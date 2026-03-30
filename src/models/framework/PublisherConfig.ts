import { Column } from 'typeorm';
import { PublisherMode } from '../enums';


export class PublisherConfig {
  @Column()
  publisherType: string = PublisherMode.SingleThreaded;

  @Column({ nullable: true })
  topicCancel?: string;

  @Column({ type: 'jsonb', default: [] })
  channelsGroups: string[][] = [];

  toYAML(): object {
    return { type: this.publisherType, channelsGroups: this.channelsGroups };
  }

  toJSON(): object {
    return { publisherType: this.publisherType, topicCancel: this.topicCancel, channelsGroups: this.channelsGroups };
  }
}
