import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

@Entity('hardware_manson_ps')
export class MansonPowerSupply extends HardwareChannel {
  @Column({ nullable: true })
  channelName?: string;

  @Column({ nullable: true })
  portName?: string;

  @Column({ nullable: true })
  bitRate?: number;

  @Column({ nullable: true })
  maxVoltage?: number;

  @Column({ nullable: true })
  maxCurrent?: number;

  @Column({ nullable: true })
  defaultVoltage?: number;

  @Column({ nullable: true })
  keepStatus?: boolean;

  @Column({ nullable: true })
  continuousRead?: boolean;

  @Column({ nullable: true })
  continuousReadingInterval?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.MANSON_PS, HardwareChannelSubclass.MANSON_PS);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, subclass: this.subclass,
      channelName: this.channelName,
      portName: this.portName,
      bitRate: this.bitRate,
      maxVoltage: this.maxVoltage,
      maxCurrent: this.maxCurrent,
      defaultVoltage: this.defaultVoltage,
      keepStatus: this.keepStatus,
      continuousRead: this.continuousRead,
      continuousReadingInterval: this.continuousReadingInterval,
    };
  }

  toJSON(): object { return this.toYAML(); }
}
