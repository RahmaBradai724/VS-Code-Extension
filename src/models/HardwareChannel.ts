import { Column } from 'typeorm';
import { Channel } from './ChannelBase';
import {
  ChannelType,
  HardwareChannelCategory,
  HardwareChannelSubclass,
} from './enums';

/**
 * Abstract base class for all hardware channels.
 */
export abstract class HardwareChannel extends Channel {
  @Column({ type: 'varchar' })
  category: HardwareChannelCategory;

  @Column({ type: 'varchar' })
  subclass: HardwareChannelSubclass;

  @Column({ nullable: true })
  status?: string;

  constructor(id: string, name: string, category: HardwareChannelCategory, subclass: HardwareChannelSubclass) {
    super(id, name, ChannelType.HARDWARE);
    this.category = category;
    this.subclass = subclass;
  }

  getStatus(): string {
    return this.status || 'Unknown';
  }

  setStatus(status: string): void {
    this.status = status;
  }

  // Called before deletion — checks if mappings exist for this channel
  abstract canDelete(mappingIds: string[]): boolean;
}
