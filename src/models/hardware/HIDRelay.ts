import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

// ─────────────────────────────────────────────
//  HID Relay Hardware Channel
// ─────────────────────────────────────────────
@Entity('hardware_hid_relays')
export class HIDRelay extends HardwareChannel {
  @Column({ nullable: true })
  vendorId?: string;

  @Column({ nullable: true })
  productId?: string;

  @Column({ nullable: true })
  deviceSerial?: string;

  @Column({ type: 'jsonb', nullable: true })
  relays?: object;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.HID_RELAY, HardwareChannelSubclass.HID_RELAY);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      vendorId: this.vendorId, productId: this.productId,
      deviceSerial: this.deviceSerial, relays: this.relays
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
