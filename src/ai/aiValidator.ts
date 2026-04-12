import { Configuration, Mapping } from '../models';
import { MappingManager } from '../services/mappingManager';
import { LocalValidator, ValidationResult } from './LocalValidator';

export interface AIValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export { ValidationResult };

/**
 * AIValidator enriches local validation results with suggestions from the Gemini API.
 * SRP: Gemini API integration only — local rule checks are delegated to LocalValidator.
 */
export class AIValidator {
  private apiKey: string;
  private localValidator: LocalValidator;

  constructor(apiKey: string, localValidator: LocalValidator = new LocalValidator()) {
    this.apiKey = apiKey;
    this.localValidator = localValidator;
  }

  /** Run local checks only (no API call). */
  validate(config: Configuration, mappings: Mapping[]): ValidationResult {
    return this.localValidator.validate(config, mappings);
  }

  /** Run local checks first, then enrich with Gemini suggestions if an API key is present. */
  async runAIValidation(config: Configuration, mappings: Mapping[], yamlContent: string): Promise<AIValidationResult> {
    const localResult = this.localValidator.validate(config, mappings);

    if (!this.apiKey) {
      return {
        ...localResult,
        warnings: [...localResult.warnings, 'AI validation skipped: no API key configured.'],
      };
    }

    try {
      const prompt = this._buildPrompt(config, mappings, yamlContent);
      const response = await this._callGeminiAPI(prompt);
      const aiResult = this._parseGeminiResponse(response);

      return {
        isValid: localResult.isValid && aiResult.isValid,
        errors: [...localResult.errors, ...aiResult.errors],
        warnings: [...localResult.warnings, ...aiResult.warnings],
        suggestions: aiResult.suggestions,
      };
    } catch (err: any) {
      return {
        ...localResult,
        warnings: [...localResult.warnings, `AI validation failed: ${err.message}`],
      };
    }
  }

  // ─── Gemini helpers ───────────────────────────────────────────────────

  private _buildPrompt(config: Configuration, mappings: Mapping[], yamlContent: string): string {
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

  private async _callGeminiAPI(prompt: string): Promise<string> {
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

    const data: any = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private _parseGeminiResponse(responseText: string): AIValidationResult {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) { throw new Error('No JSON found in AI response.'); }
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isValid: parsed.isValid ?? true,
        errors: Array.isArray(parsed.errors) ? parsed.errors : [],
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      };
    } catch {
      return { isValid: true, errors: [], warnings: ['Could not parse AI response.'], suggestions: [] };
    }
  }
}
