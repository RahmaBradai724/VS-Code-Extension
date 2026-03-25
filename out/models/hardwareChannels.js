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
exports.HHLoad = exports.CMInterface = exports.CIBInterface = exports.CANInterface = exports.TEAnalog = exports.AnalogDevice = exports.EthernetAdapter = exports.RelayBoard = exports.HIDRelay = exports.SerialPort = exports.LINCard = void 0;
const typeorm_1 = require("typeorm");
const channel_1 = require("./channel");
const enums_1 = require("./enums");
// ─────────────────────────────────────────────
//  LIN Card Hardware Channel
// ─────────────────────────────────────────────
let LINCard = class LINCard extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.SERIAL_PORT, enums_1.HardwareChannelSubclass.LIN_CARD);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, hwModel: this.hwModel };
    }
    toJSON() {
        return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, hwModel: this.hwModel, bmtStr: this.bmtStr, hwChannel: this.hwChannel };
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
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelSubclass.LIN_CARD),
    __metadata("design:paramtypes", [String, String])
], LINCard);
// ─────────────────────────────────────────────
//  Serial Port Hardware Channel
// ─────────────────────────────────────────────
let SerialPort = class SerialPort extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.SERIAL_PORT, enums_1.HardwareChannelSubclass.SERIAL_PORT);
        this.portName = '';
        this.baudRate = 9600;
        this.parity = 'None';
        this.dataBits = 8;
        this.stopBits = '1';
        this.flowControl = 'None';
        this.messageTerminator = '';
        this.separationTimeMs = 0;
        this.maxReceivedDataSize = 0;
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            portName: this.portName, baudRate: this.baudRate,
            parity: this.parity, dataBits: this.dataBits,
            stopBits: this.stopBits, flowControl: this.flowControl,
            messageTerminator: this.messageTerminator,
            separationTimeMs: this.separationTimeMs,
            maxReceivedDataSize: this.maxReceivedDataSize
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.SerialPort = SerialPort;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialPort.prototype, "portName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialPort.prototype, "baudRate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialPort.prototype, "parity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialPort.prototype, "dataBits", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialPort.prototype, "stopBits", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialPort.prototype, "flowControl", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialPort.prototype, "messageTerminator", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialPort.prototype, "separationTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialPort.prototype, "maxReceivedDataSize", void 0);
exports.SerialPort = SerialPort = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelSubclass.SERIAL_PORT),
    __metadata("design:paramtypes", [String, String])
], SerialPort);
// ─────────────────────────────────────────────
//  HID Relay Hardware Channel
// ─────────────────────────────────────────────
let HIDRelay = class HIDRelay extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.HID_RELAY, enums_1.HardwareChannelSubclass.HID_RELAY);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            vendorId: this.vendorId, productId: this.productId,
            deviceSerial: this.deviceSerial, relays: this.relays
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.HIDRelay = HIDRelay;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HIDRelay.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HIDRelay.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HIDRelay.prototype, "deviceSerial", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], HIDRelay.prototype, "relays", void 0);
exports.HIDRelay = HIDRelay = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelSubclass.HID_RELAY),
    __metadata("design:paramtypes", [String, String])
], HIDRelay);
// ─────────────────────────────────────────────
//  Relay Board Hardware Channel
// ─────────────────────────────────────────────
let RelayBoard = class RelayBoard extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.RELAY_BOARD, enums_1.HardwareChannelSubclass.RELAY_BOARD);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            relayCount: this.relayCount, channelName: this.channelName,
            boardId: this.boardId, relays: this.relays
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.RelayBoard = RelayBoard;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RelayBoard.prototype, "relayCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RelayBoard.prototype, "channelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RelayBoard.prototype, "boardId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RelayBoard.prototype, "relays", void 0);
exports.RelayBoard = RelayBoard = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelSubclass.RELAY_BOARD),
    __metadata("design:paramtypes", [String, String])
], RelayBoard);
// ─────────────────────────────────────────────
//  Ethernet Adapter Hardware Channel
// ─────────────────────────────────────────────
let EthernetAdapter = class EthernetAdapter extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.ETHERNET_ADAPTER, enums_1.HardwareChannelSubclass.ETHERNET_ADAPTER);
        this.macAddress = '';
        this.ipAddress = '';
        this.friendlyName = '';
        this.interface = '';
        this.bufferSize = 0;
        this.bpFilter = '';
        this.timeout = 0;
        this.timeStampPrecision = '';
        this.timeStampSource = '';
        this.immediateMode = false;
        this.snapshotLength = 0;
        this.pcapDeviceMode = '';
        this.useDataLoggerTimeStamp = false;
        this.removeDataLoggerMetaData = false;
        this.dataLoggerType = '';
        this.packetProcessingActive = false;
        this.packetIdentificationActive = false;
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            macAddress: this.macAddress, ipAddress: this.ipAddress,
            friendlyName: this.friendlyName, interface: this.interface,
            bufferSize: this.bufferSize, bpFilter: this.bpFilter,
            timeout: this.timeout, timeStampPrecision: this.timeStampPrecision,
            timeStampSource: this.timeStampSource, immediateMode: this.immediateMode,
            snapshotLength: this.snapshotLength, pcapDeviceMode: this.pcapDeviceMode,
            useDataLoggerTimeStamp: this.useDataLoggerTimeStamp,
            removeDataLoggerMetaData: this.removeDataLoggerMetaData,
            dataLoggerType: this.dataLoggerType,
            packetProcessingActive: this.packetProcessingActive,
            packetIdentificationActive: this.packetIdentificationActive
        };
    }
    toJSON() {
        return this.toYAML();
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
], EthernetAdapter.prototype, "friendlyName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "interface", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetAdapter.prototype, "bufferSize", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "bpFilter", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetAdapter.prototype, "timeout", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "timeStampPrecision", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "timeStampSource", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "immediateMode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetAdapter.prototype, "snapshotLength", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "pcapDeviceMode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "useDataLoggerTimeStamp", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "removeDataLoggerMetaData", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "dataLoggerType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "packetProcessingActive", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "packetIdentificationActive", void 0);
exports.EthernetAdapter = EthernetAdapter = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelSubclass.ETHERNET_ADAPTER),
    __metadata("design:paramtypes", [String, String])
], EthernetAdapter);
// ─────────────────────────────────────────────
//  IO Analog Hardware Channel
// ─────────────────────────────────────────────
let AnalogDevice = class AnalogDevice extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.ANALOG_DEVICE, enums_1.HardwareChannelSubclass.ANALOG_DEVICE);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            channels: this.channels, resolution: this.resolution,
            measurementAttribute: this.measurementAttribute, hwChannel: this.hwChannel,
            lineContactState: this.lineContactState, gndContactState: this.gndContactState,
            vbatContactState: this.vbatContactState, staticChannel: this.staticChannel,
            initValue: this.initValue, function: this.function,
            channelType: this.channelType, pwmWindowTime: this.pwmWindowTime,
            diagnostics: this.diagnostics
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.AnalogDevice = AnalogDevice;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AnalogDevice.prototype, "channels", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AnalogDevice.prototype, "resolution", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalogDevice.prototype, "measurementAttribute", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AnalogDevice.prototype, "hwChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], AnalogDevice.prototype, "lineContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], AnalogDevice.prototype, "gndContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], AnalogDevice.prototype, "vbatContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], AnalogDevice.prototype, "staticChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalogDevice.prototype, "initValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalogDevice.prototype, "function", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalogDevice.prototype, "channelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AnalogDevice.prototype, "pwmWindowTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AnalogDevice.prototype, "diagnostics", void 0);
exports.AnalogDevice = AnalogDevice = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelSubclass.ANALOG_DEVICE),
    __metadata("design:paramtypes", [String, String])
], AnalogDevice);
// ─────────────────────────────────────────────
//  TEAnalog Hardware Channel
// ─────────────────────────────────────────────
let TEAnalog = class TEAnalog extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.TE_ANALOG, enums_1.HardwareChannelSubclass.TE_ANALOG);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, sensorType: this.sensorType, hwChannel: this.hwChannel, deviceId: this.deviceId };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.TEAnalog = TEAnalog;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TEAnalog.prototype, "sensorType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], TEAnalog.prototype, "hwChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], TEAnalog.prototype, "deviceId", void 0);
exports.TEAnalog = TEAnalog = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelSubclass.TE_ANALOG),
    __metadata("design:paramtypes", [String, String])
], TEAnalog);
// ─────────────────────────────────────────────
//  CAN Interface Hardware Channel
// ─────────────────────────────────────────────
let CANInterface = class CANInterface extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.CAN_INTERFACE, enums_1.HardwareChannelSubclass.CAN_INTERFACE);
        this.netChannel = 0;
        this.netHwChannel = 0;
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, netChannel: this.netChannel, netHwChannel: this.netHwChannel };
    }
    toJSON() {
        return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, netChannel: this.netChannel, netHwChannel: this.netHwChannel };
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
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelSubclass.CAN_INTERFACE),
    __metadata("design:paramtypes", [String, String])
], CANInterface);
// ─────────────────────────────────────────────
//  CIB Interface Hardware Channel
// ─────────────────────────────────────────────
let CIBInterface = class CIBInterface extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.CAN_INTERFACE, enums_1.HardwareChannelSubclass.CIB_INTERFACE);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, bitRate: this.bitRate };
    }
    toJSON() {
        return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, bitRate: this.bitRate, hwChannel: this.hwChannel };
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
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelSubclass.CIB_INTERFACE),
    __metadata("design:paramtypes", [String, String])
], CIBInterface);
// ─────────────────────────────────────────────
//  CMInterface Hardware Channel
// ─────────────────────────────────────────────
let CMInterface = class CMInterface extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.CM_INTERFACE, enums_1.HardwareChannelSubclass.CM_INTERFACE);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            interfaceName: this.interfaceName, captureType: this.captureType,
            bitrate: this.bitrate, hwChannel: this.hwChannel
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.CMInterface = CMInterface;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CMInterface.prototype, "interfaceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], CMInterface.prototype, "captureType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CMInterface.prototype, "bitrate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CMInterface.prototype, "hwChannel", void 0);
exports.CMInterface = CMInterface = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelSubclass.CM_INTERFACE),
    __metadata("design:paramtypes", [String, String])
], CMInterface);
// ─────────────────────────────────────────────
//  HHLoad Hardware Channel
// ─────────────────────────────────────────────
let HHLoad = class HHLoad extends channel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.HH_LOAD, enums_1.HardwareChannelSubclass.HH_LOAD);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            maxLoad: this.maxLoad, deviceId: this.deviceId,
            portName: this.portName, bitRate: this.bitRate,
            loadType: this.loadType, flag: this.flag, channels: this.channels
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.HHLoad = HHLoad;
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], HHLoad.prototype, "maxLoad", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], HHLoad.prototype, "deviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HHLoad.prototype, "portName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], HHLoad.prototype, "flag", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], HHLoad.prototype, "bitRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HHLoad.prototype, "loadType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], HHLoad.prototype, "channels", void 0);
exports.HHLoad = HHLoad = __decorate([
    (0, typeorm_1.ChildEntity)(enums_1.HardwareChannelSubclass.HH_LOAD),
    __metadata("design:paramtypes", [String, String])
], HHLoad);
//# sourceMappingURL=hardwareChannels.js.map