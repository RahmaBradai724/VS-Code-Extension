import { LogicalChannel } from './channel';
import { HardwareChannel } from './channel';
import { FrameworkConfig } from './frameworkConfig';
import { Mapping } from './mapping';
import { User } from './user';

/**
 * Top-level configuration entity.
 */
export class Configuration {
  configId: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;

  logicalChannels: LogicalChannel[] = [];
  hardwareChannels: HardwareChannel[] = [];
  mappings: Mapping[] = [];
  frameworkConfig: FrameworkConfig = new FrameworkConfig();

  constructor(configId: string, name: string, userId: string) {
    this.configId = configId;
    this.name = name;
    this.userId = userId;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  touch() {
    this.updatedAt = new Date().toISOString();
  }

  toJSON(): object {
    return {
      configId: this.configId,
      name: this.name,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      logicalChannels: this.logicalChannels.map(c => c.toJSON()),
      hardwareChannels: this.hardwareChannels.map(c => c.toJSON()),
      mappings: this.mappings.map(m => m.toJSON()),
      frameworkConfig: this.frameworkConfig.toJSON(),
    };
  }
}
