"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingIndex = void 0;
/**
 * MappingIndex tracks which mapping IDs reference which channel IDs.
 * SRP: index management only — no channel business logic.
 */
class MappingIndex {
    constructor() {
        this.index = new Map();
    }
    register(channelId, mappingId) {
        if (!this.index.has(channelId)) {
            this.index.set(channelId, new Set());
        }
        this.index.get(channelId).add(mappingId);
    }
    unregister(channelId, mappingId) {
        this.index.get(channelId)?.delete(mappingId);
    }
    getMappingsForChannel(channelId) {
        return this.index.get(channelId) || new Set();
    }
    delete(channelId) {
        this.index.delete(channelId);
    }
    clear() {
        this.index.clear();
    }
}
exports.MappingIndex = MappingIndex;
//# sourceMappingURL=MappingIndex.js.map