import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import { isIP } from 'net';
import * as path from 'path';
import { Configuration } from '../models';
import { ChannelManager } from '../services/channelManager';
import { MappingManager } from '../services/mappingManager';
import { StorageService } from '../services/storageService';
import { ConfigGenerator } from '../services/configGenerator';
import { AIValidator, ValidationDiagnostic } from '../ai/aiValidator';
import { LocalValidator } from '../ai/LocalValidator';
import { RoutedMtfAgent, AgentWorkspaceContext } from '../ai/RoutedMtfAgent';
import { KnowledgeBase } from '../ai/mtf/KnowledgeBase';
import { OllamaClient } from '../ai/mtf/OllamaClient';
import { saveConfigurationToDb } from '../services/databaseService';
import { ChannelType } from '../models/enums';
import { logicalChannelFactories, hardwareChannelFactories } from './channelFactories';
import { AuthService } from '../services/auth/AuthService';
import { TokenStorage } from '../services/auth/TokenStorage';
import { UserRepository } from '../services/database/UserRepository';
import { ConfigurationRepository } from '../services/database/ConfigurationRepository';
import { consumeAutoLoad } from './autoLoadState';
import { HardwareDiscoveryService } from '../services/hardwareDiscovery';
import { YamlParser } from '../services/config/YamlParser';

/**
 * Owns all mutable runtime state and handles every webview message command.
 * Extracted from WebviewProvider to keep that class small.
 */
export class MessageHandler {
  public channelManager: ChannelManager;
  public mappingManager: MappingManager;
  public currentConfig: Configuration | undefined;

  private readonly authService: AuthService;
  private readonly userRepository: UserRepository;
  private readonly configurationRepository: ConfigurationRepository;
  /** userId of the currently authenticated user (null = not logged in) */
  private loggedInUserId: number | null = null;

  /** Cached agent resources — lazy-initialised on first agentAsk call */
  private readonly ollama = new OllamaClient();
  private kb: KnowledgeBase | null = null;

  /** Lazy-initialised hardware discovery service */
  private discoveryService: HardwareDiscoveryService | null = null;

  constructor(
    private readonly storageService: StorageService,
    private readonly tokenStorage: TokenStorage,
    private readonly aiValidator: AIValidator,
    private readonly extensionUri: vscode.Uri,
  ) {
    this.channelManager = new ChannelManager();
    this.mappingManager = new MappingManager(this.channelManager);
    const jwtSecret = this.tokenStorage.getOrCreateJwtSecret();
    this.authService = new AuthService(jwtSecret);
    this.userRepository = new UserRepository(this.authService);
    this.configurationRepository = new ConfigurationRepository();
  }

  // ── Public entry point ──────────────────────────────────────────────────

  async handle(message: any, webview: vscode.Webview): Promise<void> {
    // Auth commands are always allowed (no token required)
    switch (message.command) {
      case 'checkAuth':               return this._checkAuth(webview);
      case 'register':                return this._register(message, webview);
      case 'login':                   return this._login(message, webview);
      case 'logout':                  return this._logout(webview);
    }

    // All other commands require the user to be logged in
    if (this.loggedInUserId === null) {
      webview.postMessage({ command: 'authRequired' });
      return;
    }

    switch (message.command) {
      case 'getConfigurations':       return this._getConfigurations(webview);
      case 'createConfiguration':     return this._createConfiguration(message, webview);
      case 'deleteConfiguration':     return this._deleteConfiguration(message, webview);
      case 'loadConfiguration':       return this._loadConfiguration(message, webview);
      case 'addLogicalChannel':       return this._addLogicalChannel(message, webview);
      case 'deleteLogicalChannel':    return this._deleteLogicalChannel(message, webview);
      case 'addHardwareChannel':      return this._addHardwareChannel(message, webview);
      case 'deleteHardwareChannel':   return this._deleteHardwareChannel(message, webview);
      case 'addMapping':              return this._addMapping(message, webview);
      case 'removeMapping':           return this._removeMapping(message, webview);
      case 'generateConfig':          return this._generateConfig(message, webview);
      case 'saveFramework':            return this._saveFramework(message, webview);
      case 'runAIValidation':         return this._runAIValidation(webview);
      case 'importConfig':            return this._importConfig(webview);
      case 'applyYamlEdit':           return this._applyYamlEdit(message, webview);
      case 'openUrl':                 return this._openUrl(message);
      case 'agentCheckOllama':        return this._agentCheckOllama(webview);
      case 'agentAsk':                return this._agentAsk(message, webview);
      case 'discoverHardware':         return this._discoverHardware(webview);
    }
  }

  // ── Hardware discovery ──────────────────────────────────────────────────

  private async _discoverHardware(webview: vscode.Webview): Promise<void> {
    if (!this.discoveryService) {
      this.discoveryService = new HardwareDiscoveryService(this.extensionUri);
    }
    try {
      const result = await this.discoveryService.discover();
      webview.postMessage({ command: 'hardwareDiscoveryResult', data: result });
    } catch (err: any) {
      webview.postMessage({
        command: 'hardwareDiscoveryResult',
        data: { capture_modules: [], ethernet_adapters: [], timestamp: new Date().toISOString() },
        error: String(err?.message ?? err),
      });
    }
  }

  // ── Auth handlers ───────────────────────────────────────────────────────

  private _checkAuth(webview: vscode.Webview) {
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

  private async _register(message: any, webview: vscode.Webview) {
    try {
      const { name, email, password } = message;
      if (!name || !email || !password) {
        throw new Error('Name, email and password are required.');
      }
      const user  = await this.userRepository.register(name, email, password);
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
    } catch (e: any) {
      webview.postMessage({ command: 'authError', message: e.message });
    }
  }

  private async _login(message: any, webview: vscode.Webview) {
    try {
      const { email, password } = message;
      if (!email || !password) {
        throw new Error('Email and password are required.');
      }
      const user  = await this.userRepository.login(email, password);
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
    } catch (e: any) {
      webview.postMessage({ command: 'authError', message: e.message });
    }
  }

  private _logout(webview: vscode.Webview) {
    this.loggedInUserId = null;
    this.tokenStorage.clearAuthToken();
    this.currentConfig = undefined;
    this.channelManager = new ChannelManager();
    this.mappingManager = new MappingManager(this.channelManager);
    webview.postMessage({ command: 'authRequired' });
  }

  // ── Configuration handlers ──────────────────────────────────────────────

  private _getConfigurations(webview: vscode.Webview) {
    const all = this.storageService.getAllConfigurations() as any[];
    const mine = all.filter(c => Number(c.userId) === this.loggedInUserId);
    webview.postMessage({
      command: 'configurationsLoaded',
      data: mine,
    });
  }

  private _createConfiguration(message: any, webview: vscode.Webview) {
    const id = `config_${Date.now()}`;
    this.currentConfig = new Configuration(id, message.name, this.loggedInUserId);
    this._saveCurrentConfig();
    webview.postMessage({ command: 'configurationCreated', data: this.currentConfig.toJSON() });
  }

  private async _deleteConfiguration(message: any, webview: vscode.Webview) {
    const cfg = this.storageService.getConfigurationById(message.configId) as any;
    if (cfg && Number(cfg.userId) !== this.loggedInUserId) {
      webview.postMessage({ command: 'error', message: 'You can only delete your own configurations.' });
      return;
    }
    // Remove from VS Code globalState (webview list)
    this.storageService.deleteConfiguration(message.configId);
    // Remove from PostgreSQL database
    try {
      await this.configurationRepository.deleteById(message.configId);
    } catch (e: any) {
      console.error('[deleteConfiguration] DB delete failed:', e?.message);
    }
    webview.postMessage({ command: 'configurationDeleted', configId: message.configId });
  }

  private _loadConfiguration(message: any, webview: vscode.Webview) {
    const raw = this.storageService.getConfigurationById(message.configId) as any;

    if (raw && raw.userId != null && Number(raw.userId) !== this.loggedInUserId) {
      webview.postMessage({ command: 'error', message: 'You do not have permission to access this configuration.' });
      return;
    }

    if (raw) {
      this.currentConfig = new Configuration(
        raw.id || raw.configId,
        raw.name,
        raw.userId,
      );
      this.currentConfig.logicalChannels  = raw.logicalChannels  || [];
      this.currentConfig.hardwareChannels = raw.hardwareChannels || [];
      this.currentConfig.mappings         = raw.mappings         || [];
      this.currentConfig.frameworkConfig  = raw.frameworkConfig  || {};

      // Re-build in-memory managers (lost on extension reload)
      this._rebuildManagers(this.currentConfig);
    }

    webview.postMessage({ command: 'configurationLoaded', data: raw });
  }

  /** Returns true if the current user owns the currently loaded config. */
  private _ownsCurrentConfig(): boolean {
    if (!this.currentConfig) { return false; }
    const userId = (this.currentConfig as any).userId;
    return Number(userId) === this.loggedInUserId;
  }

  // ── Channel handlers ────────────────────────────────────────────────────

  private _addLogicalChannel(message: any, webview: vscode.Webview) {
    try {
      if (!this.currentConfig) { throw new Error('No configuration loaded.'); }
      if (!this._ownsCurrentConfig()) { throw new Error('You can only edit your own configurations.'); }
      const raw     = message.channel;
      const factory = logicalChannelFactories[raw.subclass];
      if (!factory) { throw new Error(`Unsupported logical channel subclass: ${raw.subclass}`); }

      const channel: any = factory(raw.id, raw.name);
      Object.assign(channel, raw);
      channel.type     = ChannelType.LOGICAL;
      channel.category = raw.category || channel.category;
      channel.subclass = raw.subclass || channel.subclass;

      this.channelManager.addLogicalChannel(channel);
      this.currentConfig.logicalChannels.push(channel);
      this._saveCurrentConfig();

      webview.postMessage({ command: 'success', action: 'addLogicalChannel', data: channel.toJSON() });
    } catch (e: any) {
      webview.postMessage({ command: 'error', message: e.message });
    }
  }

  private _deleteLogicalChannel(message: any, webview: vscode.Webview) {
    try {
      if (!this.currentConfig) { throw new Error('No configuration loaded.'); }
      if (!this._ownsCurrentConfig()) { throw new Error('You can only edit your own configurations.'); }
      this.channelManager.deleteLogicalChannel(message.channelId);
      this.currentConfig.logicalChannels =
        this.currentConfig.logicalChannels.filter(c => c.id !== message.channelId);
      this._saveCurrentConfig();
      webview.postMessage({ command: 'success', action: 'deleteLogicalChannel', id: message.channelId });
    } catch (e: any) {
      webview.postMessage({ command: 'error', message: e.message });
    }
  }

  private _addHardwareChannel(message: any, webview: vscode.Webview) {
    try {
      if (!this.currentConfig) { throw new Error('No configuration loaded.'); }
      if (!this._ownsCurrentConfig()) { throw new Error('You can only edit your own configurations.'); }
      const raw     = message.channel;
      const factory = hardwareChannelFactories[raw.subclass];
      if (!factory) { throw new Error(`Unsupported hardware channel subclass: ${raw.subclass}`); }

      const channel: any = factory(raw.id, raw.name);
      Object.assign(channel, raw);
      channel.type     = ChannelType.HARDWARE;
      channel.category = raw.category || channel.category;
      channel.subclass = raw.subclass || channel.subclass;

      this.channelManager.addHardwareChannel(channel);
      this.currentConfig.hardwareChannels.push(channel);
      this._saveCurrentConfig();

      webview.postMessage({ command: 'success', action: 'addHardwareChannel', data: channel.toJSON() });
    } catch (e: any) {
      webview.postMessage({ command: 'error', message: e.message });
    }
  }

  private _deleteHardwareChannel(message: any, webview: vscode.Webview) {
    try {
      if (!this.currentConfig) { throw new Error('No configuration loaded.'); }
      if (!this._ownsCurrentConfig()) { throw new Error('You can only edit your own configurations.'); }
      this.channelManager.deleteHardwareChannel(message.channelId);
      this.currentConfig.hardwareChannels =
        this.currentConfig.hardwareChannels.filter(c => c.id !== message.channelId);
      this._saveCurrentConfig();
      webview.postMessage({ command: 'success', action: 'deleteHardwareChannel', id: message.channelId });
    } catch (e: any) {
      webview.postMessage({ command: 'error', message: e.message });
    }
  }

  // ── Mapping handlers ────────────────────────────────────────────────────

  private _addMapping(message: any, webview: vscode.Webview) {
    try {
      if (!this.currentConfig) { throw new Error('No configuration loaded.'); }
      if (!this._ownsCurrentConfig()) { throw new Error('You can only edit your own configurations.'); }
      const mapping = this.mappingManager.addMapping(
        message.logicalChannelId,
        message.hardwareChannelId,
        message.configurationId,
        message.params,
      );
      this.currentConfig.mappings.push(mapping);
      this._saveCurrentConfig();
      webview.postMessage({ command: 'success', action: 'addMapping', data: mapping.toJSON() });
    } catch (e: any) {
      webview.postMessage({ command: 'error', message: e.message });
    }
  }

  private _removeMapping(message: any, webview: vscode.Webview) {
    try {
      if (!this.currentConfig) { throw new Error('No configuration loaded.'); }
      if (!this._ownsCurrentConfig()) { throw new Error('You can only edit your own configurations.'); }
      this.mappingManager.removeMapping(message.mappingId);
      this.currentConfig.mappings =
        this.currentConfig.mappings.filter(m => m.mappingId !== message.mappingId);
      this._saveCurrentConfig();
      webview.postMessage({ command: 'success', action: 'removeMapping', id: message.mappingId });
    } catch (e: any) {
      webview.postMessage({ command: 'error', message: e.message });
    }
  }

  // ── Generate & AI handlers ──────────────────────────────────────────────

  private async _saveFramework(message: any, webview: vscode.Webview) {
    if (!this.currentConfig) {
      webview.postMessage({ command: 'error', message: 'No configuration loaded.' });
      return;
    }
    const fw = message.frameworkData;
    if (!fw) { return; }
    this._applyFrameworkData(fw);
    await this._saveCurrentConfig();
    webview.postMessage({ command: 'frameworkSaved' });
  }

  private async _generateConfig(message: any, webview: vscode.Webview) {
    if (!this.currentConfig) {
      webview.postMessage({ command: 'error', message: 'No configuration loaded.' });
      return;
    }
    try {
      if (message.frameworkData) {
        this._applyFrameworkData(message.frameworkData);
        this._saveCurrentConfig();
      }

      const generator   = new ConfigGenerator(this.currentConfig, this.mappingManager);
      const yamlContent = generator.generate();
      webview.postMessage({ command: 'configGenerated', yaml: yamlContent });

      // Write directly to MTF.yaml in the workspace root if a workspace is open
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        const mtfUri = vscode.Uri.joinPath(workspaceFolders[0].uri, 'MTF.yaml');
        await vscode.workspace.fs.writeFile(mtfUri, Buffer.from(yamlContent, 'utf8'));
        vscode.window.showInformationMessage(`config.yaml saved to MTF.yaml in your workspace.`);
      } else {
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
    } catch (e: any) {
      webview.postMessage({ command: 'error', message: e.message });
    }
  }

  private async _runAIValidation(webview: vscode.Webview) {
    if (!this.currentConfig) {
      webview.postMessage({ command: 'error', message: 'No configuration loaded.' });
      return;
    }
    const generator   = new ConfigGenerator(this.currentConfig, this.mappingManager);
    const yamlContent = (() => {
      try {
        return generator.generate();
      } catch {
        return '';
      }
    })();
    const mappings = this.mappingManager.getMappingsByConfigId(this.currentConfig.id);
    const result = await this.aiValidator.runAIValidation(this.currentConfig, mappings, yamlContent);
    webview.postMessage({ command: 'aiValidationResult', data: result });
  }

  // ── Misc handlers ───────────────────────────────────────────────────────

  private async _applyYamlEdit(message: any, webview: vscode.Webview) {
    if (!this.currentConfig) {
      webview.postMessage({ command: 'error', message: 'No configuration loaded.' });
      return;
    }
    if (!this._ownsCurrentConfig()) {
      webview.postMessage({ command: 'error', message: 'You can only edit your own configurations.' });
      return;
    }
    try {
      const parsed = yaml.load(message.yaml) as any;
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('YAML content is empty or not an object.');
      }
      const channels = parsed.Channels;
      if (!channels || typeof channels !== 'object') {
        throw new Error("Missing 'Channels' section. Use 'Channels' (capital C).");
      }

      // Apply per-channel property updates matched by channel name.
      // Hardware channels and mappings are not touched.
      for (const [name, entry] of Object.entries(channels) as [string, any][]) {
        const lc = this.currentConfig.logicalChannels.find(c => c.name === name) as any;
        if (!lc || !entry) { continue; }
        if (entry.Id !== undefined)                  { lc.channelId           = Number(entry.Id); }
        if (entry.Protocol !== undefined)            { lc.protocol            = entry.Protocol; }
        if (entry.LoggingName !== undefined)         { lc.loggingName         = entry.LoggingName; }
        if (entry.TracerName !== undefined)          { lc.tracerName          = entry.TracerName; }
        if (entry.Alias !== undefined)               { lc.alias               = Array.isArray(entry.Alias) ? entry.Alias : [entry.Alias]; }
        if (entry.LoggingBusIndex !== undefined)     { lc.loggingBusIndex     = entry.LoggingBusIndex; }
        if (entry.ApplicationProtocol !== undefined) { lc.applicationProtocol = entry.ApplicationProtocol; }
      }

      // Apply PCAP adapter fields from Mappings.PCAP section
      const pcapMappings = parsed.Mappings?.PCAP || parsed.mappings?.PCAP;
      if (pcapMappings && typeof pcapMappings === 'object') {
        for (const entry of Object.values(pcapMappings) as any[]) {
          const adapter = entry?.Adapter;
          if (!adapter) { continue; }
          const logicalName: string = adapter.Name;
          if (!logicalName) { continue; }
          // Find the hardware channel linked to this logical channel via mappings
          const mapping = this.currentConfig.mappings.find((m: any) => m.logicalChannelName === logicalName);
          if (!mapping) { continue; }
          const hw = this.currentConfig.hardwareChannels.find((h: any) => h.id === mapping.hardwareChannelId) as any;
          if (!hw || hw.subclass !== 'ETHERNET_ADAPTER') { continue; }
          if (adapter.FriendlyName    !== undefined) { hw.friendlyName            = adapter.FriendlyName; }
          if (adapter.Interface       !== undefined) { hw.interface               = adapter.Interface; }
          if (adapter.BufferSize      !== undefined) { hw.bufferSize              = adapter.BufferSize; }
          if (adapter.BpfFilter       !== undefined) { hw.bpFilter                = adapter.BpfFilter; }
          if (adapter.Timeout         !== undefined) { hw.timeout                 = adapter.Timeout; }
          if (adapter.TimeStampPrecision !== undefined) { hw.timeStampPrecision   = adapter.TimeStampPrecision; }
          if (adapter.TimeStampSource !== undefined) { hw.timeStampSource         = adapter.TimeStampSource; }
          if (adapter.ImmediateMode   !== undefined) { hw.immediateMode           = adapter.ImmediateMode; }
          if (adapter.SnapshotLength  !== undefined) { hw.snapshotLength          = adapter.SnapshotLength; }
          if (adapter.PcapDeviceMode  !== undefined) { hw.pcapDeviceMode          = adapter.PcapDeviceMode; }
          if (adapter.UseDataLoggerTimeStamp    !== undefined) { hw.useDataLoggerTimeStamp    = adapter.UseDataLoggerTimeStamp; }
          if (adapter.RemoveDataLoggerMetaData  !== undefined) { hw.removeDataLoggerMetaData  = adapter.RemoveDataLoggerMetaData; }
          if (adapter.DataLoggerType            !== undefined) { hw.dataLoggerType            = adapter.DataLoggerType; }
          if (adapter.PacketProcessingActive    !== undefined) { hw.packetProcessingActive    = adapter.PacketProcessingActive; }
          if (adapter.PacketIdentificationActive!== undefined) { hw.packetIdentificationActive= adapter.PacketIdentificationActive; }
          if (adapter.DifferentHandlerForTxAndRx!== undefined) { hw.differentHandlerForTxAndRx= adapter.DifferentHandlerForTxAndRx; }
          if (adapter.TECMPPacketizationActive  !== undefined) { hw.tecmpPacketizationActive  = adapter.TECMPPacketizationActive; }
        }
      }

      await this._saveCurrentConfig();
      webview.postMessage({ command: 'yamlApplied', data: this.currentConfig.toJSON() });
    } catch (e: any) {
      webview.postMessage({ command: 'yamlApplyError', message: e.message });
    }
  }

  private async _importConfig(webview: vscode.Webview) {
    const uris = await vscode.window.showOpenDialog({
      filters: { YAML: ['yaml', 'yml'] },
      canSelectMany: false,
    });
    if (!uris || !uris[0]) { return; }

    const fileName = path.basename(uris[0].fsPath);
    try {
      const fileContent = await vscode.workspace.fs.readFile(uris[0]);
      const yamlText = Buffer.from(fileContent).toString('utf8');

      // 1. Syntax check — js-yaml throws on bad indentation / syntax
      let parsed: any;
      try {
        parsed = yaml.load(yamlText);
      } catch (syntaxErr: any) {
        webview.postMessage({
          command: 'importedConfig',
          fileName,
          validation: {
            isValid: false,
            errors: [syntaxErr.message],
            warnings: [],
            suggestions: [],
            diagnostics: [{ code: 'yaml.syntax-error', severity: 'error', source: 'yaml', message: syntaxErr.message }],
          },
        });
        return;
      }

      // 2. MTF structural validation
      const validation = this._validateMtfYaml(parsed, fileName);
      webview.postMessage({ command: 'importedConfig', fileName, validation });
    } catch (err: any) {
      webview.postMessage({
        command: 'importedConfig',
        fileName,
        validation: { isValid: false, errors: [err.message], warnings: [], suggestions: [], diagnostics: [] },
      });
    }
  }

  /** Validates a parsed MTF YAML object against the expected MTF schema. */
  private _validateMtfYaml(parsed: any, fileName: string) {
    type Diag = { code: string; severity: 'error' | 'warning' | 'suggestion'; source: string; message: string; path?: string; fix?: string };
    const diagnostics: Diag[] = [];
    const VALID_TYPES = ['CAN', 'CANFD', 'LIN', 'ETHERNET', 'FR', 'SERIAL', 'IO', 'PS'];
    const VALID_TRACER_TYPES = ['ASCII', 'PCAP', 'PCAPNG', 'MDF4'];

    if (!parsed || typeof parsed !== 'object') {
      diagnostics.push({ code: 'yaml.empty', severity: 'error', source: 'yaml', message: 'YAML content is empty or not an object.', fix: 'Provide a valid MTF configuration YAML.' });
      return this._buildValidationResult(diagnostics);
    }

    // ── Channels ──────────────────────────────────────────────────────────
    if (!parsed.Channels || typeof parsed.Channels !== 'object') {
      diagnostics.push({ code: 'mtf.channels.missing', severity: 'error', source: 'yaml', message: 'Missing required "Channels" section.', path: 'Channels', fix: 'Add a "Channels" section with at least one logical channel definition.' });
    } else {
      for (const [name, ch] of Object.entries(parsed.Channels) as [string, any][]) {
        if (ch?.Id == null) {
          diagnostics.push({ code: 'channel.id.missing', severity: 'error', source: 'yaml', message: `Channel "${name}" is missing a required "Id" field.`, path: `Channels.${name}.Id`, fix: 'Add a unique integer Id to this channel.' });
        } else if (!Number.isInteger(ch.Id) || ch.Id <= 0) {
          diagnostics.push({ code: 'channel.id.invalid', severity: 'error', source: 'yaml', message: `Channel "${name}" has an invalid Id "${ch.Id}". Must be a positive integer.`, path: `Channels.${name}.Id`, fix: 'Use a positive integer Id such as 1, 2, or 3.' });
        }
        if (!ch?.Type) {
          diagnostics.push({ code: 'channel.type.missing', severity: 'warning', source: 'yaml', message: `Channel "${name}" is missing a "Type" field.`, path: `Channels.${name}.Type`, fix: `Set Type to one of: ${VALID_TYPES.join(', ')}.` });
        }
      }
      // Check for duplicate Ids
      const idMap = new Map<number, string[]>();
      for (const [name, ch] of Object.entries(parsed.Channels) as [string, any][]) {
        if (ch?.Id != null) { const arr = idMap.get(ch.Id) ?? []; arr.push(name); idMap.set(ch.Id, arr); }
      }
      for (const [id, names] of idMap) {
        if (names.length > 1) {
          diagnostics.push({ code: 'channel.id.duplicate', severity: 'error', source: 'yaml', message: `Duplicate Id ${id} used by channels: ${names.join(', ')}.`, path: 'Channels[*].Id', fix: 'Assign a unique Id to each channel.' });
        }
      }
    }

    // ── Mappings ──────────────────────────────────────────────────────────
    const channelNames = new Set(Object.keys(parsed.Channels || {}));
    if (!parsed.Mappings || typeof parsed.Mappings !== 'object') {
      diagnostics.push({ code: 'mtf.mappings.missing', severity: 'error', source: 'yaml', message: 'Missing required "Mappings" section.', path: 'Mappings', fix: 'Add a "Mappings" section with CM, BTS, or PCAP subsections.' });
    } else {
      const { CM, BTS, PCAP } = parsed.Mappings;
      if (!CM && !BTS && !PCAP) {
        diagnostics.push({ code: 'mtf.mappings.empty', severity: 'warning', source: 'yaml', message: 'Mappings has no recognized subsections (CM, BTS, PCAP).', path: 'Mappings', fix: 'Add at least one CM, BTS, or PCAP mapping block.' });
      }
      // CM — cross-check Buses channel names
      if (CM?.Devices) {
        for (const [devId, device] of Object.entries(CM.Devices) as [string, any][]) {
          for (const busName of Object.keys(device?.Buses ?? {})) {
            if (channelNames.size > 0 && !channelNames.has(busName)) {
              diagnostics.push({ code: 'mapping.channel.unknown', severity: 'error', source: 'yaml', message: `CM Device ${devId} Buses references unknown channel "${busName}".`, path: `Mappings.CM.Devices.${devId}.Buses.${busName}`, fix: `"${busName}" must match a name defined in the Channels section.` });
            }
          }
        }
      }
      // BTS — cross-check Buses channel names
      if (BTS?.Boards) {
        for (const [boardIdx, board] of Object.entries(BTS.Boards) as [string, any][]) {
          for (const busName of Object.keys(board?.Buses ?? {})) {
            if (channelNames.size > 0 && !channelNames.has(busName)) {
              diagnostics.push({ code: 'mapping.channel.unknown', severity: 'error', source: 'yaml', message: `BTS Board ${boardIdx} Buses references unknown channel "${busName}".`, path: `Mappings.BTS.Boards.${boardIdx}.Buses.${busName}`, fix: `"${busName}" must match a name defined in the Channels section.` });
            }
          }
        }
      }
      // PCAP — cross-check Adapter.Name
      if (PCAP) {
        for (const [adapterIdx, entry] of Object.entries(PCAP) as [string, any][]) {
          const adapterName = entry?.Adapter?.Name;
          if (adapterName && channelNames.size > 0 && !channelNames.has(adapterName)) {
            diagnostics.push({ code: 'mapping.channel.unknown', severity: 'error', source: 'yaml', message: `PCAP ${adapterIdx} Adapter.Name references unknown channel "${adapterName}".`, path: `Mappings.PCAP.${adapterIdx}.Adapter.Name`, fix: `"${adapterName}" must match a name defined in the Channels section.` });
          }
        }
      }
    }

    // ── FrameworkConfig (optional) ────────────────────────────────────────
    if (parsed.FrameworkConfig) {
      const fc = parsed.FrameworkConfig;
      const tracerNames = new Set(Object.keys(fc.Tracing || {}));
      // Tracer type check
      for (const [tracerName, tracer] of Object.entries(fc.Tracing ?? {}) as [string, any][]) {
        if (!tracer?.Type) {
          diagnostics.push({ code: 'tracer.type.missing', severity: 'warning', source: 'yaml', message: `Tracer "${tracerName}" is missing a "Type" field.`, path: `FrameworkConfig.Tracing.${tracerName}.Type`, fix: `Set Type to one of: ${VALID_TRACER_TYPES.join(', ')}.` });
        }
      }
      // Channels that reference a tracer must point to a defined one
      if (tracerNames.size > 0) {
        for (const [chName, ch] of Object.entries(parsed.Channels ?? {}) as [string, any][]) {
          if (ch?.TracerName && !tracerNames.has(ch.TracerName)) {
            diagnostics.push({ code: 'channel.tracer.unknown', severity: 'warning', source: 'yaml', message: `Channel "${chName}" references undefined tracer "${ch.TracerName}".`, path: `Channels.${chName}.TracerName`, fix: `Define "${ch.TracerName}" in FrameworkConfig.Tracing or correct the tracer name.` });
          }
        }
      }
    }

    return this._buildValidationResult(diagnostics);
  }

  private _buildValidationResult(diagnostics: Array<{ code: string; severity: string; message: string; path?: string; fix?: string; source?: string }>) {
    const errors      = diagnostics.filter(d => d.severity === 'error').map(d => d.message);
    const warnings    = diagnostics.filter(d => d.severity === 'warning').map(d => d.message);
    const suggestions = diagnostics.filter(d => d.fix).map(d => d.path ? `${d.path}: ${d.fix}` : d.fix!);
    return { isValid: errors.length === 0, errors, warnings, suggestions, diagnostics };
  }



  // ── Shared helpers ────────────────────────────────────────────────────────

  /** Merges frameworkData from a webview message into the current config's frameworkConfig. */
  private _applyFrameworkData(fw: any): void {
    if (!this.currentConfig!.frameworkConfig) {
      (this.currentConfig as any).frameworkConfig = {};
    }
    const fc = this.currentConfig!.frameworkConfig as any;
    fc.tracers        = fw.tracers        || [];
    fc.publisherType  = fw.publisherType;
    fc.channelsGroups = fw.channelsGroups || [];
    fc.connectedEcus  = fw.connectedEcus  || [];
    fc.servicePack    = fw.servicePack;
    if (fw.ethernetConfig) { fc.ethernetConfig = fw.ethernetConfig; }
  }

  /** Rebuilds channelManager and mappingManager from a fully populated Configuration. */
  private _rebuildManagers(config: Configuration): void {
    this.channelManager = new ChannelManager();
    this.mappingManager = new MappingManager(this.channelManager);
    for (const ch of config.logicalChannels) {
      const factory = logicalChannelFactories[(ch as any).subclass];
      if (factory) {
        const rebuilt: any = factory(ch.id, ch.name);
        Object.assign(rebuilt, ch);
        this.channelManager.addLogicalChannel(rebuilt);
      }
    }
    for (const hw of config.hardwareChannels) {
      const factory = hardwareChannelFactories[(hw as any).subclass];
      if (factory) {
        const rebuilt: any = factory(hw.id, hw.name);
        Object.assign(rebuilt, hw);
        this.channelManager.addHardwareChannel(rebuilt);
      }
    }
    for (const m of config.mappings) {
      (this.mappingManager as any).mappings.set(m.mappingId, m);
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
  /** Public entry point used by WebviewProvider.applyPendingLoad(). */
  public applyAutoLoad(webview: vscode.Webview): void {
    if (this.loggedInUserId === null) {
      // User not yet authenticated in this panel session.
      // Leave the pending config in place — _checkAuth / _login will
      // call _applyAutoLoad themselves after setting loggedInUserId.
      return;
    }
    this._applyAutoLoad(webview);
  }

  private _applyAutoLoad(webview: vscode.Webview): void {
    const pending = consumeAutoLoad();
    if (!pending) { return; }

    // Stamp with the now-known logged-in userId
    const raw = { ...pending, userId: this.loggedInUserId };

    // Only NOW save to globalState and DB — userId is known and the FK is satisfied
    this.storageService.saveRaw(raw);
    saveConfigurationToDb(
      raw.id || raw.configId,
      raw.name,
      this.loggedInUserId,
      JSON.stringify(raw),
    ).catch((dbErr: any) => console.warn(`MTF config DB insert failed: ${dbErr.message}`));

    // Build the in-memory Configuration object
    this.currentConfig = new Configuration(
      raw.id || raw.configId,
      raw.name,
      raw.userId,
    );
    this.currentConfig.logicalChannels  = raw.logicalChannels  || [];
    this.currentConfig.hardwareChannels = raw.hardwareChannels || [];
    this.currentConfig.mappings         = raw.mappings         || [];
    this.currentConfig.frameworkConfig  = raw.frameworkConfig  || {} as any;
    this.channelManager = new ChannelManager();
    this.mappingManager = new MappingManager(this.channelManager);

    // 1) Re-send the full config list so the UI list re-renders with the new entry
    const all = this.storageService.getAllConfigurations() as any[];
    const mine = all.filter(c => Number(c.userId) === this.loggedInUserId);
    webview.postMessage({ command: 'configurationsLoaded', data: mine });

    // 2) Auto-load the MTF config as the active config
    webview.postMessage({ command: 'configurationLoaded', data: raw });
  }

  private async _saveCurrentConfig() {
    if (!this.currentConfig) { return; }
    this.storageService.saveConfiguration(this.currentConfig);
    await saveConfigurationToDb(
      this.currentConfig.id,
      this.currentConfig.name,
      this.currentConfig.userId,
      JSON.stringify(this.currentConfig.toJSON()),
    );
  }

  private _openUrl(message: any) {
    if (typeof message.url === 'string' && message.url.startsWith('https://')) {
      vscode.env.openExternal(vscode.Uri.parse(message.url));
    }
  }

  // ── MTF Agent handlers ────────────────────────────────────────────────────

  private async _agentCheckOllama(webview: vscode.Webview) {
    const client = new OllamaClient();
    const ok = await client.isAvailable();
    webview.postMessage({ command: 'agentOllamaStatus', available: ok });
  }

  private async _agentAsk(message: any, webview: vscode.Webview) {
    const question: string = (message.question ?? '').trim();
    if (!question) { return; }

    try {
      // Load knowledge base once and reuse
      if (!this.kb) {
        const resourcesDir = path.join(this.extensionUri.fsPath, 'resources');
        this.kb = KnowledgeBase.load(resourcesDir);
      }
      const agent = new RoutedMtfAgent(this.kb, this.ollama);
      const workspaceContext = await this._buildAgentWorkspaceContext();

      const { sources, meta } = await agent.ask(
        question,
        workspaceContext,
        (token: string) => {
          webview.postMessage({ command: 'agentChunk', token });
        },
      );

      webview.postMessage({
        command: 'agentDone',
        meta,
        sources: sources.map(r => ({
          section:     r.section,
          subsection:  r.subsection,
          title:       r.title,
          source_url:  r.source_url,
          score:       r.score,
          vectorScore: r.vectorScore,
          fromGraph:   r.fromGraph,
          sourceType:  r.sourceType,
          summary:     r.summary,
        })),
      });
    } catch (e: any) {
      webview.postMessage({ command: 'agentError', message: e.message });
    }
  }
  

  private async _buildAgentWorkspaceContext(): Promise<AgentWorkspaceContext | undefined> {
    const activeYamlContext = await this._readAgentYamlContext();
    if (!this.currentConfig && !activeYamlContext) { return undefined; }

    if (!this.currentConfig) {
      return activeYamlContext;
    }

    const mappings = this.mappingManager.getMappingsByConfigId(this.currentConfig.id);
    const localValidation = this.aiValidator.validate(this.currentConfig, mappings);
    const generator = new ConfigGenerator(this.currentConfig, this.mappingManager);

    let generatedYaml: string | undefined;
    let generationError: string | undefined;

    try {
      generatedYaml = generator.generate();
    } catch (error: any) {
      generationError = error?.message || 'Unknown YAML generation error.';
    }

    const generationValidationErrors = generator.preGenerationValidate();
    const generationDiagnostics = this._buildGenerationDiagnostics(generationValidationErrors);
    const validationErrors = [...new Set([
      ...generationValidationErrors,
      ...localValidation.errors,
    ])];

    return {
      configurationName: this.currentConfig.name,
      logicalChannels: this.currentConfig.logicalChannels.map((channel: any) => {
        const idLabel = channel.channelId != null && channel.channelId !== ''
          ? `Id=${channel.channelId}`
          : 'Id=missing';
        return `${channel.name} (${channel.category || channel.subclass || channel.type}; ${idLabel})`;
      }),
      hardwareChannels: this.currentConfig.hardwareChannels.map((channel: any) =>
        `${channel.name} (${channel.category || channel.subclass || channel.type})`,
      ),
      mappings: mappings.map((mapping: any) =>
        `${mapping.logicalChannelName} -> ${mapping.hardwareChannelName || mapping.hardwareChannelId}`,
      ),
      generatedYaml,
      validationErrors,
      validationWarnings: localValidation.warnings,
      validationSuggestions: localValidation.suggestions,
      validationDiagnostics: [...localValidation.diagnostics, ...generationDiagnostics],
      generationError,
      ...activeYamlContext,
    };
  }

  private async _readAgentYamlContext(): Promise<Partial<AgentWorkspaceContext> | undefined> {
    const yamlDocument = await this._resolveAgentYamlDocument();
    if (!yamlDocument) { return undefined; }

    const analysis = this._analyzeYamlDocument(yamlDocument.text);
    return {
      activeYamlPath: vscode.workspace.asRelativePath(yamlDocument.uri, false),
      activeYamlSource: yamlDocument.source,
      activeYamlText: yamlDocument.text,
      activeYamlParseError: analysis.parseError,
      activeYamlTopLevelKeys: analysis.topLevelKeys,
      activeYamlNestedKeys: analysis.nestedKeys,
      activeYamlStructuralFindings: analysis.structuralFindings,
      activeYamlDiagnostics: analysis.diagnostics,
    };
  }

  private async _resolveAgentYamlDocument(): Promise<{ uri: vscode.Uri; text: string; source: 'active_editor' | 'workspace_file' } | undefined> {
    const activeDocument = vscode.window.activeTextEditor?.document;
    if (activeDocument && this._isAgentYamlDocument(activeDocument)) {
      return {
        uri: activeDocument.uri,
        text: activeDocument.getText(),
        source: 'active_editor',
      };
    }

    const mtfFiles = await vscode.workspace.findFiles('**/MTF.yaml', '**/node_modules/**', 1);
    if (!mtfFiles.length) { return undefined; }

    const document = await vscode.workspace.openTextDocument(mtfFiles[0]);
    return {
      uri: document.uri,
      text: document.getText(),
      source: 'workspace_file',
    };
  }

  private _isAgentYamlDocument(document: vscode.TextDocument): boolean {
    if (document.uri.scheme !== 'file') { return false; }
    const lowerPath = document.uri.fsPath.toLowerCase();
    return document.languageId === 'yaml' || lowerPath.endsWith('.yaml') || lowerPath.endsWith('.yml');
  }

  private _analyzeYamlDocument(text: string): {
    parseError?: string;
    topLevelKeys: string[];
    nestedKeys: string[];
    structuralFindings: string[];
    diagnostics: ValidationDiagnostic[];
  } {
    try {
      const parsed = yaml.load(text) as unknown;
      const { topLevelKeys, nestedKeys } = this._collectYamlKeys(parsed);
      const diagnostics = this._buildYamlStructuralDiagnostics(parsed);
      return {
        topLevelKeys,
        nestedKeys,
        structuralFindings: diagnostics.map(diagnostic => diagnostic.message),
        diagnostics,
      };
    } catch (error: any) {
      const fallbackKeys = this._extractYamlKeyCandidates(text);
      const parseError = error?.message || 'Unable to parse the active YAML file.';
      return {
        parseError,
        topLevelKeys: fallbackKeys,
        nestedKeys: fallbackKeys,
        structuralFindings: [],
        diagnostics: [{
          code: 'yaml.parse_error',
          severity: 'error',
          source: 'yaml',
          message: parseError,
          path: 'yaml',
          fix: 'Fix the YAML syntax error first so the file can be parsed before deeper validation.',
        }],
      };
    }
  }

  private _collectYamlKeys(parsed: unknown): { topLevelKeys: string[]; nestedKeys: string[] } {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { topLevelKeys: [], nestedKeys: [] };
    }

    const root = parsed as Record<string, unknown>;
    const topLevelKeys = Object.keys(root);
    const nestedKeySet = new Set<string>();
    this._visitYamlNode(root, nestedKeySet);

    return {
      topLevelKeys,
      nestedKeys: [...nestedKeySet].slice(0, 40),
    };
  }

  private _visitYamlNode(node: unknown, nestedKeySet: Set<string>): void {
    if (Array.isArray(node)) {
      for (const item of node) {
        this._visitYamlNode(item, nestedKeySet);
      }
      return;
    }

    if (!node || typeof node !== 'object') { return; }
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      nestedKeySet.add(key);
      this._visitYamlNode(value, nestedKeySet);
    }
  }

  private _extractYamlKeyCandidates(text: string): string[] {
    const matches = text.match(/^[ \t]*([A-Za-z_][A-Za-z0-9_-]*)\s*:/gm) ?? [];
    const keys = matches
      .map(match => match.replace(/^[ \t]*/, '').replace(/:.*/, ''))
      .filter(Boolean);
    return [...new Set(keys)].slice(0, 40);
  }

  private _buildYamlStructuralDiagnostics(parsed: unknown): ValidationDiagnostic[] {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return [{
        code: 'yaml.root.invalid_type',
        severity: 'error',
        source: 'yaml',
        message: 'The YAML root must be a mapping of top-level sections.',
        path: 'yaml',
        fix: 'Start the file with top-level keys such as Channels, Mappings, and FrameworkConfig.',
      }];
    }

    const root = parsed as Record<string, unknown>;
    const diagnostics: ValidationDiagnostic[] = [];
    const channels = this._getYamlMapping(root.Channels);
    const channelNames = new Set(Object.keys(channels));
    const frameworkConfig = this._getYamlMapping(root.FrameworkConfig);
    const tracers = this._getYamlMapping(frameworkConfig.Tracing);
    const tracerNames = new Set(Object.keys(tracers));
    const canonicalKeys = new Map<string, string>([
      ['channels', 'Channels'],
      ['mappings', 'Mappings'],
      ['frameworkconfig', 'FrameworkConfig'],
    ]);

    for (const [key, canonical] of canonicalKeys) {
      const hasCanonical = Object.prototype.hasOwnProperty.call(root, canonical);
      const actualKey = Object.keys(root).find(candidate => candidate.toLowerCase() === key);
      if (actualKey && actualKey !== canonical && !hasCanonical) {
        diagnostics.push({
          code: 'yaml.top_level.casing',
          severity: 'error',
          source: 'yaml',
          message: `Rename top-level key '${actualKey}' to '${canonical}' to match the expected MTF casing.`,
          path: actualKey,
          fix: `Replace '${actualKey}:' with '${canonical}:'.`,
        });
      }
    }

    if (root.Channels !== undefined && (typeof root.Channels !== 'object' || root.Channels === null || Array.isArray(root.Channels))) {
      diagnostics.push({
        code: 'yaml.channels.invalid_type',
        severity: 'error',
        source: 'yaml',
        message: "'Channels' should be a mapping where each channel name contains its fields.",
        path: 'Channels',
        fix: 'Change Channels to an object mapping like Channels: { CAN1: { Id: 1 } }.',
      });
    }

    if (root.Mappings !== undefined && (typeof root.Mappings !== 'object' || root.Mappings === null)) {
      diagnostics.push({
        code: 'yaml.mappings.invalid_type',
        severity: 'error',
        source: 'yaml',
        message: "'Mappings' should be a mapping of mapping groups and entries.",
        path: 'Mappings',
        fix: 'Change Mappings to an object whose keys group mapping entries.',
      });
    }

    if (root.FrameworkConfig !== undefined && (typeof root.FrameworkConfig !== 'object' || root.FrameworkConfig === null || Array.isArray(root.FrameworkConfig))) {
      diagnostics.push({
        code: 'yaml.framework.invalid_type',
        severity: 'error',
        source: 'yaml',
        message: "'FrameworkConfig' should be an object that contains framework sections such as 'PublisherConfig'.",
        path: 'FrameworkConfig',
        fix: 'Wrap framework values under an object like FrameworkConfig: { PublisherConfig: ... }.',
      });
    }

    const NAME_RE = /^[A-Za-z_][A-Za-z0-9_\-]*$/;
    for (const [channelName, channelValue] of Object.entries(channels)) {
      if (!NAME_RE.test(channelName)) {
        diagnostics.push({
          code: 'yaml.channel.name.invalid_format',
          severity: 'error',
          source: 'yaml',
          message: `Channel name '${channelName}' is invalid. Channel names must start with a letter or underscore and contain no spaces.`,
          path: `Channels.${channelName}`,
          fix: 'Rename the channel to use only letters, digits, underscores, or hyphens.',
        });
      }

      const channel = this._getYamlMapping(channelValue);
      if (!channel.Type) {
        diagnostics.push({
          code: 'yaml.channel.type.missing',
          severity: 'error',
          source: 'yaml',
          message: `Channel '${channelName}' is missing the required 'Type' field.`,
          path: `Channels.${channelName}.Type`,
          fix: 'Add the documented channel type, such as CAN, LIN, ETHERNET, or FR.',
        });
      }
      if (channel.Id === undefined) {
        diagnostics.push({
          code: 'yaml.channel.id.missing',
          severity: 'error',
          source: 'yaml',
          message: `Channel '${channelName}' is missing the required 'Id' field.`,
          path: `Channels.${channelName}.Id`,
          fix: 'Assign a unique positive integer Id to the channel.',
        });
      }
      if (channel.TracerName && tracerNames.size > 0 && !tracerNames.has(String(channel.TracerName))) {
        diagnostics.push({
          code: 'yaml.channel.tracer.unknown',
          severity: 'error',
          source: 'yaml',
          message: `Channel '${channelName}' references tracer '${channel.TracerName}', which is not defined under FrameworkConfig.Tracing.`,
          path: `Channels.${channelName}.TracerName`,
          fix: 'Define the tracer under FrameworkConfig.Tracing or update TracerName to an existing tracer key.',
        });
      }
    }

    for (const [tracerName, tracerValue] of Object.entries(tracers)) {
      const tracer = this._getYamlMapping(tracerValue);
      if (!tracer.Type) {
        diagnostics.push({
          code: 'yaml.tracing.type.missing',
          severity: 'error',
          source: 'yaml',
          message: `Tracer '${tracerName}' is missing the required 'Type' field.`,
          path: `FrameworkConfig.Tracing.${tracerName}.Type`,
          fix: 'Set the tracer Type to a documented value such as ASCII or PCAP.',
        });
      }
      const extension = tracer.LoggerConfiguration?.FileConfig?.Extension;
      if (tracer.Type === 'ASCII' && typeof extension === 'string' && extension && extension !== '.asc') {
        diagnostics.push({
          code: 'yaml.tracing.ascii.extension_suspicious',
          severity: 'warning',
          source: 'yaml',
          message: `ASCII tracer '${tracerName}' uses extension '${extension}'. The documentation example uses '.asc'.`,
          path: `FrameworkConfig.Tracing.${tracerName}.LoggerConfiguration.FileConfig.Extension`,
          fix: 'Use .asc unless you have documentation supporting a different ASCII trace extension.',
        });
      }
      if (tracer.Type === 'PCAP' && !tracer.LoggingType) {
        diagnostics.push({
          code: 'yaml.tracing.pcap.logging_type_missing',
          severity: 'warning',
          source: 'yaml',
          message: `PCAP tracer '${tracerName}' does not define 'LoggingType'.`,
          path: `FrameworkConfig.Tracing.${tracerName}.LoggingType`,
          fix: 'Set LoggingType to a documented value such as MultipleAdapterMode, PerformanceMode, or StandardMode if supported in your version.',
        });
      }
    }

    const mappings = this._getYamlMapping(root.Mappings);
    const cmDevices = this._getYamlMapping(this._getYamlMapping(mappings.CM).Devices);
    for (const [deviceLabel, deviceValue] of Object.entries(cmDevices)) {
      const device = this._getYamlMapping(deviceValue);
      const basePath = `Mappings.CM.Devices.${deviceLabel}`;
      if (device.Id === undefined) {
        diagnostics.push({
          code: 'yaml.cm.id.missing',
          severity: 'error',
          source: 'yaml',
          message: `CM device '${deviceLabel}' is missing the required 'Id' field.`,
          path: `${basePath}.Id`,
          fix: 'Set Id to the last byte of the CM IP address as documented.',
        });
      }
      if (!device.Type) {
        diagnostics.push({
          code: 'yaml.cm.type.missing',
          severity: 'error',
          source: 'yaml',
          message: `CM device '${deviceLabel}' is missing the required 'Type' field.`,
          path: `${basePath}.Type`,
          fix: 'Set Type to a documented CM type such as CAN_Combo or LIN_Combo.',
        });
      }

      const buses = this._getYamlMapping(device.Buses ?? device.Busses);
      if (Object.keys(buses).length === 0) {
        diagnostics.push({
          code: 'yaml.cm.buses.missing',
          severity: 'error',
          source: 'yaml',
          message: `CM device '${deviceLabel}' is missing the required 'Buses' mapping.`,
          path: `${basePath}.Buses`,
          fix: 'Add a Buses section that maps each logical channel name to a HWChannel.',
        });
      }

      for (const [busName, busValue] of Object.entries(buses)) {
        const bus = this._getYamlMapping(busValue);
        if (channelNames.size > 0 && !channelNames.has(busName)) {
          diagnostics.push({
            code: 'yaml.cm.bus.unknown_channel',
            severity: 'error',
            source: 'yaml',
            message: `CM bus '${busName}' does not match any logical channel defined under Channels.`,
            path: `${basePath}.Buses.${busName}`,
            fix: 'Use the exact logical channel name from the Channels section.',
          });
        }
        if (bus.HWChannel === undefined) {
          diagnostics.push({
            code: 'yaml.cm.bus.hwchannel.missing',
            severity: 'error',
            source: 'yaml',
            message: `CM bus '${busName}' is missing the required 'HWChannel' field.`,
            path: `${basePath}.Buses.${busName}.HWChannel`,
            fix: 'Set HWChannel to the numeric channel ID configured in the CM web interface.',
          });
        } else if (!this._isNumericScalar(bus.HWChannel)) {
          diagnostics.push({
            code: 'yaml.cm.bus.hwchannel.invalid',
            severity: 'error',
            source: 'yaml',
            message: `CM bus '${busName}' uses non-numeric HWChannel '${bus.HWChannel}'.`,
            path: `${basePath}.Buses.${busName}.HWChannel`,
            fix: 'Use the numeric CM channel ID shown in the CM web interface.',
          });
        }
        if (bus.OperationMode && !['Normal', 'Spy', 'TxOnly', 'RxOnly'].includes(String(bus.OperationMode))) {
          diagnostics.push({
            code: 'yaml.cm.bus.operation_mode.invalid',
            severity: 'warning',
            source: 'yaml',
            message: `CM bus '${busName}' uses unsupported OperationMode '${bus.OperationMode}'.`,
            path: `${basePath}.Buses.${busName}.OperationMode`,
            fix: 'Use one of the documented values: Normal, Spy, TxOnly, or RxOnly.',
          });
        }
      }
    }

    const pcapMappings = this._getYamlMapping(mappings.PCAP);
    for (const [adapterLabel, adapterValue] of Object.entries(pcapMappings)) {
      const adapter = this._getYamlMapping(this._getYamlMapping(adapterValue).Adapter);
      const basePath = `Mappings.PCAP.${adapterLabel}.Adapter`;
      if (!adapter.Name) {
        diagnostics.push({
          code: 'yaml.pcap.name.missing',
          severity: 'error',
          source: 'yaml',
          message: `PCAP adapter '${adapterLabel}' is missing the required 'Name' field.`,
          path: `${basePath}.Name`,
          fix: 'Set Name to the logical Ethernet channel assigned to this adapter.',
        });
      } else if (channelNames.size > 0 && !channelNames.has(String(adapter.Name))) {
        diagnostics.push({
          code: 'yaml.pcap.name.unknown_channel',
          severity: 'error',
          source: 'yaml',
          message: `PCAP adapter '${adapterLabel}' references logical channel '${adapter.Name}', which is not defined under Channels.`,
          path: `${basePath}.Name`,
          fix: 'Use the exact Ethernet channel name from the Channels section.',
        });
      }
      if (!adapter.FriendlyName && !adapter.Interface) {
        diagnostics.push({
          code: 'yaml.pcap.adapter_locator.missing',
          severity: 'error',
          source: 'yaml',
          message: `PCAP adapter '${adapterLabel}' is missing both 'FriendlyName' and 'Interface'.`,
          path: basePath,
          fix: 'Provide FriendlyName or Interface so MTF can identify the network adapter.',
        });
      }
    }

    const publisherGroups = frameworkConfig.PublisherConfig?.ChannelsGroups;
    if (Array.isArray(publisherGroups)) {
      publisherGroups.forEach((group, groupIndex) => {
        if (!Array.isArray(group)) { return; }
        group.forEach((channelName, channelIndex) => {
          if (channelNames.size > 0 && typeof channelName === 'string' && !channelNames.has(channelName)) {
            diagnostics.push({
              code: 'yaml.publisher.channel_group.unknown_channel',
              severity: 'error',
              source: 'yaml',
              message: `PublisherConfig.ChannelsGroups references unknown channel '${channelName}'.`,
              path: `FrameworkConfig.PublisherConfig.ChannelsGroups.${groupIndex}.${channelIndex}`,
              fix: 'Use only channel names defined under Channels.',
            });
          }
        });
      });
    }

    const channelToEcus = this._getYamlMapping(frameworkConfig.EthernetConfig?.ChannelToEcusMapping);
    for (const channelName of Object.keys(channelToEcus)) {
      if (channelNames.size > 0 && !channelNames.has(channelName)) {
        diagnostics.push({
          code: 'yaml.channel_to_ecus.unknown_channel',
          severity: 'error',
          source: 'yaml',
          message: `ChannelToEcusMapping references unknown channel '${channelName}'.`,
          path: `FrameworkConfig.EthernetConfig.ChannelToEcusMapping.${channelName}`,
          fix: 'Use only channel names defined under Channels.',
        });
      }
    }

    const topologyConfig = frameworkConfig.EthernetConfig?.EthernetTopology?.TopologyConfig;
    if (Array.isArray(topologyConfig)) {
      topologyConfig.forEach((entry, entryIndex) => {
        const topologyEntry = this._getYamlMapping(entry);
        const entryPath = `FrameworkConfig.EthernetConfig.EthernetTopology.TopologyConfig.${entryIndex}`;
        const srcMacAdr = topologyEntry.SrcMacAdr;
        if (typeof srcMacAdr === 'string' && srcMacAdr && !this._isValidMacAddress(srcMacAdr)) {
          diagnostics.push({
            code: 'yaml.ethernet_topology.src_mac.invalid',
            severity: 'error',
            source: 'yaml',
            message: `Topology entry '${topologyEntry.EcuName || entryIndex}' uses invalid SrcMacAdr '${srcMacAdr}'.`,
            path: `${entryPath}.SrcMacAdr`,
            fix: 'Use a MAC address with six hexadecimal byte pairs, for example AA:BB:CC:DD:EE:FF.',
          });
        }

        const srcIpList = Array.isArray(topologyEntry.SrcIpList) ? topologyEntry.SrcIpList : [];
        srcIpList.forEach((ip, ipIndex) => {
          if (typeof ip === 'string' && !this._isValidIpAddress(ip)) {
            diagnostics.push({
              code: 'yaml.ethernet_topology.src_ip.invalid',
              severity: 'error',
              source: 'yaml',
              message: `Topology entry '${topologyEntry.EcuName || entryIndex}' uses invalid source IP '${ip}'.`,
              path: `${entryPath}.SrcIpList.${ipIndex}`,
              fix: 'Use a valid IPv4 or IPv6 address.',
            });
          }
        });

        const dstIpMappings = Array.isArray(topologyEntry.Vlans?.DstIpVlanMapping)
          ? topologyEntry.Vlans.DstIpVlanMapping as unknown[]
          : [];
        dstIpMappings.forEach((mapping: unknown, mappingIndex: number) => {
          const dstIp = this._getYamlMapping(mapping).DstIp;
          if (typeof dstIp === 'string' && !this._isValidIpAddress(dstIp)) {
            diagnostics.push({
              code: 'yaml.ethernet_topology.dst_ip.invalid',
              severity: 'error',
              source: 'yaml',
              message: `Topology entry '${topologyEntry.EcuName || entryIndex}' uses invalid destination IP '${dstIp}'.`,
              path: `${entryPath}.Vlans.DstIpVlanMapping.${mappingIndex}.DstIp`,
              fix: 'Use a valid IPv4 or IPv6 address.',
            });
          }
        });
      });
    }

    return diagnostics;
  }

  private _getYamlMapping(value: unknown): Record<string, any> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, any>;
  }

  private _isNumericScalar(value: unknown): boolean {
    if (typeof value === 'number') {
      return Number.isFinite(value);
    }
    if (typeof value === 'string') {
      return /^\d+$/.test(value.trim());
    }
    return false;
  }

  private _isValidMacAddress(value: string): boolean {
    return /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(value);
  }

  private _isValidIpAddress(value: string): boolean {
    return isIP(value) !== 0;
  }

  private _buildGenerationDiagnostics(errors: string[]): ValidationDiagnostic[] {
    return errors.map((message, index) => ({
      code: `generation.blocker.${index + 1}`,
      severity: 'error',
      source: 'generation',
      message,
      path: 'generation',
      fix: 'Resolve this generator precondition before asking the agent to produce a corrected YAML block.',
    }));
  }
  
}
