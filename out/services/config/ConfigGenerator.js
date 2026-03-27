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
const ConfigValidator_1 = require("./ConfigValidator");
/**
 * ConfigGenerator serializes a Configuration object into a config.yaml string.
 * SRP: generation and serialization only — validation delegated to ConfigValidator.
 * DIP: accepts ConfigValidator via constructor for testability.
 */
class ConfigGenerator {
    constructor(config, mappingManager, validator = new ConfigValidator_1.ConfigValidator()) {
        this.config = config;
        this.mappingManager = mappingManager;
        this.validator = validator;
    }
    /**
     * Validates that all required fields exist before generation.
     * Returns array of error messages (empty means valid).
     */
    preGenerationValidate() {
        return this.validator.validate(this.config, this.mappingManager);
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
            channels: this.config.logicalChannels.reduce((acc, ch) => {
                acc[ch.name] = ch.toYAML();
                return acc;
            }, {}),
            hardware: this.config.hardwareChannels.reduce((acc, hw) => {
                acc[hw.name] = hw.toYAML();
                return acc;
            }, {}),
            mappings: mappings.map(m => ({
                logicalChannel: m.logicalChannelName,
                hardwareChannel: m.hardwareChannelName || m.hardwareChannelId,
            })),
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
//# sourceMappingURL=ConfigGenerator.js.map