"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameworkConfig = exports.DiagnosticsConfig = exports.EthernetConfig = exports.PublisherConfig = exports.ABCFTracer = exports.PCAPTracer = exports.Tracer = void 0;
const enums_1 = require("./enums");
// ─────────────────────────────────────────────
//  Tracer Models
// ─────────────────────────────────────────────
class Tracer {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
exports.Tracer = Tracer;
class PCAPTracer extends Tracer {
    constructor(id, name) {
        super(id, name);
        this.loggingFilePath = '';
        this.loggingType = 'PCAP';
    }
    toYAML() {
        return { id: this.id, name: this.name, type: 'PCAP', loggingFilePath: this.loggingFilePath };
    }
    toJSON() {
        return { id: this.id, name: this.name, type: 'PCAP', loggingFilePath: this.loggingFilePath, loggingFileLong: this.loggingFileLong };
    }
}
exports.PCAPTracer = PCAPTracer;
class ABCFTracer extends Tracer {
    constructor(id, name) {
        super(id, name);
        this.base = '';
        this.loggingType = 'ABCF';
    }
    toYAML() {
        return { id: this.id, name: this.name, type: 'ABCF', base: this.base, timestampPrecision: this.timestampPrecision };
    }
    toJSON() {
        return { ...this.toYAML(), loggingFileLong: this.loggingFileLong };
    }
}
exports.ABCFTracer = ABCFTracer;
// ─────────────────────────────────────────────
//  Publisher Config
// ─────────────────────────────────────────────
class PublisherConfig {
    constructor() {
        this.publisherType = enums_1.PublisherMode.SingleThreaded;
        this.channelGroups = [];
    }
    toYAML() {
        return { type: this.publisherType, channelGroups: this.channelGroups };
    }
    toJSON() {
        return { publisherType: this.publisherType, topicCancel: this.topicCancel, channelGroups: this.channelGroups };
    }
}
exports.PublisherConfig = PublisherConfig;
// ─────────────────────────────────────────────
//  Ethernet Config
// ─────────────────────────────────────────────
class EthernetConfig {
    toYAML() {
        return { autoDetectEthSettings: this.autoDetectEthSettings, protocol: this.protocol, appLayerPort: this.appLayerPort };
    }
    toJSON() {
        return { ...this };
    }
}
exports.EthernetConfig = EthernetConfig;
// ─────────────────────────────────────────────
//  Diagnostics Config
// ─────────────────────────────────────────────
class DiagnosticsConfig {
    constructor() {
        this.ecuAddress = '';
        this.testerAddress = '';
        this.protocol = '';
        this.build = '';
    }
    toYAML() {
        return { ecuAddress: this.ecuAddress, testerAddress: this.testerAddress, protocol: this.protocol };
    }
    toJSON() {
        return { ...this };
    }
}
exports.DiagnosticsConfig = DiagnosticsConfig;
// ─────────────────────────────────────────────
//  Framework Config
// ─────────────────────────────────────────────
class FrameworkConfig {
    constructor() {
        this.keys = new Map();
        this.channels = new Map();
        this.publisher = new PublisherConfig();
        this.diagnostics = new DiagnosticsConfig();
        this.ethernet = new EthernetConfig();
        this.tracing = [];
        this.serverUrls = '';
        this.channelListMapping = new Map();
    }
    toYAML() {
        const tracers = this.tracing.map(t => t.toYAML());
        return {
            publisher: this.publisher.toYAML(),
            diagnostics: this.diagnostics.toYAML(),
            ethernet: this.ethernet.toYAML(),
            tracing: tracers,
        };
    }
    toJSON() {
        return {
            keys: Object.fromEntries(this.keys),
            channels: Object.fromEntries(this.channels),
            publisher: this.publisher.toJSON(),
            diagnostics: this.diagnostics.toJSON(),
            ethernet: this.ethernet.toJSON(),
            tracing: this.tracing.map(t => t.toJSON()),
            serverUrls: this.serverUrls,
        };
    }
}
exports.FrameworkConfig = FrameworkConfig;
//# sourceMappingURL=frameworkConfig.js.map