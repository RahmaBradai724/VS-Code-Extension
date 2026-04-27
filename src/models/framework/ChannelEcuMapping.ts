import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

/** One row per channel in the EthernetConfig.ChannelToEcusMapping */
@Entity('channel_ecu_mappings')
export class ChannelEcuMapping {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne('EthernetConfig', 'channelEcuMappings', { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  ethernetConfig!: any;

  /** Denormalised FK for direct queries without JOIN chain */
  @Column({ nullable: true })
  frameworkConfigId?: number;

  @Column()
  channelName!: string;

  /** List of ECU names associated with this channel */
  @Column({ type: 'jsonb', default: [] })
  ecus: string[] = [];

  toJSON(): object {
    return { channelName: this.channelName, ecus: this.ecus };
  }
}
