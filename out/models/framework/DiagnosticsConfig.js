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
exports.DiagnosticsConfig = void 0;
const typeorm_1 = require("typeorm");
class DiagnosticsConfig {
    constructor() {
        this.ecuIpAddress = '';
        this.testerIpAddress = '';
        this.protocol = '';
        this.netId = '';
    }
    toYAML() {
        return { ecuIpAddress: this.ecuIpAddress, testerIpAddress: this.testerIpAddress, protocol: this.protocol, netId: this.netId };
    }
    toJSON() {
        return { ...this };
    }
}
exports.DiagnosticsConfig = DiagnosticsConfig;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "ecuIpAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "testerIpAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "protocol", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "netId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DiagnosticsConfig.prototype, "rai", void 0);
//# sourceMappingURL=DiagnosticsConfig.js.map