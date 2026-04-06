import { Entity, Column } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';

@Entity('logical_io_input_channels')
export class IOInputChannel extends LogicalChannel {
  @Column({ nullable: true })
  loggingBusIndex?: number;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.IOINPUT, LogicalChannelSubclass.IOINPUT);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      channelId: this.channelId, loggingBusIndex: this.loggingBusIndex,
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
