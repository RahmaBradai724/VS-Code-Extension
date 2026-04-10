"use strict";
/**
 * Tiny shared state: holds a config to auto-load after the next successful auth.
 * Set by extension.ts when MTF.yaml is detected; consumed by MessageHandler after login/checkAuth.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAutoLoad = setAutoLoad;
exports.consumeAutoLoad = consumeAutoLoad;
let _pending = undefined;
function setAutoLoad(config) {
    _pending = config;
}
function consumeAutoLoad() {
    const c = _pending;
    _pending = undefined;
    return c;
}
//# sourceMappingURL=autoLoadState.js.map