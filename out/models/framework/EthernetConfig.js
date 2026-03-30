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
//# sourceMappingURL=EthernetConfig.js.map