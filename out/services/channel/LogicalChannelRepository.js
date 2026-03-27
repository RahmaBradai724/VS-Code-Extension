"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicalChannelRepository = void 0;
/**
 * In-memory repository for logical channels.
 * SRP: logical channel CRUD only.
 * Repository pattern: isolates collection management from business coordinators.
 */
class LogicalChannelRepository {
    constructor() {
        this.store = new Map();
    }
    add(channel) {
        if (this.findByName(channel.name)) {
            throw new Error(`A logical channel named "${channel.name}" already exists.`);
        }
        this.store.set(channel.id, channel);
    }
    update(id, updates) {
        const channel = this.store.get(id);
        if (!channel) {
            throw new Error(`Logical channel "${id}" not found.`);
        }
        if (updates.name && updates.name !== channel.name && this.findByName(updates.name)) {
            throw new Error(`A logical channel named "${updates.name}" already exists.`);
        }
        Object.assign(channel, updates);
        return channel;
    }
    delete(id) {
        this.store.delete(id);
    }
    get(id) {
        return this.store.get(id);
    }
    getAll() {
        return Array.from(this.store.values());
    }
    findByName(name) {
        return Array.from(this.store.values()).find(c => c.name === name);
    }
    hydrate(channels) {
        this.store.clear();
        channels.forEach(c => this.store.set(c.id, c));
    }
}
exports.LogicalChannelRepository = LogicalChannelRepository;
//# sourceMappingURL=LogicalChannelRepository.js.map