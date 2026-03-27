"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardwareChannelRepository = void 0;
/**
 * In-memory repository for hardware channels.
 * SRP: hardware channel CRUD only.
 * Repository pattern: isolates collection management from business coordinators.
 */
class HardwareChannelRepository {
    constructor() {
        this.store = new Map();
    }
    add(channel) {
        if (this.findByName(channel.name)) {
            throw new Error(`A hardware channel named "${channel.name}" already exists.`);
        }
        this.store.set(channel.id, channel);
    }
    update(id, updates) {
        const channel = this.store.get(id);
        if (!channel) {
            throw new Error(`Hardware channel "${id}" not found.`);
        }
        if (updates.name && updates.name !== channel.name && this.findByName(updates.name)) {
            throw new Error(`A hardware channel named "${updates.name}" already exists.`);
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
exports.HardwareChannelRepository = HardwareChannelRepository;
//# sourceMappingURL=HardwareChannelRepository.js.map