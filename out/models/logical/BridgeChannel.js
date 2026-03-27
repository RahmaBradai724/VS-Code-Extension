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
exports.BridgeChannel = void 0;
const typeorm_1 = require("typeorm");
const LogicalChannel_1 = require("../LogicalChannel");
const enums_1 = require("../enums");
// ─────────────────────────────────────────────
//  Bridge Logical Channel
// ─────────────────────────────────────────────
let BridgeChannel = class BridgeChannel extends LogicalChannel_1.LogicalChannel {
    constructor(id, name) {
        super(id, name, enums_1.LogicalChannelCategory.BRIDGE, enums_1.LogicalChannelSubclass.BRIDGE);
        this.bridgeName = name;
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
            bridgeName: this.bridgeName ?? this.name,
            physicalAdapter: this.physicalAdapter,
            tunTapAdapterList: this.tunTapAdapterList,
            manipulatePackets: this.manipulatePackets
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.BridgeChannel = BridgeChannel;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BridgeChannel.prototype, "bridgeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BridgeChannel.prototype, "physicalAdapter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], BridgeChannel.prototype, "tunTapAdapterList", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], BridgeChannel.prototype, "manipulatePackets", void 0);
exports.BridgeChannel = BridgeChannel = __decorate([
    (0, typeorm_1.Entity)('logical_bridge_channels'),
    __metadata("design:paramtypes", [String, String])
], BridgeChannel);
//# sourceMappingURL=BridgeChannel.js.map