import { ChildEntity, Column } from 'typeorm';
import { Tracer } from './Tracer';
import { TimestampPrecision } from '../enums';

@ChildEntity('ASCII')
export class ASCIITracer extends Tracer {
  @Column()
  base: string = '';

  @Column()
  internalEventLogged: boolean = false;

  @Column()
  timeStampSetting: string = '';

  @Column({ nullable: true })
  loggingFileLong?: string;

  @Column({ type: 'varchar', nullable: true })
  timestampPrecision?: TimestampPrecision;

  constructor(id: string, name: string) {
    super(id, name);
    this.loggingType = 'ASCII';
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: 'ASCII',
      base: this.base, internalEventLogged: this.internalEventLogged,
      timeStampSetting: this.timeStampSetting, timestampPrecision: this.timestampPrecision
    };
  }

  toJSON(): object {
    return { ...this.toYAML(), loggingFileLong: this.loggingFileLong };
  }
}
