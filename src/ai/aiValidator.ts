import { Configuration, Mapping } from '../models';
import { LocalValidator, ValidationDiagnostic, ValidationResult } from './LocalValidator';

export interface AIValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  diagnostics: ValidationDiagnostic[];
}

export { ValidationDiagnostic, ValidationResult };

/**
 * AIValidator now wraps local validation only.
 */
export class AIValidator {
  private localValidator: LocalValidator;

  constructor(localValidator: LocalValidator = new LocalValidator()) {
    this.localValidator = localValidator;
  }

  /** Run local checks only (no API call). */
  validate(config: Configuration, mappings: Mapping[]): ValidationResult {
    return this.localValidator.validate(config, mappings);
  }

  /** Preserves the existing command path while using local validation only. */
  async runAIValidation(config: Configuration, mappings: Mapping[], _yamlContent: string): Promise<AIValidationResult> {
    return this.localValidator.validate(config, mappings);
  }
}
