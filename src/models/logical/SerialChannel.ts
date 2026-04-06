import { Entity, Column } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';


@Entity('logical_serial_channels')
export class SerialChannel extends LogicalChannel {

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.SERIAL, LogicalChannelSubclass.SERIAL);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
