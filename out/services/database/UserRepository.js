"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const user_1 = require("../../models/user");
const DataSourceProvider_1 = require("./DataSourceProvider");
/**
 * UserRepository encapsulates all User-related database operations.
 * Repository pattern: isolates data access from business logic.
 * SRP: User persistence only.
 */
class UserRepository {
    constructor(authService) {
        this.authService = authService;
    }
    async register(name, email, password) {
        await (0, DataSourceProvider_1.initializeDatabase)();
        const repo = (0, DataSourceProvider_1.getDataSource)().getRepository(user_1.User);
        const existing = await repo.findOneBy({ email });
        if (existing) {
            throw new Error('An account with this email already exists.');
        }
        const user = new user_1.User(name, email);
        user.passwordHash = await this.authService.hashPassword(password);
        return repo.save(user);
    }
    async login(email, password) {
        await (0, DataSourceProvider_1.initializeDatabase)();
        const repo = (0, DataSourceProvider_1.getDataSource)().getRepository(user_1.User);
        const user = await repo.findOneBy({ email });
        if (!user) {
            throw new Error('No account found with that email.');
        }
        if (!user.passwordHash) {
            throw new Error('Account has no password set. Please contact the administrator.');
        }
        const valid = await this.authService.verifyPassword(password, user.passwordHash);
        if (!valid) {
            throw new Error('Incorrect password.');
        }
        return user;
    }
    async findById(id) {
        await (0, DataSourceProvider_1.initializeDatabase)();
        return (0, DataSourceProvider_1.getDataSource)().getRepository(user_1.User).findOneBy({ id });
    }
    async findByEmail(email) {
        await (0, DataSourceProvider_1.initializeDatabase)();
        return (0, DataSourceProvider_1.getDataSource)().getRepository(user_1.User).findOneBy({ email });
    }
    /** @deprecated Use findByEmail + login instead */
    async save(name, email) {
        await (0, DataSourceProvider_1.initializeDatabase)();
        const repo = (0, DataSourceProvider_1.getDataSource)().getRepository(user_1.User);
        let user = await repo.findOneBy({ email });
        if (user) {
            return user;
        }
        user = new user_1.User(name, email);
        return repo.save(user);
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map