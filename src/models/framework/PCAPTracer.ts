import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/** Dedicated table for PCAP tracers. */
@Entity('pcap_tracers')
export class PCAPTracer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name: string = '';

  /** FK to framework_configs.id */
  @Column({ nullable: true })
  frameworkConfigId?: number;

  /** MultipleAdapterMode | PerformanceMode | StandardMode */
  @Column({ nullable: true })
  loggingType?: string;

  /** Microsecond | Nanosecond */
  @Column({ nullable: true })
  timestamp?: string;

  /** BufferConfig + FileConfig */
  @Column({ type: 'jsonb', nullable: true })
  loggerConfiguration?: object;

  toYAML(): object {
    const entry: Record<string, any> = { Type: 'PCAP' };
    if (this.loggingType)         { entry.LoggingType         = this.loggingType; }
    if (this.timestamp)           { entry.Timestamp           = this.timestamp; }
    if (this.loggerConfiguration) { entry.LoggerConfiguration = this.loggerConfiguration; }
    return { [this.name]: entry };
  }

  toJSON(): object {
    return {
      name: this.name,
      Type: 'PCAP',
      LoggingType: this.loggingType,
      Timestamp: this.timestamp,
      LoggerConfiguration: this.loggerConfiguration,
    };
  }
}
