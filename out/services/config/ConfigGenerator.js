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
                Type: ch.category,
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
                    if (m.keySlot !== undefined && m.keySlot !== null) {
                        busObj.KeySlot = m.keySlot;
                    }
                    if (m.nodeType) {
                        busObj.NodeType = m.nodeType;
                    }
                    if (m.wakeUpCluster !== undefined && m.wakeUpCluster !== null) {
                        busObj.WakeUpCluster = m.wakeUpCluster;
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
                const logicalChannelName = hwMappings[0]?.logicalChannelName ?? hw.name;
                const adapterObj = { Name: logicalChannelName };
                if (a.friendlyName) {
                    adapterObj.FriendlyName = a.friendlyName;
                }
                if (a.bufferSize) {
                    adapterObj.BufferSize = a.bufferSize;
                }
                if (a.bpFilter !== undefined) {
                    adapterObj.BpfFilter = a.bpFilter;
                }
                if (a.timeout !== undefined) {
                    adapterObj.Timeout = a.timeout;
                }
                if (a.timeStampPrecision) {
                    adapterObj.TimeStampPrecision = a.timeStampPrecision;
                }
                if (a.timeStampSource) {
                    adapterObj.TimeStampSource = a.timeStampSource;
                }
                if (a.immediateMode !== undefined) {
                    adapterObj.ImmediateMode = a.immediateMode;
                }
                if (a.snapshotLength) {
                    adapterObj.SnapshotLength = a.snapshotLength;
                }
                if (a.pcapDeviceMode) {
                    adapterObj.PcapDeviceMode = a.pcapDeviceMode;
                }
                if (a.useDataLoggerTimeStamp !== undefined) {
                    adapterObj.UseDataLoggerTimeStamp = a.useDataLoggerTimeStamp;
                }
                if (a.removeDataLoggerMetaData !== undefined) {
                    adapterObj.RemoveDataLoggerMetaData = a.removeDataLoggerMetaData;
                }
                if (a.dataLoggerType) {
                    adapterObj.DataLoggerType = a.dataLoggerType;
                }
                if (a.packetProcessingActive !== undefined) {
                    adapterObj.PacketProcessingActive = a.packetProcessingActive;
                }
                if (a.packetIdentificationActive !== undefined) {
                    adapterObj.PacketIdentificationActive = a.packetIdentificationActive;
                }
                pcapSection[idx + 1] = { Adapter: adapterObj };
            });
            mappingsSection.PCAP = pcapSection;
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