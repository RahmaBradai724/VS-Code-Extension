import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { FrameworkConfig } from './FrameworkConfig';
import { NpduConfig } from './NpduConfig';
import { SomeIPConfig } from './SomeIPConfig';
import { AppLayerPortsConfig } from './AppLayerPortsConfig';
import { EthernetTopology } from './EthernetTopology';
import { ChannelEcuMapping } from './ChannelEcuMapping';

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
  considerOnlyEthernetTopologyEcus?: boolean;

  @OneToOne(() => NpduConfig, 'ethernetConfig', { cascade: true, eager: true, nullable: true } as any)
  npduConfig!: NpduConfig;

  @OneToOne(() => SomeIPConfig, 'ethernetConfig', { cascade: true, eager: true, nullable: true } as any)
  someIPConfig!: SomeIPConfig;

  @OneToOne(() => AppLayerPortsConfig, 'ethernetConfig', { cascade: true, eager: true, nullable: true } as any)
  appLayerPortsConfig!: AppLayerPortsConfig;

  @OneToOne(() => EthernetTopology, 'ethernetConfig', { cascade: true, eager: true, nullable: true } as any)
  ethernetTopology!: EthernetTopology;

  @OneToMany(() => ChannelEcuMapping, (m) => m.ethernetConfig, { cascade: true, eager: true })
  channelEcuMappings!: ChannelEcuMapping[];

  toYAML(): object {
    return {
      autoDetectEthSettings:             this.autoDetectEthSettings,
      protocol:                          this.protocol,
      considerOnlyEthernetTopologyEcus:  this.considerOnlyEthernetTopologyEcus,
    };
  }

  toJSON(): object {
    const channelToEcusMapping = this.channelEcuMappings?.length
      ? Object.fromEntries(this.channelEcuMappings.map(m => [m.channelName, m.ecus]))
      : undefined;
    return {
      id:                               this.id,
      autoDetectEthSettings:            this.autoDetectEthSettings,
      maxDataCols:                      this.maxDataCols,
      protocol:                         this.protocol,
      build:                            this.build,
      considerOnlyEthernetTopologyEcus: this.considerOnlyEthernetTopologyEcus,
      npduConfig:                       this.npduConfig?.toJSON(),
      someIPConfig:                     this.someIPConfig?.toJSON(),
      // "appLayerPorts" key kept for webview compatibility
      appLayerPorts:                    this.appLayerPortsConfig?.toJSON(),
      ethernetTopology:                 this.ethernetTopology?.toJSON(),
      channelToEcusMapping,
    };
  }
}
