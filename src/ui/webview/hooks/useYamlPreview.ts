import { useMemo } from 'react';
import * as yaml from 'js-yaml';
import { AppState } from '../types';

const CM_SUBCLASSES = ['CANInterface', 'CIBInterface', 'CMInterface', 'LINCard'];

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
      Id: index + 1,
      Type: ch.category === 'FLEXRAY' ? 'FR' : ch.category,
    };
    if (ch.protocol)      { obj.Protocol    = ch.protocol; }
    if (ch.loggingName)   { obj.LoggingName  = ch.loggingName; }
    if (ch.tracerName)    { obj.TracerName   = ch.tracerName; }
    if (ch.alias?.length) { obj.Alias        = ch.alias; }
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
      const logicalChannelName = hwMappings[0]?.logicalChannelName ?? hw.name;
      const adapterObj: Record<string, any> = { Name: logicalChannelName };
      if (hw.friendlyName)              { adapterObj.FriendlyName             = hw.friendlyName; }
      if (hw.bufferSize)                { adapterObj.BufferSize               = hw.bufferSize; }
      if (hw.bpFilter)                  { adapterObj.BpfFilter                = hw.bpFilter; }
      if (hw.timeout)                   { adapterObj.Timeout                  = hw.timeout; }
      if (hw.timeStampPrecision)        { adapterObj.TimeStampPrecision        = hw.timeStampPrecision; }
      if (hw.timeStampSource)           { adapterObj.TimeStampSource           = hw.timeStampSource; }
      if (hw.immediateMode)             { adapterObj.ImmediateMode             = hw.immediateMode; }
      if (hw.snapshotLength)            { adapterObj.SnapshotLength            = hw.snapshotLength; }
      if (hw.pcapDeviceMode)            { adapterObj.PcapDeviceMode            = hw.pcapDeviceMode; }
      if (hw.useDataLoggerTimeStamp)    { adapterObj.UseDataLoggerTimeStamp    = hw.useDataLoggerTimeStamp; }
      if (hw.removeDataLoggerMetaData)  { adapterObj.RemoveDataLoggerMetaData  = hw.removeDataLoggerMetaData; }
      if (hw.dataLoggerType)            { adapterObj.DataLoggerType            = hw.dataLoggerType; }
      if (hw.packetProcessingActive)    { adapterObj.PacketProcessingActive    = hw.packetProcessingActive; }
      if (hw.packetIdentificationActive){ adapterObj.PacketIdentificationActive= hw.packetIdentificationActive; }
      pcapSection[idx + 1] = { Adapter: adapterObj };
    });
    mappingsSection.PCAP = pcapSection;
  }

  // ── FrameworkConfig section ───────────────────────────────────────
  const fc = frameworkData as any;
  const frameworkSection: Record<string, any> = {};

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
          if (bc.bufferSize    !== undefined) { bufOut.BufferSize     = bc.bufferSize; }
          if (bc.bufferNumber  !== undefined) { bufOut.BufferNumber   = bc.bufferNumber; }
          if (bc.writeBurstSize !== undefined){ bufOut.WriteBurstSize = bc.writeBurstSize; }
          loggerConfig.BufferConfig = bufOut;
        }
        if (t.loggerConfiguration?.fileConfig && Object.keys(t.loggerConfiguration.fileConfig).length) {
          const fc2 = t.loggerConfiguration.fileConfig;
          const fileOut: Record<string, any> = {};
          if (fc2.baseFileName       !== undefined) { fileOut.BaseFileName       = fc2.baseFileName; }
          if (fc2.extension          !== undefined) { fileOut.Extension          = fc2.extension; }
          if (fc2.maxFile            !== undefined) { fileOut.MaxFile            = fc2.maxFile; }
          if (fc2.maxFileSize        !== undefined) { fileOut.MaxFileSize        = fc2.maxFileSize; }
          if (fc2.compressionLevel   !== undefined) { fileOut.CompressionLevel   = fc2.compressionLevel; }
          loggerConfig.FileConfig = fileOut;
        }
        if (Object.keys(loggerConfig).length) { entry.LoggerConfiguration = loggerConfig; }
      } else if (t.type === 'ASCII') {
        if (t.base)             { entry.Base               = t.base; }
        if (t.timeStampSetting) { entry.TimeStampSetting   = t.timeStampSetting; }
        if (t.internalEventLogged !== undefined) { entry.InternalEventLogged = t.internalEventLogged; }
        if (t.loggerConfiguration?.fileConfig && Object.keys(t.loggerConfiguration.fileConfig).length) {
          const fc2 = t.loggerConfiguration.fileConfig;
          const fileOut: Record<string, any> = {};
          if (fc2.baseFileName !== undefined) { fileOut.BaseFileName = fc2.baseFileName; }
          if (fc2.extension    !== undefined) { fileOut.Extension    = fc2.extension; }
          if (fc2.maxFile      !== undefined) { fileOut.MaxFile      = fc2.maxFile; }
          if (fc2.maxFileSize  !== undefined) { fileOut.MaxFileSize  = fc2.maxFileSize; }
          entry.LoggerConfiguration = { FileConfig: fileOut };
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
      if (n.manageVlansInCom            !== undefined) { npduOut.ManageVlansInCom            = n.manageVlansInCom; }
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

export function useYamlPreview(state: AppState): string {
  return useMemo(() => {
    if (!state.currentConfigId) { return ''; }
    try {
      const obj = buildMtfObject(state);
      const raw = yaml.dump(obj, { indent: 2, lineWidth: 120, noRefs: true });
      // MTF expects integer keys (1:) not quoted ('1':)
      return raw.replace(/^(\s*)'(\d+)':/gm, '$1$2:');
    } catch {
      return '';
    }
  }, [
    state.currentConfigId,
    state.logicalChannels,
    state.hardwareChannels,
    state.mappings,
    state.frameworkData,
  ]);
}
