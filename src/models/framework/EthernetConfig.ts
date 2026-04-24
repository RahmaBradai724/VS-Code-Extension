import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { FrameworkConfig } from './FrameworkConfig';

@Entity('ethernet_configs')
export class EthernetConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne('FrameworkConfig', 'ethernetConfig')
  @JoinColumn()
  frameworkConfig!: FrameworkConfig;

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

  @Column({ type: 'jsonb', nullable: true })
  ethernetTopology?: object;

  toYAML(): object {
    return {
      autoDetectEthSettings: this.autoDetectEthSettings,
      protocol: this.protocol,
      appLayerPorts: this.appLayerPorts,
      considerOnlyEthernetTopologyEcus: this.considerOnlyEthernetTopologyEcus,
      npduConfig: this.npduConfig,
      someIPConfig: this.someIPConfig,
      ethernetTopology: this.ethernetTopology,
    };
  }

  toJSON(): object {
    return { ...this };
  }
}
