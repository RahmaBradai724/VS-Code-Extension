import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

@Entity('hardware_genesys_ps')
export class GenesysPowerSupply extends HardwareChannel {
  /** Last byte of IP address (e.g. 136 for 169.254.16.136) */
  @Column({ nullable: true })
  channelName?: string;

  @Column({ nullable: true })
  defaultVoltage?: number;

  @Column({ nullable: true })
  maxVoltage?: number;

  @Column({ nullable: true })
  defaultMaxCurrent?: number;

  @Column({ nullable: true })
  samplingInterval?: number;

  /** 'Serial' or 'Tcp' */
  @Column({ nullable: true })
  communicationProtocol?: string;

  // Serial fields
  @Column({ nullable: true })
  portName?: string;

  @Column({ nullable: true })
  bitRate?: number;

  // TCP fields
  @Column({ nullable: true })
  ip?: string;

  @Column({ nullable: true })
  port?: number;

  /** 'SCPI' or 'GEN' */
  @Column({ nullable: true })
  language?: string;

  @Column({ nullable: true })
  continuousMonitoringActive?: boolean;

  @Column({ nullable: true })
  keepStatus?: boolean;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.GENESYS_PS, HardwareChannelSubclass.GENESYS_PS);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, subclass: this.subclass,
      channelName: this.channelName,
      defaultVoltage: this.defaultVoltage,
      maxVoltage: this.maxVoltage,
      defaultMaxCurrent: this.defaultMaxCurrent,
      samplingInterval: this.samplingInterval,
      communicationProtocol: this.communicationProtocol,
      portName: this.portName,
      bitRate: this.bitRate,
      ip: this.ip,
      port: this.port,
      language: this.language,
      continuousMonitoringActive: this.continuousMonitoringActive,
      keepStatus: this.keepStatus,
    };
  }

  toJSON(): object { return this.toYAML(); }
}
