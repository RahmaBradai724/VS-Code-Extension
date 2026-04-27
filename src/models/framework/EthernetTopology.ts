import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ethernet_topologies')
export class EthernetTopology {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne('EthernetConfig', 'ethernetTopology')
  @JoinColumn()
  ethernetConfig!: any;

  /** Denormalised FK for direct queries without JOIN chain */
  @Column({ nullable: true })
  frameworkConfigId?: number;

  /** Array of { Protocol, DefaultPriority, Ports: [{SrcPort|DstPort|SrcPortRange|DstPortRange, Priority}] } */
  @Column({ type: 'jsonb', nullable: true })
  ethProtoPrioConfig?: object[];

  /** Array of { EcuName, SrcIpList, SrcMacAdr, TunTapAdapterName, Vlans } */
  @Column({ type: 'jsonb', nullable: true })
  topologyConfig?: object[];

  toYAML(): object {
    const out: Record<string, any> = {};
    if (this.ethProtoPrioConfig?.length) out.EthProtoPrioConfig = this.ethProtoPrioConfig;
    if (this.topologyConfig?.length)     out.TopologyConfig     = this.topologyConfig;
    return out;
  }

  /** Returns PascalCase shape matching the old jsonb blob so the webview sees the same data */
  toJSON(): object {
    return {
      EthProtoPrioConfig: this.ethProtoPrioConfig,
      TopologyConfig:     this.topologyConfig,
    };
  }
}
