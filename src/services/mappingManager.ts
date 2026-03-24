import { Mapping, LogicalChannel, HardwareChannel } from '../models';
import { ChannelManager } from './channelManager';

// Protocol compatibility table: which logical types map to which hardware types
const PROTOCOL_COMPATIBILITY: Record<string, string[]> = {
  'CAN':      ['CAN_INTERFACE'],
  'CAN-FD':   ['CAN_INTERFACE'],
  'LIN':      ['SERIAL_PORT'],
  'FLEXRAY':  ['CAN_INTERFACE', 'ETHERNET_ADAPTER'],
  'FR':       ['CAN_INTERFACE', 'ETHERNET_ADAPTER'],
  'ETHERNET': ['ETHERNET_ADAPTER'],
  'SERIAL':   ['SERIAL_PORT'],
  'IDSERIAL': ['SERIAL_PORT'],
  'IOINPUT':  ['RELAY_BOARD', 'HID_RELAY', 'ANALOG_DEVICE'],
  'IOOUTPUT': ['RELAY_BOARD', 'HID_RELAY', 'ANALOG_DEVICE'],
  'BRIDGE':   ['CAN_INTERFACE', 'ETHERNET_ADAPTER', 'SERIAL_PORT'],
  'ANALOG':   ['ANALOG_DEVICE', 'TE_ANALOG'],
  'TE_ANALOG':['TE_ANALOG'],
  'I2C':      ['SERIAL_PORT'],
};

export interface MappingValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * MappingManager handles creation, deletion, and validation of
 * mappings between logical and hardware channels.
 */
export class MappingManager {
  private mappings: Map<string, Mapping> = new Map();
  private channelManager: ChannelManager;

  constructor(channelManager: ChannelManager) {
    this.channelManager = channelManager;
  }

  // ─── Create ───────────────────────────────────────────────────────────

  addMapping(logicalChannelId: string, hardwareChannelId: string, configurationId: string): Mapping {
    const logical = this.channelManager.getLogicalChannel(logicalChannelId);
    const hardware = this.channelManager.getHardwareChannel(hardwareChannelId);

    if (!logical) throw new Error(`Logical channel "${logicalChannelId}" does not exist.`);
    if (!hardware) throw new Error(`Hardware channel "${hardwareChannelId}" does not exist.`);

    // Check protocol compatibility
    const validation = this.validateCompatibility(logical, hardware);
    if (!validation.valid) {
      throw new Error(`Mapping incompatible: ${validation.errors.join(' | ')}`);
    }

    // Check for duplicate mapping
    if (this.isDuplicate(logicalChannelId, hardwareChannelId)) {
      throw new Error(`A mapping between "${logical.name}" and "${hardware.name}" already exists.`);
    }

    // Check logical channel is not already mapped (1:1 enforcement by default)
    if (this.isLogicalChannelAlreadyMapped(logicalChannelId)) {
      throw new Error(`Logical channel "${logical.name}" is already mapped to a hardware channel.`);
    }

    const mappingId = `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const frameworkConfigId = "default"; // Placeholder or should be passed
    const mapping = new Mapping(mappingId, configurationId, logicalChannelId, logical.name, hardwareChannelId, frameworkConfigId);
    mapping.hardwareChannelName = hardware.name;
    mapping.logicalChannelType = logical.type;
    mapping.hardwareChannelType = hardware.type;

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
    const errors: string[] = [];
    const compatibleHardware = PROTOCOL_COMPATIBILITY[logical.type] || [];
    if (!compatibleHardware.includes(hardware.type)) {
      errors.push(
        `Protocol mismatch: logical type "${logical.type}" is not compatible with hardware type "${hardware.type}". ` +
        `Compatible hardware types: ${compatibleHardware.join(', ')}.`
      );
    }
    return { valid: errors.length === 0, errors };
  }

  validateMappingRules(): MappingValidationResult {
    const errors: string[] = [];
    const seenLogical = new Set<string>();
    const seenMappingPairs = new Set<string>();

    for (const mapping of this.mappings.values()) {
      const pairKey = `${mapping.logicalChannelId}:${mapping.hardwareChannelId}`;
      if (seenMappingPairs.has(pairKey)) {
        errors.push(`Duplicate mapping detected: logical "${mapping.logicalChannelName}" → hardware "${mapping.hardwareChannelId}".`);
      }
      seenMappingPairs.add(pairKey);

      if (seenLogical.has(mapping.logicalChannelId)) {
        errors.push(`Logical channel "${mapping.logicalChannelName}" is mapped to more than one hardware channel.`);
      }
      seenLogical.add(mapping.logicalChannelId);
    }

    return { valid: errors.length === 0, errors };
  }

  private isDuplicate(logicalId: string, hardwareId: string): boolean {
    return Array.from(this.mappings.values()).some(
      m => m.logicalChannelId === logicalId && m.hardwareChannelId === hardwareId
    );
  }

  private isLogicalChannelAlreadyMapped(logicalId: string): boolean {
    return Array.from(this.mappings.values()).some(m => m.logicalChannelId === logicalId);
  }

  // ─── UML Aligned Methods ──────────────────────────────────────────────

  generate(configurationId: string): Mapping[] {
    return this.getMappingsByConfigId(configurationId);
  }

  generateAsYaml(configurationId: string): string {
    // This typically requires a ConfigGenerator instance
    return ""; // Placeholder or delegate if possible
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
}
