import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

// ─────────────────────────────────────────────
//  LIN Card Hardware Channel
// ─────────────────────────────────────────────
@Entity('hardware_lin_cards')
export class LINCard extends HardwareChannel {
  @Column({ nullable: true })
  hwModel?: number;

  @Column({ nullable: true })
  bmtStr?: string;

  @Column({ nullable: true })
  bmtList?: string;

  @Column({ nullable: true })
  hwChannel?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.SERIAL_PORT, HardwareChannelSubclass.LIN_CARD);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, hwModel: this.hwModel };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, hwModel: this.hwModel, bmtStr: this.bmtStr, hwChannel: this.hwChannel };
  }
}
