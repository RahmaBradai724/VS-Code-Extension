"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveConfigurationToDb = exports.findUserByEmail = exports.getUserById = exports.saveUserToDb = exports.ConfigurationRepository = exports.UserRepository = exports.testDatabaseConnection = exports.initializeDatabase = exports.getDataSource = void 0;
// Barrel  re-exports from database/ subfolder.
// Free-function wrappers preserve the original API for all callers.
var DataSourceProvider_1 = require("./database/DataSourceProvider");
Object.defineProperty(exports, "getDataSource", { enumerable: true, get: function () { return DataSourceProvider_1.getDataSource; } });
Object.defineProperty(exports, "initializeDatabase", { enumerable: true, get: function () { return DataSourceProvider_1.initializeDatabase; } });
Object.defineProperty(exports, "testDatabaseConnection", { enumerable: true, get: function () { return DataSourceProvider_1.testDatabaseConnection; } });
var UserRepository_1 = require("./database/UserRepository");
Object.defineProperty(exports, "UserRepository", { enumerable: true, get: function () { return UserRepository_1.UserRepository; } });
var ConfigurationRepository_1 = require("./database/ConfigurationRepository");
Object.defineProperty(exports, "ConfigurationRepository", { enumerable: true, get: function () { return ConfigurationRepository_1.ConfigurationRepository; } });
const UserRepository_2 = require("./database/UserRepository");
const ConfigurationRepository_2 = require("./database/ConfigurationRepository");
const AuthService_1 = require("./auth/AuthService");
// databaseService uses a local AuthService so the barrel functions still work.
// Callers that need full auth (register/login) should use UserRepository directly.
const _authService = new AuthService_1.AuthService('local-barrel-secret');
const _userRepo = new UserRepository_2.UserRepository(_authService);
const _configRepo = new ConfigurationRepository_2.ConfigurationRepository();
const saveUserToDb = (name, email) => _userRepo.save(name, email);
exports.saveUserToDb = saveUserToDb;
const getUserById = (id) => _userRepo.findById(id);
exports.getUserById = getUserById;
const findUserByEmail = (email) => _userRepo.findByEmail(email);
exports.findUserByEmail = findUserByEmail;
const saveConfigurationToDb = (configId, name, userId, data) => _configRepo.save(configId, name, userId, data);
exports.saveConfigurationToDb = saveConfigurationToDb;
//# sourceMappingURL=databaseService.js.map