"use strict";
/**
 * HardwareDiscoveryService
 * ========================
 * Calls `hardware_discovery.py` (which wraps `cmconfig topology`) and returns
 * structured information about the connected hardware:
 *
 *  - Capture Modules (CM CAN Combo, etc.)  → valid cmId values + device info
 *  - Host Network Adapters (NetAdapter)    → friendly names for EthernetAdapter
 *
 * The Python script is shipped under `scripts/hardware_discovery.py`.
 * It requires `cmconfig==1.10.0` installed in the active Python environment.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardwareDiscoveryService = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
// ── Service ─────────────────────────────────────────────────────────────────
class HardwareDiscoveryService {
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
        this.scriptPath = path.join(extensionUri.fsPath, 'scripts', 'hardware_discovery.py');
    }
    /**
     * Run hardware discovery and return the parsed result.
     *
     * Resolves with an empty result (no error thrown) when cmconfig finds
     * no devices, so callers can always safely destructure the result.
     *
     * @param timeoutMs  Max time to wait for the Python process (default 20 s)
     */
    async discover(timeoutMs = 20000) {
        const python = await this._resolvePythonExecutable();
        let stdout;
        try {
            const result = await execFileAsync(python, [this.scriptPath, '--json'], {
                timeout: timeoutMs,
                windowsHide: true,
            });
            stdout = result.stdout.trim();
        }
        catch (err) {
            // The script exits with code 1 when cmconfig fails; stdout still contains
            // a valid JSON error envelope – try to parse it anyway.
            stdout = (err.stdout ?? '').trim();
            if (!stdout) {
                throw new Error(`hardware_discovery.py failed: ${err.message ?? err}`);
            }
        }
        let parsed;
        try {
            parsed = JSON.parse(stdout);
        }
        catch {
            throw new Error(`hardware_discovery.py returned non-JSON output: ${stdout.slice(0, 200)}`);
        }
        if (parsed.error) {
            // Script ran but cmconfig errored (e.g. not installed). Return empty.
            console.warn('[HardwareDiscovery]', parsed.error);
            return this._empty();
        }
        return {
            capture_modules: parsed.capture_modules ?? [],
            ethernet_adapters: parsed.ethernet_adapters ?? [],
            timestamp: new Date().toISOString(),
        };
    }
    /** Return only the list of valid CM device IDs present on the network. */
    async getValidCmIds(timeoutMs = 20000) {
        const result = await this.discover(timeoutMs);
        return result.capture_modules.map(cm => cm.id);
    }
    /** Return only the list of friendly adapter names on this host. */
    async getEthernetAdapterNames(timeoutMs = 20000) {
        const result = await this.discover(timeoutMs);
        return result.ethernet_adapters
            .map(a => a.friendly_name)
            .filter(Boolean);
    }
    // ── Private helpers ───────────────────────────────────────────────────────
    _empty() {
        return { capture_modules: [], ethernet_adapters: [], timestamp: new Date().toISOString() };
    }
    /**
     * Resolve the Python executable to use.
     * Priority:
     *   1. VS Code Python extension's selected interpreter
     *   2. `.venv/Scripts/python.exe` / `.venv/bin/python` next to the extension
     *   3. `python` / `python3` on PATH
     */
    async _resolvePythonExecutable() {
        // 1. Ask the VS Code Python extension
        try {
            const pythonExt = vscode.extensions.getExtension('ms-python.python');
            if (pythonExt) {
                await pythonExt.activate();
                const api = pythonExt.exports;
                const envPath = api?.environments?.getActiveEnvironmentPath?.()?.path ??
                    api?.environment?.getActiveEnvironmentPath?.()?.path;
                if (envPath)
                    return envPath;
            }
        }
        catch {
            // Python extension not available – fall through
        }
        // 2. Check for a .venv in the workspace root
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (workspaceRoot) {
            const candidates = [
                path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe'),
                path.join(workspaceRoot, '.venv', 'bin', 'python'),
            ];
            for (const c of candidates) {
                if (await this._exists(c))
                    return c;
            }
        }
        // 3. Fallback to system python
        return process.platform === 'win32' ? 'python' : 'python3';
    }
    _exists(filePath) {
        return new Promise(resolve => {
            Promise.resolve().then(() => __importStar(require('fs'))).then(fs => resolve(fs.existsSync(filePath)));
        });
    }
}
exports.HardwareDiscoveryService = HardwareDiscoveryService;
//# sourceMappingURL=hardwareDiscovery.js.map