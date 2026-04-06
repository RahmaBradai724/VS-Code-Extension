import { Entity, Column } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';


@Entity('logical_can_channels')
export class CANChannel extends LogicalChannel {
  @Column({ nullable: true })
  protocol?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.CAN, LogicalChannelSubclass.CAN);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      channelId: this.channelId, protocol: this.protocol
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
