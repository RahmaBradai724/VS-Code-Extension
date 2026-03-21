"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
/**
 * Represents a user of the Configuration Management System.
 */
class User {
    constructor(userId, name, email) {
        this.userId = userId;
        this.name = name;
        this.email = email;
    }
    toJSON() {
        return {
            userId: this.userId,
            name: this.name,
            email: this.email,
        };
    }
    static fromJSON(data) {
        return new User(data.userId, data.name, data.email);
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map