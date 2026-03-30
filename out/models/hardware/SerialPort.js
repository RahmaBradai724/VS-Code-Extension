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
exports.SerialPort = void 0;
const typeorm_1 = require("typeorm");
const HardwareChannel_1 = require("../HardwareChannel");
const enums_1 = require("../enums");
let SerialPort = class SerialPort extends HardwareChannel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.SERIAL_PORT, enums_1.HardwareChannelSubclass.SERIAL_PORT);
        this.portName = '';
        this.baudRate = 9600;
        this.parity = 'None';
        this.dataBits = 8;
        this.stopBits = '1';
        this.flowControl = 'None';
        this.messageTerminator = '';
        this.separationTimeMs = 0;
        this.maxReceivedDataSize = 0;
    }
    get separationTimes() {
        return this.separationTimeMs;
    }
    set separationTimes(value) {
        this.separationTimeMs = value;
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            portName: this.portName, baudRate: this.baudRate,
            parity: this.parity, dataBits: this.dataBits,
            stopBits: this.stopBits, flowControl: this.flowControl,
            messageTerminator: this.messageTerminator,
            separationTimes: this.separationTimes,
            maxReceivedDataSize: this.maxReceivedDataSize
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.SerialPort = SerialPort;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialPort.prototype, "portName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialPort.prototype, "baudRate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialPort.prototype, "parity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialPort.prototype, "dataBits", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialPort.prototype, "stopBits", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialPort.prototype, "flowControl", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SerialPort.prototype, "messageTerminator", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialPort.prototype, "separationTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SerialPort.prototype, "maxReceivedDataSize", void 0);
exports.SerialPort = SerialPort = __decorate([
    (0, typeorm_1.Entity)('hardware_serial_ports'),
    __metadata("design:paramtypes", [String, String])
], SerialPort);
//# sourceMappingURL=SerialPort.js.map