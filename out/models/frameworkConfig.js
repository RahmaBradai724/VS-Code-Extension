"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameworkConfig = exports.DiagnosticsConfig = exports.EthernetConfig = exports.PublisherConfig = exports.ABCFTracer = exports.PCAPTracer = exports.Tracer = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("./enums");
const configuration_1 = require("./configuration");
// ─────────────────────────────────────────────
//  Tracer Models
// ─────────────────────────────────────────────
let Tracer = class Tracer {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
};
exports.Tracer = Tracer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Tracer.prototype, "id_internal", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tracer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tracer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tracer.prototype, "loggingType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => configuration_1.Configuration, (c) => c.frameworkConfig),
    (0, typeorm_1.JoinColumn)({ name: 'config_id' }),
    __metadata("design:type", configuration_1.Configuration)
], Tracer.prototype, "configuration", void 0);
exports.Tracer = Tracer = __decorate([
    (0, typeorm_1.Entity)('tracers'),
    (0, typeorm_1.TableInheritance)({ column: { type: 'varchar', name: 'type' } }),
    __metadata("design:paramtypes", [String, String])
], Tracer);
let PCAPTracer = class PCAPTracer extends Tracer {
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
};
exports.PCAPTracer = PCAPTracer;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PCAPTracer.prototype, "loggingFilePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PCAPTracer.prototype, "loggingFileLong", void 0);
exports.PCAPTracer = PCAPTracer = __decorate([
    (0, typeorm_1.ChildEntity)('PCAP'),
    __metadata("design:paramtypes", [String, String])
], PCAPTracer);
let ABCFTracer = class ABCFTracer extends Tracer {
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
};
exports.ABCFTracer = ABCFTracer;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ABCFTracer.prototype, "base", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ABCFTracer.prototype, "loggingFileLong", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], ABCFTracer.prototype, "timestampPrecision", void 0);
exports.ABCFTracer = ABCFTracer = __decorate([
    (0, typeorm_1.ChildEntity)('ABCF'),
    __metadata("design:paramtypes", [String, String])
], ABCFTracer);
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
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PublisherConfig.prototype, "publisherType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PublisherConfig.prototype, "topicCancel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], PublisherConfig.prototype, "channelGroups", void 0);
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
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetConfig.prototype, "autoDetectEthSettings", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetConfig.prototype, "maxDataCols", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetConfig.prototype, "protocol", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetConfig.prototype, "build", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], EthernetConfig.prototype, "appLayerPort", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], EthernetConfig.prototype, "appLayerPorts", void 0);
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
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "ecuAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "testerAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "protocol", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "build", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "rai", void 0);
// ─────────────────────────────────────────────
//  Framework Config
// ─────────────────────────────────────────────
let FrameworkConfig = class FrameworkConfig {
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
};
exports.FrameworkConfig = FrameworkConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FrameworkConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Map)
], FrameworkConfig.prototype, "keys", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Map)
], FrameworkConfig.prototype, "channels", void 0);
__decorate([
    (0, typeorm_1.Column)(() => PublisherConfig),
    __metadata("design:type", PublisherConfig)
], FrameworkConfig.prototype, "publisher", void 0);
__decorate([
    (0, typeorm_1.Column)(() => DiagnosticsConfig),
    __metadata("design:type", DiagnosticsConfig)
], FrameworkConfig.prototype, "diagnostics", void 0);
__decorate([
    (0, typeorm_1.Column)(() => EthernetConfig),
    __metadata("design:type", EthernetConfig)
], FrameworkConfig.prototype, "ethernet", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Tracer, (t) => t.configuration),
    __metadata("design:type", Array)
], FrameworkConfig.prototype, "tracing", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FrameworkConfig.prototype, "serverUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Map)
], FrameworkConfig.prototype, "channelListMapping", void 0);
exports.FrameworkConfig = FrameworkConfig = __decorate([
    (0, typeorm_1.Entity)('framework_configs')
], FrameworkConfig);
//# sourceMappingURL=frameworkConfig.js.map