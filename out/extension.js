"use strict";
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
exports.activate = activate;
exports.deactivate = deactivate;
require("reflect-metadata");
const vscode = __importStar(require("vscode"));
const webviewProvider_1 = require("./ui/webviewProvider");
const storageService_1 = require("./services/storageService");
const configImporter_1 = require("./services/configImporter");
const databaseService_1 = require("./services/databaseService");
const autoLoadState_1 = require("./ui/autoLoadState");
async function activate(context) {
    console.log('Channel Configuration Manager is now active.');
    // Silently initialize database in the background
    (0, databaseService_1.testDatabaseConnection)().then(async (connected) => {
        if (connected) {
            await (0, databaseService_1.initializeDatabase)();
        }
    });
    const storageService = new storageService_1.StorageService(context);
    const importer = new configImporter_1.ConfigImporter(storageService);
    /** Default content written to a freshly created MTF.yaml */
    const DEFAULT_MTF_YAML = [
        'Channels: {}',
        'Mappings: {}',
        'FrameworkConfig:',
        '  PublisherConfig:',
        '    PublisherType: SingleThreaded',
        '',
    ].join('\n');
    /** Helper: open/reveal the main panel */
    const openPanel = () => webviewProvider_1.WebviewProvider.open(context.extensionUri, context);
    /**
     * Called on startup when MTF.yaml already existed.
     * Tries to reuse the previously stored config for this workspace.
     * If none found, falls through to createFreshConfig.
     */
    const WS_KEY = 'mtfConfigId';
    const handleExistingFile = async (uri) => {
        const storedId = context.workspaceState.get(WS_KEY);
        if (storedId) {
            const existing = storageService.getConfigurationById(storedId);
            if (existing) {
                (0, autoLoadState_1.setAutoLoad)(existing);
                return;
            }
        }
        // No stored config (first run or storage cleared) → create fresh
        await createFreshConfig(uri);
    };
    /**
     * Called whenever MTF.yaml is freshly created (onDidCreate watcher).
     * Always produces a brand-new empty config — no ctime check needed
     * because the watcher event already tells us the file is new.
     */
    const createFreshConfig = async (uri) => {
        try {
            const rawBytes = await vscode.workspace.fs.readFile(uri);
            const text = Buffer.from(rawBytes).toString('utf8').trim();
            if (!text) {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(DEFAULT_MTF_YAML, 'utf8'));
            }
            const ts = Date.now();
            const newId = `mtf_${ts}`;
            const newName = `MTF_${new Date(ts).toISOString().slice(0, 10)}_${ts.toString().slice(-5)}`;
            await context.workspaceState.update(WS_KEY, newId);
            (0, autoLoadState_1.setAutoLoad)({
                id: newId,
                name: newName,
                userId: null,
                logicalChannels: [],
                hardwareChannels: [],
                mappings: [],
                frameworkConfig: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
        catch (err) {
            console.warn(`createFreshConfig failed: ${err.message}`);
        }
    };
    // Handle MTF.yaml already present when the workspace opens
    const existingMTF = await vscode.workspace.findFiles('**/MTF.yaml', null, 1);
    if (existingMTF.length > 0) {
        await handleExistingFile(existingMTF[0]);
        openPanel();
    }
    // Watch for MTF.yaml being created — always produce a fresh config
    const mtfWatcher = vscode.workspace.createFileSystemWatcher('**/MTF.yaml');
    mtfWatcher.onDidCreate(async (uri) => {
        await createFreshConfig(uri);
        if (webviewProvider_1.WebviewProvider.hasInstance()) {
            webviewProvider_1.WebviewProvider.applyPendingLoad();
            webviewProvider_1.WebviewProvider.open(context.extensionUri, context); // reveal
        }
        else {
            openPanel(); // new panel; pending config consumed on first checkAuth
        }
        vscode.window.showInformationMessage('MTF.yaml detected — Channel Configuration Manager opened.');
    });
    context.subscriptions.push(mtfWatcher);
    // Register commands
    const commands = [
        ['channelConfig.openDashboard', openPanel],
        ['channelConfig.manageLogicalChannels', openPanel],
        ['channelConfig.manageHardwareChannels', openPanel],
        ['channelConfig.manageMappings', openPanel],
        ['channelConfig.generateConfig', openPanel],
        ['channelConfig.runAIValidation', openPanel],
        ['channelConfig.visualizeDiagram', openPanel],
        ['channelConfig.configureFramework', openPanel],
        ['channelConfig.importConfig', async () => {
                openPanel();
                try {
                    const result = await importer.importFromFile();
                    if (!result) {
                        return;
                    }
                    const plainConfig = result.config;
                    const id = plainConfig.id || plainConfig.configId;
                    const name = plainConfig.name || 'imported';
                    storageService.saveRaw(plainConfig);
                    try {
                        await (0, databaseService_1.saveConfigurationToDb)(id, name, plainConfig.userId ?? null, JSON.stringify(plainConfig));
                    }
                    catch (dbErr) {
                        console.warn(`Config saved locally but DB insert failed: ${dbErr.message}`);
                    }
                    const warnings = result.warnings;
                    if (warnings.length > 0) {
                        vscode.window.showWarningMessage(`Config imported with ${warnings.length} warning(s):\n${warnings.join('\n')}`);
                    }
                    else {
                        vscode.window.showInformationMessage('Configuration imported successfully!');
                    }
                }
                catch (err) {
                    vscode.window.showErrorMessage(`Import failed: ${err.message}`);
                }
            }],
        ['channelConfig.exportConfig', async () => {
                const configs = storageService.getAllConfigurations();
                if (configs.length === 0) {
                    vscode.window.showWarningMessage('No configurations to export.');
                    return;
                }
                const items = configs.map((c) => ({ label: c.name, description: c.configId, config: c }));
                const selected = await vscode.window.showQuickPick(items, { placeHolder: 'Select configuration to export' });
                if (!selected) {
                    return;
                }
                const uri = await vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(`${selected.label}.json`),
                    filters: { JSON: ['json'], YAML: ['yaml'] },
                });
                if (uri) {
                    const content = JSON.stringify(selected.config, null, 2);
                    await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
                    vscode.window.showInformationMessage(`Exported to ${uri.fsPath}`);
                }
            }],
        // connectUser / disconnectUser kept as no-ops (auth is now in the webview)
        ['channelConfig.connectUser', openPanel],
        ['channelConfig.disconnectUser', openPanel],
    ];
    for (const [cmd, handler] of commands) {
        context.subscriptions.push(vscode.commands.registerCommand(cmd, handler));
    }
}
function deactivate() {
    console.log('Channel Configuration Manager deactivated.');
}
//# sourceMappingURL=extension.js.map