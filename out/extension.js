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
    const storageService = new storageService_1.StorageService(context);
    // 1. First thing: Connect the user
    promptForUserAndConnect(storageService).then(() => {
        // 2. Then ensure the dashboard is focused/opened after the prompt is done
        vscode.commands.executeCommand('channelConfig.mainView.focus');
    });
    // 3. Silently initialize database in the background
    (0, databaseService_1.testDatabaseConnection)().then(async (connected) => {
        if (connected) {
            await (0, databaseService_1.initializeDatabase)();
        }
    });
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
        ['channelConfig.connectUser', async () => {
                await promptForUserAndConnect(storageService, true);
            }],
        ['channelConfig.disconnectUser', async () => {
                storageService.clearCurrentUser();
                vscode.window.showInformationMessage('You have been disconnected.');
                // Optional: Ask if they want to connect as someone else immediately
                const reconnect = await vscode.window.showInformationMessage('Do you want to connect as a different user?', 'Yes', 'No');
                if (reconnect === 'Yes') {
                    await promptForUserAndConnect(storageService, true);
                }
            }],
    ];
    for (const [cmd, handler] of commands) {
        context.subscriptions.push(vscode.commands.registerCommand(cmd, handler));
    }
}
/**
 * Prompt the user for their information and save to DB/Storage
 */
async function promptForUserAndConnect(storageService, force = false) {
    const existingUser = storageService.getCurrentUser();
    if (existingUser && !force) {
        return;
    }
    const name = await vscode.window.showInputBox({
        prompt: 'Welcome! Please enter your name to connect to the Configuration Manager',
        placeHolder: 'e.g. John Doe',
        ignoreFocusOut: true
    });
    if (!name)
        return;
    const email = await vscode.window.showInputBox({
        prompt: 'Enter your email to identify yourself',
        placeHolder: 'john@example.com',
        ignoreFocusOut: true
    });
    if (email === undefined)
        return; // ESC pressed
    // Check if user exists in DB
    const existingDbUser = await (0, databaseService_1.findUserByNameAndEmail)(name, email || '');
    let user;
    if (existingDbUser) {
        user = existingDbUser;
        vscode.window.showInformationMessage(`Welcome back, ${name}!`);
    }
    else {
        // Save new user (ID is auto-generated by TypeORM)
        const newUser = await (0, databaseService_1.saveUserToDb)(name, email || '');
        user = newUser;
        vscode.window.showInformationMessage(`Connected successfully as ${name}!`);
    }
    // Save to VS Code Global Storage (Context)
    storageService.setCurrentUser(user);
}
function deactivate() {
    console.log('Channel Configuration Manager deactivated.');
}
//# sourceMappingURL=extension.js.map