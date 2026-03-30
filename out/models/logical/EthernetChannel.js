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
exports.EthernetChannel = void 0;
const typeorm_1 = require("typeorm");
const LogicalChannel_1 = require("../LogicalChannel");
const enums_1 = require("../enums");
let EthernetChannel = class EthernetChannel extends LogicalChannel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.ETHERNET, enums_1.LogicalChannelSubclass.ETHERNET);
        this.ethernetName = name;
    }
    get pbIFilter() {
        return this.pblFilter;
    }
    set pbIFilter(value) {
        this.pblFilter = value;
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            ethernetName: this.ethernetName ?? this.name,
            friendlyName: this.friendlyName, bufferSize: this.bufferSize,
            pblFilter: this.pblFilter, timeout: this.timeout,
            timeStampPrecision: this.timeStampPrecision,
            timeStampSource: this.timeStampSource, immediateMode: this.immediateMode,
            snapshotLength: this.snapshotLength, dapDeviceMode: this.dapDeviceMode,
            useDataLoggerTimeStamp: this.useDataLoggerTimeStamp,
            removeDataLoggerMetaData: this.removeDataLoggerMetaData,
            dataLoggerType: this.dataLoggerType,
            packetProcessingActive: this.packetProcessingActive,
            packetIdentificationActive: this.packetIdentificationActive,
            differentHandlerForTxAndRx: this.differentHandlerForTxAndRx,
            tccmPacketizationActive: this.tccmPacketizationActive
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.EthernetChannel = EthernetChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "ethernetName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "friendlyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], EthernetChannel.prototype, "bufferSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "pblFilter", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], EthernetChannel.prototype, "timeout", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "timeStampPrecision", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "timeStampSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "immediateMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], EthernetChannel.prototype, "snapshotLength", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "dapDeviceMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "useDataLoggerTimeStamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "removeDataLoggerMetaData", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EthernetChannel.prototype, "dataLoggerType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "packetProcessingActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "packetIdentificationActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "differentHandlerForTxAndRx", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], EthernetChannel.prototype, "tccmPacketizationActive", void 0);
exports.EthernetChannel = EthernetChannel = __decorate([
    (0, typeorm_1.Entity)('logical_ethernet_channels'),
    __metadata("design:paramtypes", [String, String])
], EthernetChannel);
//# sourceMappingURL=EthernetChannel.js.map