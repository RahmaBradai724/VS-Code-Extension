import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LogicalChannelCategory, HardwareChannelCategory } from './enums';
import { Configuration } from './configuration';

/**
 * Represents a mapping between a logical channel and a hardware channel.
 */
@Entity('mappings')
export class Mapping {
  @PrimaryColumn()
  mappingId: string;

  @Column()
  configurationId: string;

  @Column()
  logicalChannelId: string;

  @Column()
  logicalChannelName: string;

  @Column()
  hardwareChannelId: string;

  @Column({ nullable: true })
  hardwareChannelName?: string;

  @Column({ nullable: true })
  comment?: string;

  @Column()
  createdAt: string;

  // Protocol compatibility metadata (stored for validation)
  @Column({ type: 'varchar', nullable: true })
  logicalChannelType?: LogicalChannelCategory;

  @Column({ type: 'varchar', nullable: true })
  hardwareChannelType?: HardwareChannelCategory;

  @ManyToOne(() => Configuration, (c) => c.mappings)
  @JoinColumn({ name: 'configurationId' })
  configuration?: Configuration;

  constructor(
    mappingId: string,
    configurationId: string,
    logicalChannelId: string,
    logicalChannelName: string,
    hardwareChannelId: string,
  ) {
    this.mappingId = mappingId;
    this.configurationId = configurationId;
    this.logicalChannelId = logicalChannelId;
    this.logicalChannelName = logicalChannelName;
    this.hardwareChannelId = hardwareChannelId;
    this.createdAt = new Date().toISOString();
  }

  toYAML(): object {
    return {
      logicalChannel: this.logicalChannelName,
      hardwareChannel: this.hardwareChannelId,
    };
  }

  toJSON(): object {
    return {
      mappingId: this.mappingId,
      configurationId: this.configurationId,
      logicalChannelId: this.logicalChannelId,
      logicalChannelName: this.logicalChannelName,
      hardwareChannelId: this.hardwareChannelId,
      hardwareChannelName: this.hardwareChannelName,
      comment: this.comment,
      createdAt: this.createdAt,
      logicalChannelType: this.logicalChannelType,
      hardwareChannelType: this.hardwareChannelType,
    };
  }

  static fromJSON(data: any): Mapping {
    const m = new Mapping(
      data.mappingId, data.configurationId,
      data.logicalChannelId, data.logicalChannelName, data.hardwareChannelId,
    );
    m.hardwareChannelName = data.hardwareChannelName;
    m.comment = data.comment;
    m.createdAt = data.createdAt;
    m.logicalChannelType = data.logicalChannelType;
    m.hardwareChannelType = data.hardwareChannelType;
    return m;
  }
}
