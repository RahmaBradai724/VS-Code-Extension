/**
 * Tiny shared state: holds a config to auto-load after the next successful auth.
 * Set by extension.ts when MTF.yaml is detected; consumed by MessageHandler after login/checkAuth.
 */

let _pending: any = undefined;

export function setAutoLoad(config: any): void {
  _pending = config;
}

export function consumeAutoLoad(): any {
  const c = _pending;
  _pending = undefined;
  return c;
}
