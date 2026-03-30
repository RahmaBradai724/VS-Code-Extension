import { Entity, Column, TableInheritance, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Configuration } from '../configuration';

// ─────────────────────────────────────────────
//  Tracer Models
// ─────────────────────────────────────────────

@Entity('tracers')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Tracer {
  @PrimaryGeneratedColumn()
  id_internal!: number;

  @Column()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  loggingType?: string;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => Configuration, (c) => c.frameworkConfig)
  @JoinColumn({ name: 'config_id' })
  configuration?: Configuration;

  constructor(id: string, name: string, userId?: string) {
    this.id = id;
    this.name = name;
    this.userId = userId;
  }

  abstract toYAML(): object;
  abstract toJSON(): object;
}
