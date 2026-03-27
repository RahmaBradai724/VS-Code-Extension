import { Entity, Column } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';

// ─────────────────────────────────────────────
//  LIN Logical Channel
// ─────────────────────────────────────────────
@Entity('logical_lin_channels')
export class LINChannel extends LogicalChannel {
  @Column({ nullable: true })
  protocol?: string;

  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  operationMode?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.LIN, LogicalChannelSubclass.LIN);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      protocol: this.protocol, hwChannel: this.hwChannel,
      operationMode: this.operationMode
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
