import * as vscode from 'vscode';
import { LogicalChannel, HardwareChannel, Configuration, User } from '../models';

const STORAGE_KEY_CONFIGS = 'channelConfig.configurations';
const STORAGE_KEY_CURRENT_USER = 'channelConfig.currentUser';

/**
 * StorageService handles persistence of all configuration data
 * using VS Code's globalState (ExtensionContext).
 */
export class StorageService {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  // ─── Configurations ───────────────────────────────────────────────────

  getAllConfigurations(): object[] {
    return this.context.globalState.get<object[]>(STORAGE_KEY_CONFIGS) || [];
  }

  saveConfiguration(config: Configuration): void {
    const all = this.getAllConfigurations();
    const idx = all.findIndex((c: any) => c.configId === config.configId);
    const serialized = config.toJSON();
    if (idx >= 0) {
      all[idx] = serialized;
    } else {
      all.push(serialized);
    }
    this.context.globalState.update(STORAGE_KEY_CONFIGS, all);
  }

  deleteConfiguration(configId: string): void {
    const all = this.getAllConfigurations().filter((c: any) => c.configId !== configId);
    this.context.globalState.update(STORAGE_KEY_CONFIGS, all);
  }

  getConfigurationById(configId: string): object | undefined {
    return this.getAllConfigurations().find((c: any) => c.configId === configId);
  }

  // ─── User ─────────────────────────────────────────────────────────────

  getCurrentUser(): object | undefined {
    return this.context.globalState.get<object>(STORAGE_KEY_CURRENT_USER);
  }

  setCurrentUser(user: User): void {
    this.context.globalState.update(STORAGE_KEY_CURRENT_USER, user.toJSON());
  }

  clearCurrentUser(): void {
    this.context.globalState.update(STORAGE_KEY_CURRENT_USER, undefined);
  }

  // ─── Utilities ────────────────────────────────────────────────────────

  clearAll(): void {
    this.context.globalState.update(STORAGE_KEY_CONFIGS, []);
    this.context.globalState.update(STORAGE_KEY_CURRENT_USER, undefined);
  }
}
