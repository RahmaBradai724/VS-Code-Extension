import { Entity } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';


@Entity('logical_io_serial_channels')
export class IOSerialChannel extends LogicalChannel {
  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.IOSERIAL, LogicalChannelSubclass.IOSERIAL);
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
