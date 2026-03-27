import { PrimaryColumn, Column } from 'typeorm';
import { ChannelType } from './enums';

/**
 * Abstract base class for all channels.
 */
export abstract class Channel {
  @PrimaryColumn()

  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  type: ChannelType;
  

  constructor(id: string, name: string, type: ChannelType) {
    this.id = id;
    this.name = name;
    this.type = type;
  }

  create(): this {
    return this;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getType(): ChannelType {
    return this.type;
  }

  abstract toYAML(): object;
  abstract toJSON(): object;
}
