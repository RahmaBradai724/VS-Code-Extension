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
exports.SerialChannel = void 0;
const typeorm_1 = require("typeorm");
const LogicalChannel_1 = require("../LogicalChannel");
const enums_1 = require("../enums");
let SerialChannel = class SerialChannel extends LogicalChannel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.SERIAL, enums_1.LogicalChannelSubclass.SERIAL);
        this.portName = '';
        this.baudRate = 9600;
        this.parity = 'None';
        this.dataBits = 8;
        this.stopBits = '1';
        this.flowControl = 'None';
        this.messageTerminator = '';
        this.maxReceivedDataSize = 0;
        this.separationTimeMs = 0;
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            portName: this.portName, baudRate: this.baudRate,
            parity: this.parity, dataBits: this.dataBits,
            stopBits: this.stopBits, flowControl: this.flowControl,
            messageTerminator: this.messageTerminator,
            maxReceivedDataSize: this.maxReceivedDataSize,
            separationTimeMs: this.separationTimeMs,
            serialChannelActivationOptional: this.serialChannelActivationOptional,
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.SerialChannel = SerialChannel;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "portName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialChannel.prototype, "baudRate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "parity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialChannel.prototype, "dataBits", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "stopBits", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "flowControl", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialChannel.prototype, "messageTerminator", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialChannel.prototype, "maxReceivedDataSize", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialChannel.prototype, "separationTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], SerialChannel.prototype, "serialChannelActivationOptional", void 0);
exports.SerialChannel = SerialChannel = __decorate([
    (0, typeorm_1.Entity)('logical_serial_channels'),
    __metadata("design:paramtypes", [String, String])
], SerialChannel);
//# sourceMappingURL=SerialChannel.js.map