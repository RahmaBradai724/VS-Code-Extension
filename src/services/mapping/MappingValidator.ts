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
