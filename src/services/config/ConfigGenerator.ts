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
        // MTF spec uses 'FR' — normalize both FLEXRAY and FR enum values
        Type: ch.category === 'FLEXRAY' ? 'FR' : ch.category,
      };
      const protocol = (ch as any).protocol;
      if (protocol) { obj.Protocol = protocol; }
      if (ch.loggingName) { obj.LoggingName = ch.loggingName; }
      if (ch.tracerName) { obj.TracerName = ch.tracerName; }
      if (ch.alias?.length) { obj.Alias = ch.alias; }
      if ((ch as any).loggingBusIndex != null) { obj.LoggingBusIndex = (ch as any).loggingBusIndex; }
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
          // KeySlot, NodeType, WakeUpCluster are FlexRay-only fields
          const isFlexRay = m.logicalChannelType === 'FR' || m.logicalChannelType === 'FLEXRAY';
          if (isFlexRay) {
            if (m.keySlot !== undefined && m.keySlot !== null) { busObj.KeySlot = m.keySlot; }
            if (m.nodeType) { busObj.NodeType = m.nodeType; }
            if (m.wakeUpCluster !== undefined && m.wakeUpCluster !== null) { busObj.WakeUpCluster = m.wakeUpCluster; }
          }
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
        if (hwMappings.length === 0) { return; }
        const logicalChannelName = hwMappings[0]?.logicalChannelName ?? hw.name;
        const adapterObj: Record<string, any> = { Name: logicalChannelName };
        if (a.friendlyName) { adapterObj.FriendlyName = a.friendlyName; }
        if (a.bufferSize) { adapterObj.BufferSize = a.bufferSize; }
        if (a.bpFilter) { adapterObj.BpfFilter = a.bpFilter; }
        if (a.timeout) { adapterObj.Timeout = a.timeout; }
        if (a.timeStampPrecision) { adapterObj.TimeStampPrecision = a.timeStampPrecision; }
        if (a.timeStampSource) { adapterObj.TimeStampSource = a.timeStampSource; }
        if (a.immediateMode != null) { adapterObj.ImmediateMode = a.immediateMode; }
        if (a.snapshotLength != null) { adapterObj.SnapshotLength = a.snapshotLength; }
        if (a.pcapDeviceMode) { adapterObj.PcapDeviceMode = a.pcapDeviceMode; }
        if (a.useDataLoggerTimeStamp != null) { adapterObj.UseDataLoggerTimeStamp = a.useDataLoggerTimeStamp; }
        if (a.removeDataLoggerMetaData != null) { adapterObj.RemoveDataLoggerMetaData = a.removeDataLoggerMetaData; }
        if (a.dataLoggerType) { adapterObj.DataLoggerType = a.dataLoggerType; }
        if (a.packetProcessingActive != null) { adapterObj.PacketProcessingActive = a.packetProcessingActive; }
        if (a.packetIdentificationActive != null) { adapterObj.PacketIdentificationActive = a.packetIdentificationActive; }
        pcapSection[idx + 1] = { Adapter: adapterObj };
      });
      mappingsSection.PCAP = pcapSection;
    }

    // Serial (SerialPort)
    const serialHardware = this.config.hardwareChannels.filter(
      hw => hw.subclass === HardwareChannelSubclass.SERIAL_PORT,
    );
    if (serialHardware.length > 0) {
      const ports: Record<string, any> = {};
      serialHardware.forEach(hw => {
        const s = hw as any;
        const hwMappings = mappingsByHwId.get(hw.id) ?? [];
        if (hwMappings.length === 0) { return; }
        const logicalChannelName = hwMappings[0]?.logicalChannelName ?? hw.name;
        const portObj: Record<string, any> = {};
        if (s.portName)             { portObj.PortName             = s.portName; }
        if (s.baudRate)             { portObj.BaudRate             = s.baudRate; }
        if (s.parity)               { portObj.Parity               = s.parity; }
        if (s.dataBits)             { portObj.DataBits             = s.dataBits; }
        if (s.stopBits)             { portObj.StopBits             = s.stopBits; }
        if (s.flowControl)          { portObj.FlowControl          = s.flowControl; }
        if (s.messageTerminator != null) { portObj.MessageTerminator = s.messageTerminator; }
        if (s.separationTimeMs)     { portObj.SeparationTimeMs     = s.separationTimeMs; }
        if (s.maxReceivedDataSize)  { portObj.MaxReceivedDataSize  = s.maxReceivedDataSize; }
        ports[logicalChannelName] = portObj;
      });
      mappingsSection.Serial = { Ports: ports };
    }

    // BTS-Revo
    const btsHardware = this.config.hardwareChannels.filter(
      hw => hw.subclass === HardwareChannelSubclass.BTS_REVO,
    );
    if (btsHardware.length > 0) {
      const boards: Record<string, any> = {};
      // Shared EthernetConfiguration (from first device)
      let ethernetConfig: Record<string, any> | undefined;
      const firstBts = btsHardware[0] as any;
      if (firstBts.addressPrefix || firstBts.ethernetPort) {
        ethernetConfig = {};
        if (firstBts.addressPrefix) { ethernetConfig.AddressPrefix = firstBts.addressPrefix; }
        if (firstBts.ethernetPort)  { ethernetConfig.Port = firstBts.ethernetPort; }
      }
      btsHardware.forEach((hw, idx) => {
        const hwAny = hw as any;
        const hwMappings = mappingsByHwId.get(hw.id) ?? [];
        if (hwMappings.length === 0) { return; }
        const ios: Record<string, any> = {};
        for (const m of hwMappings) {
          const ioObj: Record<string, any> = {};
          if (m.hwChannel !== undefined && m.hwChannel !== null) { ioObj.HWChannel = m.hwChannel; }
          if (m.measurementAttribute)    { ioObj.MeasurementAttribute = m.measurementAttribute; }
          if (m.btsFunction)             { ioObj.Function             = m.btsFunction; }
          if (m.lineContactState != null) { ioObj.LineContactState    = m.lineContactState; }
          if (m.gndContactState != null)  { ioObj.GndContactState     = m.gndContactState; }
          if (m.vbatContactState != null) { ioObj.VbatContactState    = m.vbatContactState; }
          if (m.staticChannel != null)    { ioObj.StaticChannel       = m.staticChannel; }
          if (m.initValue)               { ioObj.InitValue            = m.initValue; }
          if (m.channelType)             { ioObj.ChannelType          = m.channelType; }
          if (m.pwmWindowTime != null)   { ioObj.PWMWindowTime        = m.pwmWindowTime; }
          if (m.measurementConfig?.length) { ioObj.MeasurementConfig  = m.measurementConfig; }
          if (m.subscriptionConfig && Object.keys(m.subscriptionConfig).length) {
            const sc = m.subscriptionConfig as any;
            const scOut: Record<string, any> = {};
            if (sc.ID)               { scOut.ID             = sc.ID; }
            if (sc.Type)             { scOut.Type           = sc.Type; }
            if (sc.IsPeriodic != null){ scOut.IsPeriodic    = sc.IsPeriodic; }
            if (sc.Polling != null)  { scOut.Polling        = sc.Polling; }
            if (sc.UpperThreshold != null) { scOut.UpperThreshold = sc.UpperThreshold; }
            if (sc.LowerThreshold != null) { scOut.LowerThreshold = sc.LowerThreshold; }
            ioObj.SubscriptionConfig = scOut;
          }
          ios[m.logicalChannelName] = ioObj;
        }
        boards[idx + 1] = { Id: hwAny.boardId ?? 0, IOs: ios };
      });
      const btsSection: Record<string, any> = { Boards: boards };
      if (ethernetConfig) { btsSection.EthernetConfiguration = ethernetConfig; }
      mappingsSection['BTS-Revo'] = btsSection;
    }

    // ── FrameworkConfig section ───────────────────────────────────────
    const fc = this.config.frameworkConfig as any;
    const frameworkSection: Record<string, any> = {};

    // Tracing
    const rawTracers: any[] = fc?.tracers || [];
    if (rawTracers.length > 0) {
      const tracing: Record<string, any> = {};
      for (const t of rawTracers) {
        const entry: Record<string, any> = { Type: t.type };
        if (t.timestamp) { entry.Timestamp = t.timestamp; }

        if (t.type === 'PCAP') {
          if (t.loggingType) { entry.LoggingType = t.loggingType; }
          const loggerConfig: Record<string, any> = {};
          if (t.loggerConfiguration?.bufferConfig && Object.keys(t.loggerConfiguration.bufferConfig).length) {
            const bc = t.loggerConfiguration.bufferConfig;
            const bufOut: Record<string, any> = {};
            if (bc.bufferSize  !== undefined) { bufOut.BufferSize     = bc.bufferSize; }
            if (bc.bufferNumber !== undefined) { bufOut.BufferNumber   = bc.bufferNumber; }
            if (bc.writeBurstSize !== undefined) { bufOut.WriteBurstSize = bc.writeBurstSize; }
            loggerConfig.BufferConfig = bufOut;
          }
          if (t.loggerConfiguration?.fileConfig && Object.keys(t.loggerConfiguration.fileConfig).length) {
            const fc2 = t.loggerConfiguration.fileConfig;
            const fileOut: Record<string, any> = {};
            if (fc2.baseFileName !== undefined)    { fileOut.BaseFileName    = fc2.baseFileName; }
            if (fc2.extension !== undefined)       { fileOut.Extension       = fc2.extension; }
            if (fc2.maxFile !== undefined)         { fileOut.MaxFile         = fc2.maxFile; }
            if (fc2.maxFileSize !== undefined)     { fileOut.MaxFileSize     = fc2.maxFileSize; }
            if (fc2.compressionLevel !== undefined) { fileOut.CompressionLevel = fc2.compressionLevel; }
            loggerConfig.FileConfig = fileOut;
          }
          if (Object.keys(loggerConfig).length) { entry.LoggerConfiguration = loggerConfig; }
        } else if (t.type === 'ASCII') {
          if (t.base)             { entry.Base                = t.base; }
          if (t.timeStampSetting) { entry.TimeStampSetting    = t.timeStampSetting; }
          if (t.internalEventLogged !== undefined) { entry.InternalEventLogged = t.internalEventLogged; }
          if (t.loggerConfiguration?.fileConfig && Object.keys(t.loggerConfiguration.fileConfig).length) {
            const fc2 = t.loggerConfiguration.fileConfig;
            const fileOut: Record<string, any> = {};
            if (fc2.baseFileName !== undefined) { fileOut.BaseFileName = fc2.baseFileName; }
            if (fc2.extension !== undefined)    { fileOut.Extension    = fc2.extension; }
            if (fc2.maxFile !== undefined)      { fileOut.MaxFile      = fc2.maxFile; }
            if (fc2.maxFileSize !== undefined)  { fileOut.MaxFileSize  = fc2.maxFileSize; }
            entry.LoggerConfiguration = { FileConfig: fileOut };
          }
        }

        tracing[t.name] = entry;
      }
      frameworkSection.Tracing = tracing;
    }

    // PublisherConfig
    if (fc?.publisherType) {
      const pub: Record<string, any> = { PublisherType: fc.publisherType };
      if (fc.publisherType === 'MultiThreaded' && fc.channelsGroups?.length) {
        pub.ChannelsGroups = fc.channelsGroups;
      }
      frameworkSection.PublisherConfig = pub;
    }

    // ConnectedEcus
    if (fc?.connectedEcus?.length) {
      frameworkSection.ConnectedEcus = fc.connectedEcus;
    }

    // ServicePack
    if (fc?.servicePack) {
      frameworkSection.ServicePack = fc.servicePack;
    }

    // EthernetConfig (from model if present)
    if (fc?.ethernetConfig) {
      const ec = fc.ethernetConfig as any;
      const ethOut: Record<string, any> = {};
      if (ec.considerOnlyEthernetTopologyEcus !== undefined) { ethOut.ConsiderOnlyEthernetTopologyEcus = ec.considerOnlyEthernetTopologyEcus; }
      if (ec.npduConfig) {
        const n = ec.npduConfig;
        const npduOut: Record<string, any> = {};
        if (n.manageVlansInCom           !== undefined) { npduOut.ManageVlansInCom            = n.manageVlansInCom; }
        if (n.restrictedNPduChannelsInCom !== undefined) { npduOut.RestrictedNPduChannelsInCom = n.restrictedNPduChannelsInCom; }
        if (n.ipMacTable?.length)  { npduOut.IPMacTable = n.ipMacTable; }
        if (n.vLans) {
          const vlansOut: Record<string, any> = {};
          if (n.vLans.innerTags?.length) { vlansOut.InnerTags = n.vLans.innerTags; }
          if (n.vLans.outerTags?.length) { vlansOut.OuterTags = n.vLans.outerTags; }
          if (Object.keys(vlansOut).length) { npduOut.VLans = vlansOut; }
        }
        if (Object.keys(npduOut).length) { ethOut.NPduConfig = npduOut; }
      }
      if (ec.someIPConfig) {
        const s = ec.someIPConfig;
        const someipOut: Record<string, any> = {};
        if (s.serverToClientPortRangeMapping) {
          someipOut.ServerToClientPortRangeMapping = {
            ServerPorts: s.serverToClientPortRangeMapping.serverPorts,
            ClientPorts: s.serverToClientPortRangeMapping.clientPorts,
          };
        }
        if (s.endpointImplementation) { someipOut.EndpointImplementation = s.endpointImplementation; }
        if (s.adapterName)            { someipOut.AdapterName            = s.adapterName; }
        if (Object.keys(someipOut).length) { ethOut.SomeIPConfig = someipOut; }
      }
      if (ec.appLayerPorts) { ethOut.AppLayerPorts = ec.appLayerPorts; }
      if (Object.keys(ethOut).length) { frameworkSection.EthernetConfig = ethOut; }
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
