import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

// ─────────────────────────────────────────────
//  CIB Interface Hardware Channel
// ─────────────────────────────────────────────
@Entity('hardware_cib_interfaces')
export class CIBInterface extends HardwareChannel {
  @Column({ nullable: true })
  bitRate?: number;

  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  hwChannel2?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.CAN_INTERFACE, HardwareChannelSubclass.CIB_INTERFACE);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, bitRate: this.bitRate };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, bitRate: this.bitRate, hwChannel: this.hwChannel };
  }
}
