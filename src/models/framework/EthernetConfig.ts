import { Column } from 'typeorm';

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
