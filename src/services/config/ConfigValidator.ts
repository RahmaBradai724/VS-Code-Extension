import { Configuration } from '../../models';
import { MappingManager } from '../mapping/MappingManager';

/**
 * ConfigValidator validates a Configuration before YAML generation.
 * SRP: validation only — no serialization, no file I/O.
 */
export class ConfigValidator {
  validate(config: Configuration, mappingManager: MappingManager): string[] {
    const errors: string[] = [];

    if (!config.name) { errors.push('Configuration must have a name.'); }
    if (config.logicalChannels.length === 0) { errors.push('At least one logical channel is required.'); }
    if (config.hardwareChannels.length === 0) { errors.push('At least one hardware channel is required.'); }

    const mappings = mappingManager.getMappingsByConfigId(config.id);
    if (mappings.length === 0) { errors.push('At least one mapping must be defined.'); }

    // ── Channel name format: no spaces, must not start with a digit
    const NAME_RE = /^[A-Za-z_][A-Za-z0-9_\-]*$/;
    for (const ch of config.logicalChannels) {
      if (!NAME_RE.test(ch.name)) {
        errors.push(
          `Logical channel name "${ch.name}" is invalid. ` +
          'Names must not start with a digit and may only contain letters, digits, underscores, or hyphens (no spaces).'
        );
      }
      // Validate aliases follow the same naming rules
      for (const alias of (ch.alias ?? [])) {
        if (!NAME_RE.test(alias)) {
          errors.push(
            `Alias "${alias}" on channel "${ch.name}" is invalid. ` +
            'Aliases follow the same naming rules as channel names.'
          );
        }
      }
    }

    const logicalNames = config.logicalChannels.map(c => c.name);
    const logicalDupes = logicalNames.filter((n, i) => logicalNames.indexOf(n) !== i);
    if (logicalDupes.length > 0) {
      errors.push(`Duplicate logical channel names detected: ${logicalDupes.join(', ')}.`);
    }

    // ── Id must be a positive integer and unique across all logical channels
    const seenIds = new Set<number>();
    for (const ch of config.logicalChannels) {
      const chAny = ch as any;
      const rawId = chAny.channelId;
      if (rawId === undefined || rawId === null || rawId === '') {
        errors.push(`Logical channel "${ch.name}" is missing an Id. Set a unique integer Id.`);
        continue;
      }
      const id = Number(rawId);
      if (!Number.isInteger(id) || id <= 0) {
        errors.push(`Logical channel "${ch.name}" has an invalid Id "${rawId}". Id must be a positive integer.`);
        continue;
      }
      if (seenIds.has(id)) {
        errors.push(`Duplicate Id ${id} detected on logical channel "${ch.name}". Each channel must have a unique Id.`);
      }
      seenIds.add(id);
    }

    const hwNames = config.hardwareChannels.map(c => c.name);
    const hwDupes = hwNames.filter((n, i) => hwNames.indexOf(n) !== i);
    if (hwDupes.length > 0) {
      errors.push(`Duplicate hardware channel names detected: ${hwDupes.join(', ')}.`);
    }

    const mappingValidation = mappingManager.validateMappingRules();
    errors.push(...mappingValidation.errors);

    // Validate tracers
    const fc = config.frameworkConfig as any;
    const tracers: any[] = fc?.tracers || [];
    const definedTracerNames = new Set(tracers.map((t: any) => t.name));

    // Check all tracerNames referenced in channels exist in framework tracers
    for (const ch of config.logicalChannels) {
      if (ch.tracerName && !definedTracerNames.has(ch.tracerName)) {
        errors.push(
          `Channel "${ch.name}" references tracer "${ch.tracerName}" which is not defined in Framework > Tracers.`
        );
      }
    }

    // Check PCAP tracers have a FileConfig with at least a BaseFileName
    for (const t of tracers) {
      if (t.type === 'PCAP') {
        const fileConfig = t.loggerConfiguration?.fileConfig;
        if (!fileConfig?.baseFileName) {
          errors.push(
            `PCAP tracer "${t.name}" is missing LoggerConfiguration.FileConfig.BaseFileName. ` +
            `Set a Base File Name in the tracer form.`
          );
        }
      }
    }

    return errors;
  }
}
