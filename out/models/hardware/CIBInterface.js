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
exports.CIBInterface = void 0;
const typeorm_1 = require("typeorm");
const HardwareChannel_1 = require("../HardwareChannel");
const enums_1 = require("../enums");
// ─────────────────────────────────────────────
//  CIB Interface Hardware Channel (CM CAN_Combo)
// ─────────────────────────────────────────────
let CIBInterface = class CIBInterface extends HardwareChannel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.CAN_INTERFACE, enums_1.HardwareChannelSubclass.CIB_INTERFACE);
        this.cmId = 0;
        this.cmType = 'CAN_Combo';
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return { id: this.id, name: this.name, subclass: this.subclass, cmId: this.cmId, cmType: this.cmType, bitRate: this.bitRate };
    }
    toJSON() {
        return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, cmId: this.cmId, cmType: this.cmType, bitRate: this.bitRate };
    }
};
exports.CIBInterface = CIBInterface;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CIBInterface.prototype, "cmId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CIBInterface.prototype, "cmType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CIBInterface.prototype, "bitRate", void 0);
exports.CIBInterface = CIBInterface = __decorate([
    (0, typeorm_1.Entity)('hardware_cib_interfaces'),
    __metadata("design:paramtypes", [String, String])
], CIBInterface);
//# sourceMappingURL=CIBInterface.js.map