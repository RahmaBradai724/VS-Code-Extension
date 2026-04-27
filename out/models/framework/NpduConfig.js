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
exports.NpduConfig = void 0;
const typeorm_1 = require("typeorm");
let NpduConfig = class NpduConfig {
    toYAML() {
        const out = {};
        if (this.manageVlansInCom !== undefined)
            out.ManageVlansInCom = this.manageVlansInCom;
        if (this.restrictNPduChannelsInCom !== undefined)
            out.RestrictNPduChannelsInCom = this.restrictNPduChannelsInCom;
        if (this.ipMacTable?.length)
            out.IPMacTable = this.ipMacTable;
        if (this.vlans)
            out.VLans = this.vlans;
        return out;
    }
    /** Returns PascalCase shape matching the old jsonb blob so the webview sees the same data */
    toJSON() {
        return {
            ManageVlansInCom: this.manageVlansInCom,
            RestrictNPduChannelsInCom: this.restrictNPduChannelsInCom,
            IPMacTable: this.ipMacTable,
            VLans: this.vlans,
        };
    }
};
exports.NpduConfig = NpduConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], NpduConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)('EthernetConfig', 'npduConfig'),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Object)
], NpduConfig.prototype, "ethernetConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], NpduConfig.prototype, "frameworkConfigId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], NpduConfig.prototype, "manageVlansInCom", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], NpduConfig.prototype, "restrictNPduChannelsInCom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], NpduConfig.prototype, "ipMacTable", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], NpduConfig.prototype, "vlans", void 0);
exports.NpduConfig = NpduConfig = __decorate([
    (0, typeorm_1.Entity)('npdu_configs')
], NpduConfig);
//# sourceMappingURL=NpduConfig.js.map