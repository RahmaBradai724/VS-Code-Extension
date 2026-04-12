import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

@Entity('hardware_hh_loads')
export class HHLoad extends HardwareChannel {
  /** Device ID */
  @Column({ nullable: true })
  deviceId?: number;

  /** Serial port name (e.g. COM19) */
  @Column({ nullable: true })
  portName?: string;

  /** Device type: PLI (single-channel) or PMLI (multi-channel) */
  @Column({ nullable: true })
  loadType?: string;

  /** Serial baud rate (e.g. 115200) */
  @Column({ nullable: true })
  bitRate?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.HH_LOAD, HardwareChannelSubclass.HH_LOAD);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, subclass: this.subclass,
      deviceId: this.deviceId,
      portName: this.portName,
      loadType: this.loadType,
      bitRate: this.bitRate,
    };
  }

  toJSON(): object { return this.toYAML(); }
}

