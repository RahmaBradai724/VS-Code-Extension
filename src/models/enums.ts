export enum LogicalChannelCategory {
  CAN = 'CAN',
  CAN_FD = 'CANFD',
  LIN = 'LIN',
  FR = 'FR',
  FLEXRAY = 'FLEXRAY',
  ETHERNET = 'ETHERNET',
  IOOUTPUT = 'IOOUTPUT',
  IOINPUT = 'IOINPUT',
  IOSERIAL = 'IOSERIAL',
  SERIAL = 'SERIAL',
  PS = 'PS',
  BRIDGE = 'BRIDGE',
  TE_ANALOG = 'TE_ANALOG',
}

export enum ChannelType {
  HARDWARE = 'HARDWARE',
  LOGICAL = 'LOGICAL',
}

export enum LogicalChannelSubclass {
  FLEXRAY = 'FlexRayChannel',
  SERIAL = 'SerialChannel',
  CAN = 'CANChannel',
  IOINPUT = 'IOInputChannel',
  IOOUTPUT = 'IOOutputChannel',
  LIN = 'LINChannel',
  IOSERIAL = 'IOSerialChannel',
  BRIDGE = 'BridgeChannel',
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
  TE_ANALOG = 'TE_ANALOG',
  HH_LOAD = 'HH_LOAD',
  BTS_REVO = 'BTS_REVO',
  GENESYS_PS = 'GENESYS_PS',
  MANSON_PS = 'MANSON_PS',
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
  BTS_REVO = 'BTSRevo',
  GENESYS_PS = 'GenesysPowerSupply',
  MANSON_PS = 'MansonPowerSupply',
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
