import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

@Entity('hardware_bts_revo')
export class BTSRevo extends HardwareChannel {
  /** Fourth byte of BTS IP address (e.g. 160 for 10.104.3.160) */
  @Column({ nullable: true })
  boardId?: number;

  /** First three octets of the shared BTS network (e.g. "10.104.3") */
  @Column({ nullable: true })
  addressPrefix?: string;

  /** TCP port used to communicate with BTS boards (optional) */
  @Column({ nullable: true })
  ethernetPort?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.BTS_REVO, HardwareChannelSubclass.BTS_REVO);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, subclass: this.subclass,
      boardId: this.boardId, addressPrefix: this.addressPrefix, ethernetPort: this.ethernetPort,
    };
  }

  toJSON(): object {
    return {
      id: this.id, name: this.name, type: this.type,
      category: this.category, subclass: this.subclass,
      boardId: this.boardId, addressPrefix: this.addressPrefix, ethernetPort: this.ethernetPort,
    };
  }
}
