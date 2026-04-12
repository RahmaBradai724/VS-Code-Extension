import * as vscode from 'vscode';

/**
 * TokenStorage manages JWT auth tokens and the per-installation JWT secret.
 * SRP: auth token persistence only — no config or user storage.
 */
export class TokenStorage {
  private static readonly KEY_TOKEN  = 'channelConfig.authToken';
  private static readonly KEY_SECRET = 'channelConfig.jwtSecret';

  constructor(private readonly context: vscode.ExtensionContext) {}

  getAuthToken(): string | undefined {
    return this.context.globalState.get<string>(TokenStorage.KEY_TOKEN);
  }

  setAuthToken(token: string): void {
    this.context.globalState.update(TokenStorage.KEY_TOKEN, token);
  }

  clearAuthToken(): void {
    this.context.globalState.update(TokenStorage.KEY_TOKEN, undefined);
  }

  /**
   * Returns the persisted JWT secret, generating and saving one if it does not yet exist.
   * A stable per-installation secret means tokens survive VS Code restarts.
   */
  getOrCreateJwtSecret(): string {
    const existing = this.context.globalState.get<string>(TokenStorage.KEY_SECRET);
    if (existing) { return existing; }
    const { randomBytes } = require('crypto') as typeof import('crypto');
    const secret = randomBytes(32).toString('hex');
    this.context.globalState.update(TokenStorage.KEY_SECRET, secret);
    return secret;
  }
}
