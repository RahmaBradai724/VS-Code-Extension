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
exports.AnalogDevice = void 0;
const typeorm_1 = require("typeorm");
const HardwareChannel_1 = require("../HardwareChannel");
const enums_1 = require("../enums");
// ─────────────────────────────────────────────
//  IO Analog Hardware Channel
// ─────────────────────────────────────────────
let AnalogDevice = class AnalogDevice extends HardwareChannel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.ANALOG_DEVICE, enums_1.HardwareChannelSubclass.ANALOG_DEVICE);
    }
    get inContactState() {
        return this.lineContactState;
    }
    set inContactState(value) {
        this.lineContactState = value;
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            channels: this.channels, resolution: this.resolution,
            measurementAttribute: this.measurementAttribute, hwChannel: this.hwChannel,
            inContactState: this.inContactState, gndContactState: this.gndContactState,
            vbatContactState: this.vbatContactState, staticChannel: this.staticChannel,
            initValue: this.initValue, function: this.function,
            channelType: this.channelType, pwmWindowTime: this.pwmWindowTime,
            diagnostics: this.diagnostics
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.AnalogDevice = AnalogDevice;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AnalogDevice.prototype, "channels", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AnalogDevice.prototype, "resolution", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalogDevice.prototype, "measurementAttribute", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AnalogDevice.prototype, "hwChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], AnalogDevice.prototype, "lineContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], AnalogDevice.prototype, "gndContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], AnalogDevice.prototype, "vbatContactState", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], AnalogDevice.prototype, "staticChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalogDevice.prototype, "initValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalogDevice.prototype, "function", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalogDevice.prototype, "channelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AnalogDevice.prototype, "pwmWindowTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AnalogDevice.prototype, "diagnostics", void 0);
exports.AnalogDevice = AnalogDevice = __decorate([
    (0, typeorm_1.Entity)('hardware_analog_devices'),
    __metadata("design:paramtypes", [String, String])
], AnalogDevice);
//# sourceMappingURL=AnalogDevice.js.map