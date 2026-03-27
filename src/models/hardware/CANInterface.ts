import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

// ─────────────────────────────────────────────
//  CAN Interface Hardware Channel
// ─────────────────────────────────────────────
@Entity('hardware_can_interfaces')
export class CANInterface extends HardwareChannel {
  @Column()
  netChannel: number = 0;

  @Column()
  netHwChannel: number = 0;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.CAN_INTERFACE, HardwareChannelSubclass.CAN_INTERFACE);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, netChannel: this.netChannel, netHwChannel: this.netHwChannel };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, netChannel: this.netChannel, netHwChannel: this.netHwChannel };
  }
}
