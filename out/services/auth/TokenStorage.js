"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenStorage = void 0;
/**
 * TokenStorage manages JWT auth tokens and the per-installation JWT secret.
 * SRP: auth token persistence only — no config or user storage.
 */
class TokenStorage {
    constructor(context) {
        this.context = context;
    }
    getAuthToken() {
        return this.context.globalState.get(TokenStorage.KEY_TOKEN);
    }
    setAuthToken(token) {
        this.context.globalState.update(TokenStorage.KEY_TOKEN, token);
    }
    clearAuthToken() {
        this.context.globalState.update(TokenStorage.KEY_TOKEN, undefined);
    }
    /**
     * Returns the persisted JWT secret, generating and saving one if it does not yet exist.
     * A stable per-installation secret means tokens survive VS Code restarts.
     */
    getOrCreateJwtSecret() {
        const existing = this.context.globalState.get(TokenStorage.KEY_SECRET);
        if (existing) {
            return existing;
        }
        const { randomBytes } = require('crypto');
        const secret = randomBytes(32).toString('hex');
        this.context.globalState.update(TokenStorage.KEY_SECRET, secret);
        return secret;
    }
}
exports.TokenStorage = TokenStorage;
TokenStorage.KEY_TOKEN = 'channelConfig.authToken';
TokenStorage.KEY_SECRET = 'channelConfig.jwtSecret';
//# sourceMappingURL=TokenStorage.js.map