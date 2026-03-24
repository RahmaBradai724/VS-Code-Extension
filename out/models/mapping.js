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
var Mapping_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mapping = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("./enums");
const configuration_1 = require("./configuration");
/**
 * Represents a mapping between a logical channel and a hardware channel.
 */
let Mapping = Mapping_1 = class Mapping {
    constructor(mappingId, configurationId, logicalChannelId, logicalChannelName, hardwareChannelId, frameworkConfigId) {
        this.mappingId = mappingId;
        this.configurationId = configurationId;
        this.logicalChannelId = logicalChannelId;
        this.logicalChannelName = logicalChannelName;
        this.hardwareChannelId = hardwareChannelId;
        this.frameworkConfigId = frameworkConfigId;
        this.createdAt = new Date().toISOString();
    }
    toYAML() {
        return {
            logicalChannel: this.logicalChannelName,
            hardwareChannel: this.hardwareChannelId,
        };
    }
    toJSON() {
        return {
            mappingId: this.mappingId,
            configurationId: this.configurationId,
            logicalChannelId: this.logicalChannelId,
            logicalChannelName: this.logicalChannelName,
            hardwareChannelId: this.hardwareChannelId,
            frameworkConfigId: this.frameworkConfigId,
            hardwareChannelName: this.hardwareChannelName,
            comment: this.comment,
            createdAt: this.createdAt,
            logicalChannelType: this.logicalChannelType,
            hardwareChannelType: this.hardwareChannelType,
        };
    }
    static fromJSON(data) {
        const m = new Mapping_1(data.mappingId, data.configurationId, data.logicalChannelId, data.logicalChannelName, data.hardwareChannelId, data.frameworkConfigId);
        m.hardwareChannelName = data.hardwareChannelName;
        m.comment = data.comment;
        m.createdAt = data.createdAt;
        m.logicalChannelType = data.logicalChannelType;
        m.hardwareChannelType = data.hardwareChannelType;
        return m;
    }
};
exports.Mapping = Mapping;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Mapping.prototype, "mappingId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mapping.prototype, "frameworkConfigId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mapping.prototype, "configurationId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mapping.prototype, "logicalChannelId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mapping.prototype, "logicalChannelName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mapping.prototype, "hardwareChannelId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Mapping.prototype, "hardwareChannelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Mapping.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mapping.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Mapping.prototype, "logicalChannelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Mapping.prototype, "hardwareChannelType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => configuration_1.Configuration, (c) => c.mappings),
    (0, typeorm_1.JoinColumn)({ name: 'configurationId' }),
    __metadata("design:type", configuration_1.Configuration)
], Mapping.prototype, "configuration", void 0);
exports.Mapping = Mapping = Mapping_1 = __decorate([
    (0, typeorm_1.Entity)('mappings'),
    __metadata("design:paramtypes", [String, String, String, String, String, String])
], Mapping);
//# sourceMappingURL=mapping.js.map