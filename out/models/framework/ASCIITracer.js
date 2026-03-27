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
exports.ASCIITracer = void 0;
const typeorm_1 = require("typeorm");
const Tracer_1 = require("./Tracer");
const enums_1 = require("../enums");
let ASCIITracer = class ASCIITracer extends Tracer_1.Tracer {
    constructor(id, name) {
        super(id, name);
        this.base = '';
        this.internalEventLogged = false;
        this.timeStampSetting = '';
        this.loggingType = 'ASCII';
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: 'ASCII',
            base: this.base, internalEventLogged: this.internalEventLogged,
            timeStampSetting: this.timeStampSetting, timestampPrecision: this.timestampPrecision
        };
    }
    toJSON() {
        return { ...this.toYAML(), loggingFileLong: this.loggingFileLong };
    }
};
exports.ASCIITracer = ASCIITracer;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ASCIITracer.prototype, "base", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], ASCIITracer.prototype, "internalEventLogged", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ASCIITracer.prototype, "timeStampSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ASCIITracer.prototype, "loggingFileLong", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], ASCIITracer.prototype, "timestampPrecision", void 0);
exports.ASCIITracer = ASCIITracer = __decorate([
    (0, typeorm_1.ChildEntity)('ASCII'),
    __metadata("design:paramtypes", [String, String])
], ASCIITracer);
//# sourceMappingURL=ASCIITracer.js.map