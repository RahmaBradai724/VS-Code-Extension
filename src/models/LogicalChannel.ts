import { Column } from 'typeorm';
import { Channel } from './ChannelBase';
import {
  ChannelType,
  LogicalChannelCategory,
  LogicalChannelSubclass,
} from './enums';


export abstract class LogicalChannel extends Channel {
  @Column({ type: 'varchar' })
  category: LogicalChannelCategory;

  @Column({ type: 'varchar' })
  subclass: LogicalChannelSubclass;

  @Column({ nullable: true })
  loggingName?: string;

  @Column({ nullable: true })
  tracerName?: string;

  @Column({ type: 'simple-array', nullable: true })
  alias?: string[];

  @Column({ nullable: true })
  channelId?: number;

  constructor(id: string, name: string, category: LogicalChannelCategory, subclass: LogicalChannelSubclass) {
    super(id, name, ChannelType.LOGICAL);
    this.category = category;
    this.subclass = subclass;
  }
}
