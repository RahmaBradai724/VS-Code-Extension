import * as yaml from 'js-yaml';
import { Configuration } from '../models';
import { MappingManager } from './mappingManager';

/**
 * ConfigGenerator serializes a Configuration object
 * into a valid config.yaml string, following the structure
 * required by the hardware/logical channel framework.
 */
export class ConfigGenerator {
  private config: Configuration;
  private mappingManager: MappingManager;

  constructor(config: Configuration, mappingManager: MappingManager) {
    this.config = config;
    this.mappingManager = mappingManager;
  }

  /**
   * Validates that all required fields exist before generation.
   * Returns array of error messages (empty means valid).
   */
  preGenerationValidate(): string[] {
    const errors: string[] = [];

    if (!this.config.name) { errors.push('Configuration must have a name.'); }
    if (this.config.logicalChannels.length === 0) { errors.push('At least one logical channel is required.'); }
    if (this.config.hardwareChannels.length === 0) { errors.push('At least one hardware channel is required.'); }

    const mappings = this.mappingManager.getMappingsByConfigId(this.config.id);
    if (mappings.length === 0) { errors.push('At least one mapping must be defined.'); }

    // Check for duplicate logical channel names
    const logicalNames = this.config.logicalChannels.map(c => c.name);
    const logicalDupes = logicalNames.filter((n, i) => logicalNames.indexOf(n) !== i);
    if (logicalDupes.length > 0) {
      errors.push(`Duplicate logical channel names detected: ${logicalDupes.join(', ')}.`);
    }

    // Check for duplicate hardware channel names
    const hwNames = this.config.hardwareChannels.map(c => c.name);
    const hwDupes = hwNames.filter((n, i) => hwNames.indexOf(n) !== i);
    if (hwDupes.length > 0) {
      errors.push(`Duplicate hardware channel names detected: ${hwDupes.join(', ')}.`);
    }

    // Validate mapping rules
    const mappingValidation = this.mappingManager.validateMappingRules();
    errors.push(...mappingValidation.errors);

    return errors;
  }

  /**
   * Generates the config.yaml string.
   * Throws if pre-validation fails.
   */
  generate(): string {
    const errors = this.preGenerationValidate();
    if (errors.length > 0) {
      throw new Error(`Cannot generate config.yaml:\n${errors.map(e => `  • ${e}`).join('\n')}`);
    }

    const mappings = this.mappingManager.getMappingsByConfigId(this.config.id);

    const configObj: Record<string, any> = {
      id: this.config.id,
      name: this.config.name,

      // Logical channels section
      channels: this.config.logicalChannels.reduce((acc, ch) => {
        acc[ch.name] = ch.toYAML();
        return acc;
      }, {} as Record<string, any>),

      // Hardware channels section
      hardware: this.config.hardwareChannels.reduce((acc, hw) => {
        acc[hw.name] = hw.toYAML();
        return acc;
      }, {} as Record<string, any>),

      // Mappings section
      mappings: mappings.map(m => ({
        logicalChannel: m.logicalChannelName,
        hardwareChannel: m.hardwareChannelName || m.hardwareChannelId,
      })),

      // Framework config section
      frameworkConfig: this.config.frameworkConfig.toYAML(),
    };

    return yaml.dump(configObj, { indent: 2, lineWidth: 120, noRefs: true });
  }

  /**
   * Returns the raw object (useful for preview/display).
   */
  generateAsObject(): object {
    const mappings = this.mappingManager.getMappingsByConfigId(this.config.id);
    return {
      id: this.config.id,
      name: this.config.name,
      channels: this.config.logicalChannels.reduce((acc, ch) => {
        acc[ch.name] = ch.toYAML();
        return acc;
      }, {} as Record<string, any>),
      hardware: this.config.hardwareChannels.reduce((acc, hw) => {
        acc[hw.name] = hw.toYAML();
        return acc;
      }, {} as Record<string, any>),
      mappings: mappings.map(m => m.toYAML()),
      frameworkConfig: this.config.frameworkConfig.toYAML(),
    };
  }
}
