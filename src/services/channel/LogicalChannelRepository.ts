import { LogicalChannel } from '../../models';
import { IChannelRepository } from '../interfaces/IChannelRepository';


export class LogicalChannelRepository implements IChannelRepository<LogicalChannel> {
  private store: Map<string, LogicalChannel> = new Map();

  add(channel: LogicalChannel): void {
    if (this.findByName(channel.name)) {
      throw new Error(`A logical channel named "${channel.name}" already exists.`);
    }
    this.store.set(channel.id, channel);
  }

  update(id: string, updates: Partial<LogicalChannel>): LogicalChannel {
    const channel = this.store.get(id);
    if (!channel) { throw new Error(`Logical channel "${id}" not found.`); }
    if (updates.name && updates.name !== channel.name && this.findByName(updates.name)) {
      throw new Error(`A logical channel named "${updates.name}" already exists.`);
    }
    Object.assign(channel, updates);
    return channel;
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  get(id: string): LogicalChannel | undefined {
    return this.store.get(id);
  }

  getAll(): LogicalChannel[] {
    return Array.from(this.store.values());
  }

  findByName(name: string): LogicalChannel | undefined {
    return Array.from(this.store.values()).find(c => c.name === name);
  }

  hydrate(channels: LogicalChannel[]): void {
    this.store.clear();
    channels.forEach(c => this.store.set(c.id, c));
  }
}
