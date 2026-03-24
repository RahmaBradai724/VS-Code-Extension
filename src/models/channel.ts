import { Entity, PrimaryColumn, Column, TableInheritance, ManyToOne, JoinColumn } from 'typeorm';
import { LogicalChannelCategory, HardwareChannelCategory } from './enums';
import { Configuration } from './configuration';

/**
 * Abstract base class for all channels.
 */
export abstract class Channel {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Configuration)
  @JoinColumn({ name: 'config_id' })
  configuration?: Configuration;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  abstract toYAML(): object;
  abstract toJSON(): object;
}

/**
 * Abstract base class for all logical channels.
 */
@Entity('logical_channels')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class LogicalChannel extends Channel {
  @Column({ type: 'varchar' })
  type: LogicalChannelCategory;

  @Column({ nullable: true })
  loggingName?: string;

  @Column({ nullable: true })
  tracerName?: string;

  @Column({ type: 'simple-array', nullable: true })
  alias?: string[];

  constructor(id: string, name: string, type: LogicalChannelCategory) {
    super(id, name);
    this.type = type;
  }
}

/**
 * Abstract base class for all hardware channels.
 */
@Entity('hardware_channels')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class HardwareChannel extends Channel {
  @Column({ type: 'varchar' })
  type: HardwareChannelCategory;

  @Column({ nullable: true })
  status?: string;

  constructor(id: string, name: string, type: HardwareChannelCategory) {
    super(id, name);
    this.type = type;
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
