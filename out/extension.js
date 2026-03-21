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
const vscode = __importStar(require("vscode"));
const webviewProvider_1 = require("./ui/webviewProvider");
const storageService_1 = require("./services/storageService");
const configImporter_1 = require("./services/configImporter");
function activate(context) {
    console.log('Channel Configuration Manager is now active.');
    const storageService = new storageService_1.StorageService(context);
    const importer = new configImporter_1.ConfigImporter(storageService);
    // Register the webview sidebar provider
    const provider = new webviewProvider_1.WebviewProvider(context.extensionUri, context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(webviewProvider_1.WebviewProvider.viewType, provider, {
        webviewOptions: { retainContextWhenHidden: true },
    }));
    // Register commands
    const commands = [
        ['channelConfig.openDashboard', () => {
                vscode.commands.executeCommand('channelConfig.mainView.focus');
            }],
        ['channelConfig.importConfig', async () => {
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
        ['channelConfig.manageLogicalChannels', () => {
                vscode.commands.executeCommand('channelConfig.mainView.focus');
                vscode.window.showInformationMessage('Navigate to the "Logical Channels" tab in the sidebar.');
            }],
        ['channelConfig.manageHardwareChannels', () => {
                vscode.commands.executeCommand('channelConfig.mainView.focus');
                vscode.window.showInformationMessage('Navigate to the "Hardware Channels" tab in the sidebar.');
            }],
        ['channelConfig.manageMappings', () => {
                vscode.commands.executeCommand('channelConfig.mainView.focus');
                vscode.window.showInformationMessage('Navigate to the "Mappings" tab in the sidebar.');
            }],
        ['channelConfig.generateConfig', () => {
                vscode.commands.executeCommand('channelConfig.mainView.focus');
                vscode.window.showInformationMessage('Navigate to the "Generate" tab in the sidebar.');
            }],
        ['channelConfig.runAIValidation', () => {
                vscode.commands.executeCommand('channelConfig.mainView.focus');
                vscode.window.showInformationMessage('Navigate to the "Generate" tab and click "Run AI Validation".');
            }],
        ['channelConfig.visualizeDiagram', () => {
                vscode.commands.executeCommand('channelConfig.mainView.focus');
                vscode.window.showInformationMessage('Navigate to the "Diagram" tab in the sidebar.');
            }],
        ['channelConfig.configureFramework', () => {
                vscode.commands.executeCommand('channelConfig.mainView.focus');
                vscode.window.showInformationMessage('Navigate to the "Framework" tab in the sidebar.');
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
    ];
    for (const [cmd, handler] of commands) {
        context.subscriptions.push(vscode.commands.registerCommand(cmd, handler));
    }
}
function deactivate() {
    console.log('Channel Configuration Manager deactivated.');
}
//# sourceMappingURL=extension.js.map