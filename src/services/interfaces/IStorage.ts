import { Configuration, User } from '../../models';

/**
 * ISP: two focused storage interfaces instead of one general StorageService.
 * Consumers that only need config storage depend only on IConfigurationStorage.
 */
export interface IConfigurationStorage {
  getAll(): object[];
  save(config: Configuration): void;
  delete(id: string): void;
  getById(id: string): object | undefined;
}

export interface IUserStorage {
  getCurrent(): object | undefined;
  setCurrent(user: User): void;
  clear(): void;
}
