import { Entity, Column } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';


@Entity('logical_serial_channels')
export class SerialChannel extends LogicalChannel {
  @Column()
  portName: string = '';

  @Column()
  baudRate: number = 9600;

  @Column()
  parity: string = 'None';

  @Column()
  dataBits: number = 8;

  @Column()
  stopBits: string = '1';

  @Column()
  flowControl: string = 'None';

  @Column()
  messageTerminator: string = '';

  @Column()
  maxReceivedDataSize: number = 0;

  @Column()
  separationTimeMs: number = 0;

  @Column({ nullable: true })
  serialChannelActivationOptional?: boolean;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.SERIAL, LogicalChannelSubclass.SERIAL);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      portName: this.portName, baudRate: this.baudRate,
      parity: this.parity, dataBits: this.dataBits,
      stopBits: this.stopBits, flowControl: this.flowControl,
      messageTerminator: this.messageTerminator,
      maxReceivedDataSize: this.maxReceivedDataSize,
      separationTimeMs: this.separationTimeMs,
      serialChannelActivationOptional: this.serialChannelActivationOptional,
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
