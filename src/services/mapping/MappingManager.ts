import { Mapping, LogicalChannel, HardwareChannel } from '../../models';
import { ChannelManager } from '../channel/ChannelManager';
import { MappingValidator } from './MappingValidator';
import { DefaultCompatibilityStrategy } from './CompatibilityRules';

export interface MappingValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * MappingManager handles creation, deletion, and validation of
 * mappings between logical and hardware channels.
 * Delegates validation to MappingValidator (SRP, DIP).
 * Public API is identical to the original class.
 */
export class MappingManager {
  private mappings: Map<string, Mapping> = new Map();
  private channelManager: ChannelManager;
  private validator: MappingValidator;

  constructor(
    channelManager: ChannelManager,
    validator: MappingValidator = new MappingValidator(new DefaultCompatibilityStrategy()),
  ) {
    this.channelManager = channelManager;
    this.validator = validator;
  }

  // ─── Create ───────────────────────────────────────────────────────────

  addMapping(logicalChannelId: string, hardwareChannelId: string, configurationId: string): Mapping {
    const logical = this.channelManager.getLogicalChannel(logicalChannelId);
    const hardware = this.channelManager.getHardwareChannel(hardwareChannelId);

    if (!logical) throw new Error(`Logical channel "${logicalChannelId}" does not exist.`);
    if (!hardware) throw new Error(`Hardware channel "${hardwareChannelId}" does not exist.`);

    const validation = this.validator.validateCompatibility(logical, hardware);
    if (!validation.valid) {
      throw new Error(`Mapping incompatible: ${validation.errors.join(' | ')}`);
    }

    if (this.isDuplicate(logicalChannelId, hardwareChannelId)) {
      throw new Error(`A mapping between "${logical.name}" and "${hardware.name}" already exists.`);
    }

    if (this.isLogicalChannelAlreadyMapped(logicalChannelId)) {
      throw new Error(`Logical channel "${logical.name}" is already mapped to a hardware channel.`);
    }

    const mappingId = `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const frameworkConfigId = 'default';
    const mapping = new Mapping(mappingId, configurationId, logicalChannelId, logical.name, hardwareChannelId, frameworkConfigId);
    mapping.hardwareChannelName = hardware.name;
    mapping.logicalChannelType = logical.category;
    mapping.hardwareChannelType = hardware.category;

    this.mappings.set(mappingId, mapping);
    this.channelManager.registerMappingForChannel(logicalChannelId, mappingId);
    this.channelManager.registerMappingForChannel(hardwareChannelId, mappingId);

    return mapping;
  }

  // ─── Delete ───────────────────────────────────────────────────────────

  removeMapping(mappingId: string): void {
    const mapping = this.mappings.get(mappingId);
    if (!mapping) throw new Error(`Mapping "${mappingId}" not found.`);
    this.channelManager.unregisterMappingForChannel(mapping.logicalChannelId, mappingId);
    this.channelManager.unregisterMappingForChannel(mapping.hardwareChannelId, mappingId);
    this.mappings.delete(mappingId);
  }

  // ─── Query ────────────────────────────────────────────────────────────

  getAllMappings(): Mapping[] {
    return Array.from(this.mappings.values());
  }

  getMappingsByConfigId(configId: string): Mapping[] {
    return this.getAllMappings().filter(m => m.configurationId === configId);
  }

  getMappingById(mappingId: string): Mapping | undefined {
    return this.mappings.get(mappingId);
  }

  // ─── Validation ───────────────────────────────────────────────────────

  validateCompatibility(logical: LogicalChannel, hardware: HardwareChannel): MappingValidationResult {
    return this.validator.validateCompatibility(logical, hardware);
  }

  validateMappingRules(): MappingValidationResult {
    return this.validator.validateMappingRules(this.getAllMappings());
  }

  // ─── UML Aligned Methods ──────────────────────────────────────────────

  generate(configurationId: string): Mapping[] {
    return this.getMappingsByConfigId(configurationId);
  }

  generateAsYaml(_configurationId: string): string {
    return '';
  }

  generateAsJson(configurationId: string): string {
    return JSON.stringify(this.generate(configurationId), null, 2);
  }

  Add(mapping: Mapping): void {
    this.mappings.set(mapping.mappingId, mapping);
  }

  // ─── Hydration ────────────────────────────────────────────────────────

  hydrate(mappings: Mapping[]): void {
    this.mappings.clear();
    mappings.forEach(m => this.mappings.set(m.mappingId, m));
  }

  // ─── Private ──────────────────────────────────────────────────────────

  private isDuplicate(logicalId: string, hardwareId: string): boolean {
    return Array.from(this.mappings.values()).some(
      m => m.logicalChannelId === logicalId && m.hardwareChannelId === hardwareId
    );
  }

  private isLogicalChannelAlreadyMapped(logicalId: string): boolean {
    return Array.from(this.mappings.values()).some(m => m.logicalChannelId === logicalId);
  }
}
