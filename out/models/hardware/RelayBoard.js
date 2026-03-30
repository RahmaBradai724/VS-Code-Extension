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
exports.RelayBoard = void 0;
const typeorm_1 = require("typeorm");
const HardwareChannel_1 = require("../HardwareChannel");
const enums_1 = require("../enums");
let RelayBoard = class RelayBoard extends HardwareChannel_1.HardwareChannel {
    constructor(id, name) {
        super(id, name, enums_1.HardwareChannelCategory.RELAY_BOARD, enums_1.HardwareChannelSubclass.RELAY_BOARD);
    }
    get canChannelName() {
        return this.channelName;
    }
    set canChannelName(value) {
        this.channelName = value;
    }
    canDelete(mappingIds) {
        return !mappingIds.includes(this.id);
    }
    toYAML() {
        return {
            id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
            relayCount: this.relayCount, canChannelName: this.canChannelName,
            boardId: this.boardId, relays: this.relays
        };
    }
    toJSON() {
        return this.toYAML();
    }
};
exports.RelayBoard = RelayBoard;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RelayBoard.prototype, "relayCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RelayBoard.prototype, "channelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RelayBoard.prototype, "boardId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RelayBoard.prototype, "relays", void 0);
exports.RelayBoard = RelayBoard = __decorate([
    (0, typeorm_1.Entity)('hardware_relay_boards'),
    __metadata("design:paramtypes", [String, String])
], RelayBoard);
//# sourceMappingURL=RelayBoard.js.map