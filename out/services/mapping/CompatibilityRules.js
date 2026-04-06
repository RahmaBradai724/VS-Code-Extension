"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCompatibilityStrategy = void 0;
// Protocol compatibility table: logical category → compatible hardware categories
const PROTOCOL_COMPATIBILITY = {
    'CAN': ['CAN_INTERFACE'],
    'CANFD': ['CAN_INTERFACE'],
    'LIN': ['CAN_INTERFACE', 'SERIAL_PORT'],
    'FLEXRAY': ['CAN_INTERFACE', 'ETHERNET_ADAPTER'],
    'FR': ['CAN_INTERFACE', 'ETHERNET_ADAPTER'],
    'ETHERNET': ['ETHERNET_ADAPTER'],
    'SERIAL': ['SERIAL_PORT'],
    'IOSERIAL': ['SERIAL_PORT'],
    'IOINPUT': ['RELAY_BOARD', 'HID_RELAY', 'ANALOG_DEVICE', 'BTS_REVO'],
    'IOOUTPUT': ['RELAY_BOARD', 'HID_RELAY', 'ANALOG_DEVICE', 'BTS_REVO'],
    'BRIDGE': ['CAN_INTERFACE', 'ETHERNET_ADAPTER', 'SERIAL_PORT'],
    'TE_ANALOG': ['TE_ANALOG'],
    'PS': ['BTS_REVO'],
};
/**
 * Default compatibility strategy based on the static PROTOCOL_COMPATIBILITY table.
 * Strategy pattern: swap this for a different implementation without touching MappingManager.
 * OCP: extend by creating a new ICompatibilityStrategy, not by modifying this class.
 */
class DefaultCompatibilityStrategy {
    isCompatible(logicalCategory, hardwareCategory) {
        return this.getCompatibleHardware(logicalCategory).includes(hardwareCategory);
    }
    getCompatibleHardware(logicalCategory) {
        return PROTOCOL_COMPATIBILITY[logicalCategory] || [];
    }
}
exports.DefaultCompatibilityStrategy = DefaultCompatibilityStrategy;
//# sourceMappingURL=CompatibilityRules.js.map