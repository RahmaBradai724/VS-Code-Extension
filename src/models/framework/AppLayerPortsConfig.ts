import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

/** Stores MTF AppLayerPorts – each field is a single port number */
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

  @Column({ type: 'int', nullable: true })
  nPdu?: number;

  @Column({ type: 'int', nullable: true })
  someIp?: number;

  @Column({ type: 'int', nullable: true })
  udpNm?: number;

  @Column({ type: 'int', nullable: true })
  dlt?: number;

  @Column({ type: 'int', nullable: true })
  someIpSD?: number;

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
