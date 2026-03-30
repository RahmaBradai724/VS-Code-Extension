import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

@Entity('hardware_can_interfaces')
export class CANInterface extends HardwareChannel {
  @Column()
  cmId: number = 0;

  @Column()
  cmType: string = 'CAN_Combo';

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.CAN_INTERFACE, HardwareChannelSubclass.CAN_INTERFACE);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, subclass: this.subclass, cmId: this.cmId, cmType: this.cmType };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, cmId: this.cmId, cmType: this.cmType };
  }
}
