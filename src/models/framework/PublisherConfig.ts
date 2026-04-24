import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PublisherMode } from '../enums';
import type { FrameworkConfig } from './FrameworkConfig';

@Entity('publisher_configs')
export class PublisherConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne('FrameworkConfig', 'publisherConfig')
  @JoinColumn()
  frameworkConfig!: FrameworkConfig;

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
