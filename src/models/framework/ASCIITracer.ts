import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/** Dedicated table for ASCII tracers. */
@Entity('ascii_tracers')
export class ASCIITracer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name: string = '';

  /** FK to framework_configs.id */
  @Column({ nullable: true })
  frameworkConfigId?: number;

  /** Hex | Decimal */
  @Column({ nullable: true })
  base?: string;

  @Column({ default: false })
  internalEventLogged: boolean = false;

  /** Absolute | Relative */
  @Column({ nullable: true })
  timeStampSetting?: string;

  /** Microsecond | Nanosecond */
  @Column({ nullable: true })
  timestamp?: string;

  /** FileConfig: Extension, BaseFileName, MaxFile, MaxFileSize */
  @Column({ type: 'jsonb', nullable: true })
  loggerConfiguration?: object;

  toYAML(): object {
    const entry: Record<string, any> = { Type: 'ASCII' };
    if (this.base)                { entry.Base                 = this.base; }
    if (this.timeStampSetting)    { entry.TimeStampSetting     = this.timeStampSetting; }
    if (this.timestamp)           { entry.Timestamp            = this.timestamp; }
    entry.InternalEventLogged = this.internalEventLogged;
    if (this.loggerConfiguration) { entry.LoggerConfiguration  = this.loggerConfiguration; }
    return { [this.name]: entry };
  }

  toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      Type: 'ASCII',
      Base: this.base,
      TimeStampSetting: this.timeStampSetting,
      Timestamp: this.timestamp,
      InternalEventLogged: this.internalEventLogged,
      LoggerConfiguration: this.loggerConfiguration,
    };
  }
}
