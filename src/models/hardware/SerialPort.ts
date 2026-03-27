import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

// ─────────────────────────────────────────────
//  Serial Port Hardware Channel
// ─────────────────────────────────────────────
@Entity('hardware_serial_ports')
export class SerialPort extends HardwareChannel {
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
  separationTimeMs: number = 0;

  @Column()
  maxReceivedDataSize: number = 0;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.SERIAL_PORT, HardwareChannelSubclass.SERIAL_PORT);
  }

  get separationTimes(): number {
    return this.separationTimeMs;
  }

  set separationTimes(value: number) {
    this.separationTimeMs = value;
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      portName: this.portName, baudRate: this.baudRate,
      parity: this.parity, dataBits: this.dataBits,
      stopBits: this.stopBits, flowControl: this.flowControl,
      messageTerminator: this.messageTerminator,
      separationTimes: this.separationTimes,
      maxReceivedDataSize: this.maxReceivedDataSize
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
