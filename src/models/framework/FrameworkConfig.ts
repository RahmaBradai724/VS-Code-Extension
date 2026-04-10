import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PublisherConfig } from './PublisherConfig';
import { DiagnosticsConfig } from './DiagnosticsConfig';
import { EthernetConfig } from './EthernetConfig';


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

  /** Raw tracer data (JSONB cache – source of truth for runtime/globalState). */
  @Column({ type: 'jsonb', default: [] })
  tracers: object[] = [];

  @Column({ type: 'jsonb', default: [] })
  connectedEcus: string[] = [];

  @Column({ nullable: true })
  servicePack?: string;

  @Column({ type: 'jsonb', default: {} })
  channelToEcusMapping: Map<string, string[]> = new Map();

  toYAML(): object {
    return {
      publisher: this.publisherConfig.toYAML(),
      diagnostics: this.diagnostics.toYAML(),
      ethernet: this.ethernetConfig.toYAML(),
    };
  }

  toJSON(): object {
    return {
      publisherConfig: this.publisherConfig.toJSON(),
      diagnostics: this.diagnostics.toJSON(),
      ethernetConfig: this.ethernetConfig.toJSON(),
      tracers: this.tracers ?? [],
      connectedEcus: this.connectedEcus,
      servicePack: this.servicePack,
      channelToEcusMapping: this.channelToEcusMapping instanceof Map ? Object.fromEntries(this.channelToEcusMapping) : this.channelToEcusMapping,
    };
  }
}
