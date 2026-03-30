import { Mapping, LogicalChannel, HardwareChannel } from '../../models';
import { ValidationResult } from '../interfaces/IValidator';
import { ICompatibilityStrategy } from '../interfaces/ICompatibilityStrategy';

/**
 * MappingValidator validates protocol compatibility and mapping rule integrity.
 * SRP: validation only — no state, no side effects.
 * DIP: depends on ICompatibilityStrategy, not a concrete rules table.
 */
export class MappingValidator {
  constructor(private strategy: ICompatibilityStrategy) {}

  validateCompatibility(logical: LogicalChannel, hardware: HardwareChannel): ValidationResult {
    const errors: string[] = [];
    if (!this.strategy.isCompatible(logical.category, hardware.category)) {
      const compatible = this.strategy.getCompatibleHardware(logical.category);
      errors.push(
        `Protocol mismatch: logical category "${logical.category}" is not compatible with hardware category "${hardware.category}". ` +
        `Compatible hardware types: ${compatible.join(', ')}.`
      );
    }

    // CM device type-specific check: CAN_Combo vs LIN_Combo
    const hwAny = hardware as any;
    if (hwAny.cmType) {
      const CAN_COMBO_CATEGORIES = ['CAN', 'CANFD', 'FR', 'FLEXRAY'];
      const LIN_COMBO_CATEGORIES = ['LIN'];
      if (hwAny.cmType === 'LIN_Combo' && !LIN_COMBO_CATEGORIES.includes(logical.category)) {
        errors.push(
          `CM type mismatch: LIN_Combo only supports LIN channels, but got "${logical.category}". Use a CAN_Combo device for this channel.`
        );
      } else if (hwAny.cmType === 'CAN_Combo' && !CAN_COMBO_CATEGORIES.includes(logical.category)) {
        errors.push(
          `CM type mismatch: CAN_Combo does not support "${logical.category}" channels. Use a LIN_Combo device for LIN channels.`
        );
      }
    }

    return { valid: errors.length === 0, errors };
  }

  validateMappingRules(mappings: Mapping[]): ValidationResult {
    const errors: string[] = [];
    const seenLogical = new Set<string>();
    const seenMappingPairs = new Set<string>();

    for (const mapping of mappings) {
      const pairKey = `${mapping.logicalChannelId}:${mapping.hardwareChannelId}`;
      if (seenMappingPairs.has(pairKey)) {
        errors.push(`Duplicate mapping detected: logical "${mapping.logicalChannelName}" → hardware "${mapping.hardwareChannelId}".`);
      }
      seenMappingPairs.add(pairKey);

      if (seenLogical.has(mapping.logicalChannelId)) {
        errors.push(`Logical channel "${mapping.logicalChannelName}" is mapped to more than one hardware channel.`);
      }
      seenLogical.add(mapping.logicalChannelId);
    }

    return { valid: errors.length === 0, errors };
  }
}
