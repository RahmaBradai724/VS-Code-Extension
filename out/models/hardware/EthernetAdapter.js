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
exports.EthernetAdapter = void 0;
const typeorm_1 = require("typeorm");
const HardwareChannel_1 = require("../HardwareChannel");
const enums_1 = require("../enums");
let EthernetAdapter = class EthernetAdapter extends HardwareChannel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.ETHERNET_ADAPTER, enums_1.HardwareChannelSubclass.ETHERNET_ADAPTER);
        this.macAddress = '';
        this.ipAddress = '';
        this.friendlyName = '';
        this.interface = '';
        this.bufferSize = 0;
        this.bpFilter = '';
        this.timeout = 0;
        this.timeStampPrecision = '';
        this.timeStampSource = '';
        this.immediateMode = false;
        this.snapshotLength = 0;
        this.pcapDeviceMode = '';
        this.useDataLoggerTimeStamp = false;
        this.removeDataLoggerMetaData = false;
        this.dataLoggerType = '';
        this.packetProcessingActive = false;
        this.packetIdentificationActive = false;
        this.differentHandlerForTxAndRx = false;
        this.tecmpPacketizationActive = false;
    }
    get snapShotLength() {
        return this.snapshotLength;
    }
    set snapShotLength(value) {
        this.snapshotLength = value;
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            macAddress: this.macAddress, ipAddress: this.ipAddress,
            friendlyName: this.friendlyName, interface: this.interface,
            bufferSize: this.bufferSize, bpFilter: this.bpFilter,
            timeout: this.timeout, timeStampPrecision: this.timeStampPrecision,
            timeStampSource: this.timeStampSource, immediateMode: this.immediateMode,
            snapShotLength: this.snapShotLength, pcapDeviceMode: this.pcapDeviceMode,
            useDataLoggerTimeStamp: this.useDataLoggerTimeStamp,
            removeDataLoggerMetaData: this.removeDataLoggerMetaData,
            dataLoggerType: this.dataLoggerType,
            packetProcessingActive: this.packetProcessingActive,
            packetIdentificationActive: this.packetIdentificationActive,
            differentHandlerForTxAndRx: this.differentHandlerForTxAndRx,
            tecmpPacketizationActive: this.tecmpPacketizationActive,
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.EthernetAdapter = EthernetAdapter;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "macAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "friendlyName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "interface", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetAdapter.prototype, "bufferSize", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "bpFilter", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetAdapter.prototype, "timeout", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "timeStampPrecision", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "timeStampSource", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "immediateMode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EthernetAdapter.prototype, "snapshotLength", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "pcapDeviceMode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "useDataLoggerTimeStamp", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "removeDataLoggerMetaData", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EthernetAdapter.prototype, "dataLoggerType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "packetProcessingActive", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "packetIdentificationActive", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "differentHandlerForTxAndRx", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EthernetAdapter.prototype, "tecmpPacketizationActive", void 0);
exports.EthernetAdapter = EthernetAdapter = __decorate([
    (0, typeorm_1.Entity)('hardware_ethernet_adapters'),
    __metadata("design:paramtypes", [String, String])
], EthernetAdapter);
//# sourceMappingURL=EthernetAdapter.js.map