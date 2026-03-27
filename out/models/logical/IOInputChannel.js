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
exports.IOInputChannel = void 0;
const typeorm_1 = require("typeorm");
const LogicalChannel_1 = require("../LogicalChannel");
const enums_1 = require("../enums");
// ─────────────────────────────────────────────
//  IO Input Logical Channel
// ─────────────────────────────────────────────
let IOInputChannel = class IOInputChannel extends LogicalChannel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.IOINPUT, enums_1.LogicalChannelSubclass.IOINPUT);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            hwChannel: this.hwChannel, measurementAttribute: this.measurementAttribute,
            function: this.function, lineContactState: this.lineContactState,
            gndContactState: this.gndContactState, batContactState: this.batContactState,
            staticChannel: this.staticChannel, initValue: this.initValue,
            channelType: this.channelType, measurementConfig: this.measurementConfig,
            pwmWindowTime: this.pwmWindowTime, subscriptionConfig: this.subscriptionConfig
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.IOInputChannel = IOInputChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], IOInputChannel.prototype, "hwChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOInputChannel.prototype, "measurementAttribute", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOInputChannel.prototype, "function", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], IOInputChannel.prototype, "lineContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], IOInputChannel.prototype, "gndContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], IOInputChannel.prototype, "batContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], IOInputChannel.prototype, "staticChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOInputChannel.prototype, "initValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], IOInputChannel.prototype, "channelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], IOInputChannel.prototype, "measurementConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], IOInputChannel.prototype, "pwmWindowTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IOInputChannel.prototype, "subscriptionConfig", void 0);
exports.IOInputChannel = IOInputChannel = __decorate([
    (0, typeorm_1.Entity)('logical_io_input_channels'),
    __metadata("design:paramtypes", [String, String])
], IOInputChannel);
//# sourceMappingURL=IOInputChannel.js.map