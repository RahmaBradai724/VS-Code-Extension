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
function activate(context) {
    console.log('Channel Configuration Manager is now active.');
    // Open the full-tab panel automatically on activation
    webviewProvider_1.WebviewProvider.open(context.extensionUri, context);
    // Silently initialize database in the background
    (0, databaseService_1.testDatabaseConnection)().then(async (connected) => {
        if (connected) {
            await (0, databaseService_1.initializeDatabase)();
        }
    });
    const storageService = new storageService_1.StorageService(context);
    const importer = new configImporter_1.ConfigImporter(storageService);
    /** Helper: open/reveal the main panel */
    const openPanel = () => webviewProvider_1.WebviewProvider.open(context.extensionUri, context);
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
                    storageService.saveConfiguration(result.config);
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