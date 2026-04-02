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
exports.MessageHandler = void 0;
const vscode = __importStar(require("vscode"));
const models_1 = require("../models");
const channelManager_1 = require("../services/channelManager");
const mappingManager_1 = require("../services/mappingManager");
const configGenerator_1 = require("../services/configGenerator");
const databaseService_1 = require("../services/databaseService");
const enums_1 = require("../models/enums");
const channelFactories_1 = require("./channelFactories");
const AuthService_1 = require("../services/auth/AuthService");
const UserRepository_1 = require("../services/database/UserRepository");
/**
 * Owns all mutable runtime state and handles every webview message command.
 * Extracted from WebviewProvider to keep that class small.
 */
class MessageHandler {
    constructor(storageService, aiValidator, extensionUri) {
        this.storageService = storageService;
        this.aiValidator = aiValidator;
        this.extensionUri = extensionUri;
        /** userId of the currently authenticated user (null = not logged in) */
        this.loggedInUserId = null;
        this.channelManager = new channelManager_1.ChannelManager();
        this.mappingManager = new mappingManager_1.MappingManager(this.channelManager);
        const jwtSecret = this.storageService.getOrCreateJwtSecret();
        this.authService = new AuthService_1.AuthService(jwtSecret);
        this.userRepository = new UserRepository_1.UserRepository(this.authService);
    }
    // ── Public entry point ──────────────────────────────────────────────────
    async handle(message, webview) {
        // Auth commands are always allowed (no token required)
        switch (message.command) {
            case 'checkAuth': return this._checkAuth(webview);
            case 'register': return this._register(message, webview);
            case 'login': return this._login(message, webview);
            case 'logout': return this._logout(webview);
        }
        // All other commands require the user to be logged in
        if (this.loggedInUserId === null) {
            webview.postMessage({ command: 'authRequired' });
            return;
        }
        switch (message.command) {
            case 'getConfigurations': return this._getConfigurations(webview);
            case 'createConfiguration': return this._createConfiguration(message, webview);
            case 'deleteConfiguration': return this._deleteConfiguration(message, webview);
            case 'loadConfiguration': return this._loadConfiguration(message, webview);
            case 'addLogicalChannel': return this._addLogicalChannel(message, webview);
            case 'deleteLogicalChannel': return this._deleteLogicalChannel(message, webview);
            case 'addHardwareChannel': return this._addHardwareChannel(message, webview);
            case 'deleteHardwareChannel': return this._deleteHardwareChannel(message, webview);
            case 'addMapping': return this._addMapping(message, webview);
            case 'removeMapping': return this._removeMapping(message, webview);
            case 'generateConfig': return this._generateConfig(message, webview);
            case 'runAIValidation': return this._runAIValidation(webview);
            case 'importConfig': return this._importConfig(webview);
        }
    }
    // ── Auth handlers ───────────────────────────────────────────────────────
    _checkAuth(webview) {
        const stored = this.storageService.getAuthToken();
        if (!stored) {
            webview.postMessage({ command: 'authRequired' });
            return;
        }
        const payload = this.authService.verifyToken(stored);
        if (!payload) {
            this.storageService.clearAuthToken();
            webview.postMessage({ command: 'authRequired' });
            return;
        }
        this.loggedInUserId = payload.userId;
        webview.postMessage({
            command: 'authSuccess',
            token: stored,
            user: { id: payload.userId, name: payload.name, email: payload.email },
        });
    }
    async _register(message, webview) {
        try {
            const { name, email, password } = message;
            if (!name || !email || !password) {
                throw new Error('Name, email and password are required.');
            }
            const user = await this.userRepository.register(name, email, password);
            const token = this.authService.signToken({ userId: user.id, name: user.name, email: user.email });
            this.storageService.setAuthToken(token);
            this.loggedInUserId = user.id;
            webview.postMessage({
                command: 'authSuccess',
                token,
                user: { id: user.id, name: user.name, email: user.email },
            });
        }
        catch (e) {
            webview.postMessage({ command: 'authError', message: e.message });
        }
    }
    async _login(message, webview) {
        try {
            const { email, password } = message;
            if (!email || !password) {
                throw new Error('Email and password are required.');
            }
            const user = await this.userRepository.login(email, password);
            const token = this.authService.signToken({ userId: user.id, name: user.name, email: user.email });
            this.storageService.setAuthToken(token);
            this.loggedInUserId = user.id;
            webview.postMessage({
                command: 'authSuccess',
                token,
                user: { id: user.id, name: user.name, email: user.email },
            });
        }
        catch (e) {
            webview.postMessage({ command: 'authError', message: e.message });
        }
    }
    _logout(webview) {
        this.loggedInUserId = null;
        this.storageService.clearAuthToken();
        this.currentConfig = undefined;
        this.channelManager = new channelManager_1.ChannelManager();
        this.mappingManager = new mappingManager_1.MappingManager(this.channelManager);
        webview.postMessage({ command: 'authRequired' });
    }
    // ── Configuration handlers ──────────────────────────────────────────────
    _getConfigurations(webview) {
        webview.postMessage({
            command: 'configurationsLoaded',
            data: this.storageService.getAllConfigurations(),
        });
    }
    _createConfiguration(message, webview) {
        const id = `config_${Date.now()}`;
        const currentUser = this.storageService.getCurrentUser();
        const userId = currentUser ? currentUser.id : null;
        this.currentConfig = new models_1.Configuration(id, message.name, userId);
        this._saveCurrentConfig();
        webview.postMessage({ command: 'configurationCreated', data: this.currentConfig.toJSON() });
    }
    _deleteConfiguration(message, webview) {
        this.storageService.deleteConfiguration(message.configId);
        webview.postMessage({ command: 'configurationDeleted', configId: message.configId });
    }
    _loadConfiguration(message, webview) {
        const raw = this.storageService.getConfigurationById(message.configId);
        if (raw) {
            this.currentConfig = new models_1.Configuration(raw.id || raw.configId, raw.name, raw.userId);
            this.currentConfig.logicalChannels = raw.logicalChannels || [];
            this.currentConfig.hardwareChannels = raw.hardwareChannels || [];
            this.currentConfig.mappings = raw.mappings || [];
            this.currentConfig.frameworkConfig = raw.frameworkConfig || {};
            // Re-build in-memory managers (lost on extension reload)
            this.channelManager = new channelManager_1.ChannelManager();
            this.mappingManager = new mappingManager_1.MappingManager(this.channelManager);
            for (const ch of this.currentConfig.logicalChannels) {
                const factory = channelFactories_1.logicalChannelFactories[ch.subclass];
                if (factory) {
                    const rebuilt = factory(ch.id, ch.name);
                    Object.assign(rebuilt, ch);
                    this.channelManager.addLogicalChannel(rebuilt);
                }
            }
            for (const hw of this.currentConfig.hardwareChannels) {
                const factory = channelFactories_1.hardwareChannelFactories[hw.subclass];
                if (factory) {
                    const rebuilt = factory(hw.id, hw.name);
                    Object.assign(rebuilt, hw);
                    this.channelManager.addHardwareChannel(rebuilt);
                }
            }
            for (const m of this.currentConfig.mappings) {
                this.mappingManager.mappings.set(m.mappingId, m);
                this.channelManager.registerMappingForChannel(m.logicalChannelId, m.mappingId);
                this.channelManager.registerMappingForChannel(m.hardwareChannelId, m.mappingId);
            }
        }
        webview.postMessage({ command: 'configurationLoaded', data: raw });
    }
    // ── Channel handlers ────────────────────────────────────────────────────
    _addLogicalChannel(message, webview) {
        try {
            if (!this.currentConfig) {
                throw new Error('No configuration loaded.');
            }
            const raw = message.channel;
            const factory = channelFactories_1.logicalChannelFactories[raw.subclass];
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
            this._saveCurrentConfig();
            webview.postMessage({ command: 'success', action: 'addLogicalChannel', data: channel.toJSON() });
        }
        catch (e) {
            webview.postMessage({ command: 'error', message: e.message });
        }
    }
    _deleteLogicalChannel(message, webview) {
        try {
            if (!this.currentConfig) {
                throw new Error('No configuration loaded.');
            }
            this.channelManager.deleteLogicalChannel(message.channelId);
            this.currentConfig.logicalChannels =
                this.currentConfig.logicalChannels.filter(c => c.id !== message.channelId);
            this._saveCurrentConfig();
            webview.postMessage({ command: 'success', action: 'deleteLogicalChannel', id: message.channelId });
        }
        catch (e) {
            webview.postMessage({ command: 'error', message: e.message });
        }
    }
    _addHardwareChannel(message, webview) {
        try {
            if (!this.currentConfig) {
                throw new Error('No configuration loaded.');
            }
            const raw = message.channel;
            const factory = channelFactories_1.hardwareChannelFactories[raw.subclass];
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
    }
    _deleteHardwareChannel(message, webview) {
        try {
            if (!this.currentConfig) {
                throw new Error('No configuration loaded.');
            }
            this.channelManager.deleteHardwareChannel(message.channelId);
            this.currentConfig.hardwareChannels =
                this.currentConfig.hardwareChannels.filter(c => c.id !== message.channelId);
            this._saveCurrentConfig();
            webview.postMessage({ command: 'success', action: 'deleteHardwareChannel', id: message.channelId });
        }
        catch (e) {
            webview.postMessage({ command: 'error', message: e.message });
        }
    }
    // ── Mapping handlers ────────────────────────────────────────────────────
    _addMapping(message, webview) {
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
    }
    _removeMapping(message, webview) {
        try {
            if (!this.currentConfig) {
                throw new Error('No configuration loaded.');
            }
            this.mappingManager.removeMapping(message.mappingId);
            this.currentConfig.mappings =
                this.currentConfig.mappings.filter(m => m.mappingId !== message.mappingId);
            this._saveCurrentConfig();
            webview.postMessage({ command: 'success', action: 'removeMapping', id: message.mappingId });
        }
        catch (e) {
            webview.postMessage({ command: 'error', message: e.message });
        }
    }
    // ── Generate & AI handlers ──────────────────────────────────────────────
    async _generateConfig(message, webview) {
        if (!this.currentConfig) {
            webview.postMessage({ command: 'error', message: 'No configuration loaded.' });
            return;
        }
        try {
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
            const uri = await vscode.window.showSaveDialog({
                filters: { YAML: ['yaml', 'yml'] },
                defaultUri: vscode.Uri.file('config.yaml'),
            });
            if (uri) {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(yamlContent, 'utf8'));
                vscode.window.showInformationMessage(`config.yaml saved to ${uri.fsPath}`);
            }
        }
        catch (e) {
            webview.postMessage({ command: 'error', message: e.message });
        }
    }
    async _runAIValidation(webview) {
        if (!this.currentConfig) {
            webview.postMessage({ command: 'error', message: 'No configuration loaded.' });
            return;
        }
        try {
            const generator = new configGenerator_1.ConfigGenerator(this.currentConfig, this.mappingManager);
            const yamlContent = generator.generate();
            const mappings = this.mappingManager.getMappingsByConfigId(this.currentConfig.id);
            const result = await this.aiValidator.runAIValidation(this.currentConfig, mappings, yamlContent);
            webview.postMessage({ command: 'aiValidationResult', data: result });
        }
        catch {
            // Fall back to local validation
            const mappings = this.mappingManager.getMappingsByConfigId(this.currentConfig.id);
            const result = this.aiValidator.validate(this.currentConfig, mappings);
            webview.postMessage({ command: 'aiValidationResult', data: result });
        }
    }
    // ── Misc handlers ───────────────────────────────────────────────────────
    async _importConfig(webview) {
        const uris = await vscode.window.showOpenDialog({
            filters: { YAML: ['yaml', 'yml'] },
            canSelectMany: false,
        });
        if (uris && uris[0]) {
            const content = await vscode.workspace.fs.readFile(uris[0]);
            webview.postMessage({
                command: 'importedConfig',
                content: Buffer.from(content).toString('utf8'),
            });
        }
    }
    // ── Persistence helper ──────────────────────────────────────────────────
    async _saveCurrentConfig() {
        if (!this.currentConfig) {
            return;
        }
        this.storageService.saveConfiguration(this.currentConfig);
        await (0, databaseService_1.saveConfigurationToDb)(this.currentConfig.id, this.currentConfig.name, this.currentConfig.userId, JSON.stringify(this.currentConfig.toJSON()));
    }
}
exports.MessageHandler = MessageHandler;
//# sourceMappingURL=MessageHandler.js.map