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
var User_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
/**
 * Represents a user of the Configuration Management System.
 */
let User = User_1 = class User {
    constructor(userId, name, email) {
        this.userId = userId;
        this.name = name;
        this.email = email;
    }
    getUserId() { return this.userId; }
    getName() { return this.name; }
    getEmail() { return this.email; }
    createConfiguration(id, name) {
        // Implementation would go here
    }
    manageConfiguration(config) {
        // Implementation would go here
    }
    toJSON() {
        return {
            userId: this.userId,
            name: this.name,
            email: this.email,
        };
    }
    static fromJSON(data) {
        return new User_1(data.userId || data.id, data.name, data.email);
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], User.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
exports.User = User = User_1 = __decorate([
    (0, typeorm_1.Entity)('users'),
    __metadata("design:paramtypes", [String, String, String])
], User);
//# sourceMappingURL=user.js.map