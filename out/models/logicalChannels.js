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
exports.EthernetChannel = exports.AnalogChannel = exports.BridgeChannel = exports.IPSChannel = exports.LINChannel = exports.IOOutputChannel = exports.IOInputChannel = exports.CANChannel = exports.SerialChannel = exports.FlexRayChannel = void 0;
const typeorm_1 = require("typeorm");
const channel_1 = require("./channel");
const enums_1 = require("./enums");
// ─────────────────────────────────────────────
//  FlexRay Logical Channel
// ─────────────────────────────────────────────
let FlexRayChannel = class FlexRayChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.FLEXRAY);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, optionStr: this.optionStr };
    }
    toJSON() {
        return { ...this.toYAML(), optionId: this.optionId };
    }
};
exports.FlexRayChannel = FlexRayChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FlexRayChannel.prototype, "optionStr", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FlexRayChannel.prototype, "genlId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FlexRayChannel.prototype, "optionId", void 0);
exports.FlexRayChannel = FlexRayChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelCategory.FLEXRAY),
    __metadata("design:paramtypes", [String, String])
], FlexRayChannel);
// ─────────────────────────────────────────────
//  Serial Logical Channel
// ─────────────────────────────────────────────
let SerialChannel = class SerialChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.SERIAL);
        this.portName = '';
        this.dataClass = '';
        this.query = '';
        this.dataBits = 8;
        this.baudRate = 9600;
        this.stopBits = '1';
        this.parity = 'None';
        this.bufferedData = 0;
        this.dataAcquisitionMode = '';
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type,
            portName: this.portName, baudRate: this.baudRate,
            dataBits: this.dataBits, stopBits: this.stopBits, parity: this.parity,
        };
    }
    toJSON() {
        return {
            id: this.id, name: this.name, type: this.type,
            portName: this.portName, dataClass: this.dataClass, query: this.query,
            dataBits: this.dataBits, baudRate: this.baudRate, stopBits: this.stopBits,
            parity: this.parity, bufferedData: this.bufferedData,
            dataAcquisitionMode: this.dataAcquisitionMode,
            serialChannelAdditionalOptions: this.serialChannelAdditionalOptions,
        };
    }
};
exports.SerialChannel = SerialChannel;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "portName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "dataClass", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "query", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialChannel.prototype, "dataBits", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialChannel.prototype, "baudRate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "stopBits", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "parity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialChannel.prototype, "bufferedData", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "dataAcquisitionMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], SerialChannel.prototype, "serialChannelAdditionalOptions", void 0);
exports.SerialChannel = SerialChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelCategory.SERIAL),
    __metadata("design:paramtypes", [String, String])
], SerialChannel);
// ─────────────────────────────────────────────
//  CAN Logical Channel
// ─────────────────────────────────────────────
let CANChannel = class CANChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.CAN);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, dbcChannel: this.dbcChannel };
    }
    toJSON() {
        return { ...this.toYAML(), connectionMode: this.connectionMode };
    }
};
exports.CANChannel = CANChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CANChannel.prototype, "dbcChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CANChannel.prototype, "connectionMode", void 0);
exports.CANChannel = CANChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelCategory.CAN),
    __metadata("design:paramtypes", [String, String])
], CANChannel);
// ─────────────────────────────────────────────
//  IO Input Logical Channel
// ─────────────────────────────────────────────
let IOInputChannel = class IOInputChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.IOINPUT);
        this.ioChannel = 0;
        this.measurementAttribute = '';
        this.controlState = false;
        this.loSideRelay = false;
        this.infoStatus = false;
        this.dataChannelName = '';
        this.subscriptionDetails = [];
        this.openMinTimeMs = 0;
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, ioChannel: this.ioChannel };
    }
    toJSON() {
        return { ...this, ...this.toYAML() };
    }
};
exports.IOInputChannel = IOInputChannel;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], IOInputChannel.prototype, "ioChannel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IOInputChannel.prototype, "measurementAttribute", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], IOInputChannel.prototype, "controlState", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], IOInputChannel.prototype, "loSideRelay", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], IOInputChannel.prototype, "infoStatus", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IOInputChannel.prototype, "dataChannelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IOInputChannel.prototype, "measurementConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], IOInputChannel.prototype, "subscriptionDetails", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], IOInputChannel.prototype, "openMinTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IOInputChannel.prototype, "subscriptionConfig", void 0);
exports.IOInputChannel = IOInputChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelCategory.IOINPUT),
    __metadata("design:paramtypes", [String, String])
], IOInputChannel);
// ─────────────────────────────────────────────
//  IO Output Logical Channel
// ─────────────────────────────────────────────
let IOOutputChannel = class IOOutputChannel extends channel_1.LogicalChannel {
    ;
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.IOOUTPUT);
        this.ioChannel = 0;
        this.measurementAttribute = '';
        this.timeControlMode = false;
        this.timeControlInterval = '';
        this.openWorkTime = false;
        this.packetProcessingConfig = [];
        this.endlaue = '';
        this.channelType = '';
        this.ports = [];
        this.portMinTimeMs = 0;
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, ioChannel: this.ioChannel };
    }
    toJSON() {
        return { ...this, ...this.toYAML() };
    }
};
exports.IOOutputChannel = IOOutputChannel;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], IOOutputChannel.prototype, "ioChannel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IOOutputChannel.prototype, "measurementAttribute", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], IOOutputChannel.prototype, "timeControlMode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IOOutputChannel.prototype, "timeControlInterval", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], IOOutputChannel.prototype, "openWorkTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IOOutputChannel.prototype, "measurementConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], IOOutputChannel.prototype, "packetProcessingConfig", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IOOutputChannel.prototype, "endlaue", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IOOutputChannel.prototype, "channelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], IOOutputChannel.prototype, "ports", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], IOOutputChannel.prototype, "portMinTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IOOutputChannel.prototype, "subscriptionConfig", void 0);
exports.IOOutputChannel = IOOutputChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelCategory.IOOUTPUT),
    __metadata("design:paramtypes", [String, String])
], IOOutputChannel);
// ─────────────────────────────────────────────
//  LIN Logical Channel
// ─────────────────────────────────────────────
let LINChannel = class LINChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.LIN);
        this.openSession = 0;
        this.loggingName = '';
        this.loggingType = enums_1.LogicalChannelCategory.LIN;
        this.dbList = [];
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type };
    }
    toJSON() {
        return { ...this.toYAML(), loggingName: this.loggingName, dbList: this.dbList };
    }
};
exports.LINChannel = LINChannel;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LINChannel.prototype, "openSession", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LINChannel.prototype, "loggingName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LINChannel.prototype, "loggingType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], LINChannel.prototype, "dbList", void 0);
exports.LINChannel = LINChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelCategory.LIN),
    __metadata("design:paramtypes", [String, String])
], LINChannel);
// ─────────────────────────────────────────────
//  IPS Logical Channel
// ─────────────────────────────────────────────
let IPSChannel = class IPSChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.IDSERIAL);
        this.openSession = 0;
        this.openInterface = '';
        this.openSessionFields = '';
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, openSession: this.openSession };
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
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelCategory.IDSERIAL),
    __metadata("design:paramtypes", [String, String])
], IPSChannel);
// ─────────────────────────────────────────────
//  Bridge Logical Channel
// ─────────────────────────────────────────────
let BridgeChannel = class BridgeChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.BRIDGE);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type };
    }
    toJSON() {
        return { ...this.toYAML(), hlcChannel: this.hlcChannel };
    }
};
exports.BridgeChannel = BridgeChannel;
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], BridgeChannel.prototype, "hlcChannel", void 0);
exports.BridgeChannel = BridgeChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelCategory.BRIDGE),
    __metadata("design:paramtypes", [String, String])
], BridgeChannel);
// ─────────────────────────────────────────────
//  Analog Logical Channel
// ─────────────────────────────────────────────
let AnalogChannel = class AnalogChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.ANALOG);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, sensorType: this.sensorType };
    }
    toJSON() {
        return { ...this.toYAML(), controlId: this.controlId };
    }
};
exports.AnalogChannel = AnalogChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalogChannel.prototype, "sensorType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalogChannel.prototype, "controlId", void 0);
exports.AnalogChannel = AnalogChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelCategory.ANALOG),
    __metadata("design:paramtypes", [String, String])
], AnalogChannel);
// ─────────────────────────────────────────────
//  Ethernet Logical Channel
// ─────────────────────────────────────────────
let EthernetChannel = class EthernetChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.ETHERNET);
        this.friendlyName = '';
        this.bufferSize = 0;
        this.timeout = 0;
        this.timeframeName = '';
        this.timeframePrecision = '';
        this.timeframeSource = '';
        this.timestampBound = 0;
        this.snapshotLength = 0;
        this.defSaveMode = 0;
        this.defDataSupportTimeStamp = false;
        this.sendDataLoggerMeta = false;
        this.dataLoggerType = '';
        this.packetProcessingConfig = false;
        this.differentHandlerForIuluAndR = false;
        this.useFlexRayBaudRate = false;
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type,
            friendlyName: this.friendlyName, bufferSize: this.bufferSize,
            snapshotLength: this.snapshotLength, captureType: this.captureType,
        };
    }
    toJSON() {
        return { ...this };
    }
};
exports.EthernetChannel = EthernetChannel;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetChannel.prototype, "friendlyName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetChannel.prototype, "bufferSize", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetChannel.prototype, "timeout", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetChannel.prototype, "timeframeName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetChannel.prototype, "timeframePrecision", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetChannel.prototype, "timeframeSource", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetChannel.prototype, "timestampBound", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetChannel.prototype, "snapshotLength", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetChannel.prototype, "defSaveMode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "defDataSupportTimeStamp", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "sendDataLoggerMeta", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetChannel.prototype, "dataLoggerType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "packetProcessingConfig", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "differentHandlerForIuluAndR", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "useFlexRayBaudRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "captureType", void 0);
exports.EthernetChannel = EthernetChannel = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.LogicalChannelCategory.ETHERNET),
    __metadata("design:paramtypes", [String, String])
], EthernetChannel);
//# sourceMappingURL=logicalChannels.js.map