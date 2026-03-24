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
exports.HardwareChannel = exports.LogicalChannel = exports.Channel = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("./enums");
const configuration_1 = require("./configuration");
/**
 * Abstract base class for all channels.
 */
class Channel {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
exports.Channel = Channel;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Channel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Channel.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => configuration_1.Configuration),
    (0, typeorm_1.JoinColumn)({ name: 'config_id' }),
    __metadata("design:type", configuration_1.Configuration)
], Channel.prototype, "configuration", void 0);
/**
 * Abstract base class for all logical channels.
 */
let LogicalChannel = class LogicalChannel extends Channel {
    constructor(id, name, type) {
        super(id, name);
        this.type = type;
    }
};
exports.LogicalChannel = LogicalChannel;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], LogicalChannel.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LogicalChannel.prototype, "loggingName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LogicalChannel.prototype, "tracerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], LogicalChannel.prototype, "alias", void 0);
exports.LogicalChannel = LogicalChannel = __decorate([
    (0, typeorm_1.Entity)('logical_channels'),
    (0, typeorm_1.TableInheritance)({ column: { type: 'varchar', name: 'type' } }),
    __metadata("design:paramtypes", [String, String, String])
], LogicalChannel);
/**
 * Abstract base class for all hardware channels.
 */
let HardwareChannel = class HardwareChannel extends Channel {
    constructor(id, name, type) {
        super(id, name);
        this.type = type;
    }
    getStatus() {
        return this.status || 'Unknown';
    }
    setStatus(status) {
        this.status = status;
    }
};
exports.HardwareChannel = HardwareChannel;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], HardwareChannel.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HardwareChannel.prototype, "status", void 0);
exports.HardwareChannel = HardwareChannel = __decorate([
    (0, typeorm_1.Entity)('hardware_channels'),
    (0, typeorm_1.TableInheritance)({ column: { type: 'varchar', name: 'type' } }),
    __metadata("design:paramtypes", [String, String, String])
], HardwareChannel);
//# sourceMappingURL=channel.js.map