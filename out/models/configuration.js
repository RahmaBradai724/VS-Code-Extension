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
exports.Configuration = void 0;
const typeorm_1 = require("typeorm");
const frameworkConfig_1 = require("./frameworkConfig");
const mapping_1 = require("./mapping");
const user_1 = require("./user");
/**
 * Top-level configuration entity.
 */
let Configuration = class Configuration {
    // ✅ Constructor accepts string | number | null and converts safely
    constructor(id, name, userId) {
        this.logicalChannels = [];
        this.hardwareChannels = [];
        this.id = id;
        this.name = name;
        if (userId === null || userId === undefined || userId === '') {
            this.userId = null;
        }
        else {
            const n = Number(userId);
            this.userId = isNaN(n) ? null : n;
        }
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
    touch() {
        this.updatedAt = new Date().toISOString();
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            userId: this.userId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            logicalChannels: this.logicalChannels ? this.logicalChannels.map(c => typeof c.toJSON === 'function' ? c.toJSON() : c) : [],
            hardwareChannels: this.hardwareChannels ? this.hardwareChannels.map(c => typeof c.toJSON === 'function' ? c.toJSON() : c) : [],
            mappings: this.mappings ? this.mappings.map(m => typeof m.toJSON === 'function' ? m.toJSON() : m) : [],
            frameworkConfig: this.frameworkConfig ? (typeof this.frameworkConfig.toJSON === 'function' ? this.frameworkConfig.toJSON() : this.frameworkConfig) : {},
        };
    }
};
exports.Configuration = Configuration;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Configuration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Configuration.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], Configuration.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Configuration.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Configuration.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Configuration.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => mapping_1.Mapping, (m) => m.configuration),
    __metadata("design:type", Array)
], Configuration.prototype, "mappings", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => frameworkConfig_1.FrameworkConfig, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", frameworkConfig_1.FrameworkConfig)
], Configuration.prototype, "frameworkConfig", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_1.User)
], Configuration.prototype, "user", void 0);
exports.Configuration = Configuration = __decorate([
    (0, typeorm_1.Entity)('configurations'),
    __metadata("design:paramtypes", [String, String, Object])
], Configuration);
//# sourceMappingURL=configuration.js.map