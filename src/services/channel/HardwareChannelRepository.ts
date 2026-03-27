import { HardwareChannel } from '../../models';
import { IChannelRepository } from '../interfaces/IChannelRepository';

/**
 * In-memory repository for hardware channels.
 * SRP: hardware channel CRUD only.
 * Repository pattern: isolates collection management from business coordinators.
 */
export class HardwareChannelRepository implements IChannelRepository<HardwareChannel> {
  private store: Map<string, HardwareChannel> = new Map();

  add(channel: HardwareChannel): void {
    if (this.findByName(channel.name)) {
      throw new Error(`A hardware channel named "${channel.name}" already exists.`);
    }
    this.store.set(channel.id, channel);
  }

  update(id: string, updates: Partial<HardwareChannel>): HardwareChannel {
    const channel = this.store.get(id);
    if (!channel) { throw new Error(`Hardware channel "${id}" not found.`); }
    if (updates.name && updates.name !== channel.name && this.findByName(updates.name)) {
      throw new Error(`A hardware channel named "${updates.name}" already exists.`);
    }
    Object.assign(channel, updates);
    return channel;
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  get(id: string): HardwareChannel | undefined {
    return this.store.get(id);
  }

  getAll(): HardwareChannel[] {
    return Array.from(this.store.values());
  }

  findByName(name: string): HardwareChannel | undefined {
    return Array.from(this.store.values()).find(c => c.name === name);
  }

  hydrate(channels: HardwareChannel[]): void {
    this.store.clear();
    channels.forEach(c => this.store.set(c.id, c));
  }
}
