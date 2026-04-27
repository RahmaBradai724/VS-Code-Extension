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
const EthernetConfig_1 = require("./EthernetConfig");
const PCAPTracer_1 = require("./PCAPTracer");
const ASCIITracer_1 = require("./ASCIITracer");
let FrameworkConfig = class FrameworkConfig {
    constructor() {
        this.keys = new Map();
        this.channels = new Map();
        this.connectedEcus = [];
    }
    toYAML() {
        return {
            publisher: this.publisherConfig?.toYAML(),
            ethernet: this.ethernetConfig?.toYAML(),
        };
    }
    toJSON() {
        return {
            publisherConfig: this.publisherConfig?.toJSON(),
            ethernetConfig: this.ethernetConfig?.toJSON(),
            tracers: [
                ...(this.pcapTracers ?? []).map((t) => t.toJSON()),
                ...(this.asciiTracers ?? []).map((t) => t.toJSON()),
            ],
            connectedEcus: this.connectedEcus,
            servicePack: this.servicePack,
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
    (0, typeorm_1.OneToOne)(() => PublisherConfig_1.PublisherConfig, (pc) => pc.frameworkConfig, { cascade: true, eager: true, nullable: true }),
    __metadata("design:type", PublisherConfig_1.PublisherConfig)
], FrameworkConfig.prototype, "publisherConfig", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => EthernetConfig_1.EthernetConfig, (ec) => ec.frameworkConfig, { cascade: true, eager: true, nullable: true }),
    __metadata("design:type", EthernetConfig_1.EthernetConfig)
], FrameworkConfig.prototype, "ethernetConfig", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PCAPTracer_1.PCAPTracer, (t) => t.frameworkConfig, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], FrameworkConfig.prototype, "pcapTracers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ASCIITracer_1.ASCIITracer, (t) => t.frameworkConfig, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], FrameworkConfig.prototype, "asciiTracers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], FrameworkConfig.prototype, "connectedEcus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FrameworkConfig.prototype, "servicePack", void 0);
exports.FrameworkConfig = FrameworkConfig = __decorate([
    (0, typeorm_1.Entity)('framework_configs')
], FrameworkConfig);
//# sourceMappingURL=FrameworkConfig.js.map