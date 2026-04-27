import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';
import { PublisherConfig } from './PublisherConfig';
import { EthernetConfig } from './EthernetConfig';
import { PCAPTracer } from './PCAPTracer';
import { ASCIITracer } from './ASCIITracer';


@Entity('framework_configs')
export class FrameworkConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'jsonb', default: {} })
  keys: Map<string, string> = new Map();

  @Column({ type: 'jsonb', default: {} })
  channels: Map<string, string[]> = new Map();

  @OneToOne(() => PublisherConfig, (pc) => pc.frameworkConfig, { cascade: true, eager: true, nullable: true } as any)
  publisherConfig!: PublisherConfig;

  @OneToOne(() => EthernetConfig, (ec) => ec.frameworkConfig, { cascade: true, eager: true, nullable: true } as any)
  ethernetConfig!: EthernetConfig;

  @OneToMany(() => PCAPTracer, (t) => t.frameworkConfig, { cascade: true, eager: true })
  pcapTracers!: PCAPTracer[];

  @OneToMany(() => ASCIITracer, (t) => t.frameworkConfig, { cascade: true, eager: true })
  asciiTracers!: ASCIITracer[];

  @Column({ type: 'jsonb', default: [] })
  connectedEcus: string[] = [];

  @Column({ nullable: true })
  servicePack?: string;

  toYAML(): object {
    return {
      publisher: this.publisherConfig?.toYAML(),
      ethernet: this.ethernetConfig?.toYAML(),
    };
  }

  toJSON(): object {
    return {
      publisherConfig: this.publisherConfig?.toJSON(),
      ethernetConfig: this.ethernetConfig?.toJSON(),
      tracers: [
        ...(this.pcapTracers ?? []).map((t) => t.toJSON()),
        ...(this.asciiTracers ?? []).map((t) => t.toJSON()),
      ],
      connectedEcus: this.connectedEcus,
      servicePack: this.servicePack,
    };
  }
}
