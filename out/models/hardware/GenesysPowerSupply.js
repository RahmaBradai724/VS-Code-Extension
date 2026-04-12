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
exports.GenesysPowerSupply = void 0;
const typeorm_1 = require("typeorm");
const HardwareChannel_1 = require("../HardwareChannel");
const enums_1 = require("../enums");
let GenesysPowerSupply = class GenesysPowerSupply extends HardwareChannel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.GENESYS_PS, enums_1.HardwareChannelSubclass.GENESYS_PS);
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, subclass: this.subclass,
            channelName: this.channelName,
            defaultVoltage: this.defaultVoltage,
            maxVoltage: this.maxVoltage,
            defaultMaxCurrent: this.defaultMaxCurrent,
            samplingInterval: this.samplingInterval,
            communicationProtocol: this.communicationProtocol,
            portName: this.portName,
            bitRate: this.bitRate,
            ip: this.ip,
            port: this.port,
            language: this.language,
            continuousMonitoringActive: this.continuousMonitoringActive,
            keepStatus: this.keepStatus,
        };
    }
    toJSON() { return this.toYAML(); }
};
exports.GenesysPowerSupply = GenesysPowerSupply;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GenesysPowerSupply.prototype, "channelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], GenesysPowerSupply.prototype, "defaultVoltage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], GenesysPowerSupply.prototype, "maxVoltage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], GenesysPowerSupply.prototype, "defaultMaxCurrent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], GenesysPowerSupply.prototype, "samplingInterval", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GenesysPowerSupply.prototype, "communicationProtocol", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GenesysPowerSupply.prototype, "portName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], GenesysPowerSupply.prototype, "bitRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GenesysPowerSupply.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], GenesysPowerSupply.prototype, "port", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GenesysPowerSupply.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], GenesysPowerSupply.prototype, "continuousMonitoringActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], GenesysPowerSupply.prototype, "keepStatus", void 0);
exports.GenesysPowerSupply = GenesysPowerSupply = __decorate([
    (0, typeorm_1.Entity)('hardware_genesys_ps'),
    __metadata("design:paramtypes", [String, String])
], GenesysPowerSupply);
//# sourceMappingURL=GenesysPowerSupply.js.map