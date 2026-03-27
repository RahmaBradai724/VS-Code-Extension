import { PrimaryColumn, Column } from 'typeorm';
import {
  ChannelType,
  LogicalChannelCategory,
  HardwareChannelCategory,
  LogicalChannelSubclass,
  HardwareChannelSubclass,
} from './enums';

/**
 * Abstract base class for all channels.
 */   
export abstract class Channel {
  @PrimaryColumn()

  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  type: ChannelType;
  

  constructor(id: string, name: string, type: ChannelType) {
    this.id = id;
    this.name = name;
    this.type = type;
  }

  create(): this {
    return this;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getType(): ChannelType {
    return this.type;
  }

  abstract toYAML(): object;
  abstract toJSON(): object;
}

/**
 * Abstract base class for all logical channels.
 */
export abstract class LogicalChannel extends Channel {
  @Column({ type: 'varchar' })
  category: LogicalChannelCategory;

  @Column({ type: 'varchar' })
  subclass: LogicalChannelSubclass;

  @Column({ nullable: true })
  loggingName?: string;

  @Column({ nullable: true })
  tracerName?: string;

  @Column({ type: 'simple-array', nullable: true })
  alias?: string[];

  constructor(id: string, name: string, category: LogicalChannelCategory, subclass: LogicalChannelSubclass) {
    super(id, name, ChannelType.LOGICAL);
    this.category = category;
    this.subclass = subclass;
  }
}

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
