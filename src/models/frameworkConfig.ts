import { Entity, PrimaryColumn, Column, TableInheritance, ChildEntity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PublisherMode, TimestampPrecision } from './enums';
import { Configuration } from './configuration';

// ─────────────────────────────────────────────
//  Tracer Models
// ─────────────────────────────────────────────

@Entity('tracers')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Tracer {
  @PrimaryGeneratedColumn()
  id_internal!: number; // For internal DB primary key if id is not unique across types

  @Column()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  loggingType?: string;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => Configuration, (c) => c.frameworkConfig)
  @JoinColumn({ name: 'config_id' })
  configuration?: Configuration;

  constructor(id: string, name: string, userId?: string) {
    this.id = id;
    this.name = name;
    this.userId = userId;
  }

  abstract toYAML(): object;
  abstract toJSON(): object;
}

@ChildEntity('PCAP')
export class PCAPTracer extends Tracer {
  @Column()
  loggingFilePath: string = '';

  @Column({ nullable: true })
  loggingFileLong?: string;

  constructor(id: string, name: string) {
    super(id, name);
    this.loggingType = 'PCAP';
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: 'PCAP', loggingFilePath: this.loggingFilePath };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: 'PCAP', loggingFilePath: this.loggingFilePath, loggingFileLong: this.loggingFileLong };
  }
}

@ChildEntity('ASCII')
export class ASCIITracer extends Tracer {
  @Column()
  base: string = '';

  @Column()
  internalEventLogged: boolean = false;

  @Column()
  timeStampSetting: string = '';

  @Column({ nullable: true })
  loggingFileLong?: string;

  @Column({ type: 'varchar', nullable: true })
  timestampPrecision?: TimestampPrecision;

  constructor(id: string, name: string) {
    super(id, name);
    this.loggingType = 'ASCII';
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: 'ASCII',
      base: this.base, internalEventLogged: this.internalEventLogged,
      timeStampSetting: this.timeStampSetting, timestampPrecision: this.timestampPrecision
    };
  }

  toJSON(): object {
    return { ...this.toYAML(), loggingFileLong: this.loggingFileLong };
  }
}

// ─────────────────────────────────────────────
//  Publisher Config
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
//  Ethernet Config
// ─────────────────────────────────────────────
export class EthernetConfig {
  @Column({ nullable: true })
  autoDetectEthSettings?: boolean;

  @Column({ nullable: true })
  maxDataCols?: string;

  @Column({ nullable: true })
  protocol?: string;

  @Column({ nullable: true })
  build?: string;

  @Column({ nullable: true })
  appLayerPort?: number;

  @Column({ type: 'jsonb', nullable: true })
  appLayerPorts?: number[];

  @Column({ nullable: true })
  considerOnlyEthernetTopologyEcus?: boolean;

  @Column({ type: 'jsonb', nullable: true })
  npduConfig?: object;

  @Column({ type: 'jsonb', nullable: true })
  someIPConfig?: object;

  toYAML(): object {
    return {
      autoDetectEthSettings: this.autoDetectEthSettings,
      protocol: this.protocol,
      appLayerPorts: this.appLayerPorts,
      considerOnlyEthernetTopologyEcus: this.considerOnlyEthernetTopologyEcus,
      npduConfig: this.npduConfig,
      someIPConfig: this.someIPConfig
    };
  }

  toJSON(): object {
    return { ...this };
  }
}

// ─────────────────────────────────────────────
//  Diagnostics Config
// ─────────────────────────────────────────────
export class DiagnosticsConfig {
  @Column()
  ecuIpAddress: string = '';

  @Column()
  testerIpAddress: string = '';

  @Column()
  protocol: string = '';

  @Column()
  netId: string = '';

  @Column({ nullable: true })
  rai?: string;

  toYAML(): object {
    return { ecuIpAddress: this.ecuIpAddress, testerIpAddress: this.testerIpAddress, protocol: this.protocol, netId: this.netId };
  }

  toJSON(): object {
    return { ...this };
  }
}

// ─────────────────────────────────────────────
//  Framework Config
// ─────────────────────────────────────────────
@Entity('framework_configs')
export class FrameworkConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'jsonb', default: {} })
  keys: Map<string, string> = new Map();

  @Column({ type: 'jsonb', default: {} })
  channels: Map<string, string[]> = new Map();

  @Column(() => PublisherConfig)
  publisherConfig: PublisherConfig = new PublisherConfig();

  @Column(() => DiagnosticsConfig)
  diagnostics: DiagnosticsConfig = new DiagnosticsConfig();

  @Column(() => EthernetConfig)
  ethernetConfig: EthernetConfig = new EthernetConfig();

  @OneToMany(() => Tracer, (t) => t.configuration)
  tracing: Tracer[] = [];

  @Column({ type: 'jsonb', default: [] })
  connectedEcus: string[] = [];

  @Column({ nullable: true })
  servicePack?: string;

  @Column({ type: 'jsonb', default: {} })
  channelToEcusMapping: Map<string, string[]> = new Map();

  toYAML(): object {
    const tracers: object[] = this.tracing.map(t => t.toYAML());
    return {
      publisher: this.publisherConfig.toYAML(),
      diagnostics: this.diagnostics.toYAML(),
      ethernet: this.ethernetConfig.toYAML(),
      tracing: tracers,
    };
  }

  toJSON(): object {
    return {
      publisherConfig: this.publisherConfig.toJSON(),
      diagnostics: this.diagnostics.toJSON(),
      ethernetConfig: this.ethernetConfig.toJSON(),
      tracing: this.tracing.map(t => t.toJSON()),
      connectedEcus: this.connectedEcus,
      servicePack: this.servicePack,
      channelToEcusMapping: this.channelToEcusMapping instanceof Map ? Object.fromEntries(this.channelToEcusMapping) : this.channelToEcusMapping,
    };
  }
}
