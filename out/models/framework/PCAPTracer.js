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
const Tracer_1 = require("./Tracer");
let PCAPTracer = class PCAPTracer extends Tracer_1.Tracer {
    constructor(id, name) {
        super(id, name);
        this.loggingFilePath = '';
        this.loggingType = 'PCAP';
    }
    toYAML() {
        return { id: this.id, name: this.name, type: 'PCAP', loggingFilePath: this.loggingFilePath };
    }
    toJSON() {
        return { id: this.id, name: this.name, type: 'PCAP', loggingFilePath: this.loggingFilePath, loggingFileLong: this.loggingFileLong };
    }
};
exports.PCAPTracer = PCAPTracer;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PCAPTracer.prototype, "loggingFilePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PCAPTracer.prototype, "loggingFileLong", void 0);
exports.PCAPTracer = PCAPTracer = __decorate([
    (0, typeorm_1.ChildEntity)('PCAP'),
    __metadata("design:paramtypes", [String, String])
], PCAPTracer);
//# sourceMappingURL=PCAPTracer.js.map