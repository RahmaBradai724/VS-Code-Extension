import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

// ─────────────────────────────────────────────
//  CIB Interface Hardware Channel (CM CAN_Combo)
// ─────────────────────────────────────────────
@Entity('hardware_cib_interfaces')
export class CIBInterface extends HardwareChannel {
  @Column()
  cmId: number = 0;

  @Column()
  cmType: string = 'CAN_Combo';

  @Column({ nullable: true })
  bitRate?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.CAN_INTERFACE, HardwareChannelSubclass.CIB_INTERFACE);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, subclass: this.subclass, cmId: this.cmId, cmType: this.cmType, bitRate: this.bitRate };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, cmId: this.cmId, cmType: this.cmType, bitRate: this.bitRate };
  }
}
