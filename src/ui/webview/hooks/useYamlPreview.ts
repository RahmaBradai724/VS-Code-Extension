import { useMemo } from 'react';
import * as yaml from 'js-yaml';
import { AppState } from '../types';

const CM_SUBCLASSES = ['CANInterface', 'CIBInterface', 'CMInterface', 'LINCard'];

/** Converts block-sequence AppLayerPorts entries to inline flow arrays in a YAML string. */
/** Puts the sequence indicator on its own line for InnerTags/OuterTags items.
 * e.g. "  - ID: 73" → "  -\n    ID: 73" */
/** Converts ServerPorts and ClientPorts nested block sequences to inline flow pairs.
 * e.g. "- - '30501'\n  - '30599'" → "ServerPorts: [[30501,30599], ...]" */
function convertPortRangesToFlow(yamlStr: string): string {
  const lines = yamlStr.split('\n');
  const result: string[] = [];
  let inKey = false;
  let keyIndent = -1;
  let keyName = '';
  let pairs: [string, string][] = [];
  let currentFirst: string | null = null;
  const stripQ = (s: string) => s.replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1');

  function flushKey() {
    if (keyName && (pairs.length > 0 || currentFirst !== null)) {
      if (currentFirst !== null) { pairs.push([currentFirst, '']); currentFirst = null; }
      const validPairs = pairs.filter(([a, b]) => stripQ(a) !== '' && stripQ(b) !== '');
      if (validPairs.length > 0) {
        const inline = validPairs.map(([a, b]) => `[${stripQ(a)},${stripQ(b)}]`).join(', ');
        result.push(`${' '.repeat(keyIndent)}${keyName}: [${inline}]`);
      }
      pairs = []; keyName = '';
    }
  }

  for (const line of lines) {
    if (!inKey) {
      const m = line.match(/^(\s*)(ServerPorts|ClientPorts):\s*$/);
      if (m) { inKey = true; keyIndent = m[1].length; keyName = m[2]; }
      else { result.push(line); }
      continue;
    }
    const stripped = line.trimStart();
    const lineIndent = line.length - stripped.length;
    if (stripped === '') { continue; }
    if (lineIndent <= keyIndent) {
      flushKey(); inKey = false;
      const m = line.match(/^(\s*)(ServerPorts|ClientPorts):\s*$/);
      if (m) { inKey = true; keyIndent = m[1].length; keyName = m[2]; }
      else { result.push(line); }
      continue;
    }
    const newPair = line.match(/^(\s*)- - (.*)/);
    if (newPair && newPair[1].length === keyIndent + 2) {
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
  flushKey();
  return result.join('\n');
}

function convertVlanTagsToExplicitDash(yamlStr: string): string {
  const lines = yamlStr.split('\n');
  const result: string[] = [];
  let inSection = false;
  let sectionIndent = -1;

  for (const line of lines) {
    const stripped = line.trimStart();
    const lineIndent = line.length - stripped.length;

    if (!inSection) {
      result.push(line);
      const m = line.match(/^(\s*)(InnerTags|OuterTags):\s*$/);
      if (m) { inSection = true; sectionIndent = m[1].length; }
      continue;
    }
    if (stripped === '') { result.push(line); continue; }
    if (lineIndent <= sectionIndent) {
      inSection = false; result.push(line);
      const m = line.match(/^(\s*)(InnerTags|OuterTags):\s*$/);
      if (m) { inSection = true; sectionIndent = m[1].length; }
      continue;
    }
    // Sequence item that has a mapping key inline: "    - KEY: VALUE"
    const seqItem = line.match(/^(\s+)- (\w[\w]*: .*)$/);
    if (seqItem) {
      result.push(`${seqItem[1]}-`);
      result.push(`${seqItem[1]}  ${seqItem[2]}`);
      continue;
    }
    result.push(line);
  }
  return result.join('\n');
}

function convertAppLayerPortsToFlow(yamlStr: string): string {
  const lines = yamlStr.split('\n');
  const result: string[] = [];
  let inAppLayerPorts = false;
  let alpIndent = -1;
  let currentKey = '';
  let currentItems: string[] = [];
  let currentIndent = -1;
  let inSubArray = false;
  let subArray: string[] = [];
  let subArrayIndent = -1;

  function flushSubArray() {
    if (subArray.length > 0) {
      currentItems.push(`[${subArray.join(', ')}]`);
      subArray = []; inSubArray = false; subArrayIndent = -1;
    }
  }

  function flushItem() {
    flushSubArray();
    if (currentKey && currentItems.length > 0) {
      result.push(`${' '.repeat(currentIndent)}${currentKey}: [${currentItems.join(', ')}]`);
      currentKey = ''; currentItems = [];
    }
  }

  for (const line of lines) {
    if (!inAppLayerPorts) {
      result.push(line);
      const m = line.match(/^(\s*)AppLayerPorts:\s*$/);
      if (m) { inAppLayerPorts = true; alpIndent = m[1].length; }
      continue;
    }
    const stripped = line.trimStart();
    const lineIndent = line.length - stripped.length;
    if (stripped === '') { continue; }
    if (lineIndent <= alpIndent) {
      flushItem(); inAppLayerPorts = false; result.push(line);
      const m = line.match(/^(\s*)AppLayerPorts:\s*$/);
      if (m) { inAppLayerPorts = true; alpIndent = m[1].length; }
      continue;
    }
    const keyMatch = line.match(/^(\s+)(\w+):\s*$/);
    if (keyMatch && keyMatch[1].length === alpIndent + 2) {
      flushItem(); currentKey = keyMatch[2]; currentIndent = keyMatch[1].length; currentItems = [];
      continue;
    }
    if (currentKey) {
      // Nested sub-array start: "      - - value"
      const nestedStart = line.match(/^(\s+)- - (.+)/);
      if (nestedStart) {
        flushSubArray();
        inSubArray = true; subArrayIndent = nestedStart[1].length;
        subArray = [nestedStart[2].trim()];
        continue;
      }
      // Nested sub-array continuation: deeper indent, "- value"
      if (inSubArray && lineIndent > subArrayIndent) {
        const cont = line.match(/^\s+- (.+)/);
        if (cont) { subArray.push(cont[1].trim()); continue; }
      }
      // Simple item: "      - value"
      flushSubArray();
      const simpleItem = line.match(/^\s+- (.+)/);
      if (simpleItem) { currentItems.push(simpleItem[1].trim()); continue; }
    }
    result.push(line);
  }
  flushItem();
  return result.join('\n');
}

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
 * e.g.  "- - Ch_CAN1\n    - Ch_CAN2" → "- [Ch_CAN1, Ch_CAN2]" */
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
    // Start of a new group: "  - - Item"
    const newGrp = line.match(/^(\s*)- - (.*)/);
    if (newGrp && newGrp[1].length === cgIndent + 2) {
      flushGroup();
      inGroup = true; groupOutIndent = newGrp[1].length;
      groupItems = [newGrp[2].trim()];
      continue;
    }
    // Continuation: "    - Item"
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

function mapPortEntry(port: any): any {
  if (!port.portType) { return port; } // already in correct format (e.g. imported)
  const out: any = {};
  const v = String(port.value ?? '');
  if (port.portType === 'SrcPort' || port.portType === 'DstPort') {
    out[port.portType] = v !== '' && !isNaN(Number(v)) ? Number(v) : v;
  } else {
    // SrcPortRange or DstPortRange — expect "start-end" format
    const m = v.match(/^(\d+)\s*-\s*(\d+)$/);
    out[port.portType] = m ? [Number(m[1]), Number(m[2])] : v;
  }
  if (port.Priority !== undefined) { out.Priority = port.Priority; }
  return out;
}

function buildMtfObject(state: AppState): Record<string, any> {
  const { logicalChannels, hardwareChannels, mappings, frameworkData } = state;

  // Index: hardwareChannelId → mappings[]
  const mappingsByHwId = new Map<string, any[]>();
  for (const m of mappings) {
    const arr = mappingsByHwId.get(m.hardwareChannelId) ?? [];
    arr.push(m);
    mappingsByHwId.set(m.hardwareChannelId, arr);
  }

  // ── Channels section ──────────────────────────────────────────────
  const channelsSection: Record<string, any> = {};
  logicalChannels.forEach((ch, index) => {
    const obj: Record<string, any> = {
      Id: (ch.channelId != null && ch.channelId > 0) ? ch.channelId : index + 1,
      Type: ch.category === 'FLEXRAY' ? 'FR' : ch.category,
    };
    if (ch.category !== 'BRIDGE') {
      if (ch.protocol)      { obj.Protocol    = ch.protocol; }
      if (ch.loggingName)   { obj.LoggingName  = ch.loggingName; }
      if (ch.tracerName)    { obj.TracerName   = ch.tracerName; }
      if (ch.alias?.length) { obj.Alias        = ch.alias; }
      if (ch.loggingBusIndex != null) { obj.LoggingBusIndex = ch.loggingBusIndex; }
      if (ch.applicationProtocol) { obj.ApplicationProtocol = ch.applicationProtocol; }
    }
    channelsSection[ch.name] = obj;
  });

  // ── Mappings section ──────────────────────────────────────────────
  const mappingsSection: Record<string, any> = {};

  const cmHardware = hardwareChannels.filter(hw => CM_SUBCLASSES.includes(hw.subclass));
  if (cmHardware.length > 0) {
    const cmDevices: Record<string, any> = {};
    cmHardware.forEach((hw, idx) => {
      const hwMappings = mappingsByHwId.get(hw.id) ?? [];
      const buses: Record<string, any> = {};
      for (const m of hwMappings) {
        const busObj: Record<string, any> = {};
        if (m.hwChannel !== undefined && m.hwChannel !== null) { busObj.HWChannel      = m.hwChannel; }
        if (m.operationMode)                                   { busObj.OperationMode  = m.operationMode; }
        const isFlexRay = m.logicalChannelType === 'FR' || m.logicalChannelType === 'FLEXRAY';
        if (isFlexRay) {
          if (m.keySlot !== undefined && m.keySlot !== null) { busObj.KeySlot       = m.keySlot; }
          if (m.nodeType)                                    { busObj.NodeType      = m.nodeType; }
          if (m.wakeUpCluster !== undefined && m.wakeUpCluster !== null) { busObj.WakeUpCluster = m.wakeUpCluster; }
        }
        buses[m.logicalChannelName] = busObj;
      }
      cmDevices[idx + 1] = {
        Id:    hw.cmId   ?? 0,
        Type:  hw.cmType ?? 'CAN_Combo',
        Buses: buses,
      };
    });
    mappingsSection.CM = { Devices: cmDevices };
  }

  const pcapHardware = hardwareChannels.filter(hw => hw.subclass === 'EthernetAdapter');
  if (pcapHardware.length > 0) {
    const pcapSection: Record<string, any> = {};
    pcapHardware.forEach((hw, idx) => {
      const hwMappings = mappingsByHwId.get(hw.id) ?? [];
      if (hwMappings.length === 0) { return; }
      const logicalChannelName = hwMappings[0]?.logicalChannelName ?? hw.name;
      const adapterObj: Record<string, any> = { Name: logicalChannelName };
      if (hw.friendlyName)              { adapterObj.FriendlyName             = hw.friendlyName; }
      if (hw.bufferSize)                { adapterObj.BufferSize               = hw.bufferSize; }
      if (hw.bpFilter)                  { adapterObj.BpfFilter                = hw.bpFilter; }
      if (hw.timeout)                   { adapterObj.Timeout                  = hw.timeout; }
      if (hw.timeStampPrecision)        { adapterObj.TimeStampPrecision        = hw.timeStampPrecision; }
      if (hw.timeStampSource)           { adapterObj.TimeStampSource           = hw.timeStampSource; }
      if (hw.immediateMode != null)     { adapterObj.ImmediateMode             = hw.immediateMode; }
      if (hw.snapshotLength != null)    { adapterObj.SnapshotLength            = hw.snapshotLength; }
      if (hw.pcapDeviceMode)            { adapterObj.PcapDeviceMode            = hw.pcapDeviceMode; }
      if (hw.useDataLoggerTimeStamp != null)    { adapterObj.UseDataLoggerTimeStamp    = hw.useDataLoggerTimeStamp; }
      if (hw.removeDataLoggerMetaData != null)  { adapterObj.RemoveDataLoggerMetaData  = hw.removeDataLoggerMetaData; }
      if (hw.dataLoggerType)            { adapterObj.DataLoggerType            = hw.dataLoggerType; }
      if (hw.packetProcessingActive != null)    { adapterObj.PacketProcessingActive    = hw.packetProcessingActive; }
      if (hw.packetIdentificationActive != null){ adapterObj.PacketIdentificationActive= hw.packetIdentificationActive; }
      if (hw.differentHandlerForTxAndRx != null){ adapterObj.DifferentHandlerForTxAndRx = hw.differentHandlerForTxAndRx; }
      if (hw.tecmpPacketizationActive != null)  { adapterObj.TECMPPacketizationActive   = hw.tecmpPacketizationActive; }
      pcapSection[idx + 1] = { Adapter: adapterObj };
    });
    mappingsSection.PCAP = pcapSection;
  }

  // Serial (SerialPort)
  const serialHardware = hardwareChannels.filter(hw => hw.subclass === 'SerialPort');
  if (serialHardware.length > 0) {
    const ports: Record<string, any> = {};
    serialHardware.forEach(hw => {
      const hwMappings = mappingsByHwId.get(hw.id) ?? [];
      if (hwMappings.length === 0) { return; }
      const logicalChannelName = hwMappings[0]?.logicalChannelName ?? hw.name;
      const portObj: Record<string, any> = {};
      if (hw.portName)             { portObj.PortName             = hw.portName; }
      if (hw.baudRate)             { portObj.BaudRate             = hw.baudRate; }
      if (hw.parity)               { portObj.Parity               = hw.parity; }
      if (hw.dataBits)             { portObj.DataBits             = hw.dataBits; }
      if (hw.stopBits)             { portObj.StopBits             = hw.stopBits; }
      if (hw.flowControl)          { portObj.FlowControl          = hw.flowControl; }
      if (hw.messageTerminator != null) { portObj.MessageTerminator = hw.messageTerminator; }
      if (hw.separationTimeMs)     { portObj.SeparationTimeMs     = hw.separationTimeMs; }
      if (hw.maxReceivedDataSize)  { portObj.MaxReceivedDataSize  = hw.maxReceivedDataSize; }
      ports[logicalChannelName] = portObj;
    });
    mappingsSection.Serial = { Ports: ports };
  }

  // BTS-Revo
  const btsHardware = hardwareChannels.filter(hw => hw.subclass === 'BTSRevo');
  if (btsHardware.length > 0) {
    const boards: Record<string, any> = {};
    // Collect EthernetConfiguration from the first device (shared config)
    let ethernetConfig: Record<string, any> | undefined;
    const firstBts = btsHardware[0];
    if (firstBts.addressPrefix || firstBts.ethernetPort) {
      ethernetConfig = {};
      if (firstBts.addressPrefix) { ethernetConfig.AddressPrefix = firstBts.addressPrefix; }
      if (firstBts.ethernetPort)  { ethernetConfig.Port = firstBts.ethernetPort; }
    }
    btsHardware.forEach((hw, idx) => {
      const hwMappings = mappingsByHwId.get(hw.id) ?? [];
      if (hwMappings.length === 0) { return; }
      const ios: Record<string, any> = {};
      for (const m of hwMappings) {
        const ioObj: Record<string, any> = {};
        if (m.hwChannel !== undefined && m.hwChannel !== null) { ioObj.HWChannel = m.hwChannel; }
        if (m.measurementAttribute)   { ioObj.MeasurementAttribute = m.measurementAttribute; }
        if (m.btsFunction)            { ioObj.Function             = m.btsFunction; }
        if (m.lineContactState != null){ ioObj.LineContactState     = m.lineContactState; }
        if (m.gndContactState != null) { ioObj.GndContactState      = m.gndContactState; }
        if (m.vbatContactState != null){ ioObj.VbatContactState     = m.vbatContactState; }
        if (m.staticChannel != null)   { ioObj.StaticChannel        = m.staticChannel; }
        if (m.initValue)              { ioObj.InitValue             = m.initValue; }
        if (m.channelType)            { ioObj.ChannelType           = m.channelType; }
        if (m.pwmWindowTime != null)  { ioObj.PWMWindowTime         = m.pwmWindowTime; }
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
      boards[idx + 1] = { Id: hw.boardId ?? 0, IOs: ios };
    });
    const btsSection: Record<string, any> = { Boards: boards };
    if (ethernetConfig) { btsSection.EthernetConfiguration = ethernetConfig; }
    mappingsSection['BTS-Revo'] = btsSection;
  }

  // ── FrameworkConfig section ───────────────────────────────────────
  const fc = frameworkData as any;
  const frameworkSection: Record<string, any> = {};

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
          const bsz = bc.BufferSize    ?? bc.bufferSize;    if (bsz !== undefined) { bufOut.BufferSize    = bsz; }
          const bn  = bc.BufferNumber  ?? bc.bufferNumber;  if (bn  !== undefined) { bufOut.BufferNumber  = bn; }
          const wbs = bc.WriteBurstSize ?? bc.writeBurstSize; if (wbs !== undefined) { bufOut.WriteBurstSize = wbs; }
          if (Object.keys(bufOut).length) { loggerConfig.BufferConfig = bufOut; }
        }
        const fc2 = lc?.FileConfig || lc?.fileConfig;
        if (fc2 && Object.keys(fc2).length) {
          const fileOut: Record<string, any> = {};
          const fn2 = fc2.BaseFileName ?? fc2.baseFileName; if (fn2 !== undefined) { fileOut.BaseFileName = fn2; }
          const ex  = fc2.Extension    ?? fc2.extension;    if (ex  !== undefined) { fileOut.Extension    = ex; }
          const mf  = fc2.MaxFile      ?? fc2.maxFile;      if (mf  !== undefined) { fileOut.MaxFile      = mf; }
          const ms  = fc2.MaxFileSize  ?? fc2.maxFileSize;  if (ms  !== undefined) { fileOut.MaxFileSize  = ms; }
          const cl  = fc2.CompressionLevel ?? fc2.compressionLevel; if (cl !== undefined) { fileOut.CompressionLevel = cl; }
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
          const fn2 = fc2.BaseFileName ?? fc2.baseFileName; if (fn2 !== undefined) { fileOut.BaseFileName = fn2; }
          const ex  = fc2.Extension    ?? fc2.extension;    if (ex  !== undefined) { fileOut.Extension    = ex; }
          const mf  = fc2.MaxFile      ?? fc2.maxFile;      if (mf  !== undefined) { fileOut.MaxFile      = mf; }
          const ms  = fc2.MaxFileSize  ?? fc2.maxFileSize;  if (ms  !== undefined) { fileOut.MaxFileSize  = ms; }
          if (Object.keys(fileOut).length) { entry.LoggerConfiguration = { FileConfig: fileOut }; }
        }
      }
      tracing[t.name] = entry;
    }
    frameworkSection.Tracing = tracing;
  }

  if (fc?.publisherType) {
    const pub: Record<string, any> = { PublisherType: fc.publisherType };
    if (fc.publisherType === 'MultiThreaded' && fc.channelsGroups?.length) {
      pub.ChannelsGroups = fc.channelsGroups;
    }
    frameworkSection.PublisherConfig = pub;
  }

  if (fc?.connectedEcus?.length) { frameworkSection.ConnectedEcus = fc.connectedEcus; }
  if (fc?.servicePack)           { frameworkSection.ServicePack   = fc.servicePack; }

  if (fc?.ethernetConfig) {
    const ec = fc.ethernetConfig as any;
    const ethOut: Record<string, any> = {};
    if (ec.considerOnlyEthernetTopologyEcus !== undefined) {
      ethOut.ConsiderOnlyEthernetTopologyEcus = ec.considerOnlyEthernetTopologyEcus;
    }
    if (ec.npduConfig) {
      const n = ec.npduConfig;
      const npduOut: Record<string, any> = {};
      if (n.ManageVlansInCom          !== undefined) { npduOut.ManageVlansInCom          = n.ManageVlansInCom; }
      if (n.RestrictNPduChannelsInCom !== undefined) { npduOut.RestrictNPduChannelsInCom = n.RestrictNPduChannelsInCom; }
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
    if (ec.appLayerPorts) { ethOut.AppLayerPorts = ec.appLayerPorts; }
    if (ec.ethernetTopology) {
      const topo = ec.ethernetTopology;
      const topoOut: Record<string, any> = {};
      if (topo.EthProtoPrioConfig?.length) {
        topoOut.EthProtoPrioConfig = topo.EthProtoPrioConfig.map((entry: any) => {
          if (!Array.isArray(entry.Ports) || entry.Ports.length === 0) { return entry; }
          return { ...entry, Ports: entry.Ports.map(mapPortEntry) };
        });
      }
      if (topo.TopologyConfig?.length)     { topoOut.TopologyConfig     = topo.TopologyConfig; }
      if (Object.keys(topoOut).length) { ethOut.EthernetTopology = topoOut; }
    }
    if (ec.channelToEcusMapping && Object.keys(ec.channelToEcusMapping).length) {
      ethOut.ChannelToEcusMapping = ec.channelToEcusMapping;
    }
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

export function useYamlPreview(state: AppState): string {
  return useMemo(() => {
    if (!state.currentConfigId) { return ''; }
    try {
      // Merge draft logical channel into the list for live preview
      const previewState: AppState = state.draftLogical
        ? { ...state, logicalChannels: [...state.logicalChannels, state.draftLogical] }
        : state;
      const obj = buildMtfObject(previewState);
      const raw = yaml.dump(obj, { indent: 2, lineWidth: 120, noRefs: true });
      const fixedKeys = raw.replace(/^(\s*)'(\d+)':/gm, '$1$2:');
      return convertVlanTagsToExplicitDash(convertIPListToFlow(convertIPMacTableToFlow(convertPortRangesToFlow(convertChannelsGroupsToFlow(convertAppLayerPortsToFlow(fixedKeys))))));
    } catch {
      return '';
    }
  }, [
    state.currentConfigId,
    state.logicalChannels,
    state.hardwareChannels,
    state.mappings,
    state.frameworkData,
    state.draftLogical,
  ]);
}
