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
exports.EthernetConfig = void 0;
const typeorm_1 = require("typeorm");
const NpduConfig_1 = require("./NpduConfig");
const SomeIPConfig_1 = require("./SomeIPConfig");
const AppLayerPortsConfig_1 = require("./AppLayerPortsConfig");
const EthernetTopology_1 = require("./EthernetTopology");
const ChannelEcuMapping_1 = require("./ChannelEcuMapping");
let EthernetConfig = class EthernetConfig {
    toYAML() {
        return {
            autoDetectEthSettings: this.autoDetectEthSettings,
            protocol: this.protocol,
            considerOnlyEthernetTopologyEcus: this.considerOnlyEthernetTopologyEcus,
        };
    }
    toJSON() {
        const channelToEcusMapping = this.channelEcuMappings?.length
            ? Object.fromEntries(this.channelEcuMappings.map(m => [m.channelName, m.ecus]))
            : undefined;
        return {
            id: this.id,
            autoDetectEthSettings: this.autoDetectEthSettings,
            maxDataCols: this.maxDataCols,
            protocol: this.protocol,
            build: this.build,
            considerOnlyEthernetTopologyEcus: this.considerOnlyEthernetTopologyEcus,
            npduConfig: this.npduConfig?.toJSON(),
            someIPConfig: this.someIPConfig?.toJSON(),
            // "appLayerPorts" key kept for webview compatibility
            appLayerPorts: this.appLayerPortsConfig?.toJSON(),
            ethernetTopology: this.ethernetTopology?.toJSON(),
            channelToEcusMapping,
        };
    }
};
exports.EthernetConfig = EthernetConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EthernetConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)('FrameworkConfig', 'ethernetConfig'),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Function)
], EthernetConfig.prototype, "frameworkConfig", void 0);
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
    __metadata("design:type", Boolean)
], EthernetConfig.prototype, "considerOnlyEthernetTopologyEcus", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => NpduConfig_1.NpduConfig, 'ethernetConfig', { cascade: true, eager: true, nullable: true }),
    __metadata("design:type", NpduConfig_1.NpduConfig)
], EthernetConfig.prototype, "npduConfig", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => SomeIPConfig_1.SomeIPConfig, 'ethernetConfig', { cascade: true, eager: true, nullable: true }),
    __metadata("design:type", SomeIPConfig_1.SomeIPConfig)
], EthernetConfig.prototype, "someIPConfig", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => AppLayerPortsConfig_1.AppLayerPortsConfig, 'ethernetConfig', { cascade: true, eager: true, nullable: true }),
    __metadata("design:type", AppLayerPortsConfig_1.AppLayerPortsConfig)
], EthernetConfig.prototype, "appLayerPortsConfig", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => EthernetTopology_1.EthernetTopology, 'ethernetConfig', { cascade: true, eager: true, nullable: true }),
    __metadata("design:type", EthernetTopology_1.EthernetTopology)
], EthernetConfig.prototype, "ethernetTopology", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ChannelEcuMapping_1.ChannelEcuMapping, (m) => m.ethernetConfig, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], EthernetConfig.prototype, "channelEcuMappings", void 0);
exports.EthernetConfig = EthernetConfig = __decorate([
    (0, typeorm_1.Entity)('ethernet_configs')
], EthernetConfig);
//# sourceMappingURL=EthernetConfig.js.map