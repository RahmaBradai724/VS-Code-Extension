import { LogicalChannel, HardwareChannel } from '../models';


/**
 * ChannelManager handles all CRUD operations for
 * logical and hardware channels within a configuration.
 */
export class ChannelManager {
  private logicalChannels: Map<string, LogicalChannel> = new Map();
  private hardwareChannels: Map<string, HardwareChannel> = new Map();
  // Map of channelId → set of mapping IDs that use it
  private channelMappingIndex: Map<string, Set<string>> = new Map();

  // ─── UML Aligned Methods ──────────────────────────────────────────────
  
  addChannel(channel: LogicalChannel | HardwareChannel): void {
    if (channel instanceof LogicalChannel) {
      this.addLogicalChannel(channel);
    } else {
      this.addHardwareChannel(channel);
    }
  }

  updateChannel(id: string, updates: Partial<LogicalChannel | HardwareChannel>): LogicalChannel | HardwareChannel {
    if (this.logicalChannels.has(id)) {
      return this.updateLogicalChannel(id, updates as Partial<LogicalChannel>);
    } else {
      return this.updateHardwareChannel(id, updates as Partial<HardwareChannel>);
    }
  }

  deleteChannel(id: string): void {
    if (this.logicalChannels.has(id)) {
      this.deleteLogicalChannel(id);
    } else {
      this.deleteHardwareChannel(id);
    }
  }

  // ─── Logical Channels ─────────────────────────────────────────────────

  addLogicalChannel(channel: LogicalChannel): void {
    if (this.findLogicalChannelByName(channel.name)) {
      throw new Error(`A logical channel named "${channel.name}" already exists.`);
    }
    this.logicalChannels.set(channel.id, channel);
  }

  updateLogicalChannel(id: string, updates: Partial<LogicalChannel>): LogicalChannel {
    const channel = this.logicalChannels.get(id);
    if (!channel) { throw new Error(`Logical channel "${id}" not found.`); }
    // Prevent duplicate name on update
    if (updates.name && updates.name !== channel.name && this.findLogicalChannelByName(updates.name)) {
      throw new Error(`A logical channel named "${updates.name}" already exists.`);
    }
    Object.assign(channel, updates);
    return channel;
  }

  deleteLogicalChannel(id: string): void {
    const usedBy = this.channelMappingIndex.get(id);
    if (usedBy && usedBy.size > 0) {
      throw new Error(`Cannot delete logical channel "${id}": it is used in ${usedBy.size} mapping(s). Remove mappings first.`);
    }
    this.logicalChannels.delete(id);
    this.channelMappingIndex.delete(id);
  }

  getLogicalChannel(id: string): LogicalChannel | undefined {
    return this.logicalChannels.get(id);
  }

  getAllLogicalChannels(): LogicalChannel[] {
    return Array.from(this.logicalChannels.values());
  }

  findLogicalChannelByName(name: string): LogicalChannel | undefined {
    return Array.from(this.logicalChannels.values()).find(c => c.name === name);
  }

  // ─── Hardware Channels ────────────────────────────────────────────────

  addHardwareChannel(channel: HardwareChannel): void {
    if (this.findHardwareChannelByName(channel.name)) {
      throw new Error(`A hardware channel named "${channel.name}" already exists.`);
    }
    this.hardwareChannels.set(channel.id, channel);
  }

  updateHardwareChannel(id: string, updates: Partial<HardwareChannel>): HardwareChannel {
    const channel = this.hardwareChannels.get(id);
    if (!channel) { throw new Error(`Hardware channel "${id}" not found.`); }
    if (updates.name && updates.name !== channel.name && this.findHardwareChannelByName(updates.name)) {
      throw new Error(`A hardware channel named "${updates.name}" already exists.`);
    }
    Object.assign(channel, updates);
    return channel;
  }

  deleteHardwareChannel(id: string): void {
    const usedBy = this.channelMappingIndex.get(id);
    if (usedBy && usedBy.size > 0) {
      throw new Error(`Cannot delete hardware channel "${id}": it is used in ${usedBy.size} mapping(s). Remove mappings first.`);
    }
    this.hardwareChannels.delete(id);
    this.channelMappingIndex.delete(id);
  }

  getHardwareChannel(id: string): HardwareChannel | undefined {
    return this.hardwareChannels.get(id);
  }

  getAllHardwareChannels(): HardwareChannel[] {
    return Array.from(this.hardwareChannels.values());
  }

  findHardwareChannelByName(name: string): HardwareChannel | undefined {
    return Array.from(this.hardwareChannels.values()).find(c => c.name === name);
  }

  // ─── Mapping Index ────────────────────────────────────────────────────

  registerMappingForChannel(channelId: string, mappingId: string): void {
    if (!this.channelMappingIndex.has(channelId)) {
      this.channelMappingIndex.set(channelId, new Set());
    }
    this.channelMappingIndex.get(channelId)!.add(mappingId);
  }

  unregisterMappingForChannel(channelId: string, mappingId: string): void {
    this.channelMappingIndex.get(channelId)?.delete(mappingId);
  }

  // ─── Hydration ────────────────────────────────────────────────────────

  hydrate(logicalChannels: LogicalChannel[], hardwareChannels: HardwareChannel[]): void {
    this.logicalChannels.clear();
    this.hardwareChannels.clear();
    logicalChannels.forEach(c => this.logicalChannels.set(c.id, c));
    hardwareChannels.forEach(c => this.hardwareChannels.set(c.id, c));
  }
}
