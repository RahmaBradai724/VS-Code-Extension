import { Entity, Column } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';

@Entity('logical_io_output_channels')
export class IOOutputChannel extends LogicalChannel {
  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  measurementAttribute?: string;

  @Column({ nullable: true })
  function?: string;

  @Column({ nullable: true })
  lineContactState?: boolean;

  @Column({ nullable: true })
  gndContactState?: boolean;

  @Column({ nullable: true })
  batContactState?: boolean;

  @Column({ nullable: true })
  staticChannel?: boolean;

  @Column({ nullable: true })
  initValue?: string;

  @Column({ nullable: true })
  channelType?: string;

  @Column({ type: 'jsonb', nullable: true })
  measurementConfig?: string[];

  @Column({ nullable: true })
  pwmWindowTime?: number;

  @Column({ type: 'jsonb', nullable: true })
  subscriptionConfig?: Record<string, unknown>;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.IOOUTPUT, LogicalChannelSubclass.IOOUTPUT);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      hwChannel: this.hwChannel, measurementAttribute: this.measurementAttribute,
      function: this.function, lineContactState: this.lineContactState,
      gndContactState: this.gndContactState, batContactState: this.batContactState,
      staticChannel: this.staticChannel, initValue: this.initValue,
      channelType: this.channelType, measurementConfig: this.measurementConfig,
      pwmWindowTime: this.pwmWindowTime, subscriptionConfig: this.subscriptionConfig
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
