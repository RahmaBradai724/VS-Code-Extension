import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

/** One entry in an AppLayerPorts list: a single port number or a [min, max] range. */
export type PortEntry = number | [number, number];

/** Stores MTF AppLayerPorts – each field is a list of ports and/or port ranges */
@Entity('app_layer_ports_configs')
export class AppLayerPortsConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne('EthernetConfig', 'appLayerPortsConfig')
  @JoinColumn()
  ethernetConfig!: any;

  /** Denormalised FK for direct queries without JOIN chain */
  @Column({ nullable: true })
  frameworkConfigId?: number;

  @Column({ type: 'jsonb', nullable: true })
  nPdu?: PortEntry[];

  @Column({ type: 'jsonb', nullable: true })
  someIp?: PortEntry[];

  @Column({ type: 'jsonb', nullable: true })
  udpNm?: PortEntry[];

  @Column({ type: 'jsonb', nullable: true })
  dlt?: PortEntry[];

  @Column({ type: 'jsonb', nullable: true })
  someIpSD?: PortEntry[];

  toYAML(): object {
    const out: Record<string, any> = {};
    if (this.nPdu    != null) out.NPdu    = this.nPdu;
    if (this.someIp  != null) out.SomeIp  = this.someIp;
    if (this.udpNm   != null) out.UDPNM   = this.udpNm;
    if (this.dlt     != null) out.DLT     = this.dlt;
    if (this.someIpSD != null) out.SomeIpSD = this.someIpSD;
    return out;
  }

  /** Returns PascalCase shape matching the old jsonb blob so the webview sees the same data */
  toJSON(): object {
    return {
      NPdu:    this.nPdu,
      SomeIp:  this.someIp,
      UDPNM:   this.udpNm,
      DLT:     this.dlt,
      SomeIpSD: this.someIpSD,
    };
  }
}
