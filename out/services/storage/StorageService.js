"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const STORAGE_KEY_CONFIGS = 'channelConfig.configurations';
const STORAGE_KEY_CURRENT_USER = 'channelConfig.currentUser';
const STORAGE_KEY_AUTH_TOKEN = 'channelConfig.authToken';
const STORAGE_KEY_JWT_SECRET = 'channelConfig.jwtSecret';
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
    /**
     * Save a plain config object (e.g. from YamlParser) without requiring a Configuration class instance.
     * Normalises configId → id so the stored format is consistent.
     */
    saveRaw(plainConfig) {
        const all = this.getAll();
        const id = plainConfig.id || plainConfig.configId;
        const normalised = { ...plainConfig, id };
        const idx = all.findIndex((c) => (c.id || c.configId) === id);
        if (idx >= 0) {
            all[idx] = normalised;
        }
        else {
            all.push(normalised);
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
    /** Remove from globalState any configs that have no userId (orphaned/legacy). */
    purgeOrphanedConfigs() {
        const cleaned = this.getAll().filter((c) => c.userId != null);
        this.context.globalState.update(STORAGE_KEY_CONFIGS, cleaned);
    }
    // ─── JWT / Auth ────────────────────────────────────────────────────────
    getAuthToken() {
        return this.context.globalState.get(STORAGE_KEY_AUTH_TOKEN);
    }
    setAuthToken(token) {
        this.context.globalState.update(STORAGE_KEY_AUTH_TOKEN, token);
    }
    clearAuthToken() {
        this.context.globalState.update(STORAGE_KEY_AUTH_TOKEN, undefined);
    }
    /**
     * Returns the persisted JWT secret, generating + saving one if it doesn't exist yet.
     * A stable per-installation secret means tokens survive VS Code restarts.
     */
    getOrCreateJwtSecret() {
        const existing = this.context.globalState.get(STORAGE_KEY_JWT_SECRET);
        if (existing) {
            return existing;
        }
        // Generate a 64-char hex secret
        const { randomBytes } = require('crypto');
        const secret = randomBytes(32).toString('hex');
        this.context.globalState.update(STORAGE_KEY_JWT_SECRET, secret);
        return secret;
    }
}
exports.StorageService = StorageService;
//# sourceMappingURL=StorageService.js.map