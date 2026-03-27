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
exports.HardwareChannel = void 0;
const typeorm_1 = require("typeorm");
const ChannelBase_1 = require("./ChannelBase");
const enums_1 = require("./enums");
/**
 * Abstract base class for all hardware channels.
 */
class HardwareChannel extends ChannelBase_1.Channel {
    constructor(id, name, category, subclass) {
        super(id, name, enums_1.ChannelType.HARDWARE);
        this.category = category;
        this.subclass = subclass;
    }
    getStatus() {
        return this.status || 'Unknown';
    }
    setStatus(status) {
        this.status = status;
    }
}
exports.HardwareChannel = HardwareChannel;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], HardwareChannel.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], HardwareChannel.prototype, "subclass", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HardwareChannel.prototype, "status", void 0);
//# sourceMappingURL=HardwareChannel.js.map