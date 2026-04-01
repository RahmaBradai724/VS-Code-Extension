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
exports.WebviewProvider = void 0;
const vscode = __importStar(require("vscode"));
const models_1 = require("../models");
const channelManager_1 = require("../services/channelManager");
const mappingManager_1 = require("../services/mappingManager");
const storageService_1 = require("../services/storageService");
const configGenerator_1 = require("../services/configGenerator");
const aiValidator_1 = require("../ai/aiValidator");
const databaseService_1 = require("../services/databaseService");
const logicalChannels_1 = require("../models/logicalChannels");
const hardwareChannels_1 = require("../models/hardwareChannels");
const enums_1 = require("../models/enums");
const logicalChannelFactories = {
    [enums_1.LogicalChannelSubclass.CAN]: (id, name) => new logicalChannels_1.CANChannel(id, name),
    [enums_1.LogicalChannelSubclass.LIN]: (id, name) => new logicalChannels_1.LINChannel(id, name),
    [enums_1.LogicalChannelSubclass.FLEXRAY]: (id, name) => new logicalChannels_1.FlexRayChannel(id, name),
    [enums_1.LogicalChannelSubclass.ETHERNET]: (id, name) => new logicalChannels_1.EthernetChannel(id, name),
    [enums_1.LogicalChannelSubclass.SERIAL]: (id, name) => new logicalChannels_1.SerialChannel(id, name),
    [enums_1.LogicalChannelSubclass.IOINPUT]: (id, name) => new logicalChannels_1.IOInputChannel(id, name),
    [enums_1.LogicalChannelSubclass.IOOUTPUT]: (id, name) => new logicalChannels_1.IOOutputChannel(id, name),
    [enums_1.LogicalChannelSubclass.BRIDGE]: (id, name) => new logicalChannels_1.BridgeChannel(id, name),
    [enums_1.LogicalChannelSubclass.ANALOG]: (id, name) => new logicalChannels_1.AnalogChannel(id, name),
    [enums_1.LogicalChannelSubclass.PS]: (id, name) => new logicalChannels_1.PSChannel(id, name),
    [enums_1.LogicalChannelSubclass.IOSERIAL]: (id, name) => new logicalChannels_1.IPSChannel(id, name),
};
const hardwareChannelFactories = {
    [enums_1.HardwareChannelSubclass.CAN_INTERFACE]: (id, name) => new hardwareChannels_1.CANInterface(id, name),
    [enums_1.HardwareChannelSubclass.CIB_INTERFACE]: (id, name) => new hardwareChannels_1.CIBInterface(id, name),
    [enums_1.HardwareChannelSubclass.ETHERNET_ADAPTER]: (id, name) => new hardwareChannels_1.EthernetAdapter(id, name),
    [enums_1.HardwareChannelSubclass.SERIAL_PORT]: (id, name) => new hardwareChannels_1.SerialPort(id, name),
    [enums_1.HardwareChannelSubclass.LIN_CARD]: (id, name) => new hardwareChannels_1.LINCard(id, name),
    [enums_1.HardwareChannelSubclass.RELAY_BOARD]: (id, name) => new hardwareChannels_1.RelayBoard(id, name),
    [enums_1.HardwareChannelSubclass.HID_RELAY]: (id, name) => new hardwareChannels_1.HIDRelay(id, name),
    [enums_1.HardwareChannelSubclass.ANALOG_DEVICE]: (id, name) => new hardwareChannels_1.AnalogDevice(id, name),
    [enums_1.HardwareChannelSubclass.TE_ANALOG]: (id, name) => new hardwareChannels_1.TEAnalog(id, name),
    [enums_1.HardwareChannelSubclass.CM_INTERFACE]: (id, name) => new hardwareChannels_1.CMInterface(id, name),
    [enums_1.HardwareChannelSubclass.HH_LOAD]: (id, name) => new hardwareChannels_1.HHLoad(id, name),
};
/**
 * WebviewProvider hosts the main Configuration Manager UI
 * in a VS Code sidebar/tab webview.
 */
class WebviewProvider {
    constructor(_extensionUri, context) {
        this._extensionUri = _extensionUri;
        this.storageService = new storageService_1.StorageService(context);
        this.channelManager = new channelManager_1.ChannelManager();
        this.mappingManager = new mappingManager_1.MappingManager(this.channelManager);
        const apiKey = vscode.workspace.getConfiguration('channelConfig').get('geminiApiKey') || '';
        this.aiValidator = new aiValidator_1.AIValidator(apiKey);
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(async (message) => {
            await this._handleMessage(message, webviewView.webview);
        });
    }
    async _handleMessage(message, webview) {
        switch (message.command) {
            case 'getConfigurations':
                webview.postMessage({ command: 'configurationsLoaded', data: this.storageService.getAllConfigurations() });
                break;
            case 'createConfiguration': {
                const id = `config_${Date.now()}`;
                const currentUser = this.storageService.getCurrentUser();
                const userId = currentUser ? currentUser.id : null;
                this.currentConfig = new models_1.Configuration(id, message.name, userId);
                this._saveCurrentConfig();
                webview.postMessage({ command: 'configurationCreated', data: this.currentConfig.toJSON() });
                break;
            }
            case 'deleteConfiguration': {
                this.storageService.deleteConfiguration(message.configId);
                webview.postMessage({ command: 'configurationDeleted', configId: message.configId });
                break;
            }
            case 'loadConfiguration': {
                const raw = this.storageService.getConfigurationById(message.configId);
                if (raw) {
                    this.currentConfig = new models_1.Configuration(raw.id || raw.configId, raw.name, raw.userId);
                    this.currentConfig.logicalChannels = raw.logicalChannels || [];
                    this.currentConfig.hardwareChannels = raw.hardwareChannels || [];
                    this.currentConfig.mappings = raw.mappings || [];
                    this.currentConfig.frameworkConfig = raw.frameworkConfig || {};
                    // Re-populate in-memory ChannelManager (lost on extension reload)
                    this.channelManager = new channelManager_1.ChannelManager();
                    this.mappingManager = new mappingManager_1.MappingManager(this.channelManager);
                    for (const ch of this.currentConfig.logicalChannels) {
                        const factory = logicalChannelFactories[ch.subclass];
                        if (factory) {
                            const rebuilt = factory(ch.id, ch.name);
                            Object.assign(rebuilt, ch);
                            this.channelManager.addLogicalChannel(rebuilt);
                        }
                    }
                    for (const hw of this.currentConfig.hardwareChannels) {
                        const factory = hardwareChannelFactories[hw.subclass];
                        if (factory) {
                            const rebuilt = factory(hw.id, hw.name);
                            Object.assign(rebuilt, hw);
                            this.channelManager.addHardwareChannel(rebuilt);
                        }
                    }
                    // Re-populate mappings into MappingManager's internal map
                    for (const m of this.currentConfig.mappings) {
                        this.mappingManager.mappings.set(m.mappingId, m);
                        this.channelManager.registerMappingForChannel(m.logicalChannelId, m.mappingId);
                        this.channelManager.registerMappingForChannel(m.hardwareChannelId, m.mappingId);
                    }
                }
                webview.postMessage({ command: 'configurationLoaded', data: raw });
                break;
            }
            case 'addLogicalChannel': {
                try {
                    if (!this.currentConfig) {
                        throw new Error('No configuration loaded.');
                    }
                    const raw = message.channel;
                    const factory = logicalChannelFactories[raw.subclass];
                    if (!factory) {
                        throw new Error(`Unsupported logical channel subclass: ${raw.subclass}`);
                    }
                    const channel = factory(raw.id, raw.name);
                    Object.assign(channel, raw);
                    channel.type = enums_1.ChannelType.LOGICAL;
                    channel.category = raw.category || channel.category;
                    channel.subclass = raw.subclass || channel.subclass;
                    this.channelManager.addLogicalChannel(channel);
                    this.currentConfig.logicalChannels.push(channel);
                    // Persist
                    this._saveCurrentConfig();
                    webview.postMessage({ command: 'success', action: 'addLogicalChannel', data: channel.toJSON() });
                }
                catch (e) {
                    webview.postMessage({ command: 'error', message: e.message });
                }
                break;
            }
            case 'deleteLogicalChannel': {
                try {
                    if (!this.currentConfig) {
                        throw new Error('No configuration loaded.');
                    }
                    this.channelManager.deleteLogicalChannel(message.channelId);
                    this.currentConfig.logicalChannels = this.currentConfig.logicalChannels.filter(c => c.id !== message.channelId);
                    this._saveCurrentConfig();
                    webview.postMessage({ command: 'success', action: 'deleteLogicalChannel', id: message.channelId });
                }
                catch (e) {
                    webview.postMessage({ command: 'error', message: e.message });
                }
                break;
            }
            case 'addHardwareChannel': {
                try {
                    if (!this.currentConfig) {
                        throw new Error('No configuration loaded.');
                    }
                    const raw = message.channel;
                    const factory = hardwareChannelFactories[raw.subclass];
                    if (!factory) {
                        throw new Error(`Unsupported hardware channel subclass: ${raw.subclass}`);
                    }
                    const channel = factory(raw.id, raw.name);
                    Object.assign(channel, raw);
                    channel.type = enums_1.ChannelType.HARDWARE;
                    channel.category = raw.category || channel.category;
                    channel.subclass = raw.subclass || channel.subclass;
                    this.channelManager.addHardwareChannel(channel);
                    this.currentConfig.hardwareChannels.push(channel);
                    this._saveCurrentConfig();
                    webview.postMessage({ command: 'success', action: 'addHardwareChannel', data: channel.toJSON() });
                }
                catch (e) {
                    webview.postMessage({ command: 'error', message: e.message });
                }
                break;
            }
            case 'deleteHardwareChannel': {
                try {
                    if (!this.currentConfig) {
                        throw new Error('No configuration loaded.');
                    }
                    this.channelManager.deleteHardwareChannel(message.channelId);
                    this.currentConfig.hardwareChannels = this.currentConfig.hardwareChannels.filter(c => c.id !== message.channelId);
                    this._saveCurrentConfig();
                    webview.postMessage({ command: 'success', action: 'deleteHardwareChannel', id: message.channelId });
                }
                catch (e) {
                    webview.postMessage({ command: 'error', message: e.message });
                }
                break;
            }
            case 'addMapping': {
                try {
                    if (!this.currentConfig) {
                        throw new Error('No configuration loaded.');
                    }
                    const mapping = this.mappingManager.addMapping(message.logicalChannelId, message.hardwareChannelId, message.configurationId, message.params);
                    this.currentConfig.mappings.push(mapping);
                    this._saveCurrentConfig();
                    webview.postMessage({ command: 'success', action: 'addMapping', data: mapping.toJSON() });
                }
                catch (e) {
                    webview.postMessage({ command: 'error', message: e.message });
                }
                break;
            }
            case 'removeMapping': {
                try {
                    if (!this.currentConfig) {
                        throw new Error('No configuration loaded.');
                    }
                    this.mappingManager.removeMapping(message.mappingId);
                    this.currentConfig.mappings = this.currentConfig.mappings.filter(m => m.mappingId !== message.mappingId);
                    this._saveCurrentConfig();
                    webview.postMessage({ command: 'success', action: 'removeMapping', id: message.mappingId });
                }
                catch (e) {
                    webview.postMessage({ command: 'error', message: e.message });
                }
                break;
            }
            case 'generateConfig': {
                if (!this.currentConfig) {
                    webview.postMessage({ command: 'error', message: 'No configuration loaded.' });
                    break;
                }
                try {
                    // Merge framework data from UI into the configuration before generation
                    if (message.frameworkData) {
                        const fw = message.frameworkData;
                        if (!this.currentConfig.frameworkConfig) {
                            this.currentConfig.frameworkConfig = {};
                        }
                        const fc = this.currentConfig.frameworkConfig;
                        fc.tracers = fw.tracers || [];
                        fc.publisherType = fw.publisherType;
                        fc.channelsGroups = fw.channelsGroups || [];
                        fc.connectedEcus = fw.connectedEcus || [];
                        fc.servicePack = fw.servicePack;
                        if (fw.ethernetConfig) {
                            fc.ethernetConfig = fw.ethernetConfig;
                        }
                        this._saveCurrentConfig();
                    }
                    const generator = new configGenerator_1.ConfigGenerator(this.currentConfig, this.mappingManager);
                    const yamlContent = generator.generate();
                    webview.postMessage({ command: 'configGenerated', yaml: yamlContent });
                    // Also save to workspace file
                    const uri = await vscode.window.showSaveDialog({ filters: { YAML: ['yaml', 'yml'] }, defaultUri: vscode.Uri.file('config.yaml') });
                    if (uri) {
                        await vscode.workspace.fs.writeFile(uri, Buffer.from(yamlContent, 'utf8'));
                        vscode.window.showInformationMessage(`config.yaml saved to ${uri.fsPath}`);
                    }
                }
                catch (e) {
                    webview.postMessage({ command: 'error', message: e.message });
                }
                break;
            }
            case 'runAIValidation': {
                if (!this.currentConfig) {
                    webview.postMessage({ command: 'error', message: 'No configuration loaded.' });
                    break;
                }
                try {
                    const generator = new configGenerator_1.ConfigGenerator(this.currentConfig, this.mappingManager);
                    const yamlContent = generator.generate();
                    const mappings = this.mappingManager.getMappingsByConfigId(this.currentConfig.id);
                    const result = await this.aiValidator.runAIValidation(this.currentConfig, mappings, yamlContent);
                    webview.postMessage({ command: 'aiValidationResult', data: result });
                }
                catch (e) {
                    // Run local only
                    const mappings = this.mappingManager.getMappingsByConfigId(this.currentConfig?.id || '');
                    const result = this.aiValidator.validate(this.currentConfig, mappings);
                    webview.postMessage({ command: 'aiValidationResult', data: result });
                }
                break;
            }
            case 'importConfig': {
                const uris = await vscode.window.showOpenDialog({ filters: { YAML: ['yaml', 'yml'] }, canSelectMany: false });
                if (uris && uris[0]) {
                    const content = await vscode.workspace.fs.readFile(uris[0]);
                    webview.postMessage({ command: 'importedConfig', content: Buffer.from(content).toString('utf8') });
                }
                break;
            }
            case 'openFullPanel': {
                const panel = vscode.window.createWebviewPanel('channelConfig.fullPanel', 'Channel Config Manager', vscode.ViewColumn.One, {
                    enableScripts: true,
                    localResourceRoots: [this._extensionUri],
                    retainContextWhenHidden: true,
                });
                panel.webview.html = this._getHtmlForWebview(panel.webview);
                panel.webview.onDidReceiveMessage(async (msg) => {
                    await this._handleMessage(msg, panel.webview);
                });
                break;
            }
        }
    }
    async _saveCurrentConfig() {
        if (this.currentConfig) {
            this.storageService.saveConfiguration(this.currentConfig);
            await (0, databaseService_1.saveConfigurationToDb)(this.currentConfig.id, this.currentConfig.name, this.currentConfig.userId, JSON.stringify(this.currentConfig.toJSON()));
        }
    }
    _getHtmlForWebview(webview) {
        const nonce = getNonce();
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'webview.js'));
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src ${webview.cspSource} data:; font-src ${webview.cspSource};">
  <title>Channel Config Manager</title>
  <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { overflow: hidden; } #root { width: 100vw; height: 100vh; overflow: hidden; }</style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}
exports.WebviewProvider = WebviewProvider;
WebviewProvider.viewType = 'channelConfig.mainView';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=webviewProvider.js.map