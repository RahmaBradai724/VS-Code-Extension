import * as yaml from 'js-yaml';
import { Configuration } from '../../models';
import { MappingManager } from '../mapping/MappingManager';
import { ConfigValidator } from './ConfigValidator';
import { HardwareChannelSubclass } from '../../models/enums';

/** Subclasses that represent CM (Capture Module) devices */
const CM_SUBCLASSES: string[] = [
  HardwareChannelSubclass.CAN_INTERFACE,
  HardwareChannelSubclass.CIB_INTERFACE,
  HardwareChannelSubclass.CM_INTERFACE,
  HardwareChannelSubclass.LIN_CARD,
];

/**
 * ConfigGenerator serializes a Configuration object into an MTF-compatible config.yaml.
 * Channels → logical channels only (Id, Type, Protocol, loggingName, TracerName, Alias)
 * Mappings → CM devices and PCAP adapters grouped by hardware type
 * FrameworkConfig → Tracing, Publisher, etc.
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
   * Generates the MTF-spec config.yaml string.
   * Throws if pre-validation fails.
   */
  generate(): string {
    const errors = this.preGenerationValidate();
    if (errors.length > 0) {
      throw new Error(`Cannot generate config.yaml:\n${errors.map(e => `  • ${e}`).join('\n')}`);
    }
    const raw = yaml.dump(this._buildMtfObject(), { indent: 2, lineWidth: 120, noRefs: true });
    // MTF expects integer keys (1:) not quoted string keys ('1':)
    return raw.replace(/^(\s*)'(\d+)':/gm, '$1$2:');
  }

  /**
   * Returns the raw MTF object (useful for preview/display).
   */
  generateAsObject(): object {
    return this._buildMtfObject();
  }

  // ─── Private: build MTF object ────────────────────────────────────────

  private _buildMtfObject(): Record<string, any> {
    const mappings = this.mappingManager.getMappingsByConfigId(this.config.id);

    // Index: hardwareChannelId → mappings[]
    const mappingsByHwId = new Map<string, typeof mappings>();
    for (const m of mappings) {
      const arr = mappingsByHwId.get(m.hardwareChannelId) ?? [];
      arr.push(m);
      mappingsByHwId.set(m.hardwareChannelId, arr);
    }

    // ── Channels section (logical channels only) ──────────────────────
    const channelsSection: Record<string, any> = {};
    this.config.logicalChannels.forEach((ch, index) => {
      const obj: Record<string, any> = {
        Id: index + 1,
        Type: ch.category,
      };
      const protocol = (ch as any).protocol;
      if (protocol) { obj.Protocol = protocol; }
      if (ch.loggingName) { obj.LoggingName = ch.loggingName; }
      if (ch.tracerName) { obj.TracerName = ch.tracerName; }
      if (ch.alias?.length) { obj.Alias = ch.alias; }
      channelsSection[ch.name] = obj;
    });

    // ── Mappings section ──────────────────────────────────────────────
    const mappingsSection: Record<string, any> = {};

    // CM devices (CANInterface, CIBInterface, CMInterface, LINCard)
    const cmHardware = this.config.hardwareChannels.filter(hw => CM_SUBCLASSES.includes(hw.subclass));
    if (cmHardware.length > 0) {
      const cmDevices: Record<string, any> = {};
      cmHardware.forEach((hw, idx) => {
        const hwAny = hw as any;
        const hwMappings = mappingsByHwId.get(hw.id) ?? [];
        const buses: Record<string, any> = {};
        for (const m of hwMappings) {
          const busObj: Record<string, any> = {};
          if (m.hwChannel !== undefined && m.hwChannel !== null) { busObj.HWChannel = m.hwChannel; }
          if (m.operationMode) { busObj.OperationMode = m.operationMode; }
          if (m.keySlot !== undefined && m.keySlot !== null) { busObj.KeySlot = m.keySlot; }
          if (m.nodeType) { busObj.NodeType = m.nodeType; }
          if (m.wakeUpCluster !== undefined && m.wakeUpCluster !== null) { busObj.WakeUpCluster = m.wakeUpCluster; }
          buses[m.logicalChannelName] = busObj;
        }
        cmDevices[idx + 1] = {
          Id: hwAny.cmId ?? 0,
          Type: hwAny.cmType ?? 'CAN_Combo',
          Buses: buses,
        };
      });
      mappingsSection.CM = { Devices: cmDevices };
    }

    // PCAP (EthernetAdapter)
    const pcapHardware = this.config.hardwareChannels.filter(
      hw => hw.subclass === HardwareChannelSubclass.ETHERNET_ADAPTER,
    );
    if (pcapHardware.length > 0) {
      const pcapSection: Record<string, any> = {};
      pcapHardware.forEach((hw, idx) => {
        const a = hw as any;
        const hwMappings = mappingsByHwId.get(hw.id) ?? [];
        const logicalChannelName = hwMappings[0]?.logicalChannelName ?? hw.name;
        const adapterObj: Record<string, any> = { Name: logicalChannelName };
        if (a.friendlyName) { adapterObj.FriendlyName = a.friendlyName; }
        if (a.bufferSize) { adapterObj.BufferSize = a.bufferSize; }
        if (a.bpFilter !== undefined) { adapterObj.BpfFilter = a.bpFilter; }
        if (a.timeout !== undefined) { adapterObj.Timeout = a.timeout; }
        if (a.timeStampPrecision) { adapterObj.TimeStampPrecision = a.timeStampPrecision; }
        if (a.timeStampSource) { adapterObj.TimeStampSource = a.timeStampSource; }
        if (a.immediateMode !== undefined) { adapterObj.ImmediateMode = a.immediateMode; }
        if (a.snapshotLength) { adapterObj.SnapshotLength = a.snapshotLength; }
        if (a.pcapDeviceMode) { adapterObj.PcapDeviceMode = a.pcapDeviceMode; }
        if (a.useDataLoggerTimeStamp !== undefined) { adapterObj.UseDataLoggerTimeStamp = a.useDataLoggerTimeStamp; }
        if (a.removeDataLoggerMetaData !== undefined) { adapterObj.RemoveDataLoggerMetaData = a.removeDataLoggerMetaData; }
        if (a.dataLoggerType) { adapterObj.DataLoggerType = a.dataLoggerType; }
        if (a.packetProcessingActive !== undefined) { adapterObj.PacketProcessingActive = a.packetProcessingActive; }
        if (a.packetIdentificationActive !== undefined) { adapterObj.PacketIdentificationActive = a.packetIdentificationActive; }
        pcapSection[idx + 1] = { Adapter: adapterObj };
      });
      mappingsSection.PCAP = pcapSection;
    }

    // ── FrameworkConfig section ───────────────────────────────────────
    const frameworkSection: Record<string, any> = {};
    if (this.config.frameworkConfig?.tracing?.length) {
      const tracing: Record<string, any> = {};
      for (const t of this.config.frameworkConfig.tracing) {
        tracing[t.name] = t.toYAML();
      }
      frameworkSection.Tracing = tracing;
    }

    const result: Record<string, any> = {
      Channels: channelsSection,
      Mappings: mappingsSection,
    };
    if (Object.keys(frameworkSection).length) {
      result.FrameworkConfig = frameworkSection;
    }
    return result;
  }
}
