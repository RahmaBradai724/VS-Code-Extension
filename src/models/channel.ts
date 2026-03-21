import { LogicalChannelCategory, HardwareChannelCategory } from './enums';

/**
 * Abstract base class for all channels.
 */
export abstract class Channel {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  abstract toYAML(): object;
  abstract toJSON(): object;
}

/**
 * Abstract base class for all logical channels.
 */
export abstract class LogicalChannel extends Channel {
  type: LogicalChannelCategory;
  category?: string;

  constructor(id: string, name: string, type: LogicalChannelCategory) {
    super(id, name);
    this.type = type;
  }
}

/**
 * Abstract base class for all hardware channels.
 */
export abstract class HardwareChannel extends Channel {
  type: HardwareChannelCategory;

  constructor(id: string, name: string, type: HardwareChannelCategory) {
    super(id, name);
    this.type = type;
  }

  // Called before deletion — checks if mappings exist for this channel
  abstract canDelete(mappingIds: string[]): boolean;
}
