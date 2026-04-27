import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('someip_configs')
export class SomeIPConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne('EthernetConfig', 'someIPConfig')
  @JoinColumn()
  ethernetConfig!: any;

  /** Denormalised FK for direct queries without JOIN chain */
  @Column({ nullable: true })
  frameworkConfigId?: number;

  /** { ServerPorts: [[start,end][]], ClientPorts: [[start,end][]] } */
  @Column({ type: 'jsonb', nullable: true })
  serverToClientPortRangeMapping?: object;

  @Column({ nullable: true })
  endpointImplementation?: string;

  @Column({ nullable: true })
  adapterName?: string;

  toYAML(): object {
    const out: Record<string, any> = {};
    if (this.serverToClientPortRangeMapping) out.ServerToClientPortRangeMapping = this.serverToClientPortRangeMapping;
    if (this.endpointImplementation)         out.EndpointImplementation         = this.endpointImplementation;
    if (this.adapterName)                    out.AdapterName                    = this.adapterName;
    return out;
  }

  /** Returns PascalCase shape matching the old jsonb blob so the webview sees the same data */
  toJSON(): object {
    return {
      ServerToClientPortRangeMapping: this.serverToClientPortRangeMapping,
      EndpointImplementation:         this.endpointImplementation,
      AdapterName:                    this.adapterName,
    };
  }
}
