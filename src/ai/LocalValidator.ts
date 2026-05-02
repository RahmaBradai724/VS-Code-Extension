import { Configuration, Mapping } from '../models';

export type ValidationDiagnosticSeverity = 'error' | 'warning' | 'suggestion';
export type ValidationDiagnosticSource = 'configuration' | 'mapping' | 'yaml' | 'generation';

export interface ValidationDiagnostic {
  code: string;
  severity: ValidationDiagnosticSeverity;
  source: ValidationDiagnosticSource;
  message: string;
  path?: string;
  fix?: string;
  evidence?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  diagnostics: ValidationDiagnostic[];
}

/**
 * LocalValidator performs fast, offline rule-based checks on a configuration.
 * SRP: pure validation logic only — no API calls, no vscode dependency.
 */
export class LocalValidator {

  private createDiagnostic(diagnostic: ValidationDiagnostic): ValidationDiagnostic {
    return diagnostic;
  }

  private channelPath(kind: 'logicalChannels' | 'hardwareChannels', name: string | undefined, id: string | undefined, field?: string): string {
    const key = name || id || 'unknown';
    return field ? `${kind}["${key}"].${field}` : `${kind}["${key}"]`;
  }

  private mappingPath(mapping: Mapping): string {
    const logical = mapping.logicalChannelName || mapping.logicalChannelId;
    const hardware = mapping.hardwareChannelName || mapping.hardwareChannelId;
    return `mappings["${logical}->${hardware}"]`;
  }

  private toValidationResult(diagnostics: ValidationDiagnostic[]): ValidationResult {
    const errors = diagnostics
      .filter(diagnostic => diagnostic.severity === 'error')
      .map(diagnostic => diagnostic.message);
    const warnings = diagnostics
      .filter(diagnostic => diagnostic.severity === 'warning')
      .map(diagnostic => diagnostic.message);

    const fixSuggestions = diagnostics
      .filter(diagnostic => diagnostic.fix)
      .map(diagnostic => diagnostic.path ? `${diagnostic.path}: ${diagnostic.fix}` : diagnostic.fix as string);
    const explicitSuggestions = diagnostics
      .filter(diagnostic => diagnostic.severity === 'suggestion')
      .map(diagnostic => diagnostic.message);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions: [...new Set([...explicitSuggestions, ...fixSuggestions])],
      diagnostics,
    };
  }

  detectDuplicateMappings(mappings: Mapping[]): ValidationDiagnostic[] {
    const diagnostics: ValidationDiagnostic[] = [];
    const seen = new Set<string>();
    for (const mapping of mappings) {
      const key = `${mapping.logicalChannelId}:${mapping.hardwareChannelId}`;
      if (seen.has(key)) {
        diagnostics.push(this.createDiagnostic({
          code: 'mapping.duplicate',
          severity: 'error',
          source: 'mapping',
          message: `Duplicate mapping: "${mapping.logicalChannelName}" → "${mapping.hardwareChannelName || mapping.hardwareChannelId}".`,
          path: this.mappingPath(mapping),
          fix: 'Remove the duplicate mapping entry so each logical-to-hardware link appears only once.',
        }));
      }
      seen.add(key);
    }
    return diagnostics;
  }

  detectUnusedHardware(config: Configuration, mappings: Mapping[]): ValidationDiagnostic[] {
    const diagnostics: ValidationDiagnostic[] = [];
    const usedHwIds = new Set(mappings.map(m => m.hardwareChannelId));
    for (const hw of config.hardwareChannels) {
      if (!usedHwIds.has(hw.id)) {
        diagnostics.push(this.createDiagnostic({
          code: 'hardware.unmapped',
          severity: 'warning',
          source: 'configuration',
          message: `Hardware channel "${hw.name}" (${hw.category || hw.subclass || hw.type}) is defined but not mapped to any logical channel.`,
          path: this.channelPath('hardwareChannels', hw.name, hw.id),
          fix: 'Map this hardware channel to a logical channel or remove it if it is unused.',
        }));
      }
    }
    return diagnostics;
  }

  detectUnmappedLogical(config: Configuration, mappings: Mapping[]): ValidationDiagnostic[] {
    const diagnostics: ValidationDiagnostic[] = [];
    const usedLogicalIds = new Set(mappings.map(m => m.logicalChannelId));
    for (const lc of config.logicalChannels) {
      if (!usedLogicalIds.has(lc.id)) {
        diagnostics.push(this.createDiagnostic({
          code: 'logical.unmapped',
          severity: 'warning',
          source: 'configuration',
          message: `Logical channel "${lc.name}" (${lc.category || lc.subclass || lc.type}) is defined but has no mapping.`,
          path: this.channelPath('logicalChannels', lc.name, lc.id),
          fix: 'Create a mapping for this logical channel or remove it if it should not be generated.',
        }));
      }
    }
    return diagnostics;
  }

  detectMissingElements(config: Configuration): ValidationDiagnostic[] {
    const diagnostics: ValidationDiagnostic[] = [];
    if (!config.name) {
      diagnostics.push(this.createDiagnostic({
        code: 'configuration.name.missing',
        severity: 'error',
        source: 'configuration',
        message: 'Configuration is missing a name.',
        path: 'configuration.name',
        fix: 'Set a non-empty configuration name before generating YAML.',
      }));
    }
    if (config.logicalChannels.length === 0) {
      diagnostics.push(this.createDiagnostic({
        code: 'logical.none',
        severity: 'error',
        source: 'configuration',
        message: 'No logical channels defined.',
        path: 'logicalChannels',
        fix: 'Add at least one logical channel before generating YAML.',
      }));
    }
    if (config.hardwareChannels.length === 0) {
      diagnostics.push(this.createDiagnostic({
        code: 'hardware.none',
        severity: 'error',
        source: 'configuration',
        message: 'No hardware channels defined.',
        path: 'hardwareChannels',
        fix: 'Add at least one hardware channel before generating YAML.',
      }));
    }
    for (const lc of config.logicalChannels) {
      if (!lc.name) {
        diagnostics.push(this.createDiagnostic({
          code: 'logical.name.missing',
          severity: 'error',
          source: 'configuration',
          message: `A logical channel is missing a name (id: ${lc.id}).`,
          path: this.channelPath('logicalChannels', lc.name, lc.id, 'name'),
          fix: 'Set a stable logical channel name so mappings and YAML keys can reference it.',
        }));
      }
      const rawId = (lc as any).channelId;
      if (rawId === undefined || rawId === null || rawId === '') {
        diagnostics.push(this.createDiagnostic({
          code: 'logical.id.missing',
          severity: 'error',
          source: 'configuration',
          message: `Logical channel "${lc.name}" is missing an Id (must be a unique positive integer).`,
          path: this.channelPath('logicalChannels', lc.name, lc.id, 'channelId'),
          fix: 'Assign a unique positive integer to the channel Id field.',
        }));
      } else {
        const id = Number(rawId);
        if (!Number.isInteger(id) || id <= 0) {
          diagnostics.push(this.createDiagnostic({
            code: 'logical.id.invalid',
            severity: 'error',
            source: 'configuration',
            message: `Logical channel "${lc.name}" has an invalid Id "${rawId}". Id must be a positive integer.`,
            path: this.channelPath('logicalChannels', lc.name, lc.id, 'channelId'),
            fix: 'Replace the Id with a positive integer value such as 1, 2, or 3.',
          }));
        }
      }
    }
    // Check Id uniqueness across logical channels
    const idCounts = new Map<number, string[]>();
    for (const lc of config.logicalChannels) {
      const id = Number((lc as any).channelId);
      if (!isNaN(id) && id > 0) {
        const names = idCounts.get(id) ?? [];
        names.push(lc.name);
        idCounts.set(id, names);
      }
    }
    for (const [id, names] of idCounts) {
      if (names.length > 1) {
        diagnostics.push(this.createDiagnostic({
          code: 'logical.id.duplicate',
          severity: 'error',
          source: 'configuration',
          message: `Duplicate Id ${id} used by channels: ${names.join(', ')}. Each channel must have a unique Id.`,
          path: 'logicalChannels[*].channelId',
          fix: 'Assign a different Id to each listed logical channel.',
          evidence: names.join(', '),
        }));
      }
    }
    for (const hw of config.hardwareChannels) {
      if (!hw.name) {
        diagnostics.push(this.createDiagnostic({
          code: 'hardware.name.missing',
          severity: 'error',
          source: 'configuration',
          message: `A hardware channel is missing a name (id: ${hw.id}).`,
          path: this.channelPath('hardwareChannels', hw.name, hw.id, 'name'),
          fix: 'Set a hardware channel name so mappings and YAML blocks can reference it.',
        }));
      }
    }
    return diagnostics;
  }

  detectNameFormatErrors(config: Configuration): ValidationDiagnostic[] {
    const diagnostics: ValidationDiagnostic[] = [];
    const NAME_RE = /^[A-Za-z_][A-Za-z0-9_\-]*$/;
    for (const lc of config.logicalChannels) {
      if (lc.name && !NAME_RE.test(lc.name)) {
        diagnostics.push(this.createDiagnostic({
          code: 'logical.name.invalid_format',
          severity: 'error',
          source: 'configuration',
          message: `Logical channel name "${lc.name}" is invalid. Names must not start with a digit and may only contain letters, digits, underscores, or hyphens (no spaces).`,
          path: this.channelPath('logicalChannels', lc.name, lc.id, 'name'),
          fix: 'Rename the channel to use only letters, digits, underscores, or hyphens and do not start with a digit.',
        }));
      }
      for (const alias of ((lc as any).alias ?? [])) {
        if (!NAME_RE.test(alias)) {
          diagnostics.push(this.createDiagnostic({
            code: 'logical.alias.invalid_format',
            severity: 'error',
            source: 'configuration',
            message: `Alias "${alias}" on channel "${lc.name}" is invalid. Aliases follow the same naming rules as channel names.`,
            path: this.channelPath('logicalChannels', lc.name, lc.id, 'alias'),
            fix: 'Rename the alias to follow the channel naming rules.',
            evidence: alias,
          }));
        }
      }
    }
    return diagnostics;
  }

  detectInvalidChannelTypes(config: Configuration): ValidationDiagnostic[] {
    const diagnostics: ValidationDiagnostic[] = [];
    for (const lc of config.logicalChannels) {
      if (!lc.category) {
        diagnostics.push(this.createDiagnostic({
          code: 'logical.category.missing',
          severity: 'error',
          source: 'configuration',
          message: `Logical channel "${lc.name}" has no category assigned.`,
          path: this.channelPath('logicalChannels', lc.name, lc.id, 'category'),
          fix: 'Select a logical channel category before generating YAML.',
        }));
      }
      if (!lc.subclass) {
        diagnostics.push(this.createDiagnostic({
          code: 'logical.subclass.missing',
          severity: 'error',
          source: 'configuration',
          message: `Logical channel "${lc.name}" has no subclass assigned.`,
          path: this.channelPath('logicalChannels', lc.name, lc.id, 'subclass'),
          fix: 'Select a logical channel subtype so the generator knows how to serialize it.',
        }));
      }
    }
    for (const hw of config.hardwareChannels) {
      if (!hw.category) {
        diagnostics.push(this.createDiagnostic({
          code: 'hardware.category.missing',
          severity: 'error',
          source: 'configuration',
          message: `Hardware channel "${hw.name}" has no category assigned.`,
          path: this.channelPath('hardwareChannels', hw.name, hw.id, 'category'),
          fix: 'Select a hardware channel category before generating YAML.',
        }));
      }
      if (!hw.subclass) {
        diagnostics.push(this.createDiagnostic({
          code: 'hardware.subclass.missing',
          severity: 'error',
          source: 'configuration',
          message: `Hardware channel "${hw.name}" has no subclass assigned.`,
          path: this.channelPath('hardwareChannels', hw.name, hw.id, 'subclass'),
          fix: 'Select a hardware channel subtype so the generator knows how to serialize it.',
        }));
      }
    }
    return diagnostics;
  }

  validate(config: Configuration, mappings: Mapping[]): ValidationResult {
    const diagnostics: ValidationDiagnostic[] = [
      ...this.detectDuplicateMappings(mappings),
      ...this.detectMissingElements(config),
      ...this.detectNameFormatErrors(config),
      ...this.detectInvalidChannelTypes(config),
      ...this.detectUnusedHardware(config, mappings),
      ...this.detectUnmappedLogical(config, mappings),
    ];
    return this.toValidationResult(diagnostics);
  }
}
