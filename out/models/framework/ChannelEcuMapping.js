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
exports.ChannelEcuMapping = void 0;
const typeorm_1 = require("typeorm");
/** One row per channel in the EthernetConfig.ChannelToEcusMapping */
let ChannelEcuMapping = class ChannelEcuMapping {
    constructor() {
        /** List of ECU names associated with this channel */
        this.ecus = [];
    }
    toJSON() {
        return { channelName: this.channelName, ecus: this.ecus };
    }
};
exports.ChannelEcuMapping = ChannelEcuMapping;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ChannelEcuMapping.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('EthernetConfig', 'channelEcuMappings', { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Object)
], ChannelEcuMapping.prototype, "ethernetConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ChannelEcuMapping.prototype, "frameworkConfigId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ChannelEcuMapping.prototype, "channelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], ChannelEcuMapping.prototype, "ecus", void 0);
exports.ChannelEcuMapping = ChannelEcuMapping = __decorate([
    (0, typeorm_1.Entity)('channel_ecu_mappings')
], ChannelEcuMapping);
//# sourceMappingURL=ChannelEcuMapping.js.map