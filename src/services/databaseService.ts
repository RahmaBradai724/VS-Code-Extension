// Barrel  re-exports from database/ subfolder.
// Free-function wrappers preserve the original API for all callers.
export { getDataSource, initializeDatabase, testDatabaseConnection } from './database/DataSourceProvider';
export { UserRepository } from './database/UserRepository';
export { ConfigurationRepository } from './database/ConfigurationRepository';

import { UserRepository } from './database/UserRepository';
import { ConfigurationRepository } from './database/ConfigurationRepository';

const _userRepo = new UserRepository();
const _configRepo = new ConfigurationRepository();

export const saveUserToDb = (name: string, email: string) =>
  _userRepo.save(name, email);

export const getUserById = (id: number) =>
  _userRepo.findById(id);

export const findUserByNameAndEmail = (name: string, email: string) =>
  _userRepo.findByNameAndEmail(name, email);

export const saveConfigurationToDb = (
  configId: string,
  name: string,
  userId: string | number | null,
  data: string,
) => _configRepo.save(configId, name, userId, data);
