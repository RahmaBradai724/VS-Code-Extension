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

import * as vscode from 'vscode';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// ── Public types ────────────────────────────────────────────────────────────

export interface DiscoveredCaptureModule {
  /** Maps directly to CMInterface.cmId / CANInterface.cmId */
  id: number;
  product_family: string;
  product_id: number | null;
  product_name: string | null;
  sw_version: string | null;
  hw_version?: string | null;
  /** Human-readable label (e.g. "CM CAN Combo") */
  name: string;
  description: string;
  /** Network IP address of the CM device */
  ip: string;
  mac: string;
  host_adapter: { name: string; ip: string; mac: string } | null;
  ports: DiscoveredPort[];
}

export interface DiscoveredEthernetAdapter {
  /** Maps directly to EthernetAdapter.friendlyName */
  friendly_name: string;
  description: string;
  ip: string;
  mac: string;
  ports: DiscoveredPort[];
}

export interface DiscoveredPort {
  name: string;
  short_name: string;
  link_type: string;
  link_protocol: string;
  linkup: boolean;
  speed: number;
  interface_id: string | null;
}

export interface HardwareDiscoveryResult {
  capture_modules: DiscoveredCaptureModule[];
  ethernet_adapters: DiscoveredEthernetAdapter[];
  /** ISO timestamp of when discovery was run */
  timestamp: string;
}

// ── Service ─────────────────────────────────────────────────────────────────

export class HardwareDiscoveryService {

  private readonly scriptPath: string;

  constructor(private readonly extensionUri: vscode.Uri) {
    this.scriptPath = path.join(
      extensionUri.fsPath,
      'scripts',
      'hardware_discovery.py',
    );
  }

  /**
   * Run hardware discovery and return the parsed result.
   *
   * Resolves with an empty result (no error thrown) when cmconfig finds
   * no devices, so callers can always safely destructure the result.
   *
   * @param timeoutMs  Max time to wait for the Python process (default 20 s)
   */
  async discover(timeoutMs = 20_000): Promise<HardwareDiscoveryResult> {
    const python = await this._resolvePythonExecutable();

    let stdout: string;
    try {
      const result = await execFileAsync(python, [this.scriptPath, '--json'], {
        timeout: timeoutMs,
        windowsHide: true,
      });
      stdout = result.stdout.trim();
    } catch (err: any) {
      // The script exits with code 1 when cmconfig fails; stdout still contains
      // a valid JSON error envelope – try to parse it anyway.
      stdout = (err.stdout ?? '').trim();
      if (!stdout) {
        throw new Error(`hardware_discovery.py failed: ${err.message ?? err}`);
      }
    }

    let parsed: any;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      throw new Error(`hardware_discovery.py returned non-JSON output: ${stdout.slice(0, 200)}`);
    }

    if (parsed.error) {
      // Script ran but cmconfig errored (e.g. not installed). Return empty.
      console.warn('[HardwareDiscovery]', parsed.error);
      return this._empty();
    }

    return {
      capture_modules:   parsed.capture_modules   ?? [],
      ethernet_adapters: parsed.ethernet_adapters ?? [],
      timestamp:         new Date().toISOString(),
    };
  }

  /** Return only the list of valid CM device IDs present on the network. */
  async getValidCmIds(timeoutMs = 20_000): Promise<number[]> {
    const result = await this.discover(timeoutMs);
    return result.capture_modules.map(cm => cm.id);
  }

  /** Return only the list of friendly adapter names on this host. */
  async getEthernetAdapterNames(timeoutMs = 20_000): Promise<string[]> {
    const result = await this.discover(timeoutMs);
    return result.ethernet_adapters
      .map(a => a.friendly_name)
      .filter(Boolean);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _empty(): HardwareDiscoveryResult {
    return { capture_modules: [], ethernet_adapters: [], timestamp: new Date().toISOString() };
  }

  /**
   * Resolve the Python executable to use.
   * Priority:
   *   1. VS Code Python extension's selected interpreter
   *   2. `.venv/Scripts/python.exe` / `.venv/bin/python` next to the extension
   *   3. `python` / `python3` on PATH
   */
  private async _resolvePythonExecutable(): Promise<string> {
    // 1. Ask the VS Code Python extension
    try {
      const pythonExt = vscode.extensions.getExtension('ms-python.python');
      if (pythonExt) {
        await pythonExt.activate();
        const api = pythonExt.exports;
        const envPath: string | undefined =
          api?.environments?.getActiveEnvironmentPath?.()?.path ??
          api?.environment?.getActiveEnvironmentPath?.()?.path;
        if (envPath) return envPath;
      }
    } catch {
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
        if (await this._exists(c)) return c;
      }
    }

    // 3. Fallback to system python
    return process.platform === 'win32' ? 'python' : 'python3';
  }

  private _exists(filePath: string): Promise<boolean> {
    return new Promise(resolve => {
      import('fs').then(fs => resolve(fs.existsSync(filePath)));
    });
  }
}
