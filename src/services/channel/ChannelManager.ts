import { LogicalChannel, HardwareChannel } from '../../models';
import { LogicalChannelRepository } from './LogicalChannelRepository';
import { HardwareChannelRepository } from './HardwareChannelRepository';
import { MappingIndex } from './MappingIndex';

/**
 * ChannelManager is a Façade that coordinates logical/hardware channel CRUD
 * and the mapping index. Its public API is identical to the original class —
 * all callers require zero changes.
 *
 * Façade pattern: hides LogicalChannelRepository, HardwareChannelRepository,
 * and MappingIndex behind a single, stable surface.
 * DIP: accepts collaborators via constructor for testability.
 */
export class ChannelManager {
  private logicalRepo: LogicalChannelRepository;
  private hardwareRepo: HardwareChannelRepository;
  private mappingIndex: MappingIndex;

  constructor(
    logicalRepo: LogicalChannelRepository = new LogicalChannelRepository(),
    hardwareRepo: HardwareChannelRepository = new HardwareChannelRepository(),
    mappingIndex: MappingIndex = new MappingIndex(),
  ) {
    this.logicalRepo = logicalRepo;
    this.hardwareRepo = hardwareRepo;
    this.mappingIndex = mappingIndex;
  }

  // ─── UML Aligned Methods ──────────────────────────────────────────────

  addChannel(channel: LogicalChannel | HardwareChannel): void {
    if (channel instanceof LogicalChannel) {
      this.addLogicalChannel(channel);
    } else {
      this.addHardwareChannel(channel);
    }
  }

  updateChannel(id: string, updates: Partial<LogicalChannel | HardwareChannel>): LogicalChannel | HardwareChannel {
    if (this.logicalRepo.get(id)) {
      return this.updateLogicalChannel(id, updates as Partial<LogicalChannel>);
    } else {
      return this.updateHardwareChannel(id, updates as Partial<HardwareChannel>);
    }
  }

  deleteChannel(id: string): void {
    if (this.logicalRepo.get(id)) {
      this.deleteLogicalChannel(id);
    } else {
      this.deleteHardwareChannel(id);
    }
  }

  // ─── Logical Channels ─────────────────────────────────────────────────

  addLogicalChannel(channel: LogicalChannel): void {
    this.logicalRepo.add(channel);
  }

  updateLogicalChannel(id: string, updates: Partial<LogicalChannel>): LogicalChannel {
    return this.logicalRepo.update(id, updates);
  }

  deleteLogicalChannel(id: string): void {
    const usedBy = this.mappingIndex.getMappingsForChannel(id);
    if (usedBy.size > 0) {
      throw new Error(`Cannot delete logical channel "${id}": it is used in ${usedBy.size} mapping(s). Remove mappings first.`);
    }
    this.logicalRepo.delete(id);
    this.mappingIndex.delete(id);
  }

  getLogicalChannel(id: string): LogicalChannel | undefined {
    return this.logicalRepo.get(id);
  }

  getAllLogicalChannels(): LogicalChannel[] {
    return this.logicalRepo.getAll();
  }

  findLogicalChannelByName(name: string): LogicalChannel | undefined {
    return this.logicalRepo.findByName(name);
  }

  // ─── Hardware Channels ────────────────────────────────────────────────

  addHardwareChannel(channel: HardwareChannel): void {
    this.hardwareRepo.add(channel);
  }

  updateHardwareChannel(id: string, updates: Partial<HardwareChannel>): HardwareChannel {
    return this.hardwareRepo.update(id, updates);
  }

  deleteHardwareChannel(id: string): void {
    const usedBy = this.mappingIndex.getMappingsForChannel(id);
    if (usedBy.size > 0) {
      throw new Error(`Cannot delete hardware channel "${id}": it is used in ${usedBy.size} mapping(s). Remove mappings first.`);
    }
    this.hardwareRepo.delete(id);
    this.mappingIndex.delete(id);
  }

  getHardwareChannel(id: string): HardwareChannel | undefined {
    return this.hardwareRepo.get(id);
  }

  getAllHardwareChannels(): HardwareChannel[] {
    return this.hardwareRepo.getAll();
  }

  findHardwareChannelByName(name: string): HardwareChannel | undefined {
    return this.hardwareRepo.findByName(name);
  }

  // ─── Mapping Index ────────────────────────────────────────────────────

  registerMappingForChannel(channelId: string, mappingId: string): void {
    this.mappingIndex.register(channelId, mappingId);
  }

  unregisterMappingForChannel(channelId: string, mappingId: string): void {
    this.mappingIndex.unregister(channelId, mappingId);
  }

  // ─── Hydration ────────────────────────────────────────────────────────

  hydrate(logicalChannels: LogicalChannel[], hardwareChannels: HardwareChannel[]): void {
    this.logicalRepo.hydrate(logicalChannels);
    this.hardwareRepo.hydrate(hardwareChannels);
    this.mappingIndex.clear();
  }
}
