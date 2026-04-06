"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigGenerator = void 0;
const yaml = __importStar(require("js-yaml"));
const ConfigValidator_1 = require("./ConfigValidator");
const enums_1 = require("../../models/enums");
/** Subclasses that represent CM (Capture Module) devices */
const CM_SUBCLASSES = [
    enums_1.HardwareChannelSubclass.CAN_INTERFACE,
    enums_1.HardwareChannelSubclass.CIB_INTERFACE,
    enums_1.HardwareChannelSubclass.CM_INTERFACE,
    enums_1.HardwareChannelSubclass.LIN_CARD,
];
/**
 * ConfigGenerator serializes a Configuration object into an MTF-compatible config.yaml.
 * Channels → logical channels only (Id, Type, Protocol, loggingName, TracerName, Alias)
 * Mappings → CM devices and PCAP adapters grouped by hardware type
 * FrameworkConfig → Tracing, Publisher, etc.
 */
class ConfigGenerator {
    constructor(config, mappingManager, validator = new ConfigValidator_1.ConfigValidator()) {
        this.config = config;
        this.mappingManager = mappingManager;
        this.validator = validator;
    }
    /**
     * Validates that all required fields exist before generation.
     * Returns array of error messages (empty means valid).
     */
    preGenerationValidate() {
        return this.validator.validate(this.config, this.mappingManager);
    }
    /**
     * Generates the MTF-spec config.yaml string.
     * Throws if pre-validation fails.
     */
    generate() {
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
    generateAsObject() {
        return this._buildMtfObject();
    }
    // ─── Private: build MTF object ────────────────────────────────────────
    _buildMtfObject() {
        const mappings = this.mappingManager.getMappingsByConfigId(this.config.id);
        // Index: hardwareChannelId → mappings[]
        const mappingsByHwId = new Map();
        for (const m of mappings) {
            const arr = mappingsByHwId.get(m.hardwareChannelId) ?? [];
            arr.push(m);
            mappingsByHwId.set(m.hardwareChannelId, arr);
        }
        // ── Channels section (logical channels only) ──────────────────────
        const channelsSection = {};
        this.config.logicalChannels.forEach((ch, index) => {
            const obj = {
                Id: index + 1,
                // MTF spec uses 'FR' — normalize both FLEXRAY and FR enum values
                Type: ch.category === 'FLEXRAY' ? 'FR' : ch.category,
            };
            const protocol = ch.protocol;
            if (protocol) {
                obj.Protocol = protocol;
            }
            if (ch.loggingName) {
                obj.LoggingName = ch.loggingName;
            }
            if (ch.tracerName) {
                obj.TracerName = ch.tracerName;
            }
            if (ch.alias?.length) {
                obj.Alias = ch.alias;
            }
            if (ch.loggingBusIndex != null) {
                obj.LoggingBusIndex = ch.loggingBusIndex;
            }
            channelsSection[ch.name] = obj;
        });
        // ── Mappings section ──────────────────────────────────────────────
        const mappingsSection = {};
        // CM devices (CANInterface, CIBInterface, CMInterface, LINCard)
        const cmHardware = this.config.hardwareChannels.filter(hw => CM_SUBCLASSES.includes(hw.subclass));
        if (cmHardware.length > 0) {
            const cmDevices = {};
            cmHardware.forEach((hw, idx) => {
                const hwAny = hw;
                const hwMappings = mappingsByHwId.get(hw.id) ?? [];
                const buses = {};
                for (const m of hwMappings) {
                    const busObj = {};
                    if (m.hwChannel !== undefined && m.hwChannel !== null) {
                        busObj.HWChannel = m.hwChannel;
                    }
                    if (m.operationMode) {
                        busObj.OperationMode = m.operationMode;
                    }
                    // KeySlot, NodeType, WakeUpCluster are FlexRay-only fields
                    const isFlexRay = m.logicalChannelType === 'FR' || m.logicalChannelType === 'FLEXRAY';
                    if (isFlexRay) {
                        if (m.keySlot !== undefined && m.keySlot !== null) {
                            busObj.KeySlot = m.keySlot;
                        }
                        if (m.nodeType) {
                            busObj.NodeType = m.nodeType;
                        }
                        if (m.wakeUpCluster !== undefined && m.wakeUpCluster !== null) {
                            busObj.WakeUpCluster = m.wakeUpCluster;
                        }
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
        const pcapHardware = this.config.hardwareChannels.filter(hw => hw.subclass === enums_1.HardwareChannelSubclass.ETHERNET_ADAPTER);
        if (pcapHardware.length > 0) {
            const pcapSection = {};
            pcapHardware.forEach((hw, idx) => {
                const a = hw;
                const hwMappings = mappingsByHwId.get(hw.id) ?? [];
                if (hwMappings.length === 0) {
                    return;
                }
                const logicalChannelName = hwMappings[0]?.logicalChannelName ?? hw.name;
                const adapterObj = { Name: logicalChannelName };
                if (a.friendlyName) {
                    adapterObj.FriendlyName = a.friendlyName;
                }
                if (a.bufferSize) {
                    adapterObj.BufferSize = a.bufferSize;
                }
                if (a.bpFilter) {
                    adapterObj.BpfFilter = a.bpFilter;
                }
                if (a.timeout) {
                    adapterObj.Timeout = a.timeout;
                }
                if (a.timeStampPrecision) {
                    adapterObj.TimeStampPrecision = a.timeStampPrecision;
                }
                if (a.timeStampSource) {
                    adapterObj.TimeStampSource = a.timeStampSource;
                }
                if (a.immediateMode != null) {
                    adapterObj.ImmediateMode = a.immediateMode;
                }
                if (a.snapshotLength != null) {
                    adapterObj.SnapshotLength = a.snapshotLength;
                }
                if (a.pcapDeviceMode) {
                    adapterObj.PcapDeviceMode = a.pcapDeviceMode;
                }
                if (a.useDataLoggerTimeStamp != null) {
                    adapterObj.UseDataLoggerTimeStamp = a.useDataLoggerTimeStamp;
                }
                if (a.removeDataLoggerMetaData != null) {
                    adapterObj.RemoveDataLoggerMetaData = a.removeDataLoggerMetaData;
                }
                if (a.dataLoggerType) {
                    adapterObj.DataLoggerType = a.dataLoggerType;
                }
                if (a.packetProcessingActive != null) {
                    adapterObj.PacketProcessingActive = a.packetProcessingActive;
                }
                if (a.packetIdentificationActive != null) {
                    adapterObj.PacketIdentificationActive = a.packetIdentificationActive;
                }
                pcapSection[idx + 1] = { Adapter: adapterObj };
            });
            mappingsSection.PCAP = pcapSection;
        }
        // Serial (SerialPort)
        const serialHardware = this.config.hardwareChannels.filter(hw => hw.subclass === enums_1.HardwareChannelSubclass.SERIAL_PORT);
        if (serialHardware.length > 0) {
            const ports = {};
            serialHardware.forEach(hw => {
                const s = hw;
                const hwMappings = mappingsByHwId.get(hw.id) ?? [];
                if (hwMappings.length === 0) {
                    return;
                }
                const logicalChannelName = hwMappings[0]?.logicalChannelName ?? hw.name;
                const portObj = {};
                if (s.portName) {
                    portObj.PortName = s.portName;
                }
                if (s.baudRate) {
                    portObj.BaudRate = s.baudRate;
                }
                if (s.parity) {
                    portObj.Parity = s.parity;
                }
                if (s.dataBits) {
                    portObj.DataBits = s.dataBits;
                }
                if (s.stopBits) {
                    portObj.StopBits = s.stopBits;
                }
                if (s.flowControl) {
                    portObj.FlowControl = s.flowControl;
                }
                if (s.messageTerminator != null) {
                    portObj.MessageTerminator = s.messageTerminator;
                }
                if (s.separationTimeMs) {
                    portObj.SeparationTimeMs = s.separationTimeMs;
                }
                if (s.maxReceivedDataSize) {
                    portObj.MaxReceivedDataSize = s.maxReceivedDataSize;
                }
                ports[logicalChannelName] = portObj;
            });
            mappingsSection.Serial = { Ports: ports };
        }
        // BTS-Revo
        const btsHardware = this.config.hardwareChannels.filter(hw => hw.subclass === enums_1.HardwareChannelSubclass.BTS_REVO);
        if (btsHardware.length > 0) {
            const boards = {};
            // Shared EthernetConfiguration (from first device)
            let ethernetConfig;
            const firstBts = btsHardware[0];
            if (firstBts.addressPrefix || firstBts.ethernetPort) {
                ethernetConfig = {};
                if (firstBts.addressPrefix) {
                    ethernetConfig.AddressPrefix = firstBts.addressPrefix;
                }
                if (firstBts.ethernetPort) {
                    ethernetConfig.Port = firstBts.ethernetPort;
                }
            }
            btsHardware.forEach((hw, idx) => {
                const hwAny = hw;
                const hwMappings = mappingsByHwId.get(hw.id) ?? [];
                if (hwMappings.length === 0) {
                    return;
                }
                const ios = {};
                for (const m of hwMappings) {
                    const ioObj = {};
                    if (m.hwChannel !== undefined && m.hwChannel !== null) {
                        ioObj.HWChannel = m.hwChannel;
                    }
                    if (m.measurementAttribute) {
                        ioObj.MeasurementAttribute = m.measurementAttribute;
                    }
                    if (m.btsFunction) {
                        ioObj.Function = m.btsFunction;
                    }
                    if (m.lineContactState != null) {
                        ioObj.LineContactState = m.lineContactState;
                    }
                    if (m.gndContactState != null) {
                        ioObj.GndContactState = m.gndContactState;
                    }
                    if (m.vbatContactState != null) {
                        ioObj.VbatContactState = m.vbatContactState;
                    }
                    if (m.staticChannel != null) {
                        ioObj.StaticChannel = m.staticChannel;
                    }
                    if (m.initValue) {
                        ioObj.InitValue = m.initValue;
                    }
                    if (m.channelType) {
                        ioObj.ChannelType = m.channelType;
                    }
                    if (m.pwmWindowTime != null) {
                        ioObj.PWMWindowTime = m.pwmWindowTime;
                    }
                    if (m.measurementConfig?.length) {
                        ioObj.MeasurementConfig = m.measurementConfig;
                    }
                    if (m.subscriptionConfig && Object.keys(m.subscriptionConfig).length) {
                        const sc = m.subscriptionConfig;
                        const scOut = {};
                        if (sc.ID) {
                            scOut.ID = sc.ID;
                        }
                        if (sc.Type) {
                            scOut.Type = sc.Type;
                        }
                        if (sc.IsPeriodic != null) {
                            scOut.IsPeriodic = sc.IsPeriodic;
                        }
                        if (sc.Polling != null) {
                            scOut.Polling = sc.Polling;
                        }
                        if (sc.UpperThreshold != null) {
                            scOut.UpperThreshold = sc.UpperThreshold;
                        }
                        if (sc.LowerThreshold != null) {
                            scOut.LowerThreshold = sc.LowerThreshold;
                        }
                        ioObj.SubscriptionConfig = scOut;
                    }
                    ios[m.logicalChannelName] = ioObj;
                }
                boards[idx + 1] = { Id: hwAny.boardId ?? 0, IOs: ios };
            });
            const btsSection = { Boards: boards };
            if (ethernetConfig) {
                btsSection.EthernetConfiguration = ethernetConfig;
            }
            mappingsSection['BTS-Revo'] = btsSection;
        }
        // ── FrameworkConfig section ───────────────────────────────────────
        const fc = this.config.frameworkConfig;
        const frameworkSection = {};
        // Tracing
        const rawTracers = fc?.tracers || [];
        if (rawTracers.length > 0) {
            const tracing = {};
            for (const t of rawTracers) {
                const entry = { Type: t.type };
                if (t.timestamp) {
                    entry.Timestamp = t.timestamp;
                }
                if (t.type === 'PCAP') {
                    if (t.loggingType) {
                        entry.LoggingType = t.loggingType;
                    }
                    const loggerConfig = {};
                    if (t.loggerConfiguration?.bufferConfig && Object.keys(t.loggerConfiguration.bufferConfig).length) {
                        const bc = t.loggerConfiguration.bufferConfig;
                        const bufOut = {};
                        if (bc.bufferSize !== undefined) {
                            bufOut.BufferSize = bc.bufferSize;
                        }
                        if (bc.bufferNumber !== undefined) {
                            bufOut.BufferNumber = bc.bufferNumber;
                        }
                        if (bc.writeBurstSize !== undefined) {
                            bufOut.WriteBurstSize = bc.writeBurstSize;
                        }
                        loggerConfig.BufferConfig = bufOut;
                    }
                    if (t.loggerConfiguration?.fileConfig && Object.keys(t.loggerConfiguration.fileConfig).length) {
                        const fc2 = t.loggerConfiguration.fileConfig;
                        const fileOut = {};
                        if (fc2.baseFileName !== undefined) {
                            fileOut.BaseFileName = fc2.baseFileName;
                        }
                        if (fc2.extension !== undefined) {
                            fileOut.Extension = fc2.extension;
                        }
                        if (fc2.maxFile !== undefined) {
                            fileOut.MaxFile = fc2.maxFile;
                        }
                        if (fc2.maxFileSize !== undefined) {
                            fileOut.MaxFileSize = fc2.maxFileSize;
                        }
                        if (fc2.compressionLevel !== undefined) {
                            fileOut.CompressionLevel = fc2.compressionLevel;
                        }
                        loggerConfig.FileConfig = fileOut;
                    }
                    if (Object.keys(loggerConfig).length) {
                        entry.LoggerConfiguration = loggerConfig;
                    }
                }
                else if (t.type === 'ASCII') {
                    if (t.base) {
                        entry.Base = t.base;
                    }
                    if (t.timeStampSetting) {
                        entry.TimeStampSetting = t.timeStampSetting;
                    }
                    if (t.internalEventLogged !== undefined) {
                        entry.InternalEventLogged = t.internalEventLogged;
                    }
                    if (t.loggerConfiguration?.fileConfig && Object.keys(t.loggerConfiguration.fileConfig).length) {
                        const fc2 = t.loggerConfiguration.fileConfig;
                        const fileOut = {};
                        if (fc2.baseFileName !== undefined) {
                            fileOut.BaseFileName = fc2.baseFileName;
                        }
                        if (fc2.extension !== undefined) {
                            fileOut.Extension = fc2.extension;
                        }
                        if (fc2.maxFile !== undefined) {
                            fileOut.MaxFile = fc2.maxFile;
                        }
                        if (fc2.maxFileSize !== undefined) {
                            fileOut.MaxFileSize = fc2.maxFileSize;
                        }
                        entry.LoggerConfiguration = { FileConfig: fileOut };
                    }
                }
                tracing[t.name] = entry;
            }
            frameworkSection.Tracing = tracing;
        }
        // PublisherConfig
        if (fc?.publisherType) {
            const pub = { PublisherType: fc.publisherType };
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
            const ec = fc.ethernetConfig;
            const ethOut = {};
            if (ec.considerOnlyEthernetTopologyEcus !== undefined) {
                ethOut.ConsiderOnlyEthernetTopologyEcus = ec.considerOnlyEthernetTopologyEcus;
            }
            if (ec.npduConfig) {
                const n = ec.npduConfig;
                const npduOut = {};
                if (n.manageVlansInCom !== undefined) {
                    npduOut.ManageVlansInCom = n.manageVlansInCom;
                }
                if (n.restrictedNPduChannelsInCom !== undefined) {
                    npduOut.RestrictedNPduChannelsInCom = n.restrictedNPduChannelsInCom;
                }
                if (n.ipMacTable?.length) {
                    npduOut.IPMacTable = n.ipMacTable;
                }
                if (n.vLans) {
                    const vlansOut = {};
                    if (n.vLans.innerTags?.length) {
                        vlansOut.InnerTags = n.vLans.innerTags;
                    }
                    if (n.vLans.outerTags?.length) {
                        vlansOut.OuterTags = n.vLans.outerTags;
                    }
                    if (Object.keys(vlansOut).length) {
                        npduOut.VLans = vlansOut;
                    }
                }
                if (Object.keys(npduOut).length) {
                    ethOut.NPduConfig = npduOut;
                }
            }
            if (ec.someIPConfig) {
                const s = ec.someIPConfig;
                const someipOut = {};
                if (s.serverToClientPortRangeMapping) {
                    someipOut.ServerToClientPortRangeMapping = {
                        ServerPorts: s.serverToClientPortRangeMapping.serverPorts,
                        ClientPorts: s.serverToClientPortRangeMapping.clientPorts,
                    };
                }
                if (s.endpointImplementation) {
                    someipOut.EndpointImplementation = s.endpointImplementation;
                }
                if (s.adapterName) {
                    someipOut.AdapterName = s.adapterName;
                }
                if (Object.keys(someipOut).length) {
                    ethOut.SomeIPConfig = someipOut;
                }
            }
            if (ec.appLayerPorts) {
                ethOut.AppLayerPorts = ec.appLayerPorts;
            }
            if (Object.keys(ethOut).length) {
                frameworkSection.EthernetConfig = ethOut;
            }
        }
        const result = {
            Channels: channelsSection,
            Mappings: mappingsSection,
        };
        if (Object.keys(frameworkSection).length) {
            result.FrameworkConfig = frameworkSection;
        }
        return result;
    }
}
exports.ConfigGenerator = ConfigGenerator;
//# sourceMappingURL=ConfigGenerator.js.map