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
  'IOINPUT':  ['RELAY_BOARD', 'HID_RELAY', 'ANALOG_DEVICE', 'BTS_REVO', 'HH_LOAD'],
  'IOOUTPUT': ['RELAY_BOARD', 'HID_RELAY', 'ANALOG_DEVICE', 'BTS_REVO', 'HH_LOAD'],
  'BRIDGE':   ['TUNTAP_BRIDGE'],
  'TE_ANALOG':['TE_ANALOG'],
  'PS':       ['GENESYS_PS', 'MANSON_PS'],
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
