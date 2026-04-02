import * as vscode from 'vscode';
import { Configuration, User } from '../../models';
import { IConfigurationStorage, IUserStorage } from '../interfaces/IStorage';

const STORAGE_KEY_CONFIGS = 'channelConfig.configurations';
const STORAGE_KEY_CURRENT_USER = 'channelConfig.currentUser';
const STORAGE_KEY_AUTH_TOKEN = 'channelConfig.authToken';
const STORAGE_KEY_JWT_SECRET = 'channelConfig.jwtSecret';


export class StorageService implements IConfigurationStorage, IUserStorage {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  // ─── IConfigurationStorage ────────────────────────────────────────────

  getAll(): object[] {
    return this.context.globalState.get<object[]>(STORAGE_KEY_CONFIGS) || [];
  }

  save(config: Configuration): void {
    const all = this.getAll();
    const idx = all.findIndex((c: any) => c.id === config.id);
    const serialized = config.toJSON();
    if (idx >= 0) {
      all[idx] = serialized;
    } else {
      all.push(serialized);
    }
    this.context.globalState.update(STORAGE_KEY_CONFIGS, all);
  }

  delete(id: string): void {
    const all = this.getAll().filter((c: any) => (c.id || c.configId) !== id);
    this.context.globalState.update(STORAGE_KEY_CONFIGS, all);
  }

  getById(id: string): object | undefined {
    return this.getAll().find((c: any) => (c.id || c.configId) === id);
  }

  // ─── IUserStorage ─────────────────────────────────────────────────────

  getCurrent(): object | undefined {
    return this.context.globalState.get<object>(STORAGE_KEY_CURRENT_USER);
  }

  setCurrent(user: User): void {
    this.context.globalState.update(STORAGE_KEY_CURRENT_USER, user.toJSON());
  }

  clear(): void {
    this.context.globalState.update(STORAGE_KEY_CURRENT_USER, undefined);
  }

  // ─── Backwards-compatible aliases ────────────────────────────────────

  getAllConfigurations(): object[] { return this.getAll(); }
  saveConfiguration(config: Configuration): void { return this.save(config); }
  deleteConfiguration(id: string): void { return this.delete(id); }
  getConfigurationById(id: string): object | undefined { return this.getById(id); }
  getCurrentUser(): object | undefined { return this.getCurrent(); }
  setCurrentUser(user: User): void { return this.setCurrent(user); }
  clearCurrentUser(): void { return this.clear(); }

  clearAll(): void {
    this.context.globalState.update(STORAGE_KEY_CONFIGS, []);
    this.context.globalState.update(STORAGE_KEY_CURRENT_USER, undefined);
  }

  // ─── JWT / Auth ────────────────────────────────────────────────────────

  getAuthToken(): string | undefined {
    return this.context.globalState.get<string>(STORAGE_KEY_AUTH_TOKEN);
  }

  setAuthToken(token: string): void {
    this.context.globalState.update(STORAGE_KEY_AUTH_TOKEN, token);
  }

  clearAuthToken(): void {
    this.context.globalState.update(STORAGE_KEY_AUTH_TOKEN, undefined);
  }

  /**
   * Returns the persisted JWT secret, generating + saving one if it doesn't exist yet.
   * A stable per-installation secret means tokens survive VS Code restarts.
   */
  getOrCreateJwtSecret(): string {
    const existing = this.context.globalState.get<string>(STORAGE_KEY_JWT_SECRET);
    if (existing) { return existing; }
    // Generate a 64-char hex secret
    const { randomBytes } = require('crypto') as typeof import('crypto');
    const secret = randomBytes(32).toString('hex');
    this.context.globalState.update(STORAGE_KEY_JWT_SECRET, secret);
    return secret;
  }
}
