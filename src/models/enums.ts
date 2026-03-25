/**
 * Enumerations for the Configuration Management System.
 * Derived from the UML class diagram.
 */

export enum LogicalChannelCategory {
  CAN = 'CAN',
  CAN_FD = 'CAN-FD',
  LIN = 'LIN',
  FR = 'FR',
  FLEXRAY = 'FLEXRAY',
  ETHERNET = 'ETHERNET',
  IOOUTPUT = 'IOOUTPUT',
  IOINPUT = 'IOINPUT',
  IOSERIAL = 'IOSERIAL',
  // Backward compatible alias
  IDSERIAL = 'IOSERIAL',
  SERIAL = 'SERIAL',
  I2C = 'I2C',
  BRIDGE = 'BRIDGE',
  ANALOG = 'ANALOG',
  TE_ANALOG = 'TE_ANALOG',
  PS = 'PS',
}

export enum ChannelType {
  HARDWARE = 'HARDWARE',
  LOGICAL = 'LOGICAL',
}

export enum LogicalChannelSubclass {
  FLEXRAY = 'FlexRayChannel',
  SERIAL = 'SerialChannel',
  CAN = 'CANChannel',
  CAN_FD = 'CANFDChannel',
  IOINPUT = 'IOInputChannel',
  IOOUTPUT = 'IOOutputChannel',
  LIN = 'LINChannel',
  IOSERIAL = 'IOSerialChannel',
  BRIDGE = 'BridgeChannel',
  ANALOG = 'AnalogChannel',
  PS = 'PSChannel',
  ETHERNET = 'EthernetChannel',
}

export enum HardwareChannelCategory {
  SERIAL_PORT = 'SERIAL_PORT',
  CAN_INTERFACE = 'CAN_INTERFACE',
  ETHERNET_ADAPTER = 'ETHERNET_ADAPTER',
  RELAY_BOARD = 'RELAY_BOARD',
  HID_RELAY = 'HID_RELAY',
  ANALOG_DEVICE = 'ANALOG_DEVICE',
  HID_LOAD = 'HID_LOAD',
  TE_ANALOG = 'TE_ANALOG',
  CM_INTERFACE = 'CM_INTERFACE',
  HH_LOAD = 'HH_LOAD',
}

export enum HardwareChannelSubclass {
  LIN_CARD = 'LINCard',
  SERIAL_PORT = 'SerialPort',
  HID_RELAY = 'HIDRelay',
  RELAY_BOARD = 'RelayBoard',
  ETHERNET_ADAPTER = 'EthernetAdapter',
  ANALOG_DEVICE = 'AnalogDevice',
  TE_ANALOG = 'TEAnalog',
  CAN_INTERFACE = 'CANInterface',
  CIB_INTERFACE = 'CIBInterface',
  CM_INTERFACE = 'CMInterface',
  HH_LOAD = 'HHLoad',
}

export enum CaptureType {
  FLEXRAY = 'FLEXRAY',
  ETHERNET = 'ETHERNET',
  CAN = 'CAN',
}

export enum PublisherMode {
  SingleThreaded = 'SingleThreaded',
  MultiThreaded = 'MultiThreaded',
}

export enum TimestampPrecision {
  MICROSECONDS = 'MICROSECONDS',
  MILLISECONDS = 'MILLISECONDS',
  NANOSECONDS = 'NANOSECONDS',
}
