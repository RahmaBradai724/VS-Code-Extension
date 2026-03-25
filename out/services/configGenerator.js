"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigGenerator = void 0;
const yaml = __importStar(require("js-yaml"));
/**
 * ConfigGenerator serializes a Configuration object
 * into a valid config.yaml string, following the structure
 * required by the hardware/logical channel framework.
 */
class ConfigGenerator {
    constructor(config, mappingManager) {
        this.config = config;
        this.mappingManager = mappingManager;
    }
    /**
     * Validates that all required fields exist before generation.
     * Returns array of error messages (empty means valid).
     */
    preGenerationValidate() {
        const errors = [];
        if (!this.config.name) {
            errors.push('Configuration must have a name.');
        }
        if (this.config.logicalChannels.length === 0) {
            errors.push('At least one logical channel is required.');
        }
        if (this.config.hardwareChannels.length === 0) {
            errors.push('At least one hardware channel is required.');
        }
        const mappings = this.mappingManager.getMappingsByConfigId(this.config.id);
        if (mappings.length === 0) {
            errors.push('At least one mapping must be defined.');
        }
        // Check for duplicate logical channel names
        const logicalNames = this.config.logicalChannels.map(c => c.name);
        const logicalDupes = logicalNames.filter((n, i) => logicalNames.indexOf(n) !== i);
        if (logicalDupes.length > 0) {
            errors.push(`Duplicate logical channel names detected: ${logicalDupes.join(', ')}.`);
        }
        // Check for duplicate hardware channel names
        const hwNames = this.config.hardwareChannels.map(c => c.name);
        const hwDupes = hwNames.filter((n, i) => hwNames.indexOf(n) !== i);
        if (hwDupes.length > 0) {
            errors.push(`Duplicate hardware channel names detected: ${hwDupes.join(', ')}.`);
        }
        // Validate mapping rules
        const mappingValidation = this.mappingManager.validateMappingRules();
        errors.push(...mappingValidation.errors);
        return errors;
    }
    /**
     * Generates the config.yaml string.
     * Throws if pre-validation fails.
     */
    generate() {
        const errors = this.preGenerationValidate();
        if (errors.length > 0) {
            throw new Error(`Cannot generate config.yaml:\n${errors.map(e => `  • ${e}`).join('\n')}`);
        }
        const mappings = this.mappingManager.getMappingsByConfigId(this.config.id);
        const configObj = {
            id: this.config.id,
            name: this.config.name,
            // Logical channels section
            channels: this.config.logicalChannels.reduce((acc, ch) => {
                acc[ch.name] = ch.toYAML();
                return acc;
            }, {}),
            // Hardware channels section
            hardware: this.config.hardwareChannels.reduce((acc, hw) => {
                acc[hw.name] = hw.toYAML();
                return acc;
            }, {}),
            // Mappings section
            mappings: mappings.map(m => ({
                logicalChannel: m.logicalChannelName,
                hardwareChannel: m.hardwareChannelName || m.hardwareChannelId,
            })),
            // Framework config section
            frameworkConfig: this.config.frameworkConfig.toYAML(),
        };
        return yaml.dump(configObj, { indent: 2, lineWidth: 120, noRefs: true });
    }
    /**
     * Returns the raw object (useful for preview/display).
     */
    generateAsObject() {
        const mappings = this.mappingManager.getMappingsByConfigId(this.config.id);
        return {
            id: this.config.id,
            name: this.config.name,
            channels: this.config.logicalChannels.reduce((acc, ch) => {
                acc[ch.name] = ch.toYAML();
                return acc;
            }, {}),
            hardware: this.config.hardwareChannels.reduce((acc, hw) => {
                acc[hw.name] = hw.toYAML();
                return acc;
            }, {}),
            mappings: mappings.map(m => m.toYAML()),
            frameworkConfig: this.config.frameworkConfig.toYAML(),
        };
    }
}
exports.ConfigGenerator = ConfigGenerator;
//# sourceMappingURL=configGenerator.js.map