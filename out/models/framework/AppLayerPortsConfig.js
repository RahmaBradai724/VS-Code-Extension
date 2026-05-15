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
exports.AppLayerPortsConfig = void 0;
const typeorm_1 = require("typeorm");
/** Stores MTF AppLayerPorts – each field is a list of ports and/or port ranges */
let AppLayerPortsConfig = class AppLayerPortsConfig {
    toYAML() {
        const out = {};
        if (this.nPdu != null)
            out.NPdu = this.nPdu;
        if (this.someIp != null)
            out.SomeIp = this.someIp;
        if (this.udpNm != null)
            out.UDPNM = this.udpNm;
        if (this.dlt != null)
            out.DLT = this.dlt;
        if (this.someIpSD != null)
            out.SomeIpSD = this.someIpSD;
        return out;
    }
    /** Returns PascalCase shape matching the old jsonb blob so the webview sees the same data */
    toJSON() {
        return {
            NPdu: this.nPdu,
            SomeIp: this.someIp,
            UDPNM: this.udpNm,
            DLT: this.dlt,
            SomeIpSD: this.someIpSD,
        };
    }
};
exports.AppLayerPortsConfig = AppLayerPortsConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AppLayerPortsConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)('EthernetConfig', 'appLayerPortsConfig'),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Object)
], AppLayerPortsConfig.prototype, "ethernetConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AppLayerPortsConfig.prototype, "frameworkConfigId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], AppLayerPortsConfig.prototype, "nPdu", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], AppLayerPortsConfig.prototype, "someIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], AppLayerPortsConfig.prototype, "udpNm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], AppLayerPortsConfig.prototype, "dlt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], AppLayerPortsConfig.prototype, "someIpSD", void 0);
exports.AppLayerPortsConfig = AppLayerPortsConfig = __decorate([
    (0, typeorm_1.Entity)('app_layer_ports_configs')
], AppLayerPortsConfig);
//# sourceMappingURL=AppLayerPortsConfig.js.map