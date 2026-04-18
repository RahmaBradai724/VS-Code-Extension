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
 * ConfigGenerator serializes a Configuration object into an MTPF-compatible config.yaml.
 * Channels â†’ logical channels only (Id, Type, Protocol, loggingName, TracerName, Alias)
 * Mappings â†’ CM devices and PCAP adapters grouped by hardware type
 * FrameworkConfig â†’ Tracing, Publisher, etc.
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
      throw new Error(`Cannot generate config.yaml:\n${errors.map(e => `  â€¢ ${e}`).join('\n')}`);
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

  // â”€â”€â”€ Top-level builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private _buildMtfObject(): Record<string, any> {
    const mappings = this.mappingManager.getMappingsByConfigId(this.config.id);

    // Index: hardwareChannelId â†’ mappings[]
    const mappingsByHwId = new Map<string, typeof mappings>();
    for (const m of mappings) {
      const arr = mappingsByHwId.get(m.hardwareChannelId) ?? [];
      arr.push(m);
      mappingsByHwId.set(m.hardwareChannelId, arr);
    }

    const result: Record<string, any> = {
      Channels: this._buildChannelsSection(),
      Mappings: this._buildMappingsSection(mappingsByHwId),
    };
    const framework = this._buildFrameworkSection();
    if (Object.keys(framework).length) {
      result.FrameworkConfig = framework;
    }
    return result;
  }

  // â”€â”€â”€ Channels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private _buildChannelsSection(): Record<string, any> {
    const channelsSection: Record<string, any> = {};
    this.config.logicalChannels.forEach((ch, index) => {
      const chAny = ch as any;
      const obj: Record<string, any> = {
        // Use user-defined channelId if set; fall back to 1-based index
        Id: (chAny.channelId != null && chAny.channelId !== '') ? Number(chAny.channelId) : index + 1,
        // MTF spec uses 'FR' — normalize both FLEXRAY and FR enum values
        Type: ch.category === 'FLEXRAY' ? 'FR' : ch.category,
      };
      if (ch.category !== 'BRIDGE') {
        const protocol = (ch as any).protocol;
        if (protocol) { obj.Protocol = protocol; }
        if (ch.loggingName) { obj.LoggingName = ch.loggingName; }
        if (ch.tracerName) { obj.TracerName = ch.tracerName; }
        if (ch.alias?.length) { obj.Alias = ch.alias; }
        if ((ch as any).loggingBusIndex != null) { obj.LoggingBusIndex = (ch as any).loggingBusIndex; }
        if ((ch as any).applicationProtocol) { obj.ApplicationProtocol = (ch as any).applicationProtocol; }
      }
      channelsSection[ch.name] = obj;
    });
    return channelsSection;
  }

  // â”€â”€â”€ Mappings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private _buildMappingsSection(mappingsByHwId: Map<string, any[]>): Record<string, any> {
    const section: Record<string, any> = {};

    const cm = this._buildCmSection(mappingsByHwId);
    if (cm) { section.CM = cm; }

    const pcap = this._buildPcapSection(mappingsByHwId);
    if (pcap) { section.PCAP = pcap; }

    const serial = this._buildSerialSection(mappingsByHwId);
    if (serial) { section.Serial = serial; }

    const bts = this._buildBtsRevoSection(mappingsByHwId);
    if (bts) { section['BTS-Revo'] = bts; }

    const hhLoad = this._buildHhLoadSection(mappingsByHwId);
    if (hhLoad) { section.HH_Electrical_load = hhLoad; }

    const genesys = this._buildGenesysSection(mappingsByHwId);
    if (genesys) { section.Genesys_PowerSupply = genesys; }

    const manson = this._buildMansonSection(mappingsByHwId);
    if (manson) { section.Manson_PowerSupply = manson; }

    return section;
  }

  private _buildCmSection(mappingsByHwId: Map<string, any[]>): Record<string, any> | undefined {
    const hardware = this.config.hardwareChannels.filter(hw => CM_SUBCLASSES.includes(hw.subclass));
    if (hardware.length === 0) { return undefined; }
    const cmDevices: Record<string, any> = {};
    hardware.forEach((hw, idx) => {
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
    return { Devices: cmDevices };
  }

  private _buildPcapSection(mappingsByHwId: Map<string, any[]>): Record<string, any> | undefined {
    const hardware = this.config.hardwareChannels.filter(
      hw => hw.subclass === HardwareChannelSubclass.ETHERNET_ADAPTER,
    );
    if (hardware.length === 0) { return undefined; }
    const section: Record<string, any> = {};
    hardware.forEach((hw, idx) => {
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
      if (a.differentHandlerForTxAndRx != null) { adapterObj.DifferentHandlerForTxAndRx = a.differentHandlerForTxAndRx; }
      if (a.tecmpPacketizationActive != null) { adapterObj.TECMPPacketizationActive = a.tecmpPacketizationActive; }
      section[idx + 1] = { Adapter: adapterObj };
    });
    return section;
  }

  private _buildSerialSection(mappingsByHwId: Map<string, any[]>): Record<string, any> | undefined {
    const hardware = this.config.hardwareChannels.filter(
      hw => hw.subclass === HardwareChannelSubclass.SERIAL_PORT,
    );
    if (hardware.length === 0) { return undefined; }
    const ports: Record<string, any> = {};
    hardware.forEach(hw => {
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
    return { Ports: ports };
  }

  private _buildBtsRevoSection(mappingsByHwId: Map<string, any[]>): Record<string, any> | undefined {
    const hardware = this.config.hardwareChannels.filter(
      hw => hw.subclass === HardwareChannelSubclass.BTS_REVO,
    );
    if (hardware.length === 0) { return undefined; }
    const boards: Record<string, any> = {};
    hardware.forEach((hw, idx) => {
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
    return { Boards: boards };
  }

  private _buildHhLoadSection(mappingsByHwId: Map<string, any[]>): Record<string, any> | undefined {
    const hardware = this.config.hardwareChannels.filter(
      hw => hw.subclass === HardwareChannelSubclass.HH_LOAD,
    );
    if (hardware.length === 0) { return undefined; }
    const devices: Record<string, any> = {};
    hardware.forEach((hw, idx) => {
      const a = hw as any;
      const hwMappings = mappingsByHwId.get(hw.id) ?? [];
      const channels: Record<string, any> = {};
      hwMappings.forEach((m, chIdx) => {
        channels[chIdx + 1] = {
          Id: m.hwChannel ?? chIdx + 1,
          Name: m.logicalChannelName,
        };
      });
      const dev: Record<string, any> = {};
      if (a.deviceId   != null) { dev.Id       = a.deviceId; }
      if (a.portName)           { dev.PortName  = a.portName; }
      if (a.loadType)           { dev.Type      = a.loadType; }
      if (a.bitRate    != null) { dev.BitRate   = a.bitRate; }
      if (Object.keys(channels).length) { dev.Channels = channels; }
      devices[idx + 1] = dev;
    });
    return { Devices: devices };
  }

  private _buildGenesysSection(mappingsByHwId: Map<string, any[]>): Record<string, any> | undefined {
    const hardware = this.config.hardwareChannels.filter(
      hw => hw.subclass === HardwareChannelSubclass.GENESYS_PS,
    );
    if (hardware.length === 0) { return undefined; }
    const channels: Record<string, any> = {};
    hardware.forEach((hw, idx) => {
      const a = hw as any;
      const hwMappings = mappingsByHwId.get(hw.id) ?? [];
      const channelName = hwMappings[0]?.logicalChannelName ?? a.channelName ?? hw.name;
      const ch: Record<string, any> = { ChannelName: channelName };
      if (a.communicationProtocol) { ch.CommunicationProtocol = a.communicationProtocol; }
      if (a.defaultVoltage    != null) { ch.DefaultVoltage    = a.defaultVoltage; }
      if (a.maxVoltage        != null) { ch.MaxVoltage        = a.maxVoltage; }
      if (a.defaultMaxCurrent != null) { ch.DefaultMaxCurrent = a.defaultMaxCurrent; }
      if (a.samplingInterval  != null) { ch.SamplingInterval  = a.samplingInterval; }
      if (a.portName)  { ch.PortName = a.portName; }
      if (a.bitRate    != null) { ch.BitRate = a.bitRate; }
      if (a.ip)        { ch.IP = a.ip; }
      if (a.port       != null) { ch.Port = a.port; }
      if (a.language)  { ch.Language = a.language; }
      if (a.continuousMonitoringActive != null) { ch.ContinuousMonitoringActive = a.continuousMonitoringActive; }
      if (a.keepStatus != null) { ch.KeepStatus = a.keepStatus; }
      channels[idx + 1] = ch;
    });
    return { Channels: channels };
  }

  private _buildMansonSection(mappingsByHwId: Map<string, any[]>): Record<string, any> | undefined {
    const hardware = this.config.hardwareChannels.filter(
      hw => hw.subclass === HardwareChannelSubclass.MANSON_PS,
    );
    if (hardware.length === 0) { return undefined; }
    const channels: Record<string, any> = {};
    hardware.forEach((hw, idx) => {
      const a = hw as any;
      const hwMappings = mappingsByHwId.get(hw.id) ?? [];
      const channelName = hwMappings[0]?.logicalChannelName ?? a.channelName ?? hw.name;
      const ch: Record<string, any> = { ChannelName: channelName };
      if (a.portName            != null) { ch.PortName                   = a.portName; }
      if (a.bitRate             != null) { ch.BitRate                    = a.bitRate; }
      if (a.maxVoltage          != null) { ch.MaxVoltage                 = a.maxVoltage; }
      if (a.maxCurrent          != null) { ch.MaxCurrent                 = a.maxCurrent; }
      if (a.defaultVoltage      != null) { ch.DefaultVoltage             = a.defaultVoltage; }
      if (a.keepStatus          != null) { ch.KeepStatus                 = a.keepStatus; }
      if (a.continuousRead      != null) { ch.ContinuousRead             = a.continuousRead; }
      if (a.continuousReadingInterval != null) { ch.ContinuousReadingInterval = a.continuousReadingInterval; }
      channels[idx + 1] = ch;
    });
    return { Channels: channels };
  }

  // â”€â”€â”€ Framework â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private _buildFrameworkSection(): Record<string, any> {
    const fc = this.config.frameworkConfig as any;
    const section: Record<string, any> = {};

    // Tracing
    const rawTracers: any[] = fc?.tracers || [];
    if (rawTracers.length > 0) {
      const tracing: Record<string, any> = {};
      for (const t of rawTracers) {
        const type = t.Type || t.type;
        const entry: Record<string, any> = { Type: type };
        const ts = t.Timestamp || t.timestamp;
        if (ts) { entry.Timestamp = ts; }
        const lc = t.LoggerConfiguration || t.loggerConfiguration;
        if (type === 'PCAP') {
          const lt = t.LoggingType || t.loggingType;
          if (lt) { entry.LoggingType = lt; }
          const loggerConfig: Record<string, any> = {};
          const bc = lc?.BufferConfig || lc?.bufferConfig;
          if (bc && Object.keys(bc).length) {
            const bufOut: Record<string, any> = {};
            if (bc.BufferSize    ?? bc.bufferSize    !== undefined) { bufOut.BufferSize    = bc.BufferSize    ?? bc.bufferSize; }
            if (bc.BufferNumber  ?? bc.bufferNumber  !== undefined) { bufOut.BufferNumber  = bc.BufferNumber  ?? bc.bufferNumber; }
            if (bc.WriteBurstSize ?? bc.writeBurstSize !== undefined) { bufOut.WriteBurstSize = bc.WriteBurstSize ?? bc.writeBurstSize; }
            if (Object.keys(bufOut).length) { loggerConfig.BufferConfig = bufOut; }
          }
          const fc2 = lc?.FileConfig || lc?.fileConfig;
          if (fc2 && Object.keys(fc2).length) {
            const fileOut: Record<string, any> = {};
            const bn = fc2.BaseFileName ?? fc2.baseFileName; if (bn !== undefined) { fileOut.BaseFileName = bn; }
            const ex = fc2.Extension    ?? fc2.extension;    if (ex !== undefined) { fileOut.Extension    = ex; }
            const mf = fc2.MaxFile      ?? fc2.maxFile;      if (mf !== undefined) { fileOut.MaxFile      = mf; }
            const ms = fc2.MaxFileSize  ?? fc2.maxFileSize;  if (ms !== undefined) { fileOut.MaxFileSize  = ms; }
            const cl = fc2.CompressionLevel ?? fc2.compressionLevel; if (cl !== undefined) { fileOut.CompressionLevel = cl; }
            if (Object.keys(fileOut).length) { loggerConfig.FileConfig = fileOut; }
          }
          if (Object.keys(loggerConfig).length) { entry.LoggerConfiguration = loggerConfig; }
        } else if (type === 'ASCII') {
          const base = t.Base || t.base;
          const tss  = t.TimeStampSetting || t.timeStampSetting;
          const iel  = t.InternalEventLogged ?? t.internalEventLogged;
          if (base) { entry.Base = base; }
          if (tss)  { entry.TimeStampSetting = tss; }
          if (iel !== undefined) { entry.InternalEventLogged = iel; }
          const fc2 = lc?.FileConfig || lc?.fileConfig;
          if (fc2 && Object.keys(fc2).length) {
            const fileOut: Record<string, any> = {};
            const bn = fc2.BaseFileName ?? fc2.baseFileName; if (bn !== undefined) { fileOut.BaseFileName = bn; }
            const ex = fc2.Extension    ?? fc2.extension;    if (ex !== undefined) { fileOut.Extension    = ex; }
            const mf = fc2.MaxFile      ?? fc2.maxFile;      if (mf !== undefined) { fileOut.MaxFile      = mf; }
            const ms = fc2.MaxFileSize  ?? fc2.maxFileSize;  if (ms !== undefined) { fileOut.MaxFileSize  = ms; }
            if (Object.keys(fileOut).length) { entry.LoggerConfiguration = { FileConfig: fileOut }; }
          }
        }
        tracing[t.name] = entry;
      }
      section.Tracing = tracing;
    }

    // PublisherConfig
    if (fc?.publisherType) {
      const pub: Record<string, any> = { PublisherType: fc.publisherType };
      if (fc.publisherType === 'MultiThreaded' && fc.channelsGroups?.length) {
        pub.ChannelsGroups = fc.channelsGroups;
      }
      section.PublisherConfig = pub;
    }

    // ConnectedEcus
    if (fc?.connectedEcus?.length) {
      section.ConnectedEcus = fc.connectedEcus;
    }

    // ServicePack
    if (fc?.servicePack) {
      section.ServicePack = fc.servicePack;
    }

    // EthernetConfig
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
      if (Object.keys(ethOut).length) { section.EthernetConfig = ethOut; }
    }

    return section;
  }
}
