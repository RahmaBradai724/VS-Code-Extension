import { Entity, Column } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';


@Entity('logical_ethernet_channels')
export class EthernetChannel extends LogicalChannel {

  @Column({ nullable: true })
  applicationProtocol?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.ETHERNET, LogicalChannelSubclass.ETHERNET);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      channelId: this.channelId,
      applicationProtocol: this.applicationProtocol,
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
