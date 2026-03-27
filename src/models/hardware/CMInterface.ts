import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass, CaptureType } from '../enums';

// ─────────────────────────────────────────────
//  CMInterface Hardware Channel
// ─────────────────────────────────────────────
@Entity('hardware_cm_interfaces')
export class CMInterface extends HardwareChannel {
  @Column({ nullable: true })
  interfaceName?: string;

  @Column({ type: 'varchar', nullable: true })
  captureType?: CaptureType;

  @Column({ nullable: true })
  bitrate?: number;

  @Column({ nullable: true })
  hwChannel?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.CAN_INTERFACE, HardwareChannelSubclass.CM_INTERFACE);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      interfaceName: this.interfaceName, captureType: this.captureType,
      bitrate: this.bitrate, hwChannel: this.hwChannel
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
