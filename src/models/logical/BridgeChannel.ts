import { Entity, Column } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';

export interface TunTapAdapter {
  [key: string]: unknown;
}

// ─────────────────────────────────────────────
//  Bridge Logical Channel
// ─────────────────────────────────────────────
@Entity('logical_bridge_channels')
export class BridgeChannel extends LogicalChannel {
  @Column({ nullable: true })
  bridgeName?: string;

  @Column({ nullable: true })
  physicalAdapter?: string;

  @Column({ type: 'jsonb', nullable: true })
  tunTapAdapterList?: TunTapAdapter[];

  @Column({ nullable: true })
  manipulatePackets?: boolean;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.BRIDGE, LogicalChannelSubclass.BRIDGE);
    this.bridgeName = name;
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      bridgeName: this.bridgeName ?? this.name,
      physicalAdapter: this.physicalAdapter,
      tunTapAdapterList: this.tunTapAdapterList,
      manipulatePackets: this.manipulatePackets
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
