"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardwareChannel = exports.LogicalChannel = exports.Channel = void 0;
/**
 * Abstract base class for all channels.
 */
class Channel {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
exports.Channel = Channel;
/**
 * Abstract base class for all logical channels.
 */
class LogicalChannel extends Channel {
    constructor(id, name, type) {
        super(id, name);
        this.type = type;
    }
}
exports.LogicalChannel = LogicalChannel;
/**
 * Abstract base class for all hardware channels.
 */
class HardwareChannel extends Channel {
    constructor(id, name, type) {
        super(id, name);
        this.type = type;
    }
}
exports.HardwareChannel = HardwareChannel;
//# sourceMappingURL=channel.js.map