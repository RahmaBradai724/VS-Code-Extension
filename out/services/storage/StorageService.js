"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const STORAGE_KEY_CONFIGS = 'channelConfig.configurations';
const STORAGE_KEY_CURRENT_USER = 'channelConfig.currentUser';
/**
 * StorageService handles persistence of all configuration data
 * using VS Code's globalState (ExtensionContext).
 * Implements IConfigurationStorage and IUserStorage (ISP).
 */
class StorageService {
    constructor(context) {
        this.context = context;
    }
    // ─── IConfigurationStorage ────────────────────────────────────────────
    getAll() {
        return this.context.globalState.get(STORAGE_KEY_CONFIGS) || [];
    }
    save(config) {
        const all = this.getAll();
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
    delete(id) {
        const all = this.getAll().filter((c) => (c.id || c.configId) !== id);
        this.context.globalState.update(STORAGE_KEY_CONFIGS, all);
    }
    getById(id) {
        return this.getAll().find((c) => (c.id || c.configId) === id);
    }
    // ─── IUserStorage ─────────────────────────────────────────────────────
    getCurrent() {
        return this.context.globalState.get(STORAGE_KEY_CURRENT_USER);
    }
    setCurrent(user) {
        this.context.globalState.update(STORAGE_KEY_CURRENT_USER, user.toJSON());
    }
    clear() {
        this.context.globalState.update(STORAGE_KEY_CURRENT_USER, undefined);
    }
    // ─── Backwards-compatible aliases ────────────────────────────────────
    getAllConfigurations() { return this.getAll(); }
    saveConfiguration(config) { return this.save(config); }
    deleteConfiguration(id) { return this.delete(id); }
    getConfigurationById(id) { return this.getById(id); }
    getCurrentUser() { return this.getCurrent(); }
    setCurrentUser(user) { return this.setCurrent(user); }
    clearCurrentUser() { return this.clear(); }
    clearAll() {
        this.context.globalState.update(STORAGE_KEY_CONFIGS, []);
        this.context.globalState.update(STORAGE_KEY_CURRENT_USER, undefined);
    }
}
exports.StorageService = StorageService;
//# sourceMappingURL=StorageService.js.map