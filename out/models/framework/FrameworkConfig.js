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
exports.FrameworkConfig = void 0;
const typeorm_1 = require("typeorm");
const PublisherConfig_1 = require("./PublisherConfig");
const DiagnosticsConfig_1 = require("./DiagnosticsConfig");
const EthernetConfig_1 = require("./EthernetConfig");
let FrameworkConfig = class FrameworkConfig {
    constructor() {
        this.keys = new Map();
        this.channels = new Map();
        this.publisherConfig = new PublisherConfig_1.PublisherConfig();
        this.diagnostics = new DiagnosticsConfig_1.DiagnosticsConfig();
        this.ethernetConfig = new EthernetConfig_1.EthernetConfig();
        /** Raw tracer data (JSONB cache – source of truth for runtime/globalState). */
        this.tracers = [];
        this.connectedEcus = [];
        this.channelToEcusMapping = new Map();
    }
    toYAML() {
        return {
            publisher: this.publisherConfig.toYAML(),
            diagnostics: this.diagnostics.toYAML(),
            ethernet: this.ethernetConfig.toYAML(),
        };
    }
    toJSON() {
        return {
            publisherConfig: this.publisherConfig.toJSON(),
            diagnostics: this.diagnostics.toJSON(),
            ethernetConfig: this.ethernetConfig.toJSON(),
            tracers: this.tracers ?? [],
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
    (0, typeorm_1.Column)(() => PublisherConfig_1.PublisherConfig),
    __metadata("design:type", PublisherConfig_1.PublisherConfig)
], FrameworkConfig.prototype, "publisherConfig", void 0);
__decorate([
    (0, typeorm_1.Column)(() => DiagnosticsConfig_1.DiagnosticsConfig),
    __metadata("design:type", DiagnosticsConfig_1.DiagnosticsConfig)
], FrameworkConfig.prototype, "diagnostics", void 0);
__decorate([
    (0, typeorm_1.Column)(() => EthernetConfig_1.EthernetConfig),
    __metadata("design:type", EthernetConfig_1.EthernetConfig)
], FrameworkConfig.prototype, "ethernetConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], FrameworkConfig.prototype, "tracers", void 0);
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
//# sourceMappingURL=FrameworkConfig.js.map