import { Entity, PrimaryColumn, Column, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { LogicalChannel, HardwareChannel } from './channel';
import { FrameworkConfig } from './frameworkConfig';
import { Mapping } from './mapping';
import { User } from './user';

/**
 * Top-level configuration entity.
 */
@Entity('configurations')
export class Configuration {
  @PrimaryColumn()
  configId: string;

  @Column()
  name: string;

  @Column()
  userId: string;
  
  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  @OneToMany(() => LogicalChannel, (lc) => lc.configuration)
  logicalChannels: LogicalChannel[] = [];

  @OneToMany(() => HardwareChannel, (hc) => hc.configuration)
  hardwareChannels: HardwareChannel[] = [];

  @OneToMany(() => Mapping, (m) => m.configuration)
  mappings: Mapping[] = [];

  @OneToOne(() => FrameworkConfig, { cascade: true })
  @JoinColumn()
  frameworkConfig: FrameworkConfig = new FrameworkConfig();

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user?: User;

  constructor(configId: string, name: string, userId: string) {
    this.configId = configId;
    this.name = name;
    this.userId = userId;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  touch() {
    this.updatedAt = new Date().toISOString();
  }

  toJSON(): object {
    return {
      configId: this.configId,
      name: this.name,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      logicalChannels: this.logicalChannels.map(c => c.toJSON()),
      hardwareChannels: this.hardwareChannels.map(c => c.toJSON()),
      mappings: this.mappings.map(m => m.toJSON()),
      frameworkConfig: this.frameworkConfig.toJSON(),
    };
  }
}
