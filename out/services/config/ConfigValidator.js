"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigValidator = void 0;
/**
 * ConfigValidator validates a Configuration before YAML generation.
 * SRP: validation only — no serialization, no file I/O.
 */
class ConfigValidator {
    validate(config, mappingManager) {
        const errors = [];
        if (!config.name) {
            errors.push('Configuration must have a name.');
        }
        if (config.logicalChannels.length === 0) {
            errors.push('At least one logical channel is required.');
        }
        if (config.hardwareChannels.length === 0) {
            errors.push('At least one hardware channel is required.');
        }
        const mappings = mappingManager.getMappingsByConfigId(config.id);
        if (mappings.length === 0) {
            errors.push('At least one mapping must be defined.');
        }
        const logicalNames = config.logicalChannels.map(c => c.name);
        const logicalDupes = logicalNames.filter((n, i) => logicalNames.indexOf(n) !== i);
        if (logicalDupes.length > 0) {
            errors.push(`Duplicate logical channel names detected: ${logicalDupes.join(', ')}.`);
        }
        const hwNames = config.hardwareChannels.map(c => c.name);
        const hwDupes = hwNames.filter((n, i) => hwNames.indexOf(n) !== i);
        if (hwDupes.length > 0) {
            errors.push(`Duplicate hardware channel names detected: ${hwDupes.join(', ')}.`);
        }
        const mappingValidation = mappingManager.validateMappingRules();
        errors.push(...mappingValidation.errors);
        return errors;
    }
}
exports.ConfigValidator = ConfigValidator;
//# sourceMappingURL=ConfigValidator.js.map