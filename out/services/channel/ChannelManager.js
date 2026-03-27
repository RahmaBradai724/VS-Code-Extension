"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelManager = void 0;
const models_1 = require("../../models");
const LogicalChannelRepository_1 = require("./LogicalChannelRepository");
const HardwareChannelRepository_1 = require("./HardwareChannelRepository");
const MappingIndex_1 = require("./MappingIndex");
/**
 * ChannelManager is a Façade that coordinates logical/hardware channel CRUD
 * and the mapping index. Its public API is identical to the original class —
 * all callers require zero changes.
 *
 * Façade pattern: hides LogicalChannelRepository, HardwareChannelRepository,
 * and MappingIndex behind a single, stable surface.
 * DIP: accepts collaborators via constructor for testability.
 */
class ChannelManager {
    constructor(logicalRepo = new LogicalChannelRepository_1.LogicalChannelRepository(), hardwareRepo = new HardwareChannelRepository_1.HardwareChannelRepository(), mappingIndex = new MappingIndex_1.MappingIndex()) {
        this.logicalRepo = logicalRepo;
        this.hardwareRepo = hardwareRepo;
        this.mappingIndex = mappingIndex;
    }
    // ─── UML Aligned Methods ──────────────────────────────────────────────
    addChannel(channel) {
        if (channel instanceof models_1.LogicalChannel) {
            this.addLogicalChannel(channel);
        }
        else {
            this.addHardwareChannel(channel);
        }
    }
    updateChannel(id, updates) {
        if (this.logicalRepo.get(id)) {
            return this.updateLogicalChannel(id, updates);
        }
        else {
            return this.updateHardwareChannel(id, updates);
        }
    }
    deleteChannel(id) {
        if (this.logicalRepo.get(id)) {
            this.deleteLogicalChannel(id);
        }
        else {
            this.deleteHardwareChannel(id);
        }
    }
    // ─── Logical Channels ─────────────────────────────────────────────────
    addLogicalChannel(channel) {
        this.logicalRepo.add(channel);
    }
    updateLogicalChannel(id, updates) {
        return this.logicalRepo.update(id, updates);
    }
    deleteLogicalChannel(id) {
        const usedBy = this.mappingIndex.getMappingsForChannel(id);
        if (usedBy.size > 0) {
            throw new Error(`Cannot delete logical channel "${id}": it is used in ${usedBy.size} mapping(s). Remove mappings first.`);
        }
        this.logicalRepo.delete(id);
        this.mappingIndex.delete(id);
    }
    getLogicalChannel(id) {
        return this.logicalRepo.get(id);
    }
    getAllLogicalChannels() {
        return this.logicalRepo.getAll();
    }
    findLogicalChannelByName(name) {
        return this.logicalRepo.findByName(name);
    }
    // ─── Hardware Channels ────────────────────────────────────────────────
    addHardwareChannel(channel) {
        this.hardwareRepo.add(channel);
    }
    updateHardwareChannel(id, updates) {
        return this.hardwareRepo.update(id, updates);
    }
    deleteHardwareChannel(id) {
        const usedBy = this.mappingIndex.getMappingsForChannel(id);
        if (usedBy.size > 0) {
            throw new Error(`Cannot delete hardware channel "${id}": it is used in ${usedBy.size} mapping(s). Remove mappings first.`);
        }
        this.hardwareRepo.delete(id);
        this.mappingIndex.delete(id);
    }
    getHardwareChannel(id) {
        return this.hardwareRepo.get(id);
    }
    getAllHardwareChannels() {
        return this.hardwareRepo.getAll();
    }
    findHardwareChannelByName(name) {
        return this.hardwareRepo.findByName(name);
    }
    // ─── Mapping Index ────────────────────────────────────────────────────
    registerMappingForChannel(channelId, mappingId) {
        this.mappingIndex.register(channelId, mappingId);
    }
    unregisterMappingForChannel(channelId, mappingId) {
        this.mappingIndex.unregister(channelId, mappingId);
    }
    // ─── Hydration ────────────────────────────────────────────────────────
    hydrate(logicalChannels, hardwareChannels) {
        this.logicalRepo.hydrate(logicalChannels);
        this.hardwareRepo.hydrate(hardwareChannels);
        this.mappingIndex.clear();
    }
}
exports.ChannelManager = ChannelManager;
//# sourceMappingURL=ChannelManager.js.map