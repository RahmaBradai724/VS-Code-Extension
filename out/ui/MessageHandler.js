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
const YamlParser_1 = require("../services/config/YamlParser");
const autoLoadState_1 = require("./autoLoadState");
/**
 * Owns all mutable runtime state and handles every webview message command.
 * Extracted from WebviewProvider to keep that class small.
 */
class MessageHandler {
    constructor(storageService, tokenStorage, aiValidator, extensionUri) {
        this.storageService = storageService;
        this.tokenStorage = tokenStorage;
        this.aiValidator = aiValidator;
        this.extensionUri = extensionUri;
        /** userId of the currently authenticated user (null = not logged in) */
        this.loggedInUserId = null;
        this.channelManager = new channelManager_1.ChannelManager();
        this.mappingManager = new mappingManager_1.MappingManager(this.channelManager);
        const jwtSecret = this.tokenStorage.getOrCreateJwtSecret();
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
            case 'saveFramework': return this._saveFramework(message, webview);
            case 'runAIValidation': return this._runAIValidation(webview);
            case 'importConfig': return this._importConfig(webview);
            case 'applyYamlEdit': return this._applyYamlEdit(message, webview);
        }
    }
    // ── Auth handlers ───────────────────────────────────────────────────────
    _checkAuth(webview) {
        const stored = this.tokenStorage.getAuthToken();
        if (!stored) {
            webview.postMessage({ command: 'authRequired' });
            return;
        }
        const payload = this.authService.verifyToken(stored);
        if (!payload) {
            this.tokenStorage.clearAuthToken();
            webview.postMessage({ command: 'authRequired' });
            return;
        }
        this.loggedInUserId = payload.userId;
        this.storageService.purgeOrphanedConfigs();
        // Send authSuccess (with the stored token) so the webview dispatches AUTH_SUCCESS
        // and the auth gate opens — identical shape to what _login/_register send
        webview.postMessage({
            command: 'authSuccess',
            token: stored,
            user: { id: payload.userId, name: payload.name, email: payload.email },
        });
        // Auto-load is deferred: authSuccess triggers getConfigurations in the webview,
        // then _applyAutoLoad fires after the list is re-rendered
        this._applyAutoLoad(webview);
    }
    async _register(message, webview) {
        try {
            const { name, email, password } = message;
            if (!name || !email || !password) {
                throw new Error('Name, email and password are required.');
            }
            const user = await this.userRepository.register(name, email, password);
            const token = this.authService.signToken({ userId: user.id, name: user.name, email: user.email });
            this.tokenStorage.setAuthToken(token);
            this.loggedInUserId = user.id;
            this.storageService.purgeOrphanedConfigs();
            webview.postMessage({
                command: 'authSuccess',
                token,
                user: { id: user.id, name: user.name, email: user.email },
            });
            this._applyAutoLoad(webview);
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
            this.tokenStorage.setAuthToken(token);
            this.loggedInUserId = user.id;
            this.storageService.purgeOrphanedConfigs();
            webview.postMessage({
                command: 'authSuccess',
                token,
                user: { id: user.id, name: user.name, email: user.email },
            });
            this._applyAutoLoad(webview);
        }
        catch (e) {
            webview.postMessage({ command: 'authError', message: e.message });
        }
    }
    _logout(webview) {
        this.loggedInUserId = null;
        this.tokenStorage.clearAuthToken();
        this.currentConfig = undefined;
        this.channelManager = new channelManager_1.ChannelManager();
        this.mappingManager = new mappingManager_1.MappingManager(this.channelManager);
        webview.postMessage({ command: 'authRequired' });
    }
    // ── Configuration handlers ──────────────────────────────────────────────
    _getConfigurations(webview) {
        const all = this.storageService.getAllConfigurations();
        const mine = all.filter(c => Number(c.userId) === this.loggedInUserId);
        webview.postMessage({
            command: 'configurationsLoaded',
            data: mine,
        });
    }
    _createConfiguration(message, webview) {
        const id = `config_${Date.now()}`;
        this.currentConfig = new models_1.Configuration(id, message.name, this.loggedInUserId);
        this._saveCurrentConfig();
        webview.postMessage({ command: 'configurationCreated', data: this.currentConfig.toJSON() });
    }
    _deleteConfiguration(message, webview) {
        const cfg = this.storageService.getConfigurationById(message.configId);
        if (cfg && Number(cfg.userId) !== this.loggedInUserId) {
            webview.postMessage({ command: 'error', message: 'You can only delete your own configurations.' });
            return;
        }
        this.storageService.deleteConfiguration(message.configId);
        webview.postMessage({ command: 'configurationDeleted', configId: message.configId });
    }
    _loadConfiguration(message, webview) {
        const raw = this.storageService.getConfigurationById(message.configId);
        if (raw && raw.userId != null && Number(raw.userId) !== this.loggedInUserId) {
            webview.postMessage({ command: 'error', message: 'You do not have permission to access this configuration.' });
            return;
        }
        if (raw) {
            this.currentConfig = new models_1.Configuration(raw.id || raw.configId, raw.name, raw.userId);
            this.currentConfig.logicalChannels = raw.logicalChannels || [];
            this.currentConfig.hardwareChannels = raw.hardwareChannels || [];
            this.currentConfig.mappings = raw.mappings || [];
            this.currentConfig.frameworkConfig = raw.frameworkConfig || {};
            // Re-build in-memory managers (lost on extension reload)
            this._rebuildManagers(this.currentConfig);
        }
        webview.postMessage({ command: 'configurationLoaded', data: raw });
    }
    /** Returns true if the current user owns the currently loaded config. */
    _ownsCurrentConfig() {
        if (!this.currentConfig) {
            return false;
        }
        const userId = this.currentConfig.userId;
        return Number(userId) === this.loggedInUserId;
    }
    // ── Channel handlers ────────────────────────────────────────────────────
    _addLogicalChannel(message, webview) {
        try {
            if (!this.currentConfig) {
                throw new Error('No configuration loaded.');
            }
            if (!this._ownsCurrentConfig()) {
                throw new Error('You can only edit your own configurations.');
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
            if (!this._ownsCurrentConfig()) {
                throw new Error('You can only edit your own configurations.');
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
            if (!this._ownsCurrentConfig()) {
                throw new Error('You can only edit your own configurations.');
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
            if (!this._ownsCurrentConfig()) {
                throw new Error('You can only edit your own configurations.');
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
            if (!this._ownsCurrentConfig()) {
                throw new Error('You can only edit your own configurations.');
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
            if (!this._ownsCurrentConfig()) {
                throw new Error('You can only edit your own configurations.');
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
    async _saveFramework(message, webview) {
        if (!this.currentConfig) {
            webview.postMessage({ command: 'error', message: 'No configuration loaded.' });
            return;
        }
        const fw = message.frameworkData;
        if (!fw) {
            return;
        }
        this._applyFrameworkData(fw);
        await this._saveCurrentConfig();
        webview.postMessage({ command: 'frameworkSaved' });
    }
    async _generateConfig(message, webview) {
        if (!this.currentConfig) {
            webview.postMessage({ command: 'error', message: 'No configuration loaded.' });
            return;
        }
        try {
            if (message.frameworkData) {
                this._applyFrameworkData(message.frameworkData);
                this._saveCurrentConfig();
            }
            const generator = new configGenerator_1.ConfigGenerator(this.currentConfig, this.mappingManager);
            const yamlContent = generator.generate();
            webview.postMessage({ command: 'configGenerated', yaml: yamlContent });
            // Write directly to MTF.yaml in the workspace root if a workspace is open
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders && workspaceFolders.length > 0) {
                const mtfUri = vscode.Uri.joinPath(workspaceFolders[0].uri, 'MTF.yaml');
                await vscode.workspace.fs.writeFile(mtfUri, Buffer.from(yamlContent, 'utf8'));
                vscode.window.showInformationMessage(`config.yaml saved to MTF.yaml in your workspace.`);
            }
            else {
                // Fallback: show save dialog if no workspace is open
                const uri = await vscode.window.showSaveDialog({
                    filters: { YAML: ['yaml', 'yml'] },
                    defaultUri: vscode.Uri.file('MTF.yaml'),
                });
                if (uri) {
                    await vscode.workspace.fs.writeFile(uri, Buffer.from(yamlContent, 'utf8'));
                    vscode.window.showInformationMessage(`config.yaml saved to ${uri.fsPath}`);
                }
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
    async _applyYamlEdit(message, webview) {
        if (!this.currentConfig) {
            webview.postMessage({ command: 'error', message: 'No configuration loaded.' });
            return;
        }
        if (!this._ownsCurrentConfig()) {
            webview.postMessage({ command: 'error', message: 'You can only edit your own configurations.' });
            return;
        }
        try {
            const parser = new YamlParser_1.YamlParser();
            const { config: parsed } = parser.parse(message.yaml, this.currentConfig.name);
            const p = parsed;
            this.currentConfig.logicalChannels = p.logicalChannels || [];
            this.currentConfig.hardwareChannels = p.hardwareChannels || [];
            this.currentConfig.mappings = p.mappings || [];
            if (p.frameworkConfig) {
                this.currentConfig.frameworkConfig = p.frameworkConfig;
            }
            // Rebuild in-memory managers
            this._rebuildManagers(this.currentConfig);
            await this._saveCurrentConfig();
            webview.postMessage({ command: 'yamlApplied', data: this.currentConfig.toJSON() });
        }
        catch (e) {
            webview.postMessage({ command: 'yamlApplyError', message: e.message });
        }
    }
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
    // ── Shared helpers ────────────────────────────────────────────────────────
    /** Merges frameworkData from a webview message into the current config's frameworkConfig. */
    _applyFrameworkData(fw) {
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
    }
    /** Rebuilds channelManager and mappingManager from a fully populated Configuration. */
    _rebuildManagers(config) {
        this.channelManager = new channelManager_1.ChannelManager();
        this.mappingManager = new mappingManager_1.MappingManager(this.channelManager);
        for (const ch of config.logicalChannels) {
            const factory = channelFactories_1.logicalChannelFactories[ch.subclass];
            if (factory) {
                const rebuilt = factory(ch.id, ch.name);
                Object.assign(rebuilt, ch);
                this.channelManager.addLogicalChannel(rebuilt);
            }
        }
        for (const hw of config.hardwareChannels) {
            const factory = channelFactories_1.hardwareChannelFactories[hw.subclass];
            if (factory) {
                const rebuilt = factory(hw.id, hw.name);
                Object.assign(rebuilt, hw);
                this.channelManager.addHardwareChannel(rebuilt);
            }
        }
        for (const m of config.mappings) {
            this.mappingManager.mappings.set(m.mappingId, m);
            this.channelManager.registerMappingForChannel(m.logicalChannelId, m.mappingId);
            this.channelManager.registerMappingForChannel(m.hardwareChannelId, m.mappingId);
        }
    }
    // ── Persistence helper ──────────────────────────────────────────────────
    /**
     * If a config was queued for auto-load (from MTF.yaml detection), load it now.
     * Sends both configurationsLoaded (so the list re-renders) and configurationLoaded
     * (so the config is set as active), all in one shot after successful auth.
     */
    _applyAutoLoad(webview) {
        const pending = (0, autoLoadState_1.consumeAutoLoad)();
        if (!pending) {
            return;
        }
        // Stamp with the now-known logged-in userId
        const raw = { ...pending, userId: this.loggedInUserId };
        // Only NOW save to globalState and DB — userId is known and the FK is satisfied
        this.storageService.saveRaw(raw);
        (0, databaseService_1.saveConfigurationToDb)(raw.id || raw.configId, raw.name, this.loggedInUserId, JSON.stringify(raw)).catch((dbErr) => console.warn(`MTF config DB insert failed: ${dbErr.message}`));
        // Build the in-memory Configuration object
        this.currentConfig = new models_1.Configuration(raw.id || raw.configId, raw.name, raw.userId);
        this.currentConfig.logicalChannels = raw.logicalChannels || [];
        this.currentConfig.hardwareChannels = raw.hardwareChannels || [];
        this.currentConfig.mappings = raw.mappings || [];
        this.currentConfig.frameworkConfig = raw.frameworkConfig || {};
        this.channelManager = new channelManager_1.ChannelManager();
        this.mappingManager = new mappingManager_1.MappingManager(this.channelManager);
        // 1) Re-send the full config list so the UI list re-renders with the new entry
        const all = this.storageService.getAllConfigurations();
        const mine = all.filter(c => Number(c.userId) === this.loggedInUserId);
        webview.postMessage({ command: 'configurationsLoaded', data: mine });
        // 2) Auto-load the MTF config as the active config
        webview.postMessage({ command: 'configurationLoaded', data: raw });
    }
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