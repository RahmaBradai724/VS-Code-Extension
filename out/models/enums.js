"use strict";
/**
 * Enumerations for the Configuration Management System.
 * Derived from the UML class diagram.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimestampPrecision = exports.PublisherMode = exports.CaptureType = exports.HardwareChannelCategory = exports.LogicalChannelCategory = void 0;
var LogicalChannelCategory;
(function (LogicalChannelCategory) {
    LogicalChannelCategory["CAN"] = "CAN";
    LogicalChannelCategory["CAN_FD"] = "CAN-FD";
    LogicalChannelCategory["LIN"] = "LIN";
    LogicalChannelCategory["FR"] = "FR";
    LogicalChannelCategory["FLEXRAY"] = "FLEXRAY";
    LogicalChannelCategory["ETHERNET"] = "ETHERNET";
    LogicalChannelCategory["IOOUTPUT"] = "IOOUTPUT";
    LogicalChannelCategory["IOINPUT"] = "IOINPUT";
    LogicalChannelCategory["IDSERIAL"] = "IDSERIAL";
    LogicalChannelCategory["SERIAL"] = "SERIAL";
    LogicalChannelCategory["I2C"] = "I2C";
    LogicalChannelCategory["BRIDGE"] = "BRIDGE";
    LogicalChannelCategory["ANALOG"] = "ANALOG";
    LogicalChannelCategory["TE_ANALOG"] = "TE_ANALOG";
    LogicalChannelCategory["PS"] = "PS";
})(LogicalChannelCategory || (exports.LogicalChannelCategory = LogicalChannelCategory = {}));
var HardwareChannelCategory;
(function (HardwareChannelCategory) {
    HardwareChannelCategory["SERIAL_PORT"] = "SERIAL_PORT";
    HardwareChannelCategory["CAN_INTERFACE"] = "CAN_INTERFACE";
    HardwareChannelCategory["ETHERNET_ADAPTER"] = "ETHERNET_ADAPTER";
    HardwareChannelCategory["RELAY_BOARD"] = "RELAY_BOARD";
    HardwareChannelCategory["HID_RELAY"] = "HID_RELAY";
    HardwareChannelCategory["ANALOG_DEVICE"] = "ANALOG_DEVICE";
    HardwareChannelCategory["HID_LOAD"] = "HID_LOAD";
    HardwareChannelCategory["TE_ANALOG"] = "TE_ANALOG";
    HardwareChannelCategory["CM_INTERFACE"] = "CM_INTERFACE";
    HardwareChannelCategory["HH_LOAD"] = "HH_LOAD";
})(HardwareChannelCategory || (exports.HardwareChannelCategory = HardwareChannelCategory = {}));
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