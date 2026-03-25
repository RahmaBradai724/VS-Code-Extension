"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthernetChannel = exports.PSChannel = exports.AnalogChannel = exports.BridgeChannel = exports.IPSChannel = exports.LINChannel = exports.IOOutputChannel = exports.IOInputChannel = exports.CANFDChannel = exports.CANChannel = exports.SerialChannel = exports.FlexRayChannel = void 0;
const typeorm_1 = require("typeorm");
const channel_1 = require("./channel");
const enums_1 = require("./enums");
// ─────────────────────────────────────────────
//  FlexRay Logical Channel
// ─────────────────────────────────────────────
let FlexRayChannel = class FlexRayChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.FLEXRAY, enums_1.LogicalChannelSubclass.FLEXRAY);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            hwChannel: this.hwChannel, keySlot: this.keySlot,
            nodeType: this.nodeType, wakeUpCluster: this.wakeUpCluster,
            operationMode: this.operationMode
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.FlexRayChannel = FlexRayChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], FlexRayChannel.prototype, "hwChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], FlexRayChannel.prototype, "keySlot", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FlexRayChannel.prototype, "nodeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], FlexRayChannel.prototype, "wakeUpCluster", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FlexRayChannel.prototype, "operationMode", void 0);
exports.FlexRayChannel = FlexRayChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelSubclass.FLEXRAY),
    __metadata("design:paramtypes", [String, String])
], FlexRayChannel);
// ─────────────────────────────────────────────
//  Serial Logical Channel
// ─────────────────────────────────────────────
let SerialChannel = class SerialChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.SERIAL, enums_1.LogicalChannelSubclass.SERIAL);
        this.portName = '';
        this.baudRate = 9600;
        this.parity = 'None';
        this.dataBits = 8;
        this.stopBits = '1';
        this.flowControl = 'None';
        this.messageTerminator = '';
        this.maxReceivedDataSize = 0;
        this.separationTimeMs = 0;
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            portName: this.portName, baudRate: this.baudRate,
            parity: this.parity, dataBits: this.dataBits,
            stopBits: this.stopBits, flowControl: this.flowControl,
            messageTerminator: this.messageTerminator,
            maxReceivedDataSize: this.maxReceivedDataSize,
            separationTimeMs: this.separationTimeMs,
            serialChannelActivationOptional: this.serialChannelActivationOptional,
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.SerialChannel = SerialChannel;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "portName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialChannel.prototype, "baudRate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "parity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialChannel.prototype, "dataBits", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "stopBits", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "flowControl", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "messageTerminator", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialChannel.prototype, "maxReceivedDataSize", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialChannel.prototype, "separationTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], SerialChannel.prototype, "serialChannelActivationOptional", void 0);
exports.SerialChannel = SerialChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelSubclass.SERIAL),
    __metadata("design:paramtypes", [String, String])
], SerialChannel);
// ─────────────────────────────────────────────
//  CAN Logical Channel
// ─────────────────────────────────────────────
let CANChannel = class CANChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.CAN, enums_1.LogicalChannelSubclass.CAN);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            hwChannel: this.hwChannel, operationMode: this.operationMode
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.CANChannel = CANChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CANChannel.prototype, "hwChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CANChannel.prototype, "operationMode", void 0);
exports.CANChannel = CANChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelSubclass.CAN),
    __metadata("design:paramtypes", [String, String])
], CANChannel);
// ─────────────────────────────────────────────
//  CAN FD Logical Channel
// ─────────────────────────────────────────────
let CANFDChannel = class CANFDChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.CAN_FD, enums_1.LogicalChannelSubclass.CAN_FD);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            hwChannel: this.hwChannel, operationMode: this.operationMode
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.CANFDChannel = CANFDChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CANFDChannel.prototype, "hwChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CANFDChannel.prototype, "operationMode", void 0);
exports.CANFDChannel = CANFDChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelSubclass.CAN_FD),
    __metadata("design:paramtypes", [String, String])
], CANFDChannel);
// ─────────────────────────────────────────────
//  IO Input Logical Channel
// ─────────────────────────────────────────────
let IOInputChannel = class IOInputChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.IOINPUT, enums_1.LogicalChannelSubclass.IOINPUT);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            hwChannel: this.hwChannel, measurementAttribute: this.measurementAttribute,
            function: this.function, lineContactState: this.lineContactState,
            gndContactState: this.gndContactState, batContactState: this.batContactState,
            staticChannel: this.staticChannel, initValue: this.initValue,
            channelType: this.channelType, measurementConfig: this.measurementConfig,
            pwmWindowTime: this.pwmWindowTime, subscriptionConfig: this.subscriptionConfig
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.IOInputChannel = IOInputChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], IOInputChannel.prototype, "hwChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOInputChannel.prototype, "measurementAttribute", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOInputChannel.prototype, "function", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], IOInputChannel.prototype, "lineContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], IOInputChannel.prototype, "gndContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], IOInputChannel.prototype, "batContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], IOInputChannel.prototype, "staticChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOInputChannel.prototype, "initValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOInputChannel.prototype, "channelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], IOInputChannel.prototype, "measurementConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], IOInputChannel.prototype, "pwmWindowTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IOInputChannel.prototype, "subscriptionConfig", void 0);
exports.IOInputChannel = IOInputChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelSubclass.IOINPUT),
    __metadata("design:paramtypes", [String, String])
], IOInputChannel);
// ─────────────────────────────────────────────
//  IO Output Logical Channel
// ─────────────────────────────────────────────
let IOOutputChannel = class IOOutputChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.IOOUTPUT, enums_1.LogicalChannelSubclass.IOOUTPUT);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            hwChannel: this.hwChannel, measurementAttribute: this.measurementAttribute,
            function: this.function, lineContactState: this.lineContactState,
            gndContactState: this.gndContactState, batContactState: this.batContactState,
            staticChannel: this.staticChannel, initValue: this.initValue,
            channelType: this.channelType, measurementConfig: this.measurementConfig,
            pwmWindowTime: this.pwmWindowTime, subscriptionConfig: this.subscriptionConfig
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.IOOutputChannel = IOOutputChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], IOOutputChannel.prototype, "hwChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOOutputChannel.prototype, "measurementAttribute", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOOutputChannel.prototype, "function", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], IOOutputChannel.prototype, "lineContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], IOOutputChannel.prototype, "gndContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], IOOutputChannel.prototype, "batContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], IOOutputChannel.prototype, "staticChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOOutputChannel.prototype, "initValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOOutputChannel.prototype, "channelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], IOOutputChannel.prototype, "measurementConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], IOOutputChannel.prototype, "pwmWindowTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IOOutputChannel.prototype, "subscriptionConfig", void 0);
exports.IOOutputChannel = IOOutputChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelSubclass.IOOUTPUT),
    __metadata("design:paramtypes", [String, String])
], IOOutputChannel);
// ─────────────────────────────────────────────
//  LIN Logical Channel
// ─────────────────────────────────────────────
let LINChannel = class LINChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.LIN, enums_1.LogicalChannelSubclass.LIN);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            protocol: this.protocol, hwChannel: this.hwChannel,
            operationMode: this.operationMode
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.LINChannel = LINChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LINChannel.prototype, "protocol", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LINChannel.prototype, "hwChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LINChannel.prototype, "operationMode", void 0);
exports.LINChannel = LINChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelSubclass.LIN),
    __metadata("design:paramtypes", [String, String])
], LINChannel);
// ─────────────────────────────────────────────
//  IPS Logical Channel
// ─────────────────────────────────────────────
let IPSChannel = class IPSChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.IOSERIAL, enums_1.LogicalChannelSubclass.IOSERIAL);
        this.openSession = 0;
        this.openInterface = '';
        this.openSessionFields = '';
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            openSession: this.openSession
        };
    }
    toJSON() {
        return { ...this.toYAML(), openInterface: this.openInterface };
    }
};
exports.IPSChannel = IPSChannel;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], IPSChannel.prototype, "openSession", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IPSChannel.prototype, "openInterface", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IPSChannel.prototype, "openSessionFields", void 0);
exports.IPSChannel = IPSChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelSubclass.IOSERIAL),
    __metadata("design:paramtypes", [String, String])
], IPSChannel);
// ─────────────────────────────────────────────
//  Bridge Logical Channel
// ─────────────────────────────────────────────
let BridgeChannel = class BridgeChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.BRIDGE, enums_1.LogicalChannelSubclass.BRIDGE);
        this.bridgeName = name;
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            bridgeName: this.bridgeName ?? this.name,
            physicalAdapter: this.physicalAdapter,
            tunTapAdapterList: this.tunTapAdapterList,
            manipulatePackets: this.manipulatePackets
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.BridgeChannel = BridgeChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BridgeChannel.prototype, "bridgeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BridgeChannel.prototype, "physicalAdapter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], BridgeChannel.prototype, "tunTapAdapterList", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], BridgeChannel.prototype, "manipulatePackets", void 0);
exports.BridgeChannel = BridgeChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelSubclass.BRIDGE),
    __metadata("design:paramtypes", [String, String])
], BridgeChannel);
// ─────────────────────────────────────────────
//  Analog Logical Channel
// ─────────────────────────────────────────────
let AnalogChannel = class AnalogChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.ANALOG, enums_1.LogicalChannelSubclass.ANALOG);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            hwChannel: this.hwChannel, deviceId: this.deviceId
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.AnalogChannel = AnalogChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AnalogChannel.prototype, "hwChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AnalogChannel.prototype, "deviceId", void 0);
exports.AnalogChannel = AnalogChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelSubclass.ANALOG),
    __metadata("design:paramtypes", [String, String])
], AnalogChannel);
// ─────────────────────────────────────────────
//  PS Logical Channel
// ─────────────────────────────────────────────
let PSChannel = class PSChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.PS, enums_1.LogicalChannelSubclass.PS);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.PSChannel = PSChannel;
exports.PSChannel = PSChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelSubclass.PS),
    __metadata("design:paramtypes", [String, String])
], PSChannel);
// ─────────────────────────────────────────────
//  Ethernet Logical Channel
// ─────────────────────────────────────────────
let EthernetChannel = class EthernetChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.ETHERNET, enums_1.LogicalChannelSubclass.ETHERNET);
        this.ethernetName = name;
    }
    get pbIFilter() {
        return this.pblFilter;
    }
    set pbIFilter(value) {
        this.pblFilter = value;
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            ethernetName: this.ethernetName ?? this.name,
            friendlyName: this.friendlyName, bufferSize: this.bufferSize,
            pblFilter: this.pblFilter, timeout: this.timeout,
            timeStampPrecision: this.timeStampPrecision,
            timeStampSource: this.timeStampSource, immediateMode: this.immediateMode,
            snapshotLength: this.snapshotLength, dapDeviceMode: this.dapDeviceMode,
            useDataLoggerTimeStamp: this.useDataLoggerTimeStamp,
            removeDataLoggerMetaData: this.removeDataLoggerMetaData,
            dataLoggerType: this.dataLoggerType,
            packetProcessingActive: this.packetProcessingActive,
            packetIdentificationActive: this.packetIdentificationActive,
            differentHandlerForTxAndRx: this.differentHandlerForTxAndRx,
            tccmPacketizationActive: this.tccmPacketizationActive
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.EthernetChannel = EthernetChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "ethernetName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "friendlyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], EthernetChannel.prototype, "bufferSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "pblFilter", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], EthernetChannel.prototype, "timeout", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "timeStampPrecision", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "timeStampSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "immediateMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], EthernetChannel.prototype, "snapshotLength", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "dapDeviceMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "useDataLoggerTimeStamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "removeDataLoggerMetaData", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "dataLoggerType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "packetProcessingActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "packetIdentificationActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "differentHandlerForTxAndRx", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "tccmPacketizationActive", void 0);
exports.EthernetChannel = EthernetChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelSubclass.ETHERNET),
    __metadata("design:paramtypes", [String, String])
], EthernetChannel);
//# sourceMappingURL=logicalChannels.js.map