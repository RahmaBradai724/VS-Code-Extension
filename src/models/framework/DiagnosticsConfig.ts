import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { FrameworkConfig } from './FrameworkConfig';

@Entity('diagnostics_configs')
export class DiagnosticsConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne('FrameworkConfig', 'diagnostics')
  @JoinColumn()
  frameworkConfig!: FrameworkConfig;

  @Column()
  ecuIpAddress: string = '';

  @Column()
  testerIpAddress: string = '';

  @Column()
  protocol: string = '';

  @Column()
  netId: string = '';

  @Column({ nullable: true })
  rai?: string;

  toYAML(): object {
    return { ecuIpAddress: this.ecuIpAddress, testerIpAddress: this.testerIpAddress, protocol: this.protocol, netId: this.netId };
  }

  toJSON(): object {
    return { ...this };
  }
}
