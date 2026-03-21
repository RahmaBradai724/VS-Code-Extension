"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelManager = void 0;
/**
 * ChannelManager handles all CRUD operations for
 * logical and hardware channels within a configuration.
 */
class ChannelManager {
    constructor() {
        this.logicalChannels = new Map();
        this.hardwareChannels = new Map();
        // Map of channelId → set of mapping IDs that use it
        this.channelMappingIndex = new Map();
    }
    // ─── Logical Channels ─────────────────────────────────────────────────
    addLogicalChannel(channel) {
        if (this.findLogicalChannelByName(channel.name)) {
            throw new Error(`A logical channel named "${channel.name}" already exists.`);
        }
        this.logicalChannels.set(channel.id, channel);
    }
    updateLogicalChannel(id, updates) {
        const channel = this.logicalChannels.get(id);
        if (!channel) {
            throw new Error(`Logical channel "${id}" not found.`);
        }
        // Prevent duplicate name on update
        if (updates.name && updates.name !== channel.name && this.findLogicalChannelByName(updates.name)) {
            throw new Error(`A logical channel named "${updates.name}" already exists.`);
        }
        Object.assign(channel, updates);
        return channel;
    }
    deleteLogicalChannel(id) {
        const usedBy = this.channelMappingIndex.get(id);
        if (usedBy && usedBy.size > 0) {
            throw new Error(`Cannot delete logical channel "${id}": it is used in ${usedBy.size} mapping(s). Remove mappings first.`);
        }
        this.logicalChannels.delete(id);
        this.channelMappingIndex.delete(id);
    }
    getLogicalChannel(id) {
        return this.logicalChannels.get(id);
    }
    getAllLogicalChannels() {
        return Array.from(this.logicalChannels.values());
    }
    findLogicalChannelByName(name) {
        return Array.from(this.logicalChannels.values()).find(c => c.name === name);
    }
    // ─── Hardware Channels ────────────────────────────────────────────────
    addHardwareChannel(channel) {
        if (this.findHardwareChannelByName(channel.name)) {
            throw new Error(`A hardware channel named "${channel.name}" already exists.`);
        }
        this.hardwareChannels.set(channel.id, channel);
    }
    updateHardwareChannel(id, updates) {
        const channel = this.hardwareChannels.get(id);
        if (!channel) {
            throw new Error(`Hardware channel "${id}" not found.`);
        }
        if (updates.name && updates.name !== channel.name && this.findHardwareChannelByName(updates.name)) {
            throw new Error(`A hardware channel named "${updates.name}" already exists.`);
        }
        Object.assign(channel, updates);
        return channel;
    }
    deleteHardwareChannel(id) {
        const usedBy = this.channelMappingIndex.get(id);
        if (usedBy && usedBy.size > 0) {
            throw new Error(`Cannot delete hardware channel "${id}": it is used in ${usedBy.size} mapping(s). Remove mappings first.`);
        }
        this.hardwareChannels.delete(id);
        this.channelMappingIndex.delete(id);
    }
    getHardwareChannel(id) {
        return this.hardwareChannels.get(id);
    }
    getAllHardwareChannels() {
        return Array.from(this.hardwareChannels.values());
    }
    findHardwareChannelByName(name) {
        return Array.from(this.hardwareChannels.values()).find(c => c.name === name);
    }
    // ─── Mapping Index ────────────────────────────────────────────────────
    registerMappingForChannel(channelId, mappingId) {
        if (!this.channelMappingIndex.has(channelId)) {
            this.channelMappingIndex.set(channelId, new Set());
        }
        this.channelMappingIndex.get(channelId).add(mappingId);
    }
    unregisterMappingForChannel(channelId, mappingId) {
        this.channelMappingIndex.get(channelId)?.delete(mappingId);
    }
    // ─── Hydration ────────────────────────────────────────────────────────
    hydrate(logicalChannels, hardwareChannels) {
        this.logicalChannels.clear();
        this.hardwareChannels.clear();
        logicalChannels.forEach(c => this.logicalChannels.set(c.id, c));
        hardwareChannels.forEach(c => this.hardwareChannels.set(c.id, c));
    }
}
exports.ChannelManager = ChannelManager;
//# sourceMappingURL=channelManager.js.map