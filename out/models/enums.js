"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimestampPrecision = exports.PublisherMode = exports.CaptureType = exports.HardwareChannelSubclass = exports.HardwareChannelCategory = exports.LogicalChannelSubclass = exports.ChannelType = exports.LogicalChannelCategory = void 0;
var LogicalChannelCategory;
(function (LogicalChannelCategory) {
    LogicalChannelCategory["CAN"] = "CAN";
    LogicalChannelCategory["CAN_FD"] = "CANFD";
    LogicalChannelCategory["LIN"] = "LIN";
    LogicalChannelCategory["FR"] = "FR";
    LogicalChannelCategory["FLEXRAY"] = "FLEXRAY";
    LogicalChannelCategory["ETHERNET"] = "ETHERNET";
    LogicalChannelCategory["IOOUTPUT"] = "IOOUTPUT";
    LogicalChannelCategory["IOINPUT"] = "IOINPUT";
    LogicalChannelCategory["IOSERIAL"] = "IOSERIAL";
    LogicalChannelCategory["SERIAL"] = "SERIAL";
    LogicalChannelCategory["PS"] = "PS";
    LogicalChannelCategory["BRIDGE"] = "BRIDGE";
    LogicalChannelCategory["ANALOG"] = "ANALOG";
    LogicalChannelCategory["TE_ANALOG"] = "TE_ANALOG";
})(LogicalChannelCategory || (exports.LogicalChannelCategory = LogicalChannelCategory = {}));
var ChannelType;
(function (ChannelType) {
    ChannelType["HARDWARE"] = "HARDWARE";
    ChannelType["LOGICAL"] = "LOGICAL";
})(ChannelType || (exports.ChannelType = ChannelType = {}));
var LogicalChannelSubclass;
(function (LogicalChannelSubclass) {
    LogicalChannelSubclass["FLEXRAY"] = "FlexRayChannel";
    LogicalChannelSubclass["SERIAL"] = "SerialChannel";
    LogicalChannelSubclass["CAN"] = "CANChannel";
    LogicalChannelSubclass["IOINPUT"] = "IOInputChannel";
    LogicalChannelSubclass["IOOUTPUT"] = "IOOutputChannel";
    LogicalChannelSubclass["LIN"] = "LINChannel";
    LogicalChannelSubclass["IOSERIAL"] = "IOSerialChannel";
    LogicalChannelSubclass["BRIDGE"] = "BridgeChannel";
    LogicalChannelSubclass["ANALOG"] = "AnalogChannel";
    LogicalChannelSubclass["PS"] = "PSChannel";
    LogicalChannelSubclass["ETHERNET"] = "EthernetChannel";
})(LogicalChannelSubclass || (exports.LogicalChannelSubclass = LogicalChannelSubclass = {}));
var HardwareChannelCategory;
(function (HardwareChannelCategory) {
    HardwareChannelCategory["SERIAL_PORT"] = "SERIAL_PORT";
    HardwareChannelCategory["CAN_INTERFACE"] = "CAN_INTERFACE";
    HardwareChannelCategory["ETHERNET_ADAPTER"] = "ETHERNET_ADAPTER";
    HardwareChannelCategory["RELAY_BOARD"] = "RELAY_BOARD";
    HardwareChannelCategory["HID_RELAY"] = "HID_RELAY";
    HardwareChannelCategory["ANALOG_DEVICE"] = "ANALOG_DEVICE";
    HardwareChannelCategory["TE_ANALOG"] = "TE_ANALOG";
    HardwareChannelCategory["HH_LOAD"] = "HH_LOAD";
})(HardwareChannelCategory || (exports.HardwareChannelCategory = HardwareChannelCategory = {}));
var HardwareChannelSubclass;
(function (HardwareChannelSubclass) {
    HardwareChannelSubclass["LIN_CARD"] = "LINCard";
    HardwareChannelSubclass["SERIAL_PORT"] = "SerialPort";
    HardwareChannelSubclass["HID_RELAY"] = "HIDRelay";
    HardwareChannelSubclass["RELAY_BOARD"] = "RelayBoard";
    HardwareChannelSubclass["ETHERNET_ADAPTER"] = "EthernetAdapter";
    HardwareChannelSubclass["ANALOG_DEVICE"] = "AnalogDevice";
    HardwareChannelSubclass["TE_ANALOG"] = "TEAnalog";
    HardwareChannelSubclass["CAN_INTERFACE"] = "CANInterface";
    HardwareChannelSubclass["CIB_INTERFACE"] = "CIBInterface";
    HardwareChannelSubclass["CM_INTERFACE"] = "CMInterface";
    HardwareChannelSubclass["HH_LOAD"] = "HHLoad";
})(HardwareChannelSubclass || (exports.HardwareChannelSubclass = HardwareChannelSubclass = {}));
var CaptureType;
(function (CaptureType) {
    CaptureType["FLEXRAY"] = "FLEXRAY";
    CaptureType["ETHERNET"] = "ETHERNET";
    CaptureType["CAN"] = "CAN";
})(CaptureType || (exports.CaptureType = CaptureType = {}));
var PublisherMode;
(function (PublisherMode) {
    PublisherMode["SingleThreaded"] = "SingleThreaded";
    PublisherMode["MultiThreaded"] = "MultiThreaded";
})(PublisherMode || (exports.PublisherMode = PublisherMode = {}));
var TimestampPrecision;
(function (TimestampPrecision) {
    TimestampPrecision["MICROSECONDS"] = "MICROSECONDS";
    TimestampPrecision["MILLISECONDS"] = "MILLISECONDS";
    TimestampPrecision["NANOSECONDS"] = "NANOSECONDS";
})(TimestampPrecision || (exports.TimestampPrecision = TimestampPrecision = {}));
//# sourceMappingURL=enums.js.map