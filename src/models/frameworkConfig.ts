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

  @ManyToOne(() => Configuration, (c) => c.frameworkConfig)
  @JoinColumn({ name: 'config_id' })
  configuration?: Configuration;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
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

@ChildEntity('ABCF')
export class ABCFTracer extends Tracer {
  @Column()
  base: string = '';

  @Column({ nullable: true })
  loggingFileLong?: string;

  @Column({ type: 'varchar', nullable: true })
  timestampPrecision?: TimestampPrecision;

  constructor(id: string, name: string) {
    super(id, name);
    this.loggingType = 'ABCF';
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: 'ABCF', base: this.base, timestampPrecision: this.timestampPrecision };
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
  channelGroups: string[][] = [];

  toYAML(): object {
    return { type: this.publisherType, channelGroups: this.channelGroups };
  }

  toJSON(): object {
    return { publisherType: this.publisherType, topicCancel: this.topicCancel, channelGroups: this.channelGroups };
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

  toYAML(): object {
    return { autoDetectEthSettings: this.autoDetectEthSettings, protocol: this.protocol, appLayerPort: this.appLayerPort };
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
  ecuAddress: string = '';

  @Column()
  testerAddress: string = '';

  @Column()
  protocol: string = '';

  @Column()
  build: string = '';

  @Column({ nullable: true })
  rai?: string;

  toYAML(): object {
    return { ecuAddress: this.ecuAddress, testerAddress: this.testerAddress, protocol: this.protocol };
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
  publisher: PublisherConfig = new PublisherConfig();

  @Column(() => DiagnosticsConfig)
  diagnostics: DiagnosticsConfig = new DiagnosticsConfig();

  @Column(() => EthernetConfig)
  ethernet: EthernetConfig = new EthernetConfig();

  @OneToMany(() => Tracer, (t) => t.configuration)
  tracing: Tracer[] = [];

  @Column()
  serverUrls: string = '';

  @Column({ type: 'jsonb', default: {} })
  channelListMapping: Map<string, string[]> = new Map();

  toYAML(): object {
    const tracers: object[] = this.tracing.map(t => t.toYAML());
    return {
      publisher: this.publisher.toYAML(),
      diagnostics: this.diagnostics.toYAML(),
      ethernet: this.ethernet.toYAML(),
      tracing: tracers,
    };
  }

  toJSON(): object {
    return {
      keys: Object.fromEntries(this.keys),
      channels: Object.fromEntries(this.channels),
      publisher: this.publisher.toJSON(),
      diagnostics: this.diagnostics.toJSON(),
      ethernet: this.ethernet.toJSON(),
      tracing: this.tracing.map(t => t.toJSON()),
      serverUrls: this.serverUrls,
    };
  }
}
