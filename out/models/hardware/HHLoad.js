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
exports.HHLoad = void 0;
const typeorm_1 = require("typeorm");
const HardwareChannel_1 = require("../HardwareChannel");
const enums_1 = require("../enums");
// ─────────────────────────────────────────────
//  HHLoad Hardware Channel
// ─────────────────────────────────────────────
let HHLoad = class HHLoad extends HardwareChannel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.HH_LOAD, enums_1.HardwareChannelSubclass.HH_LOAD);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            maxLoad: this.maxLoad, deviceId: this.deviceId,
            portName: this.portName, bitRate: this.bitRate,
            loadType: this.loadType, flag: this.flag, channels: this.channels
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.HHLoad = HHLoad;
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], HHLoad.prototype, "maxLoad", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], HHLoad.prototype, "deviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HHLoad.prototype, "portName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], HHLoad.prototype, "flag", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], HHLoad.prototype, "bitRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HHLoad.prototype, "loadType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], HHLoad.prototype, "channels", void 0);
exports.HHLoad = HHLoad = __decorate([
    (0, typeorm_1.Entity)('hardware_hh_loads'),
    __metadata("design:paramtypes", [String, String])
], HHLoad);
//# sourceMappingURL=HHLoad.js.map