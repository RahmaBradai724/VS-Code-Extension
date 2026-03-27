import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

// ─────────────────────────────────────────────
//  Relay Board Hardware Channel
// ─────────────────────────────────────────────
@Entity('hardware_relay_boards')
export class RelayBoard extends HardwareChannel {
  @Column({ nullable: true })
  relayCount?: number;

  @Column({ nullable: true })
  channelName?: string;

  @Column({ nullable: true })
  boardId?: number;

  @Column({ type: 'jsonb', nullable: true })
  relays?: object;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.RELAY_BOARD, HardwareChannelSubclass.RELAY_BOARD);
  }

  get canChannelName(): string | undefined {
    return this.channelName;
  }

  set canChannelName(value: string | undefined) {
    this.channelName = value;
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      relayCount: this.relayCount, canChannelName: this.canChannelName,
      boardId: this.boardId, relays: this.relays
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
