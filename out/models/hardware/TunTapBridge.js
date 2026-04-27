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
exports.TunTapBridge = void 0;
const typeorm_1 = require("typeorm");
const HardwareChannel_1 = require("../HardwareChannel");
const enums_1 = require("../enums");
let TunTapBridge = class TunTapBridge extends HardwareChannel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.TUNTAP_BRIDGE, enums_1.HardwareChannelSubclass.TUNTAP_BRIDGE);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            category: this.category,
            subclass: this.subclass,
            physicalAdapterName: this.physicalAdapterName,
            tunTapAdapters: this.tunTapAdapters,
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.TunTapBridge = TunTapBridge;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TunTapBridge.prototype, "physicalAdapterName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], TunTapBridge.prototype, "tunTapAdapters", void 0);
exports.TunTapBridge = TunTapBridge = __decorate([
    (0, typeorm_1.Entity)('hardware_tuntap_bridges'),
    __metadata("design:paramtypes", [String, String])
], TunTapBridge);
//# sourceMappingURL=TunTapBridge.js.map