"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
const frameworkConfig_1 = require("./frameworkConfig");
/**
 * Top-level configuration entity.
 */
class Configuration {
    constructor(configId, name, userId) {
        this.logicalChannels = [];
        this.hardwareChannels = [];
        this.mappings = [];
        this.frameworkConfig = new frameworkConfig_1.FrameworkConfig();
        this.configId = configId;
        this.name = name;
        this.userId = userId;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
    touch() {
        this.updatedAt = new Date().toISOString();
    }
    toJSON() {
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
exports.Configuration = Configuration;
//# sourceMappingURL=configuration.js.map