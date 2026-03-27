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
exports.FrameworkConfig = exports.DiagnosticsConfig = exports.EthernetConfig = exports.PublisherConfig = exports.ASCIITracer = exports.PCAPTracer = exports.Tracer = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("./enums");
const configuration_1 = require("./configuration");
// ─────────────────────────────────────────────
//  Tracer Models
// ─────────────────────────────────────────────
let Tracer = class Tracer {
    constructor(id, name, userId) {
        this.id = id;
        this.name = name;
        this.userId = userId;
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
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tracer.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => configuration_1.Configuration, (c) => c.frameworkConfig),
    (0, typeorm_1.JoinColumn)({ name: 'config_id' }),
    __metadata("design:type", configuration_1.Configuration)
], Tracer.prototype, "configuration", void 0);
exports.Tracer = Tracer = __decorate([
    (0, typeorm_1.Entity)('tracers'),
    (0, typeorm_1.TableInheritance)({ column: { type: 'varchar', name: 'type' } }),
    __metadata("design:paramtypes", [String, String, String])
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
let ASCIITracer = class ASCIITracer extends Tracer {
    constructor(id, name) {
        super(id, name);
        this.base = '';
        this.internalEventLogged = false;
        this.timeStampSetting = '';
        this.loggingType = 'ASCII';
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: 'ASCII',
            base: this.base, internalEventLogged: this.internalEventLogged,
            timeStampSetting: this.timeStampSetting, timestampPrecision: this.timestampPrecision
        };
    }
    toJSON() {
        return { ...this.toYAML(), loggingFileLong: this.loggingFileLong };
    }
};
exports.ASCIITracer = ASCIITracer;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ASCIITracer.prototype, "base", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], ASCIITracer.prototype, "internalEventLogged", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ASCIITracer.prototype, "timeStampSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ASCIITracer.prototype, "loggingFileLong", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], ASCIITracer.prototype, "timestampPrecision", void 0);
exports.ASCIITracer = ASCIITracer = __decorate([
    (0, typeorm_1.ChildEntity)('ASCII'),
    __metadata("design:paramtypes", [String, String])
], ASCIITracer);
// ─────────────────────────────────────────────
//  Publisher Config
// ─────────────────────────────────────────────
class PublisherConfig {
    constructor() {
        this.publisherType = enums_1.PublisherMode.SingleThreaded;
        this.channelsGroups = [];
    }
    toYAML() {
        return { type: this.publisherType, channelsGroups: this.channelsGroups };
    }
    toJSON() {
        return { publisherType: this.publisherType, topicCancel: this.topicCancel, channelsGroups: this.channelsGroups };
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
], PublisherConfig.prototype, "channelsGroups", void 0);
// ─────────────────────────────────────────────
//  Ethernet Config
// ─────────────────────────────────────────────
class EthernetConfig {
    toYAML() {
        return {
            autoDetectEthSettings: this.autoDetectEthSettings,
            protocol: this.protocol,
            appLayerPorts: this.appLayerPorts,
            considerOnlyEthernetTopologyEcus: this.considerOnlyEthernetTopologyEcus,
            npduConfig: this.npduConfig,
            someIPConfig: this.someIPConfig
        };
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
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetConfig.prototype, "considerOnlyEthernetTopologyEcus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], EthernetConfig.prototype, "npduConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], EthernetConfig.prototype, "someIPConfig", void 0);
// ─────────────────────────────────────────────
//  Diagnostics Config
// ─────────────────────────────────────────────
class DiagnosticsConfig {
    constructor() {
        this.ecuIpAddress = '';
        this.testerIpAddress = '';
        this.protocol = '';
        this.netId = '';
    }
    toYAML() {
        return { ecuIpAddress: this.ecuIpAddress, testerIpAddress: this.testerIpAddress, protocol: this.protocol, netId: this.netId };
    }
    toJSON() {
        return { ...this };
    }
}
exports.DiagnosticsConfig = DiagnosticsConfig;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "ecuIpAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "testerIpAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "protocol", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "netId", void 0);
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
        this.publisherConfig = new PublisherConfig();
        this.diagnostics = new DiagnosticsConfig();
        this.ethernetConfig = new EthernetConfig();
        this.connectedEcus = [];
        this.channelToEcusMapping = new Map();
    }
    toYAML() {
        const tracers = this.tracing ? this.tracing.map(t => t.toYAML()) : [];
        return {
            publisher: this.publisherConfig.toYAML(),
            diagnostics: this.diagnostics.toYAML(),
            ethernet: this.ethernetConfig.toYAML(),
            tracing: tracers,
        };
    }
    toJSON() {
        return {
            publisherConfig: this.publisherConfig.toJSON(),
            diagnostics: this.diagnostics.toJSON(),
            ethernetConfig: this.ethernetConfig.toJSON(),
            tracing: this.tracing ? this.tracing.map(t => t.toJSON()) : [],
            connectedEcus: this.connectedEcus,
            servicePack: this.servicePack,
            channelToEcusMapping: this.channelToEcusMapping instanceof Map ? Object.fromEntries(this.channelToEcusMapping) : this.channelToEcusMapping,
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
], FrameworkConfig.prototype, "publisherConfig", void 0);
__decorate([
    (0, typeorm_1.Column)(() => DiagnosticsConfig),
    __metadata("design:type", DiagnosticsConfig)
], FrameworkConfig.prototype, "diagnostics", void 0);
__decorate([
    (0, typeorm_1.Column)(() => EthernetConfig),
    __metadata("design:type", EthernetConfig)
], FrameworkConfig.prototype, "ethernetConfig", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Tracer, (t) => t.configuration),
    __metadata("design:type", Array)
], FrameworkConfig.prototype, "tracing", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], FrameworkConfig.prototype, "connectedEcus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FrameworkConfig.prototype, "servicePack", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Map)
], FrameworkConfig.prototype, "channelToEcusMapping", void 0);
exports.FrameworkConfig = FrameworkConfig = __decorate([
    (0, typeorm_1.Entity)('framework_configs')
], FrameworkConfig);
//# sourceMappingURL=frameworkConfig.js.map