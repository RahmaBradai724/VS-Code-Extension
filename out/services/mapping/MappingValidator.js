"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingValidator = void 0;
/**
 * MappingValidator validates protocol compatibility and mapping rule integrity.
 * SRP: validation only — no state, no side effects.
 * DIP: depends on ICompatibilityStrategy, not a concrete rules table.
 */
class MappingValidator {
    constructor(strategy) {
        this.strategy = strategy;
    }
    validateCompatibility(logical, hardware) {
        const errors = [];
        if (!this.strategy.isCompatible(logical.category, hardware.category)) {
            const compatible = this.strategy.getCompatibleHardware(logical.category);
            errors.push(`Protocol mismatch: logical category "${logical.category}" is not compatible with hardware category "${hardware.category}". ` +
                `Compatible hardware types: ${compatible.join(', ')}.`);
        }
        return { valid: errors.length === 0, errors };
    }
    validateMappingRules(mappings) {
        const errors = [];
        const seenLogical = new Set();
        const seenMappingPairs = new Set();
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
exports.MappingValidator = MappingValidator;
//# sourceMappingURL=MappingValidator.js.map