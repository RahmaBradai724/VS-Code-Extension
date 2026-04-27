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
exports.EthernetTopology = void 0;
const typeorm_1 = require("typeorm");
let EthernetTopology = class EthernetTopology {
    toYAML() {
        const out = {};
        if (this.ethProtoPrioConfig?.length)
            out.EthProtoPrioConfig = this.ethProtoPrioConfig;
        if (this.topologyConfig?.length)
            out.TopologyConfig = this.topologyConfig;
        return out;
    }
    /** Returns PascalCase shape matching the old jsonb blob so the webview sees the same data */
    toJSON() {
        return {
            EthProtoPrioConfig: this.ethProtoPrioConfig,
            TopologyConfig: this.topologyConfig,
        };
    }
};
exports.EthernetTopology = EthernetTopology;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EthernetTopology.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)('EthernetConfig', 'ethernetTopology'),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Object)
], EthernetTopology.prototype, "ethernetConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], EthernetTopology.prototype, "frameworkConfigId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], EthernetTopology.prototype, "ethProtoPrioConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], EthernetTopology.prototype, "topologyConfig", void 0);
exports.EthernetTopology = EthernetTopology = __decorate([
    (0, typeorm_1.Entity)('ethernet_topologies')
], EthernetTopology);
//# sourceMappingURL=EthernetTopology.js.map