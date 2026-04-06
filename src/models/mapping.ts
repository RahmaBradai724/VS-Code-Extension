import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LogicalChannelCategory, HardwareChannelCategory } from './enums';
import { Configuration } from './configuration';


@Entity('mappings')
export class Mapping {
  @PrimaryColumn()
  mappingId: string;

  @Column()
  frameworkConfigId: string;

  @Column()
  configurationId: string;

  @Column()
  logicalChannelId: string;

  @Column()
  logicalChannelName: string;

  @Column()
  hardwareChannelId: string;

  @Column({ nullable: true })
  hardwareChannelName?: string;

  @Column({ nullable: true })
  comment?: string;

  // Per-bus CM mapping parameters
  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  operationMode?: string;

  @Column({ nullable: true })
  keySlot?: number;

  @Column({ nullable: true })
  nodeType?: string;

  @Column({ nullable: true })
  wakeUpCluster?: boolean;

  // BTS-REVO per-IO mapping parameters
  @Column({ nullable: true })
  measurementAttribute?: string;

  @Column({ nullable: true })
  btsFunction?: string;

  @Column({ nullable: true })
  lineContactState?: boolean;

  @Column({ nullable: true })
  gndContactState?: boolean;

  @Column({ nullable: true })
  vbatContactState?: boolean;

  @Column({ nullable: true })
  staticChannel?: boolean;

  @Column({ nullable: true })
  initValue?: string;

  @Column({ nullable: true })
  channelType?: string;

  @Column({ nullable: true })
  pwmWindowTime?: number;

  /** List of measurement configuration IDs to apply on this BTS channel */
  @Column({ type: 'jsonb', nullable: true })
  measurementConfig?: string[];

  /** Subscription config (IsPeriodic, Polling, thresholds, etc.) per channel */
  @Column({ type: 'jsonb', nullable: true })
  subscriptionConfig?: Record<string, unknown>;

  @Column()
  createdAt: string;

  // Protocol compatibility metadata (stored for validation)
  @Column({ type: 'varchar', nullable: true })
  logicalChannelType?: LogicalChannelCategory;

  @Column({ type: 'varchar', nullable: true })
  hardwareChannelType?: HardwareChannelCategory;

  @ManyToOne(() => Configuration, (c) => c.mappings)
  @JoinColumn({ name: 'configurationId' })
  configuration?: Configuration;

  constructor(
    mappingId: string,
    configurationId: string,
    logicalChannelId: string,
    logicalChannelName: string,
    hardwareChannelId: string,
    frameworkConfigId: string,
  ) {
    this.mappingId = mappingId;
    this.configurationId = configurationId;
    this.logicalChannelId = logicalChannelId;
    this.logicalChannelName = logicalChannelName;
    this.hardwareChannelId = hardwareChannelId;
    this.frameworkConfigId = frameworkConfigId;
    this.createdAt = new Date().toISOString();
  }

  toYAML(): object {
    return {
      logicalChannel: this.logicalChannelName,
      hardwareChannel: this.hardwareChannelId,
    };
  }

  toJSON(): object {
    return {
      mappingId: this.mappingId,
      configurationId: this.configurationId,
      logicalChannelId: this.logicalChannelId,
      logicalChannelName: this.logicalChannelName,
      hardwareChannelId: this.hardwareChannelId,
      frameworkConfigId: this.frameworkConfigId,
      hardwareChannelName: this.hardwareChannelName,
      hwChannel: this.hwChannel,
      operationMode: this.operationMode,
      keySlot: this.keySlot,
      nodeType: this.nodeType,
      wakeUpCluster: this.wakeUpCluster,
      measurementAttribute: this.measurementAttribute,
      btsFunction: this.btsFunction,
      lineContactState: this.lineContactState,
      gndContactState: this.gndContactState,
      vbatContactState: this.vbatContactState,
      staticChannel: this.staticChannel,
      initValue: this.initValue,
      channelType: this.channelType,
      pwmWindowTime: this.pwmWindowTime,
      measurementConfig: this.measurementConfig,
      subscriptionConfig: this.subscriptionConfig,
      comment: this.comment,
      createdAt: this.createdAt,
      logicalChannelType: this.logicalChannelType,
      hardwareChannelType: this.hardwareChannelType,
    };
  }

  static fromJSON(data: any): Mapping {
    const m = new Mapping(
      data.mappingId, data.configurationId,
      data.logicalChannelId, data.logicalChannelName, data.hardwareChannelId,
      data.frameworkConfigId,
    );
    m.hardwareChannelName = data.hardwareChannelName;
    m.comment = data.comment;
    m.createdAt = data.createdAt;
    m.logicalChannelType = data.logicalChannelType;
    m.hardwareChannelType = data.hardwareChannelType;
    m.hwChannel = data.hwChannel;
    m.operationMode = data.operationMode;
    m.keySlot = data.keySlot;
    m.nodeType = data.nodeType;
    m.wakeUpCluster = data.wakeUpCluster;
    m.measurementAttribute = data.measurementAttribute;
    m.btsFunction = data.btsFunction;
    m.lineContactState = data.lineContactState;
    m.gndContactState = data.gndContactState;
    m.vbatContactState = data.vbatContactState;
    m.staticChannel = data.staticChannel;
    m.initValue = data.initValue;
    m.channelType = data.channelType;
    m.pwmWindowTime = data.pwmWindowTime;
    m.measurementConfig = data.measurementConfig;
    m.subscriptionConfig = data.subscriptionConfig;
    return m;
  }
}
