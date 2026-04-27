import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

export interface VlanConfig {
  vlanId?: string;
  vlanEthertype?: string;
  vlanPriorityTag?: number;
  vlanCfi?: boolean;
}

export interface TunTapAdapterConfig {
  name: string;
  manipulatePackets?: boolean;
  innerVlan?: VlanConfig;
  outerVlan?: VlanConfig;
}

@Entity('hardware_tuntap_bridges')
export class TunTapBridge extends HardwareChannel {
  /** Friendly name of the physical network adapter to bridge to. */
  @Column({ nullable: true })
  physicalAdapterName?: string;

  /** List of virtual (TUN/TAP) adapters linked to this bridge. */
  @Column({ type: 'jsonb', nullable: true })
  tunTapAdapters?: TunTapAdapterConfig[];

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.TUNTAP_BRIDGE, HardwareChannelSubclass.TUNTAP_BRIDGE);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      category: this.category,
      subclass: this.subclass,
      physicalAdapterName: this.physicalAdapterName,
      tunTapAdapters: this.tunTapAdapters,
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
