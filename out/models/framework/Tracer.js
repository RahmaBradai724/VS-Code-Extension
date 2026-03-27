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
exports.Tracer = void 0;
const typeorm_1 = require("typeorm");
const configuration_1 = require("../configuration");
// ─────────────────────────────────────────────
//  Tracer Models
// ─────────────────────────────────────────────
let Tracer = class Tracer {
    constructor(id, name, userId) {
        this.id = id;
        this.name = name;
        this.userId = userId;
    }
};
exports.Tracer = Tracer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Tracer.prototype, "id_internal", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tracer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tracer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tracer.prototype, "loggingType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tracer.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => configuration_1.Configuration, (c) => c.frameworkConfig),
    (0, typeorm_1.JoinColumn)({ name: 'config_id' }),
    __metadata("design:type", configuration_1.Configuration)
], Tracer.prototype, "configuration", void 0);
exports.Tracer = Tracer = __decorate([
    (0, typeorm_1.Entity)('tracers'),
    (0, typeorm_1.TableInheritance)({ column: { type: 'varchar', name: 'type' } }),
    __metadata("design:paramtypes", [String, String, String])
], Tracer);
//# sourceMappingURL=Tracer.js.map