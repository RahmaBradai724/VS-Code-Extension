"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardwareChannelFactories = exports.logicalChannelFactories = void 0;
const logicalChannels_1 = require("../models/logicalChannels");
const hardwareChannels_1 = require("../models/hardwareChannels");
const enums_1 = require("../models/enums");
exports.logicalChannelFactories = {
    [enums_1.LogicalChannelSubclass.CAN]: (id, name) => new logicalChannels_1.CANChannel(id, name),
    [enums_1.LogicalChannelSubclass.LIN]: (id, name) => new logicalChannels_1.LINChannel(id, name),
    [enums_1.LogicalChannelSubclass.FLEXRAY]: (id, name) => new logicalChannels_1.FlexRayChannel(id, name),
    [enums_1.LogicalChannelSubclass.ETHERNET]: (id, name) => new logicalChannels_1.EthernetChannel(id, name),
    [enums_1.LogicalChannelSubclass.SERIAL]: (id, name) => new logicalChannels_1.SerialChannel(id, name),
    [enums_1.LogicalChannelSubclass.IOINPUT]: (id, name) => new logicalChannels_1.IOInputChannel(id, name),
    [enums_1.LogicalChannelSubclass.IOOUTPUT]: (id, name) => new logicalChannels_1.IOOutputChannel(id, name),
    [enums_1.LogicalChannelSubclass.BRIDGE]: (id, name) => new logicalChannels_1.BridgeChannel(id, name),
    [enums_1.LogicalChannelSubclass.PS]: (id, name) => new logicalChannels_1.PSChannel(id, name),
    [enums_1.LogicalChannelSubclass.IOSERIAL]: (id, name) => new logicalChannels_1.IOSerialChannel(id, name),
};
exports.hardwareChannelFactories = {
    [enums_1.HardwareChannelSubclass.CAN_INTERFACE]: (id, name) => new hardwareChannels_1.CANInterface(id, name),
    [enums_1.HardwareChannelSubclass.CIB_INTERFACE]: (id, name) => new hardwareChannels_1.CIBInterface(id, name),
    [enums_1.HardwareChannelSubclass.ETHERNET_ADAPTER]: (id, name) => new hardwareChannels_1.EthernetAdapter(id, name),
    [enums_1.HardwareChannelSubclass.SERIAL_PORT]: (id, name) => new hardwareChannels_1.SerialPort(id, name),
    [enums_1.HardwareChannelSubclass.LIN_CARD]: (id, name) => new hardwareChannels_1.LINCard(id, name),
    [enums_1.HardwareChannelSubclass.RELAY_BOARD]: (id, name) => new hardwareChannels_1.RelayBoard(id, name),
    [enums_1.HardwareChannelSubclass.HID_RELAY]: (id, name) => new hardwareChannels_1.HIDRelay(id, name),
    [enums_1.HardwareChannelSubclass.ANALOG_DEVICE]: (id, name) => new hardwareChannels_1.AnalogDevice(id, name),
    [enums_1.HardwareChannelSubclass.TE_ANALOG]: (id, name) => new hardwareChannels_1.TEAnalog(id, name),
    [enums_1.HardwareChannelSubclass.CM_INTERFACE]: (id, name) => new hardwareChannels_1.CMInterface(id, name),
    [enums_1.HardwareChannelSubclass.HH_LOAD]: (id, name) => new hardwareChannels_1.HHLoad(id, name),
    [enums_1.HardwareChannelSubclass.BTS_REVO]: (id, name) => new hardwareChannels_1.BTSRevo(id, name),
    [enums_1.HardwareChannelSubclass.GENESYS_PS]: (id, name) => new hardwareChannels_1.GenesysPowerSupply(id, name),
    [enums_1.HardwareChannelSubclass.MANSON_PS]: (id, name) => new hardwareChannels_1.MansonPowerSupply(id, name),
    [enums_1.HardwareChannelSubclass.TUNTAP_BRIDGE]: (id, name) => new hardwareChannels_1.TunTapBridge(id, name),
};
//# sourceMappingURL=channelFactories.js.map