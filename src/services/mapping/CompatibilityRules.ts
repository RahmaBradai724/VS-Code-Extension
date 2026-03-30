import { ICompatibilityStrategy } from '../interfaces/ICompatibilityStrategy';

// Protocol compatibility table: logical category → compatible hardware categories
const PROTOCOL_COMPATIBILITY: Record<string, string[]> = {
  'CAN':      ['CAN_INTERFACE'],
  'CANFD':    ['CAN_INTERFACE'],
  'LIN':      ['CAN_INTERFACE', 'SERIAL_PORT'],
  'FLEXRAY':  ['CAN_INTERFACE', 'ETHERNET_ADAPTER'],
  'FR':       ['CAN_INTERFACE', 'ETHERNET_ADAPTER'],
  'ETHERNET': ['ETHERNET_ADAPTER'],
  'SERIAL':   ['SERIAL_PORT'],
  'IOSERIAL': ['SERIAL_PORT'],
  'IOINPUT':  ['RELAY_BOARD', 'HID_RELAY', 'ANALOG_DEVICE'],
  'IOOUTPUT': ['RELAY_BOARD', 'HID_RELAY', 'ANALOG_DEVICE'],
  'BRIDGE':   ['CAN_INTERFACE', 'ETHERNET_ADAPTER', 'SERIAL_PORT'],
  'ANALOG':   ['ANALOG_DEVICE', 'TE_ANALOG'],
  'TE_ANALOG':['TE_ANALOG'],
};

/**
 * Default compatibility strategy based on the static PROTOCOL_COMPATIBILITY table.
 * Strategy pattern: swap this for a different implementation without touching MappingManager.
 * OCP: extend by creating a new ICompatibilityStrategy, not by modifying this class.
 */
export class DefaultCompatibilityStrategy implements ICompatibilityStrategy {
  isCompatible(logicalCategory: string, hardwareCategory: string): boolean {
    return this.getCompatibleHardware(logicalCategory).includes(hardwareCategory);
  }

  getCompatibleHardware(logicalCategory: string): string[] {
    return PROTOCOL_COMPATIBILITY[logicalCategory] || [];
  }
}
