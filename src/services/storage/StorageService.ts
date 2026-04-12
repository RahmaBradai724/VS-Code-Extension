import * as vscode from 'vscode';
import { Configuration, User } from '../../models';
import { IConfigurationStorage, IUserStorage } from '../interfaces/IStorage';

const STORAGE_KEY_CONFIGS       = 'channelConfig.configurations';
const STORAGE_KEY_CURRENT_USER  = 'channelConfig.currentUser';

/**
 * StorageService manages configuration and user persistence in VS Code globalState.
 * SRP: config/user storage only — auth token persistence is handled by TokenStorage.
 */
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
    } else {0
      all.push(serialized);
    }
    this.context.globalState.update(STORAGE_KEY_CONFIGS, all);
  }

  /**
   * Save a plain config object (e.g. from YamlParser) without requiring a Configuration instance.
   * Normalises configId → id so the stored format is consistent.
   */
  saveRaw(plainConfig: any): void {
    const all = this.getAll();
    const id = plainConfig.id || plainConfig.configId;
    const normalised = { ...plainConfig, id };
    const idx = all.findIndex((c: any) => (c.id || (c as any).configId) === id);
    if (idx >= 0) {
      all[idx] = normalised;
    } else {
      all.push(normalised);
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

  /** Remove from globalState any configs that have no userId (orphaned/legacy). */
  purgeOrphanedConfigs(): void {
    const cleaned = this.getAll().filter((c: any) => c.userId != null);
    this.context.globalState.update(STORAGE_KEY_CONFIGS, cleaned);
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
}
