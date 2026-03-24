"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const STORAGE_KEY_CONFIGS = 'channelConfig.configurations';
const STORAGE_KEY_CURRENT_USER = 'channelConfig.currentUser';
/**
 * StorageService handles persistence of all configuration data
 * using VS Code's globalState (ExtensionContext).
 */
class StorageService {
    constructor(context) {
        this.context = context;
    }
    // ─── Configurations ───────────────────────────────────────────────────
    getAllConfigurations() {
        return this.context.globalState.get(STORAGE_KEY_CONFIGS) || [];
    }
    saveConfiguration(config) {
        const all = this.getAllConfigurations();
        const idx = all.findIndex((c) => c.id === config.id);
        const serialized = config.toJSON();
        if (idx >= 0) {
            all[idx] = serialized;
        }
        else {
            all.push(serialized);
        }
        this.context.globalState.update(STORAGE_KEY_CONFIGS, all);
    }
    deleteConfiguration(id) {
        const all = this.getAllConfigurations().filter((c) => (c.id || c.configId) !== id);
        this.context.globalState.update(STORAGE_KEY_CONFIGS, all);
    }
    getConfigurationById(id) {
        return this.getAllConfigurations().find((c) => (c.id || c.configId) === id);
    }
    // ─── User ─────────────────────────────────────────────────────────────
    getCurrentUser() {
        return this.context.globalState.get(STORAGE_KEY_CURRENT_USER);
    }
    setCurrentUser(user) {
        this.context.globalState.update(STORAGE_KEY_CURRENT_USER, user.toJSON());
    }
    clearCurrentUser() {
        this.context.globalState.update(STORAGE_KEY_CURRENT_USER, undefined);
    }
    // ─── Utilities ────────────────────────────────────────────────────────
    clearAll() {
        this.context.globalState.update(STORAGE_KEY_CONFIGS, []);
        this.context.globalState.update(STORAGE_KEY_CURRENT_USER, undefined);
    }
}
exports.StorageService = StorageService;
//# sourceMappingURL=storageService.js.map