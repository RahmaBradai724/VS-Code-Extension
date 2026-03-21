"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIBInterface = exports.CANInterface = exports.IOAnalog = exports.EthernetAdapter = exports.RelayBoard = exports.HIDRelay = exports.SerialPort = exports.LINCard = void 0;
const channel_1 = require("./channel");
const enums_1 = require("./enums");
// ─────────────────────────────────────────────
//  LIN Card Hardware Channel
// ─────────────────────────────────────────────
class LINCard extends channel_1.HardwareChannel {
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
}
exports.LINCard = LINCard;
// ─────────────────────────────────────────────
//  Serial Port Hardware Channel
// ─────────────────────────────────────────────
class SerialPort extends channel_1.HardwareChannel {
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
}
exports.SerialPort = SerialPort;
// ─────────────────────────────────────────────
//  HID Relay Hardware Channel
// ─────────────────────────────────────────────
class HIDRelay extends channel_1.HardwareChannel {
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
}
exports.HIDRelay = HIDRelay;
// ─────────────────────────────────────────────
//  Relay Board Hardware Channel
// ─────────────────────────────────────────────
class RelayBoard extends channel_1.HardwareChannel {
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
}
exports.RelayBoard = RelayBoard;
// ─────────────────────────────────────────────
//  Ethernet Adapter Hardware Channel
// ─────────────────────────────────────────────
class EthernetAdapter extends channel_1.HardwareChannel {
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
}
exports.EthernetAdapter = EthernetAdapter;
// ─────────────────────────────────────────────
//  IO Analog Hardware Channel
// ─────────────────────────────────────────────
class IOAnalog extends channel_1.HardwareChannel {
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
}
exports.IOAnalog = IOAnalog;
// ─────────────────────────────────────────────
//  CAN Interface Hardware Channel
// ─────────────────────────────────────────────
class CANInterface extends channel_1.HardwareChannel {
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
}
exports.CANInterface = CANInterface;
// ─────────────────────────────────────────────
//  CIB Interface Hardware Channel
// ─────────────────────────────────────────────
class CIBInterface extends channel_1.HardwareChannel {
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
}
exports.CIBInterface = CIBInterface;
//# sourceMappingURL=hardwareChannels.js.map