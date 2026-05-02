import * as yaml from 'js-yaml';
import { ValidationDiagnostic } from './LocalValidator';
import { OllamaClient, ChatMessage } from './mtf/OllamaClient';
import { KnowledgeBase, SearchResult } from './mtf/KnowledgeBase';

export type AgentIntent = 'support' | 'error_analysis' | 'mixed';

export interface AgentWorkspaceContext {
  configurationName?: string;
  logicalChannels?: string[];
  hardwareChannels?: string[];
  mappings?: string[];
  generatedYaml?: string;
  validationErrors?: string[];
  validationWarnings?: string[];
  validationSuggestions?: string[];
  validationDiagnostics?: ValidationDiagnostic[];
  generationError?: string;
  activeYamlPath?: string;
  activeYamlSource?: 'active_editor' | 'workspace_file';
  activeYamlText?: string;
  activeYamlParseError?: string;
  activeYamlTopLevelKeys?: string[];
  activeYamlNestedKeys?: string[];
  activeYamlStructuralFindings?: string[];
  activeYamlDiagnostics?: ValidationDiagnostic[];
}

export interface AgentEvidenceSource {
  section: string;
  subsection: string;
  title: string;
  source_url: string;
  score?: number;
  vectorScore?: number;
  fromGraph?: boolean;
  sourceType?: 'documentation' | 'workspace';
  summary?: string;
}

export type AgentConfidence = 'high' | 'medium' | 'low';
export type AgentVerification = 'diagnostics' | 'documentation' | 'mixed' | 'limited';
export type AgentPatchSafety = 'verified' | 'blocked' | 'not-needed';

export interface AgentResponseMeta {
  confidence: AgentConfidence;
  verification: AgentVerification;
  patchSafety: AgentPatchSafety;
  notes: string[];
}

export interface RoutedAgentResponse {
  answer: string;
  sources: AgentEvidenceSource[];
  intent: AgentIntent;
  meta: AgentResponseMeta;
}

export interface QuestionYamlContext {
  yamlText?: string;
  parseError?: string;
  topLevelKeys: string[];
  nestedKeys: string[];
}

const DOC_TOP_K = 6;
const EXACT_FIELD_TOP_K = 3;
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
  /analy(?:s|z)e\b/,
  /error\b/,
  /invalid\b/,
  /failed\b/,
  /failing\b/,
  /issue\b/,
  /problem\b/,
  /review\b/,
  /recommend(?:ation)?\b/,
  /solution\b/,
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

const EXACT_FIELD_ALIASES: Array<{ canonical: string; patterns: RegExp[] }> = [
  { canonical: 'CM', patterns: [/\bcm\b/i, /\bcapture\s+module\b/i] },
  { canonical: 'Id', patterns: [/\bid\b/i, /\bidentifier\b/i] },
  { canonical: 'HWChannel', patterns: [/\bhwchannel\b/i, /\bhardware\s+channel\b/i] },
  { canonical: 'LoggingName', patterns: [/\bloggingname\b/i, /\blogging\s+name\b/i] },
  { canonical: 'LoggingBusIndex', patterns: [/\bloggingbusindex\b/i, /\blogging\s+bus\s+index\b/i, /\blogging\s+bus\b/i] },
  { canonical: 'TracerName', patterns: [/\btracername\b/i, /\btracer\s+name\b/i] },
  { canonical: 'OperationMode', patterns: [/\boperationmode\b/i, /\boperation\s+mode\b/i] },
  { canonical: 'PCAP', patterns: [/\bpcap\b/i, /\bnetwork\s+adapter\b/i] },
  { canonical: 'AppLayerPorts', patterns: [/\bapplayerports\b/i, /\bapp\s+layer\s+ports?\b/i] },
  { canonical: 'NPduConfig', patterns: [/\bnpduconfig\b/i, /\bnpdu\s+config\b/i] },
  { canonical: 'SomeIPConfig', patterns: [/\bsomeipconfig\b/i, /\bsome\s*ip\s+config\b/i] },
  { canonical: 'EthernetConfig', patterns: [/\bethernetconfig\b/i, /\bethernet\s+config(?:uration)?\b/i] },
  { canonical: 'EthernetTopology', patterns: [/\bethernettopology\b/i, /\bethernet\s+topology\b/i] },
  { canonical: 'ChannelToEcusMapping', patterns: [/\bchanneltoecusmapping\b/i, /\bchannel\s+to\s+ecus\s+mapping\b/i] },
  { canonical: 'ConnectedEcus', patterns: [/\bconnectedecus\b/i, /\bconnected\s+ecus\b/i] },
  { canonical: 'PublisherConfig', patterns: [/\bpublisherconfig\b/i, /\bpublisher\s+config\b/i] },
  { canonical: 'Diagnostics', patterns: [/\bdiagnostics\b/i] },
  { canonical: 'SomeIpSD', patterns: [/\bsomeipsd\b/i, /\bsome\s*ip\s*sd\b/i] },
  { canonical: 'UDPNM', patterns: [/\budpnm\b/i, /\budp\s*nm\b/i] },
  { canonical: 'SomeIp', patterns: [/\bsomeip\b/i, /\bsome\s*ip\b/i] },
  { canonical: 'NPdu', patterns: [/\bnpdu\b/i] },
  { canonical: 'DLT', patterns: [/\bdlt\b/i] },
];

export class RoutedMtfAgent {
  constructor(
    private readonly kb: KnowledgeBase,
    private readonly ollama: OllamaClient,
  ) {}

  async ask(
    question: string,
    workspace: AgentWorkspaceContext | undefined,
    onChunk: (token: string) => void,
    signal?: AbortSignal,
  ): Promise<RoutedAgentResponse> {
    const questionYaml = extractQuestionYaml(question);
    const intent = classifyIntent(question, workspace, questionYaml);
    const exactFieldNames = extractExactFieldNames(question);
    const exactFieldQuestion = isExactFieldQuestion(question, questionYaml, exactFieldNames);
    const retrievalQuery = buildRetrievalQuery(question, workspace, questionYaml);
    const docResults = await this.retrieveRelevantDocs(retrievalQuery, exactFieldQuestion, exactFieldNames);

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: buildSystemPrompt(intent, docResults, workspace, questionYaml, exactFieldNames),
      },
      { role: 'user', content: question },
    ];

    const sources = [
      ...buildWorkspaceSources(intent, workspace, questionYaml),
      ...docResults.map(toDocumentationSource),
    ];

    const rawAnswer = await this.ollama.chat(messages, () => undefined, signal);
    const guarded = guardAgentResponse({
      answer: rawAnswer,
      intent,
      question,
      workspace,
      questionYaml,
      docResults,
      exactFieldNames,
      sources,
    });

    streamAgentAnswer(guarded.answer, onChunk);

    return { answer: guarded.answer, sources, intent, meta: guarded.meta };
  }

  private async retrieveRelevantDocs(query: string, exactFieldQuestion: boolean, exactFieldNames: string[]): Promise<SearchResult[]> {
    const merged = new Map<string, SearchResult>();
    const topK = exactFieldQuestion ? EXACT_FIELD_TOP_K : DOC_TOP_K;

    const keywordResults = this.kb.keywordSearch(query, topK);
    for (const result of keywordResults) {
      merged.set(result.chunk.chunk_id, result);
    }

    if (exactFieldNames.length) {
      const exactResults = this.kb.keywordSearch(exactFieldNames.join(' '), topK + 2);
      for (const result of exactResults) {
        const existing = merged.get(result.chunk.chunk_id);
        if (!existing || scoreWithExactFieldBoost(result, exactFieldNames) > scoreWithExactFieldBoost(existing, exactFieldNames)) {
          merged.set(result.chunk.chunk_id, result);
        }
      }
    }

    try {
      const embedding = await this.ollama.embed(query);
      const hybridResults = this.kb.search(embedding, query, topK);
      for (const result of hybridResults) {
        const existing = merged.get(result.chunk.chunk_id);
        if (!existing || scoreWithExactFieldBoost(result, exactFieldNames) > scoreWithExactFieldBoost(existing, exactFieldNames)) {
          merged.set(result.chunk.chunk_id, result);
        }
      }
    } catch {
      // Keyword retrieval is the fallback when embeddings are unavailable.
    }

    const sorted = [...merged.values()].sort(
      (a, b) => scoreWithExactFieldBoost(b, exactFieldNames) - scoreWithExactFieldBoost(a, exactFieldNames),
    );
    if (exactFieldQuestion) {
      const directHits = sorted.filter(result => !result.fromGraph);
      return (directHits.length ? directHits : sorted).slice(0, topK);
    }

    return sorted.slice(0, DOC_TOP_K + 2);
  }
}

function classifyIntent(
  question: string,
  workspace: AgentWorkspaceContext | undefined,
  questionYaml: QuestionYamlContext,
): AgentIntent {
  const lowered = question.toLowerCase();
  let supportScore = 0;
  let errorScore = 0;
  const referencesCurrentYaml = /\b(?:current|active|this|my)\s+ya?ml\b|\bcurrent\s+file\b|\bopen\s+file\b/.test(lowered);

  for (const pattern of SUPPORT_PATTERNS) {
    if (pattern.test(lowered)) { supportScore++; }
  }
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.test(lowered)) { errorScore++; }
  }

  if (questionYaml.yamlText) { errorScore += 3; }
  if (questionYaml.parseError) { errorScore += 3; }
  if ((workspace?.validationErrors?.length ?? 0) > 0) { errorScore += 2; }
  if ((workspace?.validationDiagnostics?.length ?? 0) > 0) { errorScore += 1; }
  if (workspace?.generationError) { errorScore += 2; }
  if (workspace?.activeYamlParseError) { errorScore += 3; }
  if ((workspace?.activeYamlStructuralFindings?.length ?? 0) > 0) { errorScore += 2; }
  if ((workspace?.activeYamlDiagnostics?.length ?? 0) > 0) { errorScore += 1; }
  if (referencesCurrentYaml && workspace?.activeYamlText) { errorScore += 2; }

  const asksAboutDocs = /\b(field|section|keyword|documentation|meaning)\b/.test(lowered);
  if (asksAboutDocs) { supportScore += 2; }

  if (errorScore >= 3 && supportScore >= 2) { return 'mixed'; }
  if (errorScore >= 3) { return 'error_analysis'; }
  return 'support';
}

function buildRetrievalQuery(
  question: string,
  workspace: AgentWorkspaceContext | undefined,
  questionYaml: QuestionYamlContext,
): string {
  const parts: string[] = [question];

  if (workspace?.validationErrors?.length) {
    parts.push(workspace.validationErrors.slice(0, 4).join(' '));
  }
  if (workspace?.validationDiagnostics?.length) {
    parts.push(workspace.validationDiagnostics.slice(0, 5).map(formatDiagnosticForRetrieval).join(' '));
  }
  if (workspace?.generationError) {
    parts.push(workspace.generationError);
  }
  if (workspace?.activeYamlParseError) {
    parts.push(workspace.activeYamlParseError);
  }
  if (workspace?.activeYamlStructuralFindings?.length) {
    parts.push(workspace.activeYamlStructuralFindings.slice(0, 6).join(' '));
  }
  if (workspace?.activeYamlDiagnostics?.length) {
    parts.push(workspace.activeYamlDiagnostics.slice(0, 5).map(formatDiagnosticForRetrieval).join(' '));
  }
  if (questionYaml.parseError) {
    parts.push(questionYaml.parseError);
  }
  if (workspace?.activeYamlTopLevelKeys?.length) {
    parts.push(workspace.activeYamlTopLevelKeys.join(' '));
  }
  if (workspace?.activeYamlNestedKeys?.length) {
    parts.push(workspace.activeYamlNestedKeys.slice(0, 12).join(' '));
  }
  if (questionYaml.topLevelKeys.length) {
    parts.push(questionYaml.topLevelKeys.join(' '));
  }
  if (questionYaml.nestedKeys.length) {
    parts.push(questionYaml.nestedKeys.slice(0, 12).join(' '));
  }

  return parts.filter(Boolean).join('\n');
}

function scoreWithExactFieldBoost(result: SearchResult, exactFieldNames: string[]): number {
  if (!exactFieldNames.length) { return result.score; }

  const haystack = `${result.chunk.title}\n${result.chunk.content}`;
  let boost = 0;
  for (const fieldName of exactFieldNames) {
    const pattern = new RegExp(`\\b${escapeRegExp(fieldName)}\\b`, 'i');
    if (pattern.test(result.chunk.title)) {
      boost += 0.25;
      continue;
    }
    if (pattern.test(haystack)) {
      boost += 0.15;
    }
  }
  return result.score + boost;
}

function buildSystemPrompt(
  intent: AgentIntent,
  docResults: SearchResult[],
  workspace: AgentWorkspaceContext | undefined,
  questionYaml: QuestionYamlContext,
  exactFieldNames: string[],
): string {
  const docContext = buildDocumentationContext(docResults);
  const diagnosticsContext = buildDiagnosticsContext(workspace, questionYaml);
  const fieldFocus = exactFieldNames.length
    ? `Field focus: ${exactFieldNames.join(', ')}`
    : 'Field focus: none';

  return `You are an expert assistant for the MTF (Modular Test Framework) configuration workflow.

Intent: ${intent}
${fieldFocus}

Core rules:
- Use the documentation context and diagnostics context only.
- Quote field names exactly as written in the docs, for example \`Id\`, \`Type\`, \`HWChannel\`, \`FrameworkConfig\`.
- Preserve protocol names, casing, and YAML structure exactly as shown in the retrieved documentation.
- When an active YAML file is present in the diagnostics context, treat it as the primary artifact under review.
- For syntax or structure questions, describe only the forms explicitly shown in the documentation context.
- Do not invent alternate YAML forms, defaults, IP-address formats, acronym expansions, or semantic explanations that are not stated in the documentation context.
- Do not infer the meaning of a YAML example beyond what the documentation context explicitly explains.
- If the documentation context does not support a claim, say so clearly.
- Never invent a validation error. Only mention an error if it appears in the diagnostics context.
- Treat structured diagnostics as the highest-priority evidence for what is broken and how to repair it.
- Never claim a YAML parse error unless the diagnostics context explicitly contains a parse error for the active YAML or the user-provided YAML snippet.
- If the diagnostics context says the YAML parsed successfully, do not contradict it.
- Never expand an acronym such as \`CM\` unless the retrieved documentation explicitly spells out that expansion.
- Never convert a documented numeric example into a channel-name reference, or the reverse, unless the documentation context explicitly shows that form.
- Distinguish between workspace-model diagnostics and active-file diagnostics. Do not say the YAML file contains a problem unless that problem is attached to the active YAML or the pasted YAML snippet.
- For each issue you mention, identify the affected YAML key, section, or block before giving the fix.
- Prefer concrete edit instructions such as rename a key, add a missing section, move a field, or replace a wrong value.
- When a diagnostic includes a fix, use that fix before proposing broader recommendations.
- Only output a Recommended YAML block when at least one of these is true: a structured diagnostic includes a fix, a parse error points to a YAML issue, or the retrieved documentation contains an explicit YAML form for the fields you are editing.
- If those conditions are not met, write \`Recommended YAML: I can't verify a safe YAML patch from the current diagnostics and documentation.\`
- Keep the answer practical and easy to follow.

Response style:
- For support questions: explain the field or section, then give a short YAML example only when it matches the retrieved documentation context. If the docs mention the term but do not define it, say that explicitly.
- For error analysis: use this structure exactly: Diagnosis, Why it happens, How to fix, Recommended YAML.
- For mixed questions: start with Diagnosis if there is a real error, then explain the relevant documentation, then finish with Recommended YAML.
- When active YAML is present, make the Recommended YAML section a targeted patch or corrected snippet for only the affected sections.
- When you are uncertain, say \`I can't verify that from the current documentation and diagnostics.\` instead of guessing.

Documentation context:
${docContext || 'No documentation chunks were retrieved.'}

Diagnostics context:
${diagnosticsContext}`;
}

function buildDocumentationContext(results: SearchResult[]): string {
  const parts: string[] = [];
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

function buildDiagnosticsContext(
  workspace: AgentWorkspaceContext | undefined,
  questionYaml: QuestionYamlContext,
): string {
  const parts: string[] = [];

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
    const validationDiagnostics = workspace.validationDiagnostics ?? [];
    const activeYamlDiagnostics = workspace.activeYamlDiagnostics ?? [];

    parts.push(`Validation errors (${errors.length}): ${errors.length ? formatList(errors) : 'none'}`);
    parts.push(`Validation warnings (${warnings.length}): ${warnings.length ? formatList(warnings) : 'none'}`);

    if (suggestions.length) {
      parts.push(`Validation suggestions (${suggestions.length}): ${formatList(suggestions)}`);
    }
    if (validationDiagnostics.length) {
      parts.push(`Structured validation diagnostics (${validationDiagnostics.length}):\n${formatDiagnostics(validationDiagnostics)}`);
    }

    if (workspace.generationError) {
      parts.push(`Generation error: ${workspace.generationError}`);
    }

    if (workspace.generatedYaml) {
      parts.push(`Generated YAML excerpt:\n${truncateText(workspace.generatedYaml, MAX_YAML_CONTEXT_CHARS)}`);
    }

    if (workspace.activeYamlText) {
      const activeYamlLabel = workspace.activeYamlSource === 'active_editor'
        ? 'Active YAML in editor'
        : 'Workspace YAML file';
      parts.push(`${activeYamlLabel}: ${workspace.activeYamlPath || 'unknown path'}`);

      if (workspace.activeYamlParseError) {
        parts.push(`Active YAML parse error: ${workspace.activeYamlParseError}`);
      } else {
        parts.push('Active YAML parse status: parsed successfully (no parse error detected).');
        parts.push(`Active YAML top-level keys: ${workspace.activeYamlTopLevelKeys?.length ? workspace.activeYamlTopLevelKeys.join(', ') : 'none detected'}`);
      }

      if (workspace.activeYamlNestedKeys?.length) {
        parts.push(`Active YAML nested keys: ${workspace.activeYamlNestedKeys.slice(0, 20).join(', ')}`);
      }

      if (workspace.activeYamlStructuralFindings?.length) {
        parts.push(`Active YAML findings (${workspace.activeYamlStructuralFindings.length}): ${formatList(workspace.activeYamlStructuralFindings)}`);
      }
      if (activeYamlDiagnostics.length) {
        parts.push(`Active YAML diagnostics (${activeYamlDiagnostics.length}):\n${formatDiagnostics(activeYamlDiagnostics)}`);
      }

      parts.push(`Active YAML excerpt:\n${truncateText(workspace.activeYamlText, MAX_YAML_CONTEXT_CHARS)}`);
    }
  } else {
    parts.push('No active workspace configuration is available.');
  }

  if (questionYaml.yamlText) {
    parts.push(`User-provided YAML snippet:\n${truncateText(questionYaml.yamlText, MAX_YAML_CONTEXT_CHARS)}`);
    if (questionYaml.parseError) {
      parts.push(`YAML parse error: ${questionYaml.parseError}`);
    } else {
      parts.push('User-provided YAML parse status: parsed successfully (no parse error detected).');
      parts.push(`YAML top-level keys: ${questionYaml.topLevelKeys.length ? questionYaml.topLevelKeys.join(', ') : 'none detected'}`);
      if (questionYaml.nestedKeys.length) {
        parts.push(`YAML nested keys: ${questionYaml.nestedKeys.slice(0, 20).join(', ')}`);
      }
    }
  }

  return parts.join('\n');
}

function buildWorkspaceSources(
  intent: AgentIntent,
  workspace: AgentWorkspaceContext | undefined,
  questionYaml: QuestionYamlContext,
): AgentEvidenceSource[] {
  const sources: AgentEvidenceSource[] = [];

  if (workspace && shouldExposeWorkspaceSource(intent, workspace)) {
    const summary = [
      workspace.generationError ? 'YAML generation is blocked by validation errors.' : null,
      `Errors: ${workspace.validationErrors?.length ?? 0}`,
      `Warnings: ${workspace.validationWarnings?.length ?? 0}`,
      workspace.validationDiagnostics?.length ? `Diagnostics: ${workspace.validationDiagnostics.length}` : null,
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

  if (workspace?.activeYamlText) {
    const summary = workspace.activeYamlParseError
      ? workspace.activeYamlParseError
      : workspace.activeYamlDiagnostics?.length
        ? workspace.activeYamlDiagnostics.slice(0, 2).map(diagnostic => diagnostic.message).join(' ')
        : workspace.activeYamlStructuralFindings?.length
          ? workspace.activeYamlStructuralFindings.join(' ')
        : `Top-level keys: ${workspace.activeYamlTopLevelKeys?.join(', ') || 'none detected'}`;

    sources.push({
      sourceType: 'workspace',
      section: 'Active YAML file',
      subsection: workspace.activeYamlPath || (workspace.activeYamlSource === 'active_editor' ? 'Open editor' : 'Workspace file'),
      title: 'Current YAML under analysis',
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

function streamAgentAnswer(answer: string, onChunk: (token: string) => void): void {
  const chunkSize = 48;
  for (let index = 0; index < answer.length; index += chunkSize) {
    onChunk(answer.slice(index, index + chunkSize));
  }
}

export interface AgentGuardInput {
  answer: string;
  intent: AgentIntent;
  question: string;
  workspace: AgentWorkspaceContext | undefined;
  questionYaml: QuestionYamlContext;
  docResults: SearchResult[];
  exactFieldNames: string[];
  sources: AgentEvidenceSource[];
}

export function guardAgentResponse(input: AgentGuardInput): { answer: string; meta: AgentResponseMeta } {
  const violations = collectSafetyViolations(input);
  const meta = buildAgentResponseMeta(input, violations);

  if (violations.length === 0) {
    return { answer: input.answer.trim(), meta };
  }

  const answer = buildSafeFallbackAnswer(input, violations, meta);
  return {
    answer,
    meta: {
      ...meta,
      confidence: meta.confidence === 'high' ? 'medium' : 'low',
      notes: [...meta.notes, ...violations.map(violation => violation.note)],
      patchSafety: violations.some(violation => violation.kind === 'unsupported_yaml_patch' || violation.kind === 'numeric_name_rewrite')
        ? 'blocked'
        : meta.patchSafety,
    },
  };
}

interface SafetyViolation {
  kind: 'unsupported_parse_claim' | 'unsupported_yaml_patch' | 'unsupported_acronym_expansion' | 'numeric_name_rewrite' | 'invented_mapping_structure';
  note: string;
}

function collectSafetyViolations(input: AgentGuardInput): SafetyViolation[] {
  const violations: SafetyViolation[] = [];
  const normalizedAnswer = input.answer.toLowerCase();
  const docsText = buildDocumentationEvidenceText(input.docResults);
  const activeYamlText = input.workspace?.activeYamlText ?? input.questionYaml.yamlText ?? '';

  if (
    !input.workspace?.activeYamlParseError &&
    !input.questionYaml.parseError &&
    /yaml parse error|parse error occurs|indentation issue|line\s+\d+\s*,\s*column\s+\d+/i.test(input.answer) &&
    !/no parse error detected/i.test(normalizedAnswer)
  ) {
    violations.push({
      kind: 'unsupported_parse_claim',
      note: 'Blocked an unsupported YAML parse-error claim because the diagnostics reported no parse error.',
    });
  }

  const hasYamlPatch = /```ya?ml[\s\S]*?```/i.test(input.answer) || /Recommended YAML\s*:/i.test(input.answer);
  const canVerifyPatch = canVerifySafePatch(input, docsText);
  if (hasYamlPatch && !canVerifyPatch) {
    violations.push({
      kind: 'unsupported_yaml_patch',
      note: 'Blocked a YAML patch because it was not supported by diagnostics or explicit documentation examples.',
    });
  }

  if (
    /\bcapture module\b/i.test(input.answer) &&
    /\bcm\b/i.test(input.question) &&
    !/\bcapture module\b/i.test(docsText)
  ) {
    violations.push({
      kind: 'unsupported_acronym_expansion',
      note: 'Blocked an acronym expansion that was not explicitly defined in the retrieved documentation.',
    });
  }

  if (
    /HWChannel\s*:\s*[A-Za-z_][A-Za-z0-9_-]*/.test(input.answer) &&
    /HWChannel\s*:\s*\d+/.test(activeYamlText) &&
    /hwchannel/i.test(docsText) &&
    /channel id/i.test(docsText)
  ) {
    violations.push({
      kind: 'numeric_name_rewrite',
      note: 'Blocked a rewrite that changed a numeric HWChannel identifier into a name without explicit documentation support.',
    });
  }

  if (/Mappings\s*:[\s\S]*HardwareChannels\s*:/i.test(input.answer) && !/HardwareChannels\s*:/.test(docsText)) {
    violations.push({
      kind: 'invented_mapping_structure',
      note: 'Blocked an invented mapping structure that does not appear in the retrieved documentation.',
    });
  }

  return violations;
}

function canVerifySafePatch(input: AgentGuardInput, docsText: string): boolean {
  if (input.workspace?.activeYamlParseError || input.questionYaml.parseError) {
    return true;
  }

  const hasDiagnosticFix = [
    ...(input.workspace?.validationDiagnostics ?? []),
    ...(input.workspace?.activeYamlDiagnostics ?? []),
  ].some(diagnostic => Boolean(diagnostic.fix));

  if (hasDiagnosticFix) {
    return true;
  }

  return documentationHasExplicitYamlForm(docsText, input.exactFieldNames);
}

function documentationHasExplicitYamlForm(docsText: string, exactFieldNames: string[]): boolean {
  if (!docsText) { return false; }

  const hasYamlScaffold = /Channels\s*:|Mappings\s*:|FrameworkConfig\s*:|HWChannel\s*:|TracerName\s*:|LoggingBusIndex\s*:/i.test(docsText);
  if (!hasYamlScaffold) { return false; }
  if (!exactFieldNames.length) { return true; }

  return exactFieldNames.some(fieldName => new RegExp(`\\b${escapeRegExp(fieldName)}\\b`, 'i').test(docsText));
}

function buildDocumentationEvidenceText(docResults: SearchResult[]): string {
  return docResults
    .map(result => `${result.chunk.title}\n${result.chunk.content}`)
    .join('\n');
}

function buildAgentResponseMeta(input: AgentGuardInput, violations: SafetyViolation[]): AgentResponseMeta {
  const hasDiagnostics = Boolean(
    (input.workspace?.validationDiagnostics?.length ?? 0) > 0 ||
    (input.workspace?.activeYamlDiagnostics?.length ?? 0) > 0 ||
    input.workspace?.activeYamlParseError ||
    input.questionYaml.parseError,
  );
  const hasDocumentation = input.docResults.length > 0;

  let verification: AgentVerification = 'limited';
  if (hasDiagnostics && hasDocumentation) {
    verification = 'mixed';
  } else if (hasDiagnostics) {
    verification = 'diagnostics';
  } else if (hasDocumentation) {
    verification = 'documentation';
  }

  let confidence: AgentConfidence = 'low';
  if (verification === 'mixed') {
    confidence = 'high';
  } else if (verification === 'documentation' || verification === 'diagnostics') {
    confidence = 'medium';
  }
  if (violations.length) {
    confidence = 'low';
  }

  let patchSafety: AgentPatchSafety = 'not-needed';
  if (/```ya?ml[\s\S]*?```/i.test(input.answer) || /Recommended YAML\s*:/i.test(input.answer)) {
    patchSafety = violations.some(violation => violation.kind === 'unsupported_yaml_patch' || violation.kind === 'numeric_name_rewrite')
      ? 'blocked'
      : 'verified';
  }

  const notes = [
    verification === 'mixed'
      ? 'Verified from both diagnostics and documentation.'
      : verification === 'diagnostics'
        ? 'Verified primarily from deterministic diagnostics.'
        : verification === 'documentation'
          ? 'Verified primarily from retrieved documentation.'
          : 'Verification is limited; the answer should remain conservative.',
  ];

  return { confidence, verification, patchSafety, notes };
}

function buildSafeFallbackAnswer(input: AgentGuardInput, violations: SafetyViolation[], meta: AgentResponseMeta): string {
  const diagnostics = [
    ...(input.workspace?.activeYamlDiagnostics ?? []),
    ...(input.workspace?.validationDiagnostics ?? []),
  ];
  const diagnosticMessages = diagnostics.slice(0, 4).map(diagnostic => {
    const fix = diagnostic.fix ? ` Fix: ${diagnostic.fix}` : '';
    return `- ${diagnostic.path ? `${diagnostic.path}: ` : ''}${diagnostic.message}${fix}`;
  });

  const docHighlights = input.docResults.slice(0, 3).map(result => `- ${result.chunk.title} (${result.chunk.section}${result.chunk.subsection ? ` > ${result.chunk.subsection}` : ''})`);
  const lines: string[] = [
    'Safety review:',
    ...violations.map(violation => `- ${violation.note}`),
    '',
    'Diagnosis:',
  ];

  if (input.workspace?.activeYamlParseError || input.questionYaml.parseError) {
    lines.push(`- Verified parse error: ${input.workspace?.activeYamlParseError ?? input.questionYaml.parseError}`);
  } else if (diagnosticMessages.length) {
    lines.push(...diagnosticMessages);
  } else {
    lines.push('- I cannot verify a concrete YAML error from the current diagnostics.');
  }

  lines.push('', 'Why it happens:');
  if (docHighlights.length) {
    lines.push('- The available documentation focuses on the following relevant sections:');
    lines.push(...docHighlights);
  } else {
    lines.push('- I cannot verify the needed documentation context strongly enough to justify the original draft answer.');
  }

  lines.push('', 'How to fix:');
  if (diagnosticMessages.length) {
    lines.push('- Apply the deterministic fixes listed in the diagnostics before changing unrelated sections.');
  } else {
    lines.push('- Re-run the analysis after adding more explicit documentation context or a deterministic validation finding.');
  }

  lines.push('', 'Recommended YAML:');
  lines.push(meta.patchSafety === 'verified'
    ? 'Use the documented YAML form shown in the retrieved sections above.'
    : "I can't verify a safe YAML patch from the current diagnostics and documentation.");

  return lines.join('\n');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function shouldExposeWorkspaceSource(intent: AgentIntent, workspace: AgentWorkspaceContext): boolean {
  if (intent !== 'support') { return true; }
  return Boolean(
    workspace.activeYamlText ||
    workspace.generatedYaml ||
    workspace.generationError ||
    (workspace.validationDiagnostics?.length ?? 0) > 0 ||
    (workspace.activeYamlDiagnostics?.length ?? 0) > 0 ||
    (workspace.validationErrors?.length ?? 0) > 0 ||
    (workspace.validationWarnings?.length ?? 0) > 0,
  );
}

function formatDiagnosticForRetrieval(diagnostic: ValidationDiagnostic): string {
  return [diagnostic.code, diagnostic.path, diagnostic.message, diagnostic.fix]
    .filter(Boolean)
    .join(' ');
}

function formatDiagnostics(diagnostics: ValidationDiagnostic[]): string {
  return diagnostics
    .slice(0, MAX_LIST_ITEMS)
    .map((diagnostic, index) => {
      const parts = [
        `${index + 1}. [${diagnostic.severity}] ${diagnostic.code}`,
        diagnostic.path ? `path=${diagnostic.path}` : null,
        diagnostic.message,
        diagnostic.fix ? `Fix: ${diagnostic.fix}` : null,
      ].filter(Boolean);
      return parts.join(' | ');
    })
    .join('\n');
}

function toDocumentationSource(result: SearchResult): AgentEvidenceSource {
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

function extractQuestionYaml(question: string): QuestionYamlContext {
  const yamlText = extractFencedYaml(question);
  if (!yamlText) {
    return { topLevelKeys: [], nestedKeys: [] };
  }

  try {
    const parsed = yaml.load(yamlText) as unknown;
    const { topLevelKeys, nestedKeys } = collectYamlKeys(parsed);
    return { yamlText, topLevelKeys, nestedKeys };
  } catch (error: any) {
    return {
      yamlText,
      parseError: error?.message || 'Unable to parse the YAML snippet.',
      topLevelKeys: extractKeyCandidates(yamlText),
      nestedKeys: extractKeyCandidates(yamlText),
    };
  }
}

function extractFencedYaml(question: string): string | undefined {
  const fencedMatch = question.match(/```(?:yaml|yml)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]?.trim()) {
    return fencedMatch[1].trim();
  }

  const lines = question.split(/\r?\n/);
  const yamlStartIndex = lines.findIndex(line =>
    /^[ \t]*(?:Channels|Mappings|FrameworkConfig|ChannelsConfig)\s*:/.test(line),
  );
  const yamlishLineCount = lines.filter(line =>
    /^[ \t]*[A-Za-z_][A-Za-z0-9_-]*\s*:/.test(line),
  ).length;

  if (yamlStartIndex >= 0 && yamlishLineCount >= 2) {
    return lines.slice(yamlStartIndex).join('\n').trim();
  }

  return undefined;
}

function collectYamlKeys(parsed: unknown): { topLevelKeys: string[]; nestedKeys: string[] } {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { topLevelKeys: [], nestedKeys: [] };
  }

  const root = parsed as Record<string, unknown>;
  const topLevelKeys = Object.keys(root);
  const nestedKeySet = new Set<string>();
  visitYamlNode(root, nestedKeySet);

  return {
    topLevelKeys,
    nestedKeys: [...nestedKeySet].slice(0, 40),
  };
}

function visitYamlNode(node: unknown, nestedKeySet: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      visitYamlNode(item, nestedKeySet);
    }
    return;
  }

  if (!node || typeof node !== 'object') { return; }
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    nestedKeySet.add(key);
    visitYamlNode(value, nestedKeySet);
  }
}

function extractKeyCandidates(text: string): string[] {
  const matches = text.match(/^[ \t]*([A-Za-z_][A-Za-z0-9_-]*)\s*:/gm) ?? [];
  const keys = matches
    .map(match => match.replace(/^[ \t]*/, '').replace(/:.*/, ''))
    .filter(Boolean);
  return [...new Set(keys)].slice(0, 40);
}

function extractExactFieldNames(question: string): string[] {
  const matches: string[] = [];
  for (const field of EXACT_FIELD_ALIASES) {
    if (field.patterns.some(pattern => pattern.test(question))) {
      matches.push(field.canonical);
    }
  }
  return [...new Set(matches)];
}

function isExactFieldQuestion(
  question: string,
  questionYaml: QuestionYamlContext,
  exactFieldNames: string[],
): boolean {
  if (!exactFieldNames.length || questionYaml.yamlText || questionYaml.parseError) { return false; }

  const lowered = question.toLowerCase();
  if (ERROR_PATTERNS.some(pattern => pattern.test(lowered))) { return false; }

  const words = lowered
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  return words.length <= 10 || /\b(what|explain|syntax|field|section|meaning|example|please)\b/.test(lowered);
}

function formatList(items: string[]): string {
  if (!items.length) { return 'none'; }
  const visible = items.slice(0, MAX_LIST_ITEMS);
  const suffix = items.length > MAX_LIST_ITEMS ? ` (+${items.length - MAX_LIST_ITEMS} more)` : '';
  return visible.join(' | ') + suffix;
}

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) { return text; }
  return text.slice(0, maxChars) + '\n...';
}
