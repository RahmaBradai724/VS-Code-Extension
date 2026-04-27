import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('npdu_configs')
export class NpduConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne('EthernetConfig', 'npduConfig')
  @JoinColumn()
  ethernetConfig!: any;

  /** Denormalised FK for direct queries without JOIN chain */
  @Column({ nullable: true })
  frameworkConfigId?: number;

  @Column({ nullable: true })
  manageVlansInCom?: boolean;

  @Column({ nullable: true })
  restrictNPduChannelsInCom?: boolean;

  /** Array of [ip, mac] pairs */
  @Column({ type: 'jsonb', nullable: true })
  ipMacTable?: [string, string][];

  /** { InnerTags: [{ID, Priority, IPList}[]], OuterTags: [...] } */
  @Column({ type: 'jsonb', nullable: true })
  vlans?: object;

  toYAML(): object {
    const out: Record<string, any> = {};
    if (this.manageVlansInCom !== undefined)           out.ManageVlansInCom          = this.manageVlansInCom;
    if (this.restrictNPduChannelsInCom !== undefined)  out.RestrictNPduChannelsInCom = this.restrictNPduChannelsInCom;
    if (this.ipMacTable?.length)                       out.IPMacTable                = this.ipMacTable;
    if (this.vlans)                                    out.VLans                     = this.vlans;
    return out;
  }

  /** Returns PascalCase shape matching the old jsonb blob so the webview sees the same data */
  toJSON(): object {
    return {
      ManageVlansInCom:          this.manageVlansInCom,
      RestrictNPduChannelsInCom: this.restrictNPduChannelsInCom,
      IPMacTable:                this.ipMacTable,
      VLans:                     this.vlans,
    };
  }
}
