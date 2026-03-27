"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingManager = void 0;
const models_1 = require("../../models");
const MappingValidator_1 = require("./MappingValidator");
const CompatibilityRules_1 = require("./CompatibilityRules");
/**
 * MappingManager handles creation, deletion, and validation of
 * mappings between logical and hardware channels.
 * Delegates validation to MappingValidator (SRP, DIP).
 * Public API is identical to the original class.
 */
class MappingManager {
    constructor(channelManager, validator = new MappingValidator_1.MappingValidator(new CompatibilityRules_1.DefaultCompatibilityStrategy())) {
        this.mappings = new Map();
        this.channelManager = channelManager;
        this.validator = validator;
    }
    // ─── Create ───────────────────────────────────────────────────────────
    addMapping(logicalChannelId, hardwareChannelId, configurationId, params) {
        const logical = this.channelManager.getLogicalChannel(logicalChannelId);
        const hardware = this.channelManager.getHardwareChannel(hardwareChannelId);
        if (!logical)
            throw new Error(`Logical channel "${logicalChannelId}" does not exist.`);
        if (!hardware)
            throw new Error(`Hardware channel "${hardwareChannelId}" does not exist.`);
        const validation = this.validator.validateCompatibility(logical, hardware);
        if (!validation.valid) {
            throw new Error(`Mapping incompatible: ${validation.errors.join(' | ')}`);
        }
        if (this.isDuplicate(logicalChannelId, hardwareChannelId)) {
            throw new Error(`A mapping between "${logical.name}" and "${hardware.name}" already exists.`);
        }
        if (this.isLogicalChannelAlreadyMapped(logicalChannelId)) {
            throw new Error(`Logical channel "${logical.name}" is already mapped to a hardware channel.`);
        }
        const mappingId = `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const frameworkConfigId = 'default';
        const mapping = new models_1.Mapping(mappingId, configurationId, logicalChannelId, logical.name, hardwareChannelId, frameworkConfigId);
        mapping.hardwareChannelName = hardware.name;
        mapping.logicalChannelType = logical.category;
        mapping.hardwareChannelType = hardware.category;
        if (params) {
            if (params.hwChannel !== undefined)
                mapping.hwChannel = params.hwChannel;
            if (params.operationMode !== undefined)
                mapping.operationMode = params.operationMode;
            if (params.keySlot !== undefined)
                mapping.keySlot = params.keySlot;
            if (params.nodeType !== undefined)
                mapping.nodeType = params.nodeType;
            if (params.wakeUpCluster !== undefined)
                mapping.wakeUpCluster = params.wakeUpCluster;
        }
        this.mappings.set(mappingId, mapping);
        this.channelManager.registerMappingForChannel(logicalChannelId, mappingId);
        this.channelManager.registerMappingForChannel(hardwareChannelId, mappingId);
        return mapping;
    }
    // ─── Delete ───────────────────────────────────────────────────────────
    removeMapping(mappingId) {
        const mapping = this.mappings.get(mappingId);
        if (!mapping)
            throw new Error(`Mapping "${mappingId}" not found.`);
        this.channelManager.unregisterMappingForChannel(mapping.logicalChannelId, mappingId);
        this.channelManager.unregisterMappingForChannel(mapping.hardwareChannelId, mappingId);
        this.mappings.delete(mappingId);
    }
    // ─── Query ────────────────────────────────────────────────────────────
    getAllMappings() {
        return Array.from(this.mappings.values());
    }
    getMappingsByConfigId(configId) {
        return this.getAllMappings().filter(m => m.configurationId === configId);
    }
    getMappingById(mappingId) {
        return this.mappings.get(mappingId);
    }
    // ─── Validation ───────────────────────────────────────────────────────
    validateCompatibility(logical, hardware) {
        return this.validator.validateCompatibility(logical, hardware);
    }
    validateMappingRules() {
        return this.validator.validateMappingRules(this.getAllMappings());
    }
    // ─── UML Aligned Methods ──────────────────────────────────────────────
    generate(configurationId) {
        return this.getMappingsByConfigId(configurationId);
    }
    generateAsYaml(_configurationId) {
        return '';
    }
    generateAsJson(configurationId) {
        return JSON.stringify(this.generate(configurationId), null, 2);
    }
    Add(mapping) {
        this.mappings.set(mapping.mappingId, mapping);
    }
    // ─── Hydration ────────────────────────────────────────────────────────
    hydrate(mappings) {
        this.mappings.clear();
        mappings.forEach(m => this.mappings.set(m.mappingId, m));
    }
    // ─── Private ──────────────────────────────────────────────────────────
    isDuplicate(logicalId, hardwareId) {
        return Array.from(this.mappings.values()).some(m => m.logicalChannelId === logicalId && m.hardwareChannelId === hardwareId);
    }
    isLogicalChannelAlreadyMapped(logicalId) {
        return Array.from(this.mappings.values()).some(m => m.logicalChannelId === logicalId);
    }
}
exports.MappingManager = MappingManager;
//# sourceMappingURL=MappingManager.js.map