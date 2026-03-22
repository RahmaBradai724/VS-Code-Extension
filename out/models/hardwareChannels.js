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
exports.CIBInterface = exports.CANInterface = exports.IOAnalog = exports.EthernetAdapter = exports.RelayBoard = exports.HIDRelay = exports.SerialPort = exports.LINCard = void 0;
const typeorm_1 = require("typeorm");
const channel_1 = require("./channel");
const enums_1 = require("./enums");
// ─────────────────────────────────────────────
//  LIN Card Hardware Channel
// ─────────────────────────────────────────────
let LINCard = class LINCard extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.SERIAL_PORT);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, hwModel: this.hwModel };
    }
    toJSON() {
        return { id: this.id, name: this.name, type: this.type, hwModel: this.hwModel, bmtStr: this.bmtStr, hwChannel: this.hwChannel };
    }
};
exports.LINCard = LINCard;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LINCard.prototype, "hwModel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LINCard.prototype, "bmtStr", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LINCard.prototype, "bmtList", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LINCard.prototype, "hwChannel", void 0);
exports.LINCard = LINCard = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelCategory.SERIAL_PORT),
    __metadata("design:paramtypes", [String, String])
], LINCard);
// ─────────────────────────────────────────────
//  Serial Port Hardware Channel
// ─────────────────────────────────────────────
let SerialPort = class SerialPort extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.SERIAL_PORT);
        this.portName = '';
        this.parity = 'None';
        this.query = '';
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, portName: this.portName, parity: this.parity };
    }
    toJSON() {
        return { ...this };
    }
};
exports.SerialPort = SerialPort;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialPort.prototype, "portName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialPort.prototype, "parity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialPort.prototype, "query", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SerialPort.prototype, "stopBit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], SerialPort.prototype, "flowRts", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], SerialPort.prototype, "receiveAllMessageDsBit", void 0);
exports.SerialPort = SerialPort = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelCategory.SERIAL_PORT),
    __metadata("design:paramtypes", [String, String])
], SerialPort);
// ─────────────────────────────────────────────
//  HID Relay Hardware Channel
// ─────────────────────────────────────────────
let HIDRelay = class HIDRelay extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.HID_RELAY);
        this.relayId = 0;
        this.relayChannelName = '';
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, relayId: this.relayId };
    }
    toJSON() {
        return { id: this.id, name: this.name, type: this.type, relayId: this.relayId, relayChannelName: this.relayChannelName };
    }
};
exports.HIDRelay = HIDRelay;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], HIDRelay.prototype, "relayId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HIDRelay.prototype, "relayChannelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HIDRelay.prototype, "relayType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], HIDRelay.prototype, "relayNum", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Map)
], HIDRelay.prototype, "return_Map", void 0);
exports.HIDRelay = HIDRelay = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelCategory.HID_RELAY),
    __metadata("design:paramtypes", [String, String])
], HIDRelay);
// ─────────────────────────────────────────────
//  Relay Board Hardware Channel
// ─────────────────────────────────────────────
let RelayBoard = class RelayBoard extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.RELAY_BOARD);
        this.ioChannel = 0;
        this.relayChannelName = '';
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, ioChannel: this.ioChannel };
    }
    toJSON() {
        return { ...this };
    }
};
exports.RelayBoard = RelayBoard;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], RelayBoard.prototype, "ioChannel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RelayBoard.prototype, "relayChannelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RelayBoard.prototype, "relayCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RelayBoard.prototype, "relayChannelCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RelayBoard.prototype, "dmerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Map)
], RelayBoard.prototype, "Mapping", void 0);
exports.RelayBoard = RelayBoard = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelCategory.RELAY_BOARD),
    __metadata("design:paramtypes", [String, String])
], RelayBoard);
// ─────────────────────────────────────────────
//  Ethernet Adapter Hardware Channel
// ─────────────────────────────────────────────
let EthernetAdapter = class EthernetAdapter extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.ETHERNET_ADAPTER);
        this.macAddress = '';
        this.ipAddress = '';
        this.memberName = '';
        this.bufferSize = 0;
        this.timeout = 0;
        this.immutableMode = false;
        this.snapshotLength = 0;
        this.pcapModeMode = false;
        this.timeframes = [];
        this.immediateDataReadMode = false;
        this.dataLoggerType = '';
        this.packetProcessingConfig = false;
        this.goodChildLength = false;
        this.positionIdentificationActive = false;
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type,
            macAddress: this.macAddress, ipAddress: this.ipAddress,
            bufferSize: this.bufferSize, snapshotLength: this.snapshotLength,
        };
    }
    toJSON() {
        return { ...this };
    }
};
exports.EthernetAdapter = EthernetAdapter;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "macAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "memberName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetAdapter.prototype, "bufferSize", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetAdapter.prototype, "timeout", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "immutableMode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetAdapter.prototype, "snapshotLength", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "pcapModeMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], EthernetAdapter.prototype, "timeframes", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "immediateDataReadMode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "dataLoggerType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "packetProcessingConfig", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "goodChildLength", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "positionIdentificationActive", void 0);
exports.EthernetAdapter = EthernetAdapter = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelCategory.ETHERNET_ADAPTER),
    __metadata("design:paramtypes", [String, String])
], EthernetAdapter);
// ─────────────────────────────────────────────
//  IO Analog Hardware Channel
// ─────────────────────────────────────────────
let IOAnalog = class IOAnalog extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.ANALOG_DEVICE);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, sensorType: this.sensorType };
    }
    toJSON() {
        return { id: this.id, name: this.name, type: this.type, sensorType: this.sensorType, portId: this.portId };
    }
};
exports.IOAnalog = IOAnalog;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOAnalog.prototype, "sensorType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOAnalog.prototype, "controlId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], IOAnalog.prototype, "portId", void 0);
exports.IOAnalog = IOAnalog = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelCategory.ANALOG_DEVICE),
    __metadata("design:paramtypes", [String, String])
], IOAnalog);
// ─────────────────────────────────────────────
//  CAN Interface Hardware Channel
// ─────────────────────────────────────────────
let CANInterface = class CANInterface extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.CAN_INTERFACE);
        this.netChannel = 0;
        this.netHwChannel = 0;
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, netChannel: this.netChannel, netHwChannel: this.netHwChannel };
    }
    toJSON() {
        return { id: this.id, name: this.name, type: this.type, netChannel: this.netChannel, netHwChannel: this.netHwChannel };
    }
};
exports.CANInterface = CANInterface;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CANInterface.prototype, "netChannel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CANInterface.prototype, "netHwChannel", void 0);
exports.CANInterface = CANInterface = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelCategory.CAN_INTERFACE),
    __metadata("design:paramtypes", [String, String])
], CANInterface);
// ─────────────────────────────────────────────
//  CIB Interface Hardware Channel
// ─────────────────────────────────────────────
let CIBInterface = class CIBInterface extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.CAN_INTERFACE);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, bitRate: this.bitRate };
    }
    toJSON() {
        return { id: this.id, name: this.name, type: this.type, bitRate: this.bitRate, hwChannel: this.hwChannel };
    }
};
exports.CIBInterface = CIBInterface;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CIBInterface.prototype, "bitRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CIBInterface.prototype, "hwChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CIBInterface.prototype, "hwChannel2", void 0);
exports.CIBInterface = CIBInterface = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelCategory.CAN_INTERFACE),
    __metadata("design:paramtypes", [String, String])
], CIBInterface);
//# sourceMappingURL=hardwareChannels.js.map