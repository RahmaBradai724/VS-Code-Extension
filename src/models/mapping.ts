import { LogicalChannelCategory, HardwareChannelCategory } from './enums';

/**
 * Represents a mapping between a logical channel and a hardware channel.
 */
export class Mapping {
  mappingId: string;
  configurationId: string;
  logicalChannelId: string;
  logicalChannelName: string;
  hardwareChannelId: string;
  hardwareChannelName?: string;
  comment?: string;
  createdAt: string;
  // Protocol compatibility metadata (stored for validation)
  logicalChannelType?: LogicalChannelCategory;
  hardwareChannelType?: HardwareChannelCategory;

  constructor(
    mappingId: string,
    configurationId: string,
    logicalChannelId: string,
    logicalChannelName: string,
    hardwareChannelId: string,
  ) {
    this.mappingId = mappingId;
    this.configurationId = configurationId;
    this.logicalChannelId = logicalChannelId;
    this.logicalChannelName = logicalChannelName;
    this.hardwareChannelId = hardwareChannelId;
    this.createdAt = new Date().toISOString();
  }

  toYAML(): object {
    return {
      logicalChannel: this.logicalChannelName,
      hardwareChannel: this.hardwareChannelId,
    };
  }

  toJSON(): object {
    return {
      mappingId: this.mappingId,
      configurationId: this.configurationId,
      logicalChannelId: this.logicalChannelId,
      logicalChannelName: this.logicalChannelName,
      hardwareChannelId: this.hardwareChannelId,
      hardwareChannelName: this.hardwareChannelName,
      comment: this.comment,
      createdAt: this.createdAt,
      logicalChannelType: this.logicalChannelType,
      hardwareChannelType: this.hardwareChannelType,
    };
  }

  static fromJSON(data: any): Mapping {
    const m = new Mapping(
      data.mappingId, data.configurationId,
      data.logicalChannelId, data.logicalChannelName, data.hardwareChannelId,
    );
    m.hardwareChannelName = data.hardwareChannelName;
    m.comment = data.comment;
    m.createdAt = data.createdAt;
    m.logicalChannelType = data.logicalChannelType;
    m.hardwareChannelType = data.hardwareChannelType;
    return m;
  }
}
