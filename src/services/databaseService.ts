// Barrel  re-exports from database/ subfolder.
// Free-function wrappers preserve the original API for all callers.
export { getDataSource, initializeDatabase, testDatabaseConnection } from './database/DataSourceProvider';
export { UserRepository } from './database/UserRepository';
export { ConfigurationRepository } from './database/ConfigurationRepository';

import { UserRepository } from './database/UserRepository';
import { ConfigurationRepository } from './database/ConfigurationRepository';
import { AuthService } from './auth/AuthService';

// databaseService uses a local AuthService so the barrel functions still work.
// Callers that need full auth (register/login) should use UserRepository directly.
const _authService = new AuthService('local-barrel-secret');
const _userRepo = new UserRepository(_authService);
const _configRepo = new ConfigurationRepository();

export const saveUserToDb = (name: string, email: string) =>
  _userRepo.save(name, email);

export const getUserById = (id: number) =>
  _userRepo.findById(id);

export const findUserByEmail = (email: string) =>
  _userRepo.findByEmail(email);

export const saveConfigurationToDb = (
  configId: string,
  name: string,
  userId: string | number | null,
  data: string,
) => _configRepo.save(configId, name, userId, data);
