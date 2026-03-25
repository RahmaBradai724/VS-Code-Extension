"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIValidator = exports.ValidationResult = void 0;
class ValidationResult {
    constructor(isValid = true, errors = [], warnings = [], suggestions = []) {
        this.isValid = true;
        this.errors = [];
        this.warnings = [];
        this.suggestions = [];
        this.isValid = isValid;
        this.errors = errors;
        this.warnings = warnings;
        this.suggestions = suggestions;
    }
}
exports.ValidationResult = ValidationResult;
/**
 * AIValidator uses the Gemini API to analyze a configuration
 * and detect potential issues. It also performs local rule-based
 * checks for speed and offline functionality.
 */
class AIValidator {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    // ─── Local Rule-Based Checks ──────────────────────────────────────────
    detectDuplicateMappings(mappings) {
        const errors = [];
        const seen = new Set();
        for (const mapping of mappings) {
            const key = `${mapping.logicalChannelId}:${mapping.hardwareChannelId}`;
            if (seen.has(key)) {
                errors.push(`Duplicate mapping: "${mapping.logicalChannelName}" → "${mapping.hardwareChannelName || mapping.hardwareChannelId}".`);
            }
            seen.add(key);
        }
        return errors;
    }
    detectUnusedHardware(config, mappings) {
        const warnings = [];
        const usedHwIds = new Set(mappings.map(m => m.hardwareChannelId));
        for (const hw of config.hardwareChannels) {
            if (!usedHwIds.has(hw.id)) {
                warnings.push(`Hardware channel "${hw.name}" (${hw.category || hw.subclass || hw.type}) is defined but not mapped to any logical channel.`);
            }
        }
        return warnings;
    }
    detectInvalidType(config, mappings) {
        const warnings = [];
        const usedLogicalIds = new Set(mappings.map(m => m.hardwareChannelId));
        for (const lc of config.logicalChannels) {
            if (!usedLogicalIds.has(lc.id)) {
                warnings.push(`Logical channel "${lc.name}" (${lc.category || lc.subclass || lc.type}) is defined but has no mapping.`);
            }
        }
        return warnings;
    }
    detectMissingElements(config) {
        const errors = [];
        if (!config.name) {
            errors.push('Configuration is missing a name.');
        }
        if (config.logicalChannels.length === 0) {
            errors.push('No logical channels defined.');
        }
        if (config.hardwareChannels.length === 0) {
            errors.push('No hardware channels defined.');
        }
        for (const lc of config.logicalChannels) {
            if (!lc.name) {
                errors.push(`A logical channel is missing a name (id: ${lc.id}).`);
            }
        }
        for (const hw of config.hardwareChannels) {
            if (!hw.name) {
                errors.push(`A hardware channel is missing a name (id: ${hw.id}).`);
            }
        }
        return errors;
    }
    detectInvalidChannelTypes(config) {
        const errors = [];
        // Validate that category and subclass are non-empty/defined
        for (const lc of config.logicalChannels) {
            if (!lc.category) {
                errors.push(`Logical channel "${lc.name}" has no category assigned.`);
            }
            if (!lc.subclass) {
                errors.push(`Logical channel "${lc.name}" has no subclass assigned.`);
            }
        }
        for (const hw of config.hardwareChannels) {
            if (!hw.category) {
                errors.push(`Hardware channel "${hw.name}" has no category assigned.`);
            }
            if (!hw.subclass) {
                errors.push(`Hardware channel "${hw.name}" has no subclass assigned.`);
            }
        }
        return errors;
    }
    // ─── Combined Local Validation ────────────────────────────────────────
    validate(config, mappings) {
        const errors = [
            ...this.detectDuplicateMappings(mappings),
            ...this.detectMissingElements(config),
            ...this.detectInvalidChannelTypes(config),
        ];
        const warnings = [
            ...this.detectUnusedHardware(config, mappings),
            ...this.detectInvalidType(config, mappings),
        ];
        return new ValidationResult(errors.length === 0, errors, warnings);
    }
    // ─── AI-Powered Validation (Gemini) ───────────────────────────────────
    async runAIValidation(config, mappings, yamlContent) {
        // First run local checks
        const localResult = this.validate(config, mappings);
        if (!this.apiKey) {
            return {
                ...localResult,
                suggestions: localResult.suggestions || [],
                warnings: [...localResult.warnings, 'AI validation skipped: no API key configured.'],
            };
        }
        try {
            const prompt = this.buildPrompt(config, mappings, yamlContent);
            const response = await this.callGeminiAPI(prompt);
            const aiResult = this.parseGeminiResponse(response);
            return {
                isValid: localResult.isValid && aiResult.isValid,
                errors: [...localResult.errors, ...aiResult.errors],
                warnings: [...localResult.warnings, ...aiResult.warnings],
                suggestions: aiResult.suggestions,
            };
        }
        catch (err) {
            return {
                ...localResult,
                suggestions: localResult.suggestions || [],
                warnings: [...localResult.warnings, `AI validation failed: ${err.message}`],
            };
        }
    }
    buildPrompt(config, mappings, yamlContent) {
        return `You are an expert in hardware/software channel configuration for automotive and embedded systems.
Analyze the following config.yaml and respond ONLY in JSON format.

Config YAML:
\`\`\`yaml
${yamlContent}
\`\`\`

Summary:
- Logical channels: ${config.logicalChannels.map(c => `${c.name} (${c.category || c.subclass || c.type})`).join(', ')}
- Hardware channels: ${config.hardwareChannels.map(c => `${c.name} (${c.category || c.subclass || c.type})`).join(', ')}
- Mappings: ${mappings.map(m => `${m.logicalChannelName} -> ${m.hardwareChannelName}`).join(', ')}

Analyze the configuration for:
1. Suspicious or impossible mappings (protocol mismatches)
2. Suboptimal configurations
3. Best practice violations
4. Missing optional but recommended fields
5. Any other anomalies

Respond in this exact JSON format:
{
  "isValid": true/false,
  "errors": ["list of critical errors"],
  "warnings": ["list of warnings"],
  "suggestions": ["list of improvement suggestions"]
}`;
    }
    async callGeminiAPI(prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;
        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    parseGeminiResponse(responseText) {
        try {
            // Extract JSON from the response (model may wrap it in markdown)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in AI response.');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                isValid: parsed.isValid ?? true,
                errors: Array.isArray(parsed.errors) ? parsed.errors : [],
                warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
            };
        }
        catch {
            return { isValid: true, errors: [], warnings: ['Could not parse AI response.'], suggestions: [] };
        }
    }
}
exports.AIValidator = AIValidator;
//# sourceMappingURL=aiValidator.js.map