import { Entity, PrimaryColumn, Column, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { LogicalChannel, HardwareChannel } from './channel';
import { FrameworkConfig } from './frameworkConfig';
import { Mapping } from './mapping';
import { User } from './user';


@Entity('configurations')
export class Configuration {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  userId!: number | null;

  @Column({ type: 'text', nullable: true })
  data?: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  logicalChannels: LogicalChannel[] = [];
  hardwareChannels: HardwareChannel[] = [];

  @OneToMany(() => Mapping, (m) => m.configuration)
  mappings!: Mapping[];

  @OneToOne(() => FrameworkConfig, { cascade: true, eager: true })
  @JoinColumn()
  frameworkConfig!: FrameworkConfig;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user?: User;

  // ✅ Constructor accepts string | number | null and converts safely
  constructor(id: string, name: string, userId?: string | number | null) {
    this.id = id;
    this.name = name;

    if (userId === null || userId === undefined || userId === '') {
      this.userId = null;
    } else {
      const n = Number(userId);
      this.userId = isNaN(n) ? null : n;
    }

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  touch() {
    this.updatedAt = new Date().toISOString();
  }

  toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      logicalChannels: this.logicalChannels ? this.logicalChannels.map(c => typeof c.toJSON === 'function' ? c.toJSON() : c) : [],
      hardwareChannels: this.hardwareChannels ? this.hardwareChannels.map(c => typeof c.toJSON === 'function' ? c.toJSON() : c) : [],
      mappings: this.mappings ? this.mappings.map(m => typeof m.toJSON === 'function' ? m.toJSON() : m) : [],
      frameworkConfig: this.frameworkConfig ? (typeof this.frameworkConfig.toJSON === 'function' ? this.frameworkConfig.toJSON() : this.frameworkConfig) : {},
    };
  }
}