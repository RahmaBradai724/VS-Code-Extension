import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

// ─────────────────────────────────────────────
//  HHLoad Hardware Channel
// ─────────────────────────────────────────────
@Entity('hardware_hh_loads')
export class HHLoad extends HardwareChannel {
  @Column({ type: 'float', nullable: true })
  maxLoad?: number;

  @Column({ nullable: true })
  deviceId?: number;

  @Column({ nullable: true })
  portName?: string;

  @Column({ nullable: true })
  flag?: boolean;

  @Column({ nullable: true })
  bitRate?: number;

  @Column({ nullable: true })
  loadType?: string; // Using loadType to avoid conflict with 'type' from base class

  @Column({ type: 'jsonb', nullable: true })
  channels?: object;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.HH_LOAD, HardwareChannelSubclass.HH_LOAD);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      maxLoad: this.maxLoad, deviceId: this.deviceId,
      portName: this.portName, bitRate: this.bitRate,
      loadType: this.loadType, flag: this.flag, channels: this.channels
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
