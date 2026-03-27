import { Entity, Column } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';

// ─────────────────────────────────────────────
//  IPS Logical Channel
// ─────────────────────────────────────────────
@Entity('logical_io_serial_channels')
export class IPSChannel extends LogicalChannel {
  @Column()
  openSession: number = 0;

  @Column()
  openInterface: string = '';

  @Column()
  openSessionFields: string = '';

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.IOSERIAL, LogicalChannelSubclass.IOSERIAL);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      openSession: this.openSession
    };
  }

  toJSON(): object {
    return { ...this.toYAML(), openInterface: this.openInterface };
  }
}
