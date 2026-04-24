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
exports.PCAPTracer = void 0;
const typeorm_1 = require("typeorm");
/** Dedicated table for PCAP tracers. */
let PCAPTracer = class PCAPTracer {
    constructor() {
        this.name = '';
    }
    toYAML() {
        const entry = { Type: 'PCAP' };
        if (this.loggingType) {
            entry.LoggingType = this.loggingType;
        }
        if (this.timestamp) {
            entry.Timestamp = this.timestamp;
        }
        if (this.loggerConfiguration) {
            entry.LoggerConfiguration = this.loggerConfiguration;
        }
        return { [this.name]: entry };
    }
    toJSON() {
        return {
            name: this.name,
            Type: 'PCAP',
            LoggingType: this.loggingType,
            Timestamp: this.timestamp,
            LoggerConfiguration: this.loggerConfiguration,
        };
    }
};
exports.PCAPTracer = PCAPTracer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PCAPTracer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PCAPTracer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('FrameworkConfig', 'pcapTracers', { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'frameworkConfigId' }),
    __metadata("design:type", Function)
], PCAPTracer.prototype, "frameworkConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PCAPTracer.prototype, "loggingType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PCAPTracer.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PCAPTracer.prototype, "loggerConfiguration", void 0);
exports.PCAPTracer = PCAPTracer = __decorate([
    (0, typeorm_1.Entity)('pcap_tracers')
], PCAPTracer);
//# sourceMappingURL=PCAPTracer.js.map