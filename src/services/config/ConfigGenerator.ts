import * as yaml from 'js-yaml';
import { Configuration } from '../../models';
import { MappingManager } from '../mapping/MappingManager';
import { ConfigValidator } from './ConfigValidator';
import { HardwareChannelSubclass } from '../../models/enums';

const CM_SUBCLASSES: string[] = [
  HardwareChannelSubclass.CAN_INTERFACE,
  HardwareChannelSubclass.CIB_INTERFACE,
  HardwareChannelSubclass.CM_INTERFACE,
  HardwareChannelSubclass.LIN_CARD,
];

function convertAppLayerPortsToFlow(yamlStr: string): string {
  const lines = yamlStr.split('\n');
  const result: string[] = [];
  let inAppLayerPorts = false;
  let alpIndent = -1;
  let currentKey = '';
  let currentItems: string[] = [];
  let currentIndent = -1;

  function flushItem() {
    if (currentKey && currentItems.length > 0) {
      const inline = currentItems.map(item => {
        const sub = item.match(/^\s*-\s+(.*)/);
        return sub ? sub[1].trim() : item.trim();
      });
      result.push(`${' '.repeat(currentIndent)}${currentKey}: [${inline.join(', ')}]`);
      currentKey = '';
      currentItems = [];
    }
  }

  for (const line of lines) {
    if (!inAppLayerPorts) {
      result.push(line);
      const m = line.match(/^(\s*)AppLayerPorts:\s*$/);
      if (m) {
        inAppLayerPorts = true;
        alpIndent = m[1].length;
      }
      continue;
    }

    // Detect if we've left the AppLayerPorts block
    const stripped = line.trimStart();
    const lineIndent = line.length - stripped.length;
    if (stripped === '' ) { currentItems.push(line); continue; }
    if (lineIndent <= alpIndent && stripped !== '') {
      flushItem();
      inAppLayerPorts = false;
      result.push(line);
      const m = line.match(/^(\s*)AppLayerPorts:\s*$/);
      if (m) { inAppLayerPorts = true; alpIndent = m[1].length; }
      continue;
    }

    // Key line: e.g. "      NPdu:"
    const keyMatch = line.match(/^(\s+)(\w+):\s*$/);
    if (keyMatch && keyMatch[1].length === alpIndent + 2) {
      flushItem();
      currentKey = keyMatch[2];
      currentIndent = keyMatch[1].length;
      currentItems = [];
      continue;
    }

    // Item line under a key
    if (currentKey) {
      currentItems.push(line);
    } else {
      result.push(line);
    }
  }
  flushItem();
  return result.join('\n');
}

/** Converts IPMacTable nested block sequences to a single inline flow line. */
/** Converts block sequences under IPList to inline flow with no spaces: [ip1,ip2,ip3] */
function convertIPListToFlow(yamlStr: string): string {
  const lines = yamlStr.split('\n');
  const result: string[] = [];
  let inList = false;
  let listIndent = -1;
  let items: string[] = [];

  function flushList() {
    if (items.length > 0) {
      result.push(`${' '.repeat(listIndent)}IPList: [${items.join(',')}]`);
      items = [];
    }
  }

  for (const line of lines) {
    if (!inList) {
      const m = line.match(/^(\s*)IPList:\s*$/);
      if (m) { inList = true; listIndent = m[1].length; }
      else { result.push(line); }
      continue;
    }
    const stripped = line.trimStart();
    const lineIndent = line.length - stripped.length;
    if (stripped === '') { continue; }
    if (lineIndent <= listIndent) {
      flushList(); inList = false;
      const m = line.match(/^(\s*)IPList:\s*$/);
      if (m) { inList = true; listIndent = m[1].length; }
      else { result.push(line); }
      continue;
    }
    const itemMatch = line.match(/^\s+- (.*)/);
    if (itemMatch) { items.push(itemMatch[1].trim()); continue; }
    result.push(line);
  }
  flushList();
  return result.join('\n');
}

function convertIPMacTableToFlow(yamlStr: string): string {
  const lines = yamlStr.split('\n');
  const result: string[] = [];
  let inIMT = false;
  let imtIndent = -1;
  let pairs: [string, string][] = [];
  let currentFirst: string | null = null;
  const stripQ = (s: string) => s.replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1');

  function flushIMT() {
    if (pairs.length > 0 || currentFirst !== null) {
      if (currentFirst !== null) { pairs.push([currentFirst, '']); currentFirst = null; }
      const inline = pairs.map(([a, b]) => `[${stripQ(a)}, ${stripQ(b)}]`).join(', ');
      result.push(`${' '.repeat(imtIndent)}IPMacTable: [${inline}]`);
      pairs = [];
    }
  }

  for (const line of lines) {
    if (!inIMT) {
      const m = line.match(/^(\s*)IPMacTable:\s*$/);
      if (m) { inIMT = true; imtIndent = m[1].length; }
      else { result.push(line); }
      continue;
    }
    const stripped = line.trimStart();
    const lineIndent = line.length - stripped.length;
    if (stripped === '') { continue; }
    if (lineIndent <= imtIndent) {
      flushIMT(); inIMT = false;
      const m = line.match(/^(\s*)IPMacTable:\s*$/);
      if (m) { inIMT = true; imtIndent = m[1].length; }
      else { result.push(line); }
      continue;
    }
    const newPair = line.match(/^(\s*)- - (.*)/);
    if (newPair && newPair[1].length === imtIndent + 2) {
      if (currentFirst !== null) { pairs.push([currentFirst, '']); }
      currentFirst = newPair[2].trim();
      continue;
    }
    if (currentFirst !== null) {
      const cont = line.match(/^\s+- (.*)/);
      if (cont) { pairs.push([currentFirst, cont[1].trim()]); currentFirst = null; continue; }
      pairs.push([currentFirst, '']); currentFirst = null;
    }
    result.push(line);
  }
  flushIMT();
  return result.join('\n');
}

/** Converts block nested-sequences under ChannelsGroups to inline flow arrays.
 * e.g. "- - Ch_CAN1\n    - Ch_CAN2" → "- [Ch_CAN1, Ch_CAN2]" */
function convertChannelsGroupsToFlow(yamlStr: string): string {
  const lines = yamlStr.split('\n');
  const result: string[] = [];
  let inCG = false;
  let cgIndent = -1;
  let inGroup = false;
  let groupItems: string[] = [];
  let groupOutIndent = -1;

  function flushGroup() {
    if (inGroup && groupItems.length > 0) {
      result.push(`${' '.repeat(groupOutIndent)}- [${groupItems.join(', ')}]`);
      groupItems = []; inGroup = false;
    }
  }

  for (const line of lines) {
    if (!inCG) {
      result.push(line);
      const m = line.match(/^(\s*)ChannelsGroups:\s*$/);
      if (m) { inCG = true; cgIndent = m[1].length; }
      continue;
    }
    const stripped = line.trimStart();
    const lineIndent = line.length - stripped.length;
    if (stripped === '') { continue; }
    if (lineIndent <= cgIndent) {
      flushGroup(); inCG = false; result.push(line);
      const m = line.match(/^(\s*)ChannelsGroups:\s*$/);
      if (m) { inCG = true; cgIndent = m[1].length; }
      continue;
    }
    const newGrp = line.match(/^(\s*)- - (.*)/);
    if (newGrp && newGrp[1].length === cgIndent + 2) {
      flushGroup();
      inGroup = true; groupOutIndent = newGrp[1].length;
      groupItems = [newGrp[2].trim()];
      continue;
    }
    if (inGroup) {
      const cont = line.match(/^\s+- (.*)/);
      if (cont) { groupItems.push(cont[1].trim()); continue; }
      flushGroup();
    }
    result.push(line);
  }
  flushGroup();
  return result.join('\n');
}

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

  preGenerationValidate(): string[] {
    return this.validator.validate(this.config, this.mappingManager);
  }

  generate(): string {
    const errors = this.preGenerationValidate();
    if (errors.length > 0) {
      throw new Error(`Cannot generate config.yaml:\n${errors.map(e => `  â€¢ ${e}`).join('\n')}`);
    }
    const raw = yaml.dump(this._buildMtfObject(), { indent: 2, lineWidth: 120, noRefs: true });
    const fixedKeys = raw.replace(/^(\s*)'(\d+)':/gm, '$1$2:');
    return convertIPListToFlow(convertIPMacTableToFlow(convertChannelsGroupsToFlow(convertAppLayerPortsToFlow(fixedKeys))));
  }

  generateAsObject(): object {
    return this._buildMtfObject();
  }


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
        if (n.ManageVlansInCom            !== undefined) { npduOut.ManageVlansInCom            = n.ManageVlansInCom; }
        if (n.RestrictNPduChannelsInCom   !== undefined) { npduOut.RestrictNPduChannelsInCom   = n.RestrictNPduChannelsInCom; }
        if (n.IPMacTable?.length)  { npduOut.IPMacTable = n.IPMacTable; }
        if (n.VLans) {
          const vlansOut: Record<string, any> = {};
          if (n.VLans.InnerTags?.length) { vlansOut.InnerTags = n.VLans.InnerTags; }
          if (n.VLans.OuterTags?.length) { vlansOut.OuterTags = n.VLans.OuterTags; }
          if (Object.keys(vlansOut).length) { npduOut.VLans = vlansOut; }
        }
        if (Object.keys(npduOut).length) { ethOut.NPduConfig = npduOut; }
      }
      if (ec.someIPConfig) {
        const s = ec.someIPConfig;
        const someipOut: Record<string, any> = {};
        if (s.ServerToClientPortRangeMapping) {
          someipOut.ServerToClientPortRangeMapping = {
            ServerPorts: s.ServerToClientPortRangeMapping.ServerPorts,
            ClientPorts: s.ServerToClientPortRangeMapping.ClientPorts,
          };
        }
        if (s.EndpointImplementation) { someipOut.EndpointImplementation = s.EndpointImplementation; }
        if (s.AdapterName)            { someipOut.AdapterName            = s.AdapterName; }
        if (Object.keys(someipOut).length) { ethOut.SomeIPConfig = someipOut; }
      }
      if (ec.appLayerPorts) {
        const alpObj: Record<string, any> = {};
        for (const [k, v] of Object.entries(ec.appLayerPorts as Record<string, any>)) {
          if (v !== undefined && v !== null) { alpObj[k] = v; }
        }
        if (Object.keys(alpObj).length) { ethOut.AppLayerPorts = alpObj; }
      }
      if (ec.ethernetTopology) {
        const topo = ec.ethernetTopology;
        const topoOut: Record<string, any> = {};
        if (topo.EthProtoPrioConfig?.length) { topoOut.EthProtoPrioConfig = topo.EthProtoPrioConfig; }
        if (topo.TopologyConfig?.length)     { topoOut.TopologyConfig     = topo.TopologyConfig; }
        if (Object.keys(topoOut).length) { ethOut.EthernetTopology = topoOut; }
      }
      if (ec.channelToEcusMapping && Object.keys(ec.channelToEcusMapping).length) {
        ethOut.ChannelToEcusMapping = ec.channelToEcusMapping;
      }
      if (Object.keys(ethOut).length) { section.EthernetConfig = ethOut; }
    }

    return section;
  }
}
