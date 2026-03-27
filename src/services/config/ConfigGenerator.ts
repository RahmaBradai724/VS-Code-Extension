import * as yaml from 'js-yaml';
import { Configuration } from '../../models';
import { MappingManager } from '../mapping/MappingManager';
import { ConfigValidator } from './ConfigValidator';

/**
 * ConfigGenerator serializes a Configuration object into a config.yaml string.
 * SRP: generation and serialization only — validation delegated to ConfigValidator.
 * DIP: accepts ConfigValidator via constructor for testability.
 */
export class ConfigGenerator {
  private config: Configuration;
  private mappingManager: MappingManager;
  private validator: ConfigValidator;

  constructor(
    config: Configuration,
    mappingManager: MappingManager,
    validator: ConfigValidator = new ConfigValidator(),
  ) {
    this.config = config;
    this.mappingManager = mappingManager;
    this.validator = validator;
  }

  /**
   * Validates that all required fields exist before generation.
   * Returns array of error messages (empty means valid).
   */
  preGenerationValidate(): string[] {
    return this.validator.validate(this.config, this.mappingManager);
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
      channels: this.config.logicalChannels.reduce((acc, ch) => {
        acc[ch.name] = ch.toYAML();
        return acc;
      }, {} as Record<string, any>),
      hardware: this.config.hardwareChannels.reduce((acc, hw) => {
        acc[hw.name] = hw.toYAML();
        return acc;
      }, {} as Record<string, any>),
      mappings: mappings.map(m => ({
        logicalChannel: m.logicalChannelName,
        hardwareChannel: m.hardwareChannelName || m.hardwareChannelId,
      })),
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
