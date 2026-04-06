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
exports.BTSRevo = void 0;
const typeorm_1 = require("typeorm");
const HardwareChannel_1 = require("../HardwareChannel");
const enums_1 = require("../enums");
let BTSRevo = class BTSRevo extends HardwareChannel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.BTS_REVO, enums_1.HardwareChannelSubclass.BTS_REVO);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, subclass: this.subclass,
            boardId: this.boardId, addressPrefix: this.addressPrefix, ethernetPort: this.ethernetPort,
        };
    }
    toJSON() {
        return {
            id: this.id, name: this.name, type: this.type,
            category: this.category, subclass: this.subclass,
            boardId: this.boardId, addressPrefix: this.addressPrefix, ethernetPort: this.ethernetPort,
        };
    }
};
exports.BTSRevo = BTSRevo;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], BTSRevo.prototype, "boardId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BTSRevo.prototype, "addressPrefix", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], BTSRevo.prototype, "ethernetPort", void 0);
exports.BTSRevo = BTSRevo = __decorate([
    (0, typeorm_1.Entity)('hardware_bts_revo'),
    __metadata("design:paramtypes", [String, String])
], BTSRevo);
//# sourceMappingURL=BTSRevo.js.map