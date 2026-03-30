import { Entity, Column } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';

@Entity('logical_analog_channels')
export class AnalogChannel extends LogicalChannel {
  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  deviceId?: number;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.ANALOG, LogicalChannelSubclass.ANALOG);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      hwChannel: this.hwChannel, deviceId: this.deviceId
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
