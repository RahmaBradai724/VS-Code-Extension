import {
  CANChannel, LINChannel, FlexRayChannel, EthernetChannel, SerialChannel,
  IOInputChannel, IOOutputChannel, BridgeChannel, AnalogChannel, PSChannel, IPSChannel,
} from '../models/logicalChannels';
import {
  LINCard, SerialPort, HIDRelay, RelayBoard, EthernetAdapter, AnalogDevice,
  CANInterface, CIBInterface, TEAnalog, CMInterface, HHLoad,
} from '../models/hardwareChannels';
import { LogicalChannelSubclass, HardwareChannelSubclass } from '../models/enums';

export const logicalChannelFactories: Record<string, (id: string, name: string) => any> = {
  [LogicalChannelSubclass.CAN]:     (id, name) => new CANChannel(id, name),
  [LogicalChannelSubclass.LIN]:     (id, name) => new LINChannel(id, name),
  [LogicalChannelSubclass.FLEXRAY]: (id, name) => new FlexRayChannel(id, name),
  [LogicalChannelSubclass.ETHERNET]:(id, name) => new EthernetChannel(id, name),
  [LogicalChannelSubclass.SERIAL]:  (id, name) => new SerialChannel(id, name),
  [LogicalChannelSubclass.IOINPUT]: (id, name) => new IOInputChannel(id, name),
  [LogicalChannelSubclass.IOOUTPUT]:(id, name) => new IOOutputChannel(id, name),
  [LogicalChannelSubclass.BRIDGE]:  (id, name) => new BridgeChannel(id, name),
  [LogicalChannelSubclass.ANALOG]:  (id, name) => new AnalogChannel(id, name),
  [LogicalChannelSubclass.PS]:      (id, name) => new PSChannel(id, name),
  [LogicalChannelSubclass.IOSERIAL]:(id, name) => new IPSChannel(id, name),
};

export const hardwareChannelFactories: Record<string, (id: string, name: string) => any> = {
  [HardwareChannelSubclass.CAN_INTERFACE]:   (id, name) => new CANInterface(id, name),
  [HardwareChannelSubclass.CIB_INTERFACE]:   (id, name) => new CIBInterface(id, name),
  [HardwareChannelSubclass.ETHERNET_ADAPTER]:(id, name) => new EthernetAdapter(id, name),
  [HardwareChannelSubclass.SERIAL_PORT]:     (id, name) => new SerialPort(id, name),
  [HardwareChannelSubclass.LIN_CARD]:        (id, name) => new LINCard(id, name),
  [HardwareChannelSubclass.RELAY_BOARD]:     (id, name) => new RelayBoard(id, name),
  [HardwareChannelSubclass.HID_RELAY]:       (id, name) => new HIDRelay(id, name),
  [HardwareChannelSubclass.ANALOG_DEVICE]:   (id, name) => new AnalogDevice(id, name),
  [HardwareChannelSubclass.TE_ANALOG]:       (id, name) => new TEAnalog(id, name),
  [HardwareChannelSubclass.CM_INTERFACE]:    (id, name) => new CMInterface(id, name),
  [HardwareChannelSubclass.HH_LOAD]:         (id, name) => new HHLoad(id, name),
};
