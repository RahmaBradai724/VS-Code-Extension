import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

// ─────────────────────────────────────────────
//  TEAnalog Hardware Channel
// ─────────────────────────────────────────────
@Entity('hardware_te_analog_channels')
export class TEAnalog extends HardwareChannel {
  @Column({ nullable: true })
  sensorType?: string;

  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  deviceId?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.TE_ANALOG, HardwareChannelSubclass.TE_ANALOG);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, sensorType: this.sensorType, hwChannel: this.hwChannel, deviceId: this.deviceId };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
