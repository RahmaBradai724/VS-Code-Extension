import { LogicalChannel, HardwareChannel } from '../../models';

/**
 * Generic repository interface for managing channels.
 * ISP: focused on CRUD only; DIP: consumers depend on this abstraction.
 */
export interface IChannelRepository<T extends LogicalChannel | HardwareChannel> {
  add(channel: T): void;
  update(id: string, updates: Partial<T>): T;
  delete(id: string): void;
  get(id: string): T | undefined;
  getAll(): T[];
  findByName(name: string): T | undefined;
  hydrate(channels: T[]): void;
}
