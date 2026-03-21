"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mapping = void 0;
/**
 * Represents a mapping between a logical channel and a hardware channel.
 */
class Mapping {
    constructor(mappingId, configurationId, logicalChannelId, logicalChannelName, hardwareChannelId) {
        this.mappingId = mappingId;
        this.configurationId = configurationId;
        this.logicalChannelId = logicalChannelId;
        this.logicalChannelName = logicalChannelName;
        this.hardwareChannelId = hardwareChannelId;
        this.createdAt = new Date().toISOString();
    }
    toYAML() {
        return {
            logicalChannel: this.logicalChannelName,
            hardwareChannel: this.hardwareChannelId,
        };
    }
    toJSON() {
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
    static fromJSON(data) {
        const m = new Mapping(data.mappingId, data.configurationId, data.logicalChannelId, data.logicalChannelName, data.hardwareChannelId);
        m.hardwareChannelName = data.hardwareChannelName;
        m.comment = data.comment;
        m.createdAt = data.createdAt;
        m.logicalChannelType = data.logicalChannelType;
        m.hardwareChannelType = data.hardwareChannelType;
        return m;
    }
}
exports.Mapping = Mapping;
//# sourceMappingURL=mapping.js.map