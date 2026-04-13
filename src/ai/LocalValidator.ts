import { Configuration, Mapping } from '../models';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * LocalValidator performs fast, offline rule-based checks on a configuration.
 * SRP: pure validation logic only — no API calls, no vscode dependency.
 */
export class LocalValidator {

  detectDuplicateMappings(mappings: Mapping[]): string[] {
    const errors: string[] = [];
    const seen = new Set<string>();
    for (const mapping of mappings) {
      const key = `${mapping.logicalChannelId}:${mapping.hardwareChannelId}`;
      if (seen.has(key)) {
        errors.push(`Duplicate mapping: "${mapping.logicalChannelName}" → "${mapping.hardwareChannelName || mapping.hardwareChannelId}".`);
      }
      seen.add(key);
    }
    return errors;
  }

  detectUnusedHardware(config: Configuration, mappings: Mapping[]): string[] {
    const warnings: string[] = [];
    const usedHwIds = new Set(mappings.map(m => m.hardwareChannelId));
    for (const hw of config.hardwareChannels) {
      if (!usedHwIds.has(hw.id)) {
        warnings.push(`Hardware channel "${hw.name}" (${hw.category || hw.subclass || hw.type}) is defined but not mapped to any logical channel.`);
      }
    }
    return warnings;
  }

  detectUnmappedLogical(config: Configuration, mappings: Mapping[]): string[] {
    const warnings: string[] = [];
    const usedLogicalIds = new Set(mappings.map(m => m.logicalChannelId));
    for (const lc of config.logicalChannels) {
      if (!usedLogicalIds.has(lc.id)) {
        warnings.push(`Logical channel "${lc.name}" (${lc.category || lc.subclass || lc.type}) is defined but has no mapping.`);
      }
    }
    return warnings;
  }

  detectMissingElements(config: Configuration): string[] {
    const errors: string[] = [];
    if (!config.name) { errors.push('Configuration is missing a name.'); }
    if (config.logicalChannels.length === 0) { errors.push('No logical channels defined.'); }
    if (config.hardwareChannels.length === 0) { errors.push('No hardware channels defined.'); }
    for (const lc of config.logicalChannels) {
      if (!lc.name) { errors.push(`A logical channel is missing a name (id: ${lc.id}).`); }
      const rawId = (lc as any).channelId;
      if (rawId === undefined || rawId === null || rawId === '') {
        errors.push(`Logical channel "${lc.name}" is missing an Id (must be a unique positive integer).`);
      } else {
        const id = Number(rawId);
        if (!Number.isInteger(id) || id <= 0) {
          errors.push(`Logical channel "${lc.name}" has an invalid Id "${rawId}". Id must be a positive integer.`);
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
        errors.push(`Duplicate Id ${id} used by channels: ${names.join(', ')}. Each channel must have a unique Id.`);
      }
    }
    for (const hw of config.hardwareChannels) {
      if (!hw.name) { errors.push(`A hardware channel is missing a name (id: ${hw.id}).`); }
    }
    return errors;
  }

  detectNameFormatErrors(config: Configuration): string[] {
    const errors: string[] = [];
    const NAME_RE = /^[A-Za-z_][A-Za-z0-9_\-]*$/;
    for (const lc of config.logicalChannels) {
      if (lc.name && !NAME_RE.test(lc.name)) {
        errors.push(
          `Logical channel name "${lc.name}" is invalid. ` +
          'Names must not start with a digit and may only contain letters, digits, underscores, or hyphens (no spaces).'
        );
      }
      for (const alias of ((lc as any).alias ?? [])) {
        if (!NAME_RE.test(alias)) {
          errors.push(
            `Alias "${alias}" on channel "${lc.name}" is invalid. ` +
            'Aliases follow the same naming rules as channel names.'
          );
        }
      }
    }
    return errors;
  }

  detectInvalidChannelTypes(config: Configuration): string[] {
    const errors: string[] = [];
    for (const lc of config.logicalChannels) {
      if (!lc.category) { errors.push(`Logical channel "${lc.name}" has no category assigned.`); }
      if (!lc.subclass) { errors.push(`Logical channel "${lc.name}" has no subclass assigned.`); }
    }
    for (const hw of config.hardwareChannels) {
      if (!hw.category) { errors.push(`Hardware channel "${hw.name}" has no category assigned.`); }
      if (!hw.subclass) { errors.push(`Hardware channel "${hw.name}" has no subclass assigned.`); }
    }
    return errors;
  }

  validate(config: Configuration, mappings: Mapping[]): ValidationResult {
    const errors: string[] = [
      ...this.detectDuplicateMappings(mappings),
      ...this.detectMissingElements(config),
      ...this.detectNameFormatErrors(config),
      ...this.detectInvalidChannelTypes(config),
    ];
    const warnings: string[] = [
      ...this.detectUnusedHardware(config, mappings),
      ...this.detectUnmappedLogical(config, mappings),
    ];
    return { isValid: errors.length === 0, errors, warnings, suggestions: [] };
  }
}
