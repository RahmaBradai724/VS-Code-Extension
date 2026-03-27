import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Tracer } from './Tracer';
import { PublisherConfig } from './PublisherConfig';
import { DiagnosticsConfig } from './DiagnosticsConfig';
import { EthernetConfig } from './EthernetConfig';

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
  tracing!: Tracer[];

  @Column({ type: 'jsonb', default: [] })
  connectedEcus: string[] = [];

  @Column({ nullable: true })
  servicePack?: string;

  @Column({ type: 'jsonb', default: {} })
  channelToEcusMapping: Map<string, string[]> = new Map();

  toYAML(): object {
    const tracers: object[] = this.tracing ? this.tracing.map(t => t.toYAML()) : [];
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
      tracing: this.tracing ? this.tracing.map(t => t.toJSON()) : [],
      connectedEcus: this.connectedEcus,
      servicePack: this.servicePack,
      channelToEcusMapping: this.channelToEcusMapping instanceof Map ? Object.fromEntries(this.channelToEcusMapping) : this.channelToEcusMapping,
    };
  }
}
