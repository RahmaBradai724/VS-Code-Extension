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
exports.MansonPowerSupply = void 0;
const typeorm_1 = require("typeorm");
const HardwareChannel_1 = require("../HardwareChannel");
const enums_1 = require("../enums");
let MansonPowerSupply = class MansonPowerSupply extends HardwareChannel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.MANSON_PS, enums_1.HardwareChannelSubclass.MANSON_PS);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, subclass: this.subclass,
            channelName: this.channelName,
            portName: this.portName,
            bitRate: this.bitRate,
            maxVoltage: this.maxVoltage,
            maxCurrent: this.maxCurrent,
            defaultVoltage: this.defaultVoltage,
            keepStatus: this.keepStatus,
            continuousRead: this.continuousRead,
            continuousReadingInterval: this.continuousReadingInterval,
        };
    }
    toJSON() { return this.toYAML(); }
};
exports.MansonPowerSupply = MansonPowerSupply;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MansonPowerSupply.prototype, "channelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MansonPowerSupply.prototype, "portName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MansonPowerSupply.prototype, "bitRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MansonPowerSupply.prototype, "maxVoltage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MansonPowerSupply.prototype, "maxCurrent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MansonPowerSupply.prototype, "defaultVoltage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], MansonPowerSupply.prototype, "keepStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], MansonPowerSupply.prototype, "continuousRead", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MansonPowerSupply.prototype, "continuousReadingInterval", void 0);
exports.MansonPowerSupply = MansonPowerSupply = __decorate([
    (0, typeorm_1.Entity)('hardware_manson_ps'),
    __metadata("design:paramtypes", [String, String])
], MansonPowerSupply);
//# sourceMappingURL=MansonPowerSupply.js.map