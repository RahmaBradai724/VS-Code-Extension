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
  IDSERIAL = 'IDSERIAL',
  SERIAL = 'SERIAL',
  I2C = 'I2C',
  BRIDGE = 'BRIDGE',
  ANALOG = 'ANALOG',
  TE_ANALOG = 'TE_ANALOG',
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
