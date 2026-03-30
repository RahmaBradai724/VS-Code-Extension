import { Entity, Column } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';


@Entity('logical_flexray_channels')
export class FlexRayChannel extends LogicalChannel {
  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  keySlot?: number;

  @Column({ nullable: true })
  nodeType?: string;

  @Column({ nullable: true })
  wakeUpCluster?: boolean;

  @Column({ nullable: true })
  operationMode?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.FLEXRAY, LogicalChannelSubclass.FLEXRAY);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      hwChannel: this.hwChannel, keySlot: this.keySlot,
      nodeType: this.nodeType, wakeUpCluster: this.wakeUpCluster,
      operationMode: this.operationMode
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
