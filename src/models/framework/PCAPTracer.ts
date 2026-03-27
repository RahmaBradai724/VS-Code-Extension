import { ChildEntity, Column } from 'typeorm';
import { Tracer } from './Tracer';

@ChildEntity('PCAP')
export class PCAPTracer extends Tracer {
  @Column()
  loggingFilePath: string = '';

  @Column({ nullable: true })
  loggingFileLong?: string;

  constructor(id: string, name: string) {
    super(id, name);
    this.loggingType = 'PCAP';
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: 'PCAP', loggingFilePath: this.loggingFilePath };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: 'PCAP', loggingFilePath: this.loggingFilePath, loggingFileLong: this.loggingFileLong };
  }
}
