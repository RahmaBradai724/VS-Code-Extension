import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { Configuration } from '../models';
import { ChannelManager } from '../services/channelManager';
import { MappingManager } from '../services/mappingManager';
import { StorageService } from '../services/storageService';
import { ConfigGenerator } from '../services/configGenerator';
import { AIValidator } from '../ai/aiValidator';
import { MtfAgent } from '../ai/MtfAgent';
import { KnowledgeBase } from '../ai/mtf/KnowledgeBase';
import { OllamaClient } from '../ai/mtf/OllamaClient';
import { saveConfigurationToDb } from '../services/databaseService';
import { ChannelType } from '../models/enums';
import { logicalChannelFactories, hardwareChannelFactories } from './channelFactories';
import { AuthService } from '../services/auth/AuthService';
import { TokenStorage } from '../services/auth/TokenStorage';
import { UserRepository } from '../services/database/UserRepository';
import { ConfigurationRepository } from '../services/database/ConfigurationRepository';
import { YamlParser } from '../services/config/YamlParser';
import { consumeAutoLoad } from './autoLoadState';

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
    try {
      const generator   = new ConfigGenerator(this.currentConfig, this.mappingManager);
      const yamlContent = generator.generate();
      const mappings    = this.mappingManager.getMappingsByConfigId(this.currentConfig.id);
      const result      = await this.aiValidator.runAIValidation(this.currentConfig, mappings, yamlContent);
      webview.postMessage({ command: 'aiValidationResult', data: result });
    } catch {
      // Fall back to local validation
      const mappings = this.mappingManager.getMappingsByConfigId(this.currentConfig.id);
      const result   = this.aiValidator.validate(this.currentConfig, mappings);
      webview.postMessage({ command: 'aiValidationResult', data: result });
    }
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
      const agent = new MtfAgent(this.kb, this.ollama);

      const { sources } = await agent.ask(
        question,
        (token: string) => {
          webview.postMessage({ command: 'agentChunk', token });
        },
      );

      webview.postMessage({
        command: 'agentDone',
        sources: sources.map(r => ({
          section:     r.chunk.section,
          subsection:  r.chunk.subsection,
          title:       r.chunk.title,
          source_url:  r.chunk.source_url,
          score:       r.score,
          vectorScore: r.vectorScore,
          fromGraph:   r.fromGraph,
        })),
      });
    } catch (e: any) {
      webview.postMessage({ command: 'agentError', message: e.message });
    }
  }
}
