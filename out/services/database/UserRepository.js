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
    async save(name, email) {
        await (0, DataSourceProvider_1.initializeDatabase)();
        const repo = (0, DataSourceProvider_1.getDataSource)().getRepository(user_1.User);
        let user = await repo.findOneBy({ name, email });
        if (user) {
            return user;
        }
        user = new user_1.User(name, email);
        return repo.save(user);
    }
    async findById(id) {
        await (0, DataSourceProvider_1.initializeDatabase)();
        return (0, DataSourceProvider_1.getDataSource)().getRepository(user_1.User).findOneBy({ id });
    }
    async findByNameAndEmail(name, email) {
        await (0, DataSourceProvider_1.initializeDatabase)();
        return (0, DataSourceProvider_1.getDataSource)().getRepository(user_1.User).findOneBy({ name, email });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map