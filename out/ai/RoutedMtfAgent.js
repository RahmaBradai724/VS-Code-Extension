"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutedMtfAgent = void 0;
const yaml = __importStar(require("js-yaml"));
const DOC_TOP_K = 6;
const MAX_DOC_CONTEXT_CHARS = 4200;
const MAX_YAML_CONTEXT_CHARS = 2200;
const MAX_LIST_ITEMS = 8;
const SUPPORT_PATTERNS = [
    /what is\b/,
    /what does\b/,
    /explain\b/,
    /how do i\b/,
    /how to\b/,
    /difference\b/,
    /documentation\b/,
    /field\b/,
    /section\b/,
    /learn\b/,
    /meaning\b/,
];
const ERROR_PATTERNS = [
    /error\b/,
    /invalid\b/,
    /failed\b/,
    /failing\b/,
    /issue\b/,
    /problem\b/,
    /wrong\b/,
    /fix\b/,
    /why\b/,
    /cannot\b/,
    /can't\b/,
    /generate\b/,
    /yaml\b/,
    /parse\b/,
    /parser\b/,
    /validation\b/,
    /missing\b/,
    /duplicate\b/,
    /line \d+/,
];
class RoutedMtfAgent {
    constructor(kb, ollama) {
        this.kb = kb;
        this.ollama = ollama;
    }
    async ask(question, workspace, onChunk, signal) {
        const questionYaml = extractQuestionYaml(question);
        const intent = classifyIntent(question, workspace, questionYaml);
        const retrievalQuery = buildRetrievalQuery(question, workspace, questionYaml);
        const docResults = await this.retrieveRelevantDocs(retrievalQuery);
        const messages = [
            {
                role: 'system',
                content: buildSystemPrompt(intent, docResults, workspace, questionYaml),
            },
            { role: 'user', content: question },
        ];
        const answer = await this.ollama.chat(messages, onChunk, signal);
        const sources = [
            ...buildWorkspaceSources(intent, workspace, questionYaml),
            ...docResults.map(toDocumentationSource),
        ];
        return { answer, sources, intent };
    }
    async retrieveRelevantDocs(query) {
        const merged = new Map();
        const keywordResults = this.kb.keywordSearch(query, DOC_TOP_K);
        for (const result of keywordResults) {
            merged.set(result.chunk.chunk_id, result);
        }
        try {
            const embedding = await this.ollama.embed(query);
            const hybridResults = this.kb.search(embedding, query, DOC_TOP_K);
            for (const result of hybridResults) {
                const existing = merged.get(result.chunk.chunk_id);
                if (!existing || result.score > existing.score) {
                    merged.set(result.chunk.chunk_id, result);
                }
            }
        }
        catch {
            // Keyword retrieval is the fallback when embeddings are unavailable.
        }
        return [...merged.values()]
            .sort((a, b) => b.score - a.score)
            .slice(0, DOC_TOP_K + 2);
    }
}
exports.RoutedMtfAgent = RoutedMtfAgent;
function classifyIntent(question, workspace, questionYaml) {
    const lowered = question.toLowerCase();
    let supportScore = 0;
    let errorScore = 0;
    for (const pattern of SUPPORT_PATTERNS) {
        if (pattern.test(lowered)) {
            supportScore++;
        }
    }
    for (const pattern of ERROR_PATTERNS) {
        if (pattern.test(lowered)) {
            errorScore++;
        }
    }
    if (questionYaml.yamlText) {
        errorScore += 3;
    }
    if (questionYaml.parseError) {
        errorScore += 3;
    }
    if ((workspace?.validationErrors?.length ?? 0) > 0) {
        errorScore += 2;
    }
    if (workspace?.generationError) {
        errorScore += 2;
    }
    const asksAboutDocs = /\b(field|section|keyword|documentation|meaning)\b/.test(lowered);
    if (asksAboutDocs) {
        supportScore += 2;
    }
    if (errorScore >= 3 && supportScore >= 2) {
        return 'mixed';
    }
    if (errorScore >= 3) {
        return 'error_analysis';
    }
    return 'support';
}
function buildRetrievalQuery(question, workspace, questionYaml) {
    const parts = [question];
    if (workspace?.validationErrors?.length) {
        parts.push(workspace.validationErrors.slice(0, 4).join(' '));
    }
    if (workspace?.generationError) {
        parts.push(workspace.generationError);
    }
    if (questionYaml.parseError) {
        parts.push(questionYaml.parseError);
    }
    if (questionYaml.topLevelKeys.length) {
        parts.push(questionYaml.topLevelKeys.join(' '));
    }
    if (questionYaml.nestedKeys.length) {
        parts.push(questionYaml.nestedKeys.slice(0, 12).join(' '));
    }
    return parts.filter(Boolean).join('\n');
}
function buildSystemPrompt(intent, docResults, workspace, questionYaml) {
    const docContext = buildDocumentationContext(docResults);
    const diagnosticsContext = buildDiagnosticsContext(workspace, questionYaml);
    return `You are an expert assistant for the MTF (Modular Test Framework) configuration workflow.

Intent: ${intent}

Core rules:
- Use the documentation context and diagnostics context only.
- Quote field names exactly as written in the docs, for example \`Id\`, \`Type\`, \`HWChannel\`, \`FrameworkConfig\`.
- If the documentation context does not support a claim, say so clearly.
- Never invent a validation error. Only mention an error if it appears in the diagnostics context.
- Keep the answer practical and easy to follow.

Response style:
- For support questions: explain the field or section, then give a short YAML example when useful.
- For error analysis: use this structure exactly: Diagnosis, Why it happens, How to fix, Example.
- For mixed questions: start with Diagnosis if there is a real error, then explain the relevant documentation.

Documentation context:
${docContext || 'No documentation chunks were retrieved.'}

Diagnostics context:
${diagnosticsContext}`;
}
function buildDocumentationContext(results) {
    const parts = [];
    let totalChars = 0;
    for (const { chunk, fromGraph } of results) {
        const sectionLabel = chunk.subsection
            ? `${chunk.section} > ${chunk.subsection}`
            : chunk.section;
        const relatedTag = fromGraph ? ' [related]' : '';
        const block = `[${sectionLabel}${relatedTag}]\n${chunk.title}\n${chunk.content}`;
        if (totalChars + block.length > MAX_DOC_CONTEXT_CHARS) {
            const remaining = MAX_DOC_CONTEXT_CHARS - totalChars;
            if (remaining > 220) {
                parts.push(block.slice(0, remaining) + ' ...');
            }
            break;
        }
        parts.push(block);
        totalChars += block.length;
    }
    return parts.join('\n\n---\n\n');
}
function buildDiagnosticsContext(workspace, questionYaml) {
    const parts = [];
    if (workspace) {
        parts.push(`Active configuration: ${workspace.configurationName || 'Unnamed configuration'}`);
        if (workspace.logicalChannels?.length) {
            parts.push(`Logical channels (${workspace.logicalChannels.length}): ${formatList(workspace.logicalChannels)}`);
        }
        if (workspace.hardwareChannels?.length) {
            parts.push(`Hardware channels (${workspace.hardwareChannels.length}): ${formatList(workspace.hardwareChannels)}`);
        }
        if (workspace.mappings?.length) {
            parts.push(`Mappings (${workspace.mappings.length}): ${formatList(workspace.mappings)}`);
        }
        const errors = workspace.validationErrors ?? [];
        const warnings = workspace.validationWarnings ?? [];
        const suggestions = workspace.validationSuggestions ?? [];
        parts.push(`Validation errors (${errors.length}): ${errors.length ? formatList(errors) : 'none'}`);
        parts.push(`Validation warnings (${warnings.length}): ${warnings.length ? formatList(warnings) : 'none'}`);
        if (suggestions.length) {
            parts.push(`Validation suggestions (${suggestions.length}): ${formatList(suggestions)}`);
        }
        if (workspace.generationError) {
            parts.push(`Generation error: ${workspace.generationError}`);
        }
        if (workspace.generatedYaml) {
            parts.push(`Generated YAML excerpt:\n${truncateText(workspace.generatedYaml, MAX_YAML_CONTEXT_CHARS)}`);
        }
    }
    else {
        parts.push('No active workspace configuration is available.');
    }
    if (questionYaml.yamlText) {
        parts.push(`User-provided YAML snippet:\n${truncateText(questionYaml.yamlText, MAX_YAML_CONTEXT_CHARS)}`);
        if (questionYaml.parseError) {
            parts.push(`YAML parse error: ${questionYaml.parseError}`);
        }
        else {
            parts.push(`YAML top-level keys: ${questionYaml.topLevelKeys.length ? questionYaml.topLevelKeys.join(', ') : 'none detected'}`);
            if (questionYaml.nestedKeys.length) {
                parts.push(`YAML nested keys: ${questionYaml.nestedKeys.slice(0, 20).join(', ')}`);
            }
        }
    }
    return parts.join('\n');
}
function buildWorkspaceSources(intent, workspace, questionYaml) {
    const sources = [];
    if (workspace && shouldExposeWorkspaceSource(intent, workspace)) {
        const summary = [
            workspace.generationError ? 'YAML generation is blocked by validation errors.' : null,
            `Errors: ${workspace.validationErrors?.length ?? 0}`,
            `Warnings: ${workspace.validationWarnings?.length ?? 0}`,
            workspace.generatedYaml ? 'Generated YAML was included in the analysis.' : null,
        ].filter(Boolean).join(' ');
        sources.push({
            sourceType: 'workspace',
            section: 'Workspace diagnostics',
            subsection: workspace.configurationName || 'Current configuration',
            title: 'Validation and generation context',
            source_url: '',
            summary,
        });
    }
    if (questionYaml.yamlText) {
        const summary = questionYaml.parseError
            ? questionYaml.parseError
            : `Top-level keys: ${questionYaml.topLevelKeys.join(', ') || 'none detected'}`;
        sources.push({
            sourceType: 'workspace',
            section: 'User YAML snippet',
            subsection: questionYaml.parseError ? 'Parse error' : 'Parsed snippet',
            title: 'Question-provided YAML',
            source_url: '',
            summary,
        });
    }
    return sources;
}
function shouldExposeWorkspaceSource(intent, workspace) {
    if (intent !== 'support') {
        return true;
    }
    return Boolean(workspace.generatedYaml ||
        workspace.generationError ||
        (workspace.validationErrors?.length ?? 0) > 0 ||
        (workspace.validationWarnings?.length ?? 0) > 0);
}
function toDocumentationSource(result) {
    return {
        section: result.chunk.section,
        subsection: result.chunk.subsection,
        title: result.chunk.title,
        source_url: result.chunk.source_url,
        score: result.score,
        vectorScore: result.vectorScore,
        fromGraph: result.fromGraph,
        sourceType: 'documentation',
    };
}
function extractQuestionYaml(question) {
    const yamlText = extractFencedYaml(question);
    if (!yamlText) {
        return { topLevelKeys: [], nestedKeys: [] };
    }
    try {
        const parsed = yaml.load(yamlText);
        const { topLevelKeys, nestedKeys } = collectYamlKeys(parsed);
        return { yamlText, topLevelKeys, nestedKeys };
    }
    catch (error) {
        return {
            yamlText,
            parseError: error?.message || 'Unable to parse the YAML snippet.',
            topLevelKeys: extractKeyCandidates(yamlText),
            nestedKeys: extractKeyCandidates(yamlText),
        };
    }
}
function extractFencedYaml(question) {
    const fencedMatch = question.match(/```(?:yaml|yml)?\s*([\s\S]*?)```/i);
    if (fencedMatch?.[1]?.trim()) {
        return fencedMatch[1].trim();
    }
    const lines = question.split(/\r?\n/);
    const yamlStartIndex = lines.findIndex(line => /^[ \t]*(?:Channels|Mappings|FrameworkConfig|ChannelsConfig)\s*:/.test(line));
    const yamlishLineCount = lines.filter(line => /^[ \t]*[A-Za-z_][A-Za-z0-9_-]*\s*:/.test(line)).length;
    if (yamlStartIndex >= 0 && yamlishLineCount >= 2) {
        return lines.slice(yamlStartIndex).join('\n').trim();
    }
    return undefined;
}
function collectYamlKeys(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { topLevelKeys: [], nestedKeys: [] };
    }
    const root = parsed;
    const topLevelKeys = Object.keys(root);
    const nestedKeySet = new Set();
    visitYamlNode(root, nestedKeySet);
    return {
        topLevelKeys,
        nestedKeys: [...nestedKeySet].slice(0, 40),
    };
}
function visitYamlNode(node, nestedKeySet) {
    if (Array.isArray(node)) {
        for (const item of node) {
            visitYamlNode(item, nestedKeySet);
        }
        return;
    }
    if (!node || typeof node !== 'object') {
        return;
    }
    for (const [key, value] of Object.entries(node)) {
        nestedKeySet.add(key);
        visitYamlNode(value, nestedKeySet);
    }
}
function extractKeyCandidates(text) {
    const matches = text.match(/^[ \t]*([A-Za-z_][A-Za-z0-9_-]*)\s*:/gm) ?? [];
    const keys = matches
        .map(match => match.replace(/^[ \t]*/, '').replace(/:.*/, ''))
        .filter(Boolean);
    return [...new Set(keys)].slice(0, 40);
}
function formatList(items) {
    if (!items.length) {
        return 'none';
    }
    const visible = items.slice(0, MAX_LIST_ITEMS);
    const suffix = items.length > MAX_LIST_ITEMS ? ` (+${items.length - MAX_LIST_ITEMS} more)` : '';
    return visible.join(' | ') + suffix;
}
function truncateText(text, maxChars) {
    if (text.length <= maxChars) {
        return text;
    }
    return text.slice(0, maxChars) + '\n...';
}
//# sourceMappingURL=RoutedMtfAgent.js.map