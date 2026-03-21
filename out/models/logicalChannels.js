"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthernetChannel = exports.AnalogChannel = exports.BridgeChannel = exports.IPSChannel = exports.LINChannel = exports.IOOutputChannel = exports.IOInputChannel = exports.CANChannel = exports.SerialChannel = exports.FlexRayChannel = void 0;
const channel_1 = require("./channel");
const enums_1 = require("./enums");
// ─────────────────────────────────────────────
//  FlexRay Logical Channel
// ─────────────────────────────────────────────
class FlexRayChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.FLEXRAY);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, optionStr: this.optionStr };
    }
    toJSON() {
        return { ...this.toYAML(), optionId: this.optionId };
    }
}
exports.FlexRayChannel = FlexRayChannel;
// ─────────────────────────────────────────────
//  Serial Logical Channel
// ─────────────────────────────────────────────
class SerialChannel extends channel_1.LogicalChannel {
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
}
exports.SerialChannel = SerialChannel;
// ─────────────────────────────────────────────
//  CAN Logical Channel
// ─────────────────────────────────────────────
class CANChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.CAN);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, dbcChannel: this.dbcChannel };
    }
    toJSON() {
        return { ...this.toYAML(), connectionMode: this.connectionMode };
    }
}
exports.CANChannel = CANChannel;
// ─────────────────────────────────────────────
//  IO Input Logical Channel
// ─────────────────────────────────────────────
class IOInputChannel extends channel_1.LogicalChannel {
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
}
exports.IOInputChannel = IOInputChannel;
// ─────────────────────────────────────────────
//  IO Output Logical Channel
// ─────────────────────────────────────────────
class IOOutputChannel extends channel_1.LogicalChannel {
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
}
exports.IOOutputChannel = IOOutputChannel;
// ─────────────────────────────────────────────
//  LIN Logical Channel
// ─────────────────────────────────────────────
class LINChannel extends channel_1.LogicalChannel {
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
}
exports.LINChannel = LINChannel;
// ─────────────────────────────────────────────
//  IPS Logical Channel
// ─────────────────────────────────────────────
class IPSChannel extends channel_1.LogicalChannel {
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
}
exports.IPSChannel = IPSChannel;
// ─────────────────────────────────────────────
//  Bridge Logical Channel
// ─────────────────────────────────────────────
class BridgeChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.BRIDGE);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type };
    }
    toJSON() {
        return { ...this.toYAML(), hlcChannel: this.hlcChannel };
    }
}
exports.BridgeChannel = BridgeChannel;
// ─────────────────────────────────────────────
//  Analog Logical Channel
// ─────────────────────────────────────────────
class AnalogChannel extends channel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.ANALOG);
    }
    toYAML() {
        return { id: this.id, name: this.name, type: this.type, sensorType: this.sensorType };
    }
    toJSON() {
        return { ...this.toYAML(), controlId: this.controlId };
    }
}
exports.AnalogChannel = AnalogChannel;
// ─────────────────────────────────────────────
//  Ethernet Logical Channel
// ─────────────────────────────────────────────
class EthernetChannel extends channel_1.LogicalChannel {
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
}
exports.EthernetChannel = EthernetChannel;
//# sourceMappingURL=logicalChannels.js.map