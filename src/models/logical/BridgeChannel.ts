import { Entity, Column } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';

export interface TunTapAdapter {
  [key: string]: unknown;
}

@Entity('logical_bridge_channels')
export class BridgeChannel extends LogicalChannel {
  @Column({ nullable: true })
  bridgeName?: string;

  @Column({ type: 'jsonb', nullable: true })
  tunTapAdapterList?: TunTapAdapter[];

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.BRIDGE, LogicalChannelSubclass.BRIDGE);
    this.bridgeName = name;
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      channelId: this.channelId, bridgeName: this.bridgeName ?? this.name,
      tunTapAdapterList: this.tunTapAdapterList,
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
