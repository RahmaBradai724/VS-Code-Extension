import * as vscode from 'vscode';
import * as path from 'path';
import { Configuration } from '../models';
import { ChannelManager } from '../services/channelManager';
import { MappingManager } from '../services/mappingManager';
import { StorageService } from '../services/storageService';
import { ConfigGenerator } from '../services/configGenerator';
import { AIValidator } from '../ai/aiValidator';
import { saveConfigurationToDb } from '../services/databaseService';
import { CANChannel, LINChannel, FlexRayChannel, EthernetChannel, SerialChannel, IOInputChannel, IOOutputChannel, BridgeChannel, AnalogChannel, PSChannel, IPSChannel } from '../models/logicalChannels';
import { LINCard, SerialPort, HIDRelay, RelayBoard, EthernetAdapter, AnalogDevice, CANInterface, CIBInterface, TEAnalog, CMInterface, HHLoad } from '../models/hardwareChannels';
import {
  ChannelType,
  LogicalChannelCategory,
  HardwareChannelCategory,
  LogicalChannelSubclass,
  HardwareChannelSubclass,
} from '../models/enums';

const logicalChannelFactories: Record<string, (id: string, name: string) => any> = {
  [LogicalChannelSubclass.CAN]: (id, name) => new CANChannel(id, name),
  [LogicalChannelSubclass.LIN]: (id, name) => new LINChannel(id, name),
  [LogicalChannelSubclass.FLEXRAY]: (id, name) => new FlexRayChannel(id, name),
  [LogicalChannelSubclass.ETHERNET]: (id, name) => new EthernetChannel(id, name),
  [LogicalChannelSubclass.SERIAL]: (id, name) => new SerialChannel(id, name),
  [LogicalChannelSubclass.IOINPUT]: (id, name) => new IOInputChannel(id, name),
  [LogicalChannelSubclass.IOOUTPUT]: (id, name) => new IOOutputChannel(id, name),
  [LogicalChannelSubclass.BRIDGE]: (id, name) => new BridgeChannel(id, name),
  [LogicalChannelSubclass.ANALOG]: (id, name) => new AnalogChannel(id, name),
  [LogicalChannelSubclass.PS]: (id, name) => new PSChannel(id, name),
  [LogicalChannelSubclass.IOSERIAL]: (id, name) => new IPSChannel(id, name),
};

const hardwareChannelFactories: Record<string, (id: string, name: string) => any> = {
  [HardwareChannelSubclass.CAN_INTERFACE]: (id, name) => new CANInterface(id, name),
  [HardwareChannelSubclass.CIB_INTERFACE]: (id, name) => new CIBInterface(id, name),
  [HardwareChannelSubclass.ETHERNET_ADAPTER]: (id, name) => new EthernetAdapter(id, name),
  [HardwareChannelSubclass.SERIAL_PORT]: (id, name) => new SerialPort(id, name),
  [HardwareChannelSubclass.LIN_CARD]: (id, name) => new LINCard(id, name),
  [HardwareChannelSubclass.RELAY_BOARD]: (id, name) => new RelayBoard(id, name),
  [HardwareChannelSubclass.HID_RELAY]: (id, name) => new HIDRelay(id, name),
  [HardwareChannelSubclass.ANALOG_DEVICE]: (id, name) => new AnalogDevice(id, name),
  [HardwareChannelSubclass.TE_ANALOG]: (id, name) => new TEAnalog(id, name),
  [HardwareChannelSubclass.CM_INTERFACE]: (id, name) => new CMInterface(id, name),
  [HardwareChannelSubclass.HH_LOAD]: (id, name) => new HHLoad(id, name),
};

/**
 * WebviewProvider hosts the main Configuration Manager UI
 * in a VS Code sidebar/tab webview.
 */
export class WebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'channelConfig.mainView';

  private _view?: vscode.WebviewView;
  private channelManager: ChannelManager;
  private mappingManager: MappingManager;
  private storageService: StorageService;
  private aiValidator: AIValidator;
  private currentConfig?: Configuration;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    context: vscode.ExtensionContext,
  ) {
    this.storageService = new StorageService(context);
    this.channelManager = new ChannelManager();
    this.mappingManager = new MappingManager(this.channelManager);
    const apiKey = vscode.workspace.getConfiguration('channelConfig').get<string>('geminiApiKey') || '';
    this.aiValidator = new AIValidator(apiKey);
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
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

  private async _handleMessage(message: any, webview: vscode.Webview) {
    switch (message.command) {
      case 'getConfigurations':
        webview.postMessage({ command: 'configurationsLoaded', data: this.storageService.getAllConfigurations() });
        break;

      case 'createConfiguration': {
        const id = `config_${Date.now()}`;
        const currentUser = this.storageService.getCurrentUser() as any;
        const userId = currentUser ? currentUser.id : null;
        this.currentConfig = new Configuration(id, message.name, userId);
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
        const raw = this.storageService.getConfigurationById(message.configId) as any;

        if (raw) {
          this.currentConfig = new Configuration(
            raw.id || raw.configId,
            raw.name,
            raw.userId
          );

          this.currentConfig.logicalChannels = raw.logicalChannels || [];
          this.currentConfig.hardwareChannels = raw.hardwareChannels || [];
          this.currentConfig.mappings = raw.mappings || [];
          this.currentConfig.frameworkConfig = raw.frameworkConfig || {};
        }

        webview.postMessage({ command: 'configurationLoaded', data: raw });
        break;
      }

      case 'addLogicalChannel': {
        try {
          if (!this.currentConfig) { throw new Error('No configuration loaded.'); }
          
          const raw = message.channel;
          const factory = logicalChannelFactories[raw.subclass];
          if (!factory) {
            throw new Error(`Unsupported logical channel subclass: ${raw.subclass}`);
          }
          const channel: any = factory(raw.id, raw.name);
          
          Object.assign(channel, raw);
          channel.type = ChannelType.LOGICAL;
          channel.category = raw.category || channel.category;
          channel.subclass = raw.subclass || channel.subclass;
          this.channelManager.addLogicalChannel(channel);
          this.currentConfig.logicalChannels.push(channel);
          
          // Persist
          this._saveCurrentConfig();
          
          webview.postMessage({ command: 'success', action: 'addLogicalChannel', data: channel.toJSON() });
        } catch (e: any) {
          webview.postMessage({ command: 'error', message: e.message });
        }
        break;
      }

      case 'deleteLogicalChannel': {
        try {
          if (!this.currentConfig) { throw new Error('No configuration loaded.'); }
          this.channelManager.deleteLogicalChannel(message.channelId);
          this.currentConfig.logicalChannels = this.currentConfig.logicalChannels.filter(c => c.id !== message.channelId);
          
          this._saveCurrentConfig();
          
          webview.postMessage({ command: 'success', action: 'deleteLogicalChannel', id: message.channelId });
        } catch (e: any) {
          webview.postMessage({ command: 'error', message: e.message });
        }
        break;
      }

      case 'addHardwareChannel': {
        try {
          if (!this.currentConfig) { throw new Error('No configuration loaded.'); }
          const raw = message.channel;
          const factory = hardwareChannelFactories[raw.subclass];
          if (!factory) {
            throw new Error(`Unsupported hardware channel subclass: ${raw.subclass}`);
          }
          const channel: any = factory(raw.id, raw.name);
          
          Object.assign(channel, raw);
          channel.type = ChannelType.HARDWARE;
          channel.category = raw.category || channel.category;
          channel.subclass = raw.subclass || channel.subclass;
          this.channelManager.addHardwareChannel(channel);
          this.currentConfig.hardwareChannels.push(channel);
          
          this._saveCurrentConfig();
          
          webview.postMessage({ command: 'success', action: 'addHardwareChannel', data: channel.toJSON() });
        } catch (e: any) {
          webview.postMessage({ command: 'error', message: e.message });
        }
        break;
      }

      case 'deleteHardwareChannel': {
        try {
          if (!this.currentConfig) { throw new Error('No configuration loaded.'); }
          this.channelManager.deleteHardwareChannel(message.channelId);
          this.currentConfig.hardwareChannels = this.currentConfig.hardwareChannels.filter(c => c.id !== message.channelId);
          
          this._saveCurrentConfig();
          
          webview.postMessage({ command: 'success', action: 'deleteHardwareChannel', id: message.channelId });
        } catch (e: any) {
          webview.postMessage({ command: 'error', message: e.message });
        }
        break;
      }

      case 'addMapping': {
        try {
          if (!this.currentConfig) { throw new Error('No configuration loaded.'); }
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
        break;
      }

      case 'removeMapping': {
        try {
          if (!this.currentConfig) { throw new Error('No configuration loaded.'); }
          this.mappingManager.removeMapping(message.mappingId);
          this.currentConfig.mappings = this.currentConfig.mappings.filter(m => m.mappingId !== message.mappingId);
          
          this._saveCurrentConfig();
          
          webview.postMessage({ command: 'success', action: 'removeMapping', id: message.mappingId });
        } catch (e: any) {
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
          const generator = new ConfigGenerator(this.currentConfig, this.mappingManager);
          const yamlContent = generator.generate();
          webview.postMessage({ command: 'configGenerated', yaml: yamlContent });

          // Also save to workspace file
          const uri = await vscode.window.showSaveDialog({ filters: { YAML: ['yaml', 'yml'] }, defaultUri: vscode.Uri.file('config.yaml') });
          if (uri) {
            await vscode.workspace.fs.writeFile(uri, Buffer.from(yamlContent, 'utf8'));
            vscode.window.showInformationMessage(`config.yaml saved to ${uri.fsPath}`);
          }
        } catch (e: any) {
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
          const generator = new ConfigGenerator(this.currentConfig, this.mappingManager);
          const yamlContent = generator.generate();
          const mappings = this.mappingManager.getMappingsByConfigId(this.currentConfig.id);
          const result = await this.aiValidator.runAIValidation(this.currentConfig, mappings, yamlContent);
          webview.postMessage({ command: 'aiValidationResult', data: result });
        } catch (e: any) {
          // Run local only
          const mappings = this.mappingManager.getMappingsByConfigId(this.currentConfig?.id || '');
          const result = this.aiValidator.validate(this.currentConfig!, mappings);
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
    }
  }

  private async _saveCurrentConfig() {
    if (this.currentConfig) {
      this.storageService.saveConfiguration(this.currentConfig);
      await saveConfigurationToDb(
        this.currentConfig.id,
        this.currentConfig.name,
        this.currentConfig.userId,
        JSON.stringify(this.currentConfig.toJSON())
      );
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();
    const logicalCategoryOptions = Object.values(LogicalChannelCategory);
    const hardwareCategoryOptions = Object.values(HardwareChannelCategory);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' 'nonce-${nonce}';">
  <title>Channel Configuration Manager</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background);
      --fg: var(--vscode-editor-foreground);
      --accent: var(--vscode-button-background);
      --accent-fg: var(--vscode-button-foreground);
      --border: var(--vscode-panel-border);
      --input-bg: var(--vscode-input-background);
      --input-fg: var(--vscode-input-foreground);
      --card-bg: var(--vscode-editorWidget-background);
      --error: var(--vscode-errorForeground);
      --warning: var(--vscode-editorWarning-foreground);
      --success: var(--vscode-terminal-ansiGreen);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--vscode-font-family); font-size: 13px; color: var(--fg); background: var(--bg); padding: 12px; }
    h2 { font-size: 15px; font-weight: 600; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
    h3 { font-size: 13px; font-weight: 600; margin: 10px 0 6px; }
    .tabs { display: flex; gap: 4px; margin-bottom: 16px; flex-wrap: wrap; }
    .tab { padding: 5px 10px; cursor: pointer; border: 1px solid var(--border); background: transparent; color: var(--fg); border-radius: 4px; font-size: 12px; }
    .tab.active { background: var(--accent); color: var(--accent-fg); border-color: var(--accent); }
    .panel { display: none; }
    .panel.active { display: block; }
    input, select, textarea {
      width: 100%; padding: 5px 8px; background: var(--input-bg); color: var(--input-fg);
      border: 1px solid var(--border); border-radius: 4px; font-size: 12px; margin-bottom: 8px;
    }
    button {
      padding: 5px 12px; background: var(--accent); color: var(--accent-fg); border: none;
      border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;
      display: inline-flex; align-items: center; justify-content: center;
    }
    button:hover { opacity: 0.85; }
    button.secondary { background: transparent; color: var(--fg); border: 1px solid var(--border); }
    .btn-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 6px; padding: 10px; margin-bottom: 8px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .badge { font-size: 10px; padding: 2px 6px; border-radius: 10px; background: var(--accent); color: var(--accent-fg); }
    .list-empty { color: var(--vscode-descriptionForeground); font-size: 12px; padding: 8px 0; }
    .alert { padding: 8px 10px; border-radius: 4px; margin-bottom: 8px; font-size: 12px; }
    .alert.error { background: rgba(255,0,0,0.1); border-left: 3px solid var(--error); color: var(--error); }
    .alert.warning { background: rgba(255,165,0,0.1); border-left: 3px solid var(--warning); color: var(--warning); }
    .alert.success { background: rgba(0,200,0,0.1); border-left: 3px solid var(--success); color: var(--success); }
    .alert.info { background: rgba(100,100,255,0.1); border-left: 3px solid var(--vscode-textLink-foreground); }
    pre { background: var(--card-bg); border: 1px solid var(--border); border-radius: 4px; padding: 10px; font-size: 11px; overflow: auto; max-height: 300px; white-space: pre-wrap; }
    label { font-size: 11px; color: var(--vscode-descriptionForeground); display: block; margin-bottom: 2px; }
    .form-group { margin-bottom: 10px; }
    #diagram-container { width: 100%; height: 400px; border: 1px solid var(--border); border-radius: 6px; overflow: auto; position: relative; background: var(--card-bg); }
    .diagram-node { position: absolute; border: 2px solid var(--accent); border-radius: 8px; padding: 8px 12px; font-size: 11px; font-weight: 500; min-width: 120px; text-align: center; cursor: pointer; background: var(--card-bg); }
    .diagram-node.logical { border-color: #4ec9b0; }
    .diagram-node.hardware { border-color: #dcdcaa; }
    .diagram-line { position: absolute; background: var(--border); height: 2px; transform-origin: left center; }
  </style>
</head>
<body>
  <h2>⚙️ Channel Config Manager</h2>

  <div class="tabs">
    <button class="tab active" data-tab="configs">Configurations</button>
    <button class="tab" data-tab="logical">Logical Channels</button>
    <button class="tab" data-tab="hardware">Hardware Channels</button>
    <button class="tab" data-tab="mappings">Mappings</button>
    <button class="tab" data-tab="framework">Framework</button>
    <button class="tab" data-tab="generate">Generate</button>
    <button class="tab" data-tab="diagram">Diagram</button>
  </div>

  <!-- CONFIGURATIONS PANEL -->
  <div id="panel-configs" class="panel active">
    <h3>Configurations</h3>
    <div class="form-group">
      <label>New Configuration Name</label>
      <input id="new-config-name" type="text" placeholder="e.g. ECU_Config_v1" />
    </div>
    <div class="btn-row">
      <button id="btn-create-config">+ Create</button>
      <button id="btn-import-config" class="secondary">↑ Import YAML</button>
    </div>
    <div id="config-list" style="margin-top:12px"><p class="list-empty">No configurations yet.</p></div>
  </div>

  <!-- LOGICAL CHANNELS PANEL -->
  <div id="panel-logical" class="panel">
    <h3>Logical Channels</h3>
    <div class="card">
      <div class="form-group">
        <label>Category</label>
        <select id="lc-category"></select>
      </div>
      <div class="form-group">
        <label>Subclass</label>
        <div id="lc-subclass-list" class="btn-row"></div>
        <input id="lc-subclass" type="hidden" />
      </div>
      <div id="lc-fields-wrapper" style="display:none">
        <div class="form-group">
          <label>Name</label>
          <input id="lc-name" type="text" placeholder="e.g. CAN_BUS_1" />
        </div>
        <div class="form-group">
          <label>Logging Name</label>
          <input id="lc-logging-name" type="text" placeholder="e.g. Logging_1" />
        </div>
        <div class="form-group">
          <label>Tracer Name</label>
          <input id="lc-tracer-name" type="text" placeholder="e.g. Tracer_1" />
        </div>
        <div class="form-group">
          <label>Aliases (comma separated)</label>
          <input id="lc-alias" type="text" placeholder="e.g. Alias1, Alias2" />
        </div>
        <div id="lc-dynamic-attrs" style="border-top: 1px solid var(--border); margin-top: 10px; padding-top: 10px;">
          <!-- Dynamic fields go here -->
        </div>
        <button id="btn-add-logical" style="margin-top: 10px;">+ Add Channel</button>
      </div>
    </div>
    <div id="lc-list"><p class="list-empty">No logical channels defined.</p></div>
  </div>

  <!-- HARDWARE CHANNELS PANEL -->
  <div id="panel-hardware" class="panel">
    <h3>Hardware Channels</h3>
    <div class="card">
      <div class="form-group">
        <label>Category</label>
        <select id="hw-category"></select>
      </div>
      <div class="form-group">
        <label>Subclass</label>
        <div id="hw-subclass-list" class="btn-row"></div>
        <input id="hw-subclass" type="hidden" />
      </div>
      <div id="hw-dynamic-attrs" style="border-top: 1px solid var(--border); margin-top: 10px; padding-top: 10px;">
        <!-- Dynamic fields go here -->
      </div>
      <button id="btn-add-hardware">+ Add Hardware</button>
    </div>
    <div id="hw-list"><p class="list-empty">No hardware channels defined.</p></div>
  </div>

  <!-- MAPPINGS PANEL -->
  <div id="panel-mappings" class="panel">
    <h3>Channel Mappings</h3>
    <div class="card">
      <div class="form-group">
        <label>Logical Channel</label>
        <select id="map-logical"><option value="">-- Select --</option></select>
      </div>
      <div class="form-group">
        <label>Hardware Channel</label>
        <select id="map-hardware"><option value="">-- Select --</option></select>
      </div>
      <div style="border-top:1px solid var(--border);margin-top:8px;padding-top:8px">
        <p style="font-size:11px;opacity:0.7;margin-bottom:6px">CM Bus Parameters (required for CM devices)</p>
        <div class="form-group">
          <label>HW Channel (CM port ID)</label>
          <input id="map-hwChannel" type="number" placeholder="e.g. 619" />
        </div>
        <div class="form-group">
          <label>Operation Mode</label>
          <select id="map-operationMode">
            <option value="">-- None --</option>
            <option value="Normal">Normal</option>
            <option value="Spy">Spy</option>
            <option value="TxOnly">TxOnly</option>
            <option value="RxOnly">RxOnly</option>
          </select>
        </div>
        <p style="font-size:11px;opacity:0.7;margin-bottom:6px;margin-top:6px">FlexRay only</p>
        <div class="form-group">
          <label>Key Slot</label>
          <input id="map-keySlot" type="number" placeholder="e.g. 1" />
        </div>
        <div class="form-group">
          <label>Node Type</label>
          <select id="map-nodeType">
            <option value="">-- None --</option>
            <option value="ColdStartLeading">ColdStartLeading</option>
            <option value="ColdStartFollowing">ColdStartFollowing</option>
            <option value="NonColdStartNonSync">NonColdStartNonSync</option>
            <option value="NonColdStartSync">NonColdStartSync</option>
          </select>
        </div>
        <div class="form-group">
          <label>Wake Up Cluster</label>
          <input id="map-wakeUpCluster" type="checkbox" style="width:auto" />
        </div>
      </div>
      <button id="btn-add-mapping">+ Create Mapping</button>
    </div>
    <div id="map-list"><p class="list-empty">No mappings defined.</p></div>
  </div>

  <!-- FRAMEWORK PANEL -->
  <div id="panel-framework" class="panel">
    <h3>Framework Configuration</h3>
    <div class="card">
      <div class="form-group">
        <label>Publisher Mode</label>
        <select id="fw-publisher-mode">
          <option value="SingleThreaded">Single Threaded</option>
          <option value="MultiThreaded">Multi Threaded</option>
        </select>
      </div>
      <div class="form-group">
        <label>Server URL</label>
        <input id="fw-server-url" type="text" placeholder="http://localhost:8080" />
      </div>
      <h3 style="margin-top:10px">Tracers</h3>
      <div style="display:flex;gap:8px">
        <select id="tracer-type"><option value="PCAP">PCAP Tracer</option><option value="ASCII">ASCII Tracer</option></select>
        <input id="tracer-name" type="text" placeholder="Tracer name" style="margin:0"/>
        <button id="btn-add-tracer" style="white-space:nowrap">+ Add</button>
      </div>
      <div id="tracer-list" style="margin-top:8px"><p class="list-empty">No tracers.</p></div>
    </div>
  </div>

  <!-- GENERATE PANEL -->
  <div id="panel-generate" class="panel">
    <h3>Generate &amp; Validate</h3>
    <div class="btn-row">
      <button id="btn-generate-config">⚡ Generate config.yaml</button>
      <button id="btn-run-ai-validation">🤖 Run AI Validation</button>
    </div>
    <div id="generate-messages" style="margin-top:12px"></div>
    <div id="yaml-preview" style="margin-top:12px;display:none">
      <h3>Preview</h3>
      <pre id="yaml-content"></pre>
    </div>
    <div id="ai-results" style="margin-top:12px;display:none">
      <h3>AI Validation Results</h3>
      <div id="ai-errors"></div>
      <div id="ai-warnings"></div>
      <div id="ai-suggestions"></div>
    </div>
  </div>

  <!-- DIAGRAM PANEL -->
  <div id="panel-diagram" class="panel">
    <h3>Hardware Diagram</h3>
    <button id="btn-refresh-diagram" style="margin-bottom:10px">🔄 Refresh Diagram</button>
    <div id="diagram-container"></div>
  </div>

  <div id="global-message" style="margin-top:10px;display:none"></div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    let state = {
      configs: [],
      selectedConfigId: null,
      logicalChannels: [],
      hardwareChannels: [],
      mappings: [],
    };

    // ── Tab navigation ──────────────────────────────────────────────────
    function showTab(tabName) {
      const panel = document.getElementById('panel-' + tabName);
      if (!panel) return;

      // Update panels
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      panel.classList.add('active');

      // Update tab buttons
      document.querySelectorAll('.tab').forEach(t => {
        if (t.dataset.tab === tabName) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });
      
      if (tabName === 'mappings') { refreshMappingDropdowns(); }
      if (tabName === 'diagram') { renderDiagram(); }
      if (tabName === 'logical') { resetLogicalSubclassSelection(); }
      if (tabName === 'hardware') { resetHardwareSubclassSelection(); }
    }

    // Initialize tab listeners
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        showTab(tab.dataset.tab);
      });
    });

    // ── Message from extension ──────────────────────────────────────────
    window.addEventListener('message', event => {
      const msg = event.data;
      switch(msg.command) {
        case 'configurationsLoaded':
          state.configs = msg.data;
          renderConfigList();
          break;
        case 'configurationCreated':
          state.configs.push(msg.data);
          renderConfigList();
          showGlobal('Configuration created!', 'success');
          break;
        case 'configurationDeleted':
          state.configs = state.configs.filter(c => c.configId !== msg.configId);
          renderConfigList();
          break;
        case 'configurationLoaded':
          if (msg.data) {
            state.selectedConfigId = msg.data.id || msg.data.configId;
            state.logicalChannels = msg.data.logicalChannels || [];
            state.hardwareChannels = msg.data.hardwareChannels || [];
            state.mappings = msg.data.mappings || [];
            renderLogicalList(); renderHardwareList(); renderMappingList();
            showGlobal('Configuration "' + msg.data.name + '" loaded.', 'success');
          }
          break;
        case 'success':
          handleSuccess(msg);
          break;
        case 'error':
          showGlobal(msg.message, 'error');
          break;
        case 'configGenerated':
          document.getElementById('yaml-content').textContent = msg.yaml;
          document.getElementById('yaml-preview').style.display = 'block';
          showMessage('generate-messages', 'config.yaml generated successfully!', 'success');
          break;
        case 'aiValidationResult':
          renderAIResults(msg.data);
          break;
        case 'importedConfig':
          showMessage('generate-messages', 'File imported. YAML content:\\n' + msg.content.substring(0, 200) + '...', 'info');
          break;
      }
    });

    function handleSuccess(msg) {
      if (msg.action === 'addLogicalChannel') {
        state.logicalChannels.push(msg.data);
        renderLogicalList();
        showGlobal('Logical channel added.', 'success');
      } else if (msg.action === 'deleteLogicalChannel') {
        state.logicalChannels = state.logicalChannels.filter(c => c.id !== msg.id);
        renderLogicalList();
      } else if (msg.action === 'addHardwareChannel') {
        state.hardwareChannels.push(msg.data);
        renderHardwareList();
        showGlobal('Hardware channel added.', 'success');
      } else if (msg.action === 'deleteHardwareChannel') {
        state.hardwareChannels = state.hardwareChannels.filter(c => c.id !== msg.id);
        renderHardwareList();
      } else if (msg.action === 'addMapping') {
        state.mappings.push(msg.data);
        renderMappingList();
        showGlobal('Mapping created.', 'success');
      } else if (msg.action === 'removeMapping') {
        state.mappings = state.mappings.filter(m => m.mappingId !== msg.id);
        renderMappingList();
      }
    }

    // ── Setup Click Listeners ───────────────────────────────────────────
    document.getElementById('btn-create-config').addEventListener('click', () => {
      const name = document.getElementById('new-config-name').value.trim();
      if (!name) { showGlobal('Please enter a configuration name.', 'error'); return; }
      vscode.postMessage({ command: 'createConfiguration', name });
      document.getElementById('new-config-name').value = '';
    });

    document.getElementById('btn-import-config').addEventListener('click', () => {
      vscode.postMessage({ command: 'importConfig' });
    });

    const CHANNEL_TYPES = {
      LOGICAL: '${ChannelType.LOGICAL}',
      HARDWARE: '${ChannelType.HARDWARE}',
    };
    const LOGICAL_CATEGORY_OPTIONS = ${JSON.stringify(logicalCategoryOptions)};
    const HARDWARE_CATEGORY_OPTIONS = ${JSON.stringify(hardwareCategoryOptions)};
    const LOGICAL_SUBCLASS_OPTIONS = [
      { value: 'FlexRayChannel', label: 'FlexRayChannel', category: 'FLEXRAY' },
      { value: 'SerialChannel', label: 'SerialChannel', category: 'SERIAL' },
      { value: 'CANChannel', label: 'CANChannel', category: 'CAN' },
      { value: 'IOInputChannel', label: 'IOInputChannel', category: 'IOINPUT' },
      { value: 'IOOutputChannel', label: 'IOOutputChannel', category: 'IOOUTPUT' },
      { value: 'LINChannel', label: 'LINChannel', category: 'LIN' },
      { value: 'PSChannel', label: 'PSChannel', category: 'PS' },
      { value: 'BridgeChannel', label: 'BridgeChannel', category: 'BRIDGE' },
      { value: 'AnalogChannel', label: 'AnalogChannel', category: 'ANALOG' },
      { value: 'EthernetChannel', label: 'EthernetChannel', category: 'ETHERNET' },
    ];

    const HARDWARE_SUBCLASS_OPTIONS = [
      { value: 'CANInterface', label: 'CANInterface (CM CAN_Combo)', category: 'CAN_INTERFACE' },
      { value: 'CIBInterface', label: 'CIBInterface (CM CAN_Combo)', category: 'CAN_INTERFACE' },
      { value: 'CMInterface', label: 'CMInterface (CM CAN_Combo)', category: 'CAN_INTERFACE' },
      { value: 'LINCard', label: 'LINCard (CM LIN_Combo)', category: 'CAN_INTERFACE' },
      { value: 'EthernetAdapter', label: 'EthernetAdapter (PCAP)', category: 'ETHERNET_ADAPTER' },
      { value: 'SerialPort', label: 'SerialPort', category: 'SERIAL_PORT' },
      { value: 'RelayBoard', label: 'RelayBoard', category: 'RELAY_BOARD' },
      { value: 'HIDRelay', label: 'HIDRelay', category: 'HID_RELAY' },
      { value: 'AnalogDevice', label: 'AnalogDevice', category: 'ANALOG_DEVICE' },
      { value: 'TEAnalog', label: 'TEAnalog', category: 'TE_ANALOG' },
      { value: 'HHLoad', label: 'HHLoad', category: 'HH_LOAD' },
    ];

    function renderLogicalCategoryOptions() {
      const select = document.getElementById('lc-category');
      select.innerHTML = '<option value="">-- Select Category --</option>' +
        LOGICAL_CATEGORY_OPTIONS.map(category => \`<option value="\${category}">\${category}</option>\`).join('');
    }

    function renderHardwareCategoryOptions() {
      const select = document.getElementById('hw-category');
      select.innerHTML = '<option value="">-- Select Category --</option>' +
        HARDWARE_CATEGORY_OPTIONS.map(category => \`<option value="\${category}">\${category}</option>\`).join('');
    }

    function buildAutoHardwareName(subclass) {
      const count = state.hardwareChannels.filter(c => c.subclass === subclass).length + 1;
      return \`\${subclass}_\${count}\`;
    }

    function collectDynamicValues(containerId, prefix) {
      const out = {};
      const container = document.getElementById(containerId);
      const inputs = container.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const rawValue = typeof input.value === 'string' ? input.value.trim() : input.value;
        if (input.type !== 'checkbox' && !rawValue) {
          return;
        }
        let val = rawValue;
        if (input.type === 'number') { val = parseFloat(rawValue); }
        if (input.type === 'checkbox') { val = input.checked; }
        if (input.dataset.format === 'csv') {
          val = rawValue.split(',').map(v => v.trim()).filter(Boolean);
          if (val.length === 0) {
            return;
          }
        }
        if (input.dataset.format === 'json') {
          try {
            val = JSON.parse(rawValue);
          } catch (error) {
            throw new Error('Invalid JSON for ' + input.id.replace(prefix, '') + '.');
          }
        }
        out[input.id.replace(prefix, '')] = val;
      });
      return out;
    }

    function syncLogicalSubclassOptions() {
      const list = document.getElementById('lc-subclass-list');
      const subclassInput = document.getElementById('lc-subclass');
      const categoryInput = document.getElementById('lc-category');
      const fieldsWrapper = document.getElementById('lc-fields-wrapper');
      const selected = subclassInput.value;

      list.innerHTML = LOGICAL_SUBCLASS_OPTIONS.map(o => \`<button class="secondary logical-subclass-btn \${o.value === selected ? 'active' : ''}" data-subclass="\${o.value}" data-category="\${o.category}">\${o.label}</button>\`).join('');

      const selectedOption = LOGICAL_SUBCLASS_OPTIONS.find(o => o.value === selected);
      if (selectedOption) {
        subclassInput.value = selectedOption.value;
        fieldsWrapper.style.display = 'block';
        renderDynamicLogicalFields(selectedOption.value);
      } else {
        fieldsWrapper.style.display = 'none';
        document.getElementById('lc-dynamic-attrs').innerHTML = '';
      }

      list.querySelectorAll('.logical-subclass-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const subclass = btn.dataset.subclass;
          subclassInput.value = subclass;
          renderDynamicLogicalFields(subclass);
          syncLogicalSubclassOptions();
        });
      });
    }

    function resetLogicalSubclassSelection() {
      document.getElementById('lc-subclass').value = '';
      document.getElementById('lc-category').value = '';
      document.getElementById('lc-fields-wrapper').style.display = 'none';
      document.getElementById('lc-dynamic-attrs').innerHTML = '';
      syncLogicalSubclassOptions();
    }

    function renderDynamicLogicalFields(subclass) {
      const container = document.getElementById('lc-dynamic-attrs');
      container.innerHTML = '';
      let html = '';

      if (subclass === 'CANChannel') {
        html += \`
          <div class="form-group">
            <label>Hardware Channel (Index)</label>
            <input id="lc-attr-hwChannel" type="number" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Operation Mode</label>
            <select id="lc-attr-operationMode">
              <option value="Normal">Normal</option>
              <option value="ListenOnly">Listen Only</option>
            </select>
          </div>
        \`;
      } else if (subclass === 'FlexRayChannel') {
        html += \`
          <div class="form-group"><label>HW Channel</label><input id="lc-attr-hwChannel" type="number" /></div>
          <div class="form-group"><label>Key Slot</label><input id="lc-attr-keySlot" type="number" /></div>
          <div class="form-group"><label>Node Type</label><input id="lc-attr-nodeType" type="text" /></div>
          <div class="form-group"><label>Wake Up Cluster</label><input id="lc-attr-wakeUpCluster" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>Operation Mode</label><input id="lc-attr-operationMode" type="text" /></div>
        \`;
      } else if (subclass === 'SerialChannel') {
        html += \`
          <div class="form-group"><label>Port Name</label><input id="lc-attr-portName" type="text" /></div>
          <div class="form-group"><label>Baud Rate</label><input id="lc-attr-baudRate" type="number" /></div>
          <div class="form-group"><label>Parity</label><input id="lc-attr-parity" type="text" /></div>
          <div class="form-group"><label>Data Bits</label><input id="lc-attr-dataBits" type="number" /></div>
          <div class="form-group"><label>Stop Bits</label><input id="lc-attr-stopBits" type="text" /></div>
          <div class="form-group"><label>Flow Control</label><input id="lc-attr-flowControl" type="text" /></div>
          <div class="form-group"><label>Message Terminator</label><input id="lc-attr-messageTerminator" type="text" /></div>
          <div class="form-group"><label>Max Received Data Size</label><input id="lc-attr-maxReceivedDataSize" type="number" /></div>
          <div class="form-group"><label>Separation Time (ms)</label><input id="lc-attr-separationTimeMs" type="number" /></div>
          <div class="form-group"><label>Activation Optional</label><input id="lc-attr-serialChannelActivationOptional" type="checkbox" style="width:auto"/></div>
        \`;
      } else if (subclass === 'LINChannel') {
        html += \`
          <div class="form-group"><label>HW Channel</label><input id="lc-attr-hwChannel" type="number" /></div>
          <div class="form-group"><label>Protocol</label><input id="lc-attr-protocol" type="text" placeholder="e.g. 2.1" /></div>
          <div class="form-group"><label>Operation Mode</label><input id="lc-attr-operationMode" type="text" /></div>
        \`;
      } else if (subclass === 'EthernetChannel') {
        html += \`
          <div class="form-group"><label>Ethernet Name</label><input id="lc-attr-ethernetName" type="text" placeholder="Defaults to channel name" /></div>
          <div class="form-group"><label>Friendly Name</label><input id="lc-attr-friendlyName" type="text" /></div>
          <div class="form-group"><label>Buffer Size</label><input id="lc-attr-bufferSize" type="number" /></div>
          <div class="form-group"><label>pblFilter</label><input id="lc-attr-pblFilter" type="text" /></div>
          <div class="form-group"><label>Timeout</label><input id="lc-attr-timeout" type="number" /></div>
          <div class="form-group"><label>Timestamp Precision</label><input id="lc-attr-timeStampPrecision" type="text" /></div>
          <div class="form-group"><label>Timestamp Source</label><input id="lc-attr-timeStampSource" type="text" /></div>
          <div class="form-group"><label>Immediate Mode</label><input id="lc-attr-immediateMode" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>Snapshot Length</label><input id="lc-attr-snapshotLength" type="number" /></div>
          <div class="form-group"><label>DAP Device Mode</label><input id="lc-attr-dapDeviceMode" type="text" /></div>
          <div class="form-group"><label>Use DataLogger Timestamp</label><input id="lc-attr-useDataLoggerTimeStamp" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>Remove DataLogger MetaData</label><input id="lc-attr-removeDataLoggerMetaData" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>Data Logger Type</label><input id="lc-attr-dataLoggerType" type="text" /></div>
          <div class="form-group"><label>Packet Processing Active</label><input id="lc-attr-packetProcessingActive" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>Packet Identification Active</label><input id="lc-attr-packetIdentificationActive" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>Different Handler For Tx/Rx</label><input id="lc-attr-differentHandlerForTxAndRx" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>tccm Packetization Active</label><input id="lc-attr-tccmPacketizationActive" type="checkbox" style="width:auto"/></div>
        \`;
      } else if (subclass === 'AnalogChannel') {
        html += \`
          <div class="form-group"><label>HW Channel</label><input id="lc-attr-hwChannel" type="number" /></div>
          <div class="form-group"><label>Device ID</label><input id="lc-attr-deviceId" type="number" /></div>
        \`;
      } else if (subclass === 'IOInputChannel' || subclass === 'IOOutputChannel') {
        html += \`
          <div class="form-group"><label>HW Channel</label><input id="lc-attr-hwChannel" type="number" /></div>
          <div class="form-group"><label>Measurement Attribute</label><input id="lc-attr-measurementAttribute" type="text" /></div>
          <div class="form-group"><label>Function</label><input id="lc-attr-function" type="text" /></div>
          <div class="form-group"><label>Line Contact State</label><input id="lc-attr-lineContactState" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>GND Contact State</label><input id="lc-attr-gndContactState" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>BAT Contact State</label><input id="lc-attr-batContactState" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>Static Channel</label><input id="lc-attr-staticChannel" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>Init Value</label><input id="lc-attr-initValue" type="text" /></div>
          <div class="form-group"><label>Channel Type</label><input id="lc-attr-channelType" type="text" /></div>
          <div class="form-group"><label>Measurement Config</label><textarea id="lc-attr-measurementConfig" data-format="csv" placeholder="value1, value2"></textarea></div>
          <div class="form-group"><label>PWM Window Time</label><input id="lc-attr-pwmWindowTime" type="number" /></div>
          <div class="form-group"><label>Subscription Config</label><textarea id="lc-attr-subscriptionConfig" data-format="json" placeholder='{"topic":"example"}'></textarea></div>
        \`;
      } else if (subclass === 'BridgeChannel') {
        html += \`
          <div class="form-group"><label>Bridge Name</label><input id="lc-attr-bridgeName" type="text" placeholder="Defaults to channel name" /></div>
          <div class="form-group"><label>Physical Adapter</label><input id="lc-attr-physicalAdapter" type="text" /></div>
          <div class="form-group"><label>Tun/Tap Adapter List</label><textarea id="lc-attr-tunTapAdapterList" data-format="json" placeholder='[{"name":"tap0"}]'></textarea></div>
          <div class="form-group"><label>Manipulate Packets</label><input id="lc-attr-manipulatePackets" type="checkbox" style="width:auto"/></div>
        \`;
      }

      container.innerHTML = html;
    }

    function syncHardwareSubclassOptions() {
      const list = document.getElementById('hw-subclass-list');
      const subclassInput = document.getElementById('hw-subclass');
      const categoryInput = document.getElementById('hw-category');
      const attrsContainer = document.getElementById('hw-dynamic-attrs');
      const selected = subclassInput.value;

      list.innerHTML = HARDWARE_SUBCLASS_OPTIONS.map(o => \`<button class="secondary hardware-subclass-btn \${o.value === selected ? 'active' : ''}" data-subclass="\${o.value}" data-category="\${o.category}">\${o.label}</button>\`).join('');

      const selectedOption = HARDWARE_SUBCLASS_OPTIONS.find(o => o.value === selected);
      if (selectedOption) {
        renderDynamicHardwareFields(selectedOption.value);
      } else {
        attrsContainer.innerHTML = '';
      }

      list.querySelectorAll('.hardware-subclass-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          subclassInput.value = btn.dataset.subclass;
          syncHardwareSubclassOptions();
        });
      });
    }

    function resetHardwareSubclassSelection() {
      document.getElementById('hw-subclass').value = '';
      document.getElementById('hw-category').value = '';
      document.getElementById('hw-dynamic-attrs').innerHTML = '';
      syncHardwareSubclassOptions();
    }

    function renderDynamicHardwareFields(subclass) {
      const container = document.getElementById('hw-dynamic-attrs');
      container.innerHTML = '';
      let html = '';

      if (subclass === 'RelayBoard') {
        html += \`
          <div class="form-group"><label>Relay Count</label><input id="hw-attr-relayCount" type="number" /></div>
          <div class="form-group"><label>CAN Channel Name</label><input id="hw-attr-canChannelName" type="text" /></div>
          <div class="form-group"><label>Board ID</label><input id="hw-attr-boardId" type="number" /></div>
          <div class="form-group"><label>Relays</label><textarea id="hw-attr-relays" data-format="json" placeholder='{"relay1":{"state":true}}'></textarea></div>
        \`;
      } else if (subclass === 'EthernetAdapter') {
        html += \`
          <div class="form-group"><label>MAC Address</label><input id="hw-attr-macAddress" type="text" /></div>
          <div class="form-group"><label>IP Address</label><input id="hw-attr-ipAddress" type="text" /></div>
          <div class="form-group"><label>Friendly Name</label><input id="hw-attr-friendlyName" type="text" /></div>
          <div class="form-group"><label>Interface</label><input id="hw-attr-interface" type="text" /></div>
          <div class="form-group"><label>Buffer Size</label><input id="hw-attr-bufferSize" type="number" /></div>
          <div class="form-group"><label>BP Filter</label><input id="hw-attr-bpFilter" type="text" /></div>
          <div class="form-group"><label>Timeout</label><input id="hw-attr-timeout" type="number" /></div>
          <div class="form-group"><label>Timestamp Precision</label><input id="hw-attr-timeStampPrecision" type="text" /></div>
          <div class="form-group"><label>Timestamp Source</label><input id="hw-attr-timeStampSource" type="text" /></div>
          <div class="form-group"><label>Immediate Mode</label><input id="hw-attr-immediateMode" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>SnapShot Length</label><input id="hw-attr-snapShotLength" type="number" /></div>
          <div class="form-group"><label>PCAP Device Mode</label><input id="hw-attr-pcapDeviceMode" type="text" /></div>
          <div class="form-group"><label>Use DataLogger TimeStamp</label><input id="hw-attr-useDataLoggerTimeStamp" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>Remove DataLogger MetaData</label><input id="hw-attr-removeDataLoggerMetaData" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>Data Logger Type</label><input id="hw-attr-dataLoggerType" type="text" /></div>
          <div class="form-group"><label>Packet Processing Active</label><input id="hw-attr-packetProcessingActive" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>Packet Identification Active</label><input id="hw-attr-packetIdentificationActive" type="checkbox" style="width:auto"/></div>
        \`;
      } else if (subclass === 'TEAnalog') {
        html += \`
          <div class="form-group"><label>Sensor Type</label><input id="hw-attr-sensorType" type="text" /></div>
          <div class="form-group"><label>HW Channel</label><input id="hw-attr-hwChannel" type="number" /></div>
          <div class="form-group"><label>Device ID</label><input id="hw-attr-deviceId" type="number" /></div>
        \`;
      } else if (subclass === 'AnalogDevice') {
        html += \`
          <div class="form-group"><label>Channels</label><input id="hw-attr-channels" type="number" /></div>
          <div class="form-group"><label>Resolution</label><input id="hw-attr-resolution" type="number" /></div>
          <div class="form-group"><label>Measurement Attribute</label><input id="hw-attr-measurementAttribute" type="text" /></div>
          <div class="form-group"><label>HW Channel</label><input id="hw-attr-hwChannel" type="number" /></div>
          <div class="form-group"><label>In Contact State</label><input id="hw-attr-inContactState" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>GND Contact State</label><input id="hw-attr-gndContactState" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>VBAT Contact State</label><input id="hw-attr-vbatContactState" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>Static Channel</label><input id="hw-attr-staticChannel" type="checkbox" style="width:auto"/></div>
          <div class="form-group"><label>Init Value</label><input id="hw-attr-initValue" type="text" /></div>
          <div class="form-group"><label>Function</label><input id="hw-attr-function" type="text" /></div>
          <div class="form-group"><label>Channel Type</label><input id="hw-attr-channelType" type="text" /></div>
          <div class="form-group"><label>PWM Window Time</label><input id="hw-attr-pwmWindowTime" type="number" /></div>
        \`;
      } else if (subclass === 'HHLoad') {
        html += \`
          <div class="form-group"><label>Max Load</label><input id="hw-attr-maxLoad" type="number" /></div>
          <div class="form-group"><label>Device ID</label><input id="hw-attr-deviceId" type="number" /></div>
          <div class="form-group"><label>Port Name</label><input id="hw-attr-portName" type="text" /></div>
          <div class="form-group"><label>Bit Rate</label><input id="hw-attr-bitRate" type="number" /></div>
          <div class="form-group"><label>Type</label><input id="hw-attr-loadType" type="text" /></div>
          <div class="form-group"><label>Channels</label><textarea id="hw-attr-channels" data-format="json" placeholder='{"1":{"name":"load1"}}'></textarea></div>
        \`;
      } else if (subclass === 'SerialPort') {
        html += \`
          <div class="form-group"><label>Port Name</label><input id="hw-attr-portName" type="text" /></div>
          <div class="form-group"><label>Baud Rate</label><input id="hw-attr-baudRate" type="number" /></div>
          <div class="form-group"><label>Parity</label><input id="hw-attr-parity" type="text" /></div>
          <div class="form-group"><label>Data Bits</label><input id="hw-attr-dataBits" type="number" /></div>
          <div class="form-group"><label>Stop Bits</label><input id="hw-attr-stopBits" type="number" /></div>
          <div class="form-group"><label>Flow Control</label><input id="hw-attr-flowControl" type="text" /></div>
          <div class="form-group"><label>Message Terminator</label><input id="hw-attr-messageTerminator" type="text" /></div>
          <div class="form-group"><label>Separation Times</label><input id="hw-attr-separationTimes" type="number" /></div>
          <div class="form-group"><label>Max Received Data Size</label><input id="hw-attr-maxReceivedDataSize" type="number" /></div>
        \`;
      } else if (subclass === 'HIDRelay') {
        html += \`
          <div class="form-group"><label>Vendor ID</label><input id="hw-attr-vendorId" type="text" /></div>
          <div class="form-group"><label>Product ID</label><input id="hw-attr-productId" type="text" /></div>
          <div class="form-group"><label>Device Serial</label><input id="hw-attr-deviceSerial" type="text" /></div>
          <div class="form-group"><label>Relays</label><textarea id="hw-attr-relays" data-format="json" placeholder='{"relay1":{"state":true}}'></textarea></div>
        \`;
      } else if (subclass === 'CANInterface' || subclass === 'CIBInterface' || subclass === 'CMInterface') {
        const defaultBitRate = subclass === 'CMInterface' ? 'bitrate' : 'bitRate';
        html += \`
          <div class="form-group"><label>CM ID</label><input id="hw-attr-cmId" type="number" placeholder="e.g. 1" /></div>
          <div class="form-group"><label>CM Type</label><select id="hw-attr-cmType"><option value="CAN_Combo">CAN_Combo</option><option value="LIN_Combo">LIN_Combo</option></select></div>
          <div class="form-group"><label>Bit Rate</label><input id="hw-attr-\${defaultBitRate}" type="number" placeholder="e.g. 500000" /></div>
        \`;
      } else if (subclass === 'LINCard') {
        html += \`
          <div class="form-group"><label>CM ID</label><input id="hw-attr-cmId" type="number" placeholder="e.g. 1" /></div>
          <div class="form-group"><label>CM Type</label><select id="hw-attr-cmType"><option value="LIN_Combo">LIN_Combo</option><option value="CAN_Combo">CAN_Combo</option></select></div>
        \`;
      }

      container.innerHTML = html;
    }

    document.getElementById('btn-add-logical').addEventListener('click', () => {
      try {
        const name = document.getElementById('lc-name').value.trim();
        const category = document.getElementById('lc-category').value;
        const subclass = document.getElementById('lc-subclass').value;
        const loggingName = document.getElementById('lc-logging-name').value.trim();
        const tracerName = document.getElementById('lc-tracer-name').value.trim();
        const aliasRaw = document.getElementById('lc-alias').value.trim();

        if (!name) { showGlobal('Enter a channel name.', 'error'); return; }
        if (!state.selectedConfigId) { showGlobal('Load a configuration first.', 'error'); return; }
        if (!category) { showGlobal('Select a logical category.', 'error'); return; }
        if (!subclass) { showGlobal('Select a logical subclass.', 'error'); return; }

        const channelData = {
          id: 'lc_' + Date.now(),
          name,
          type: CHANNEL_TYPES.LOGICAL,
          category,
          subclass,
          loggingName: loggingName || undefined,
          tracerName: tracerName || undefined,
          alias: aliasRaw ? aliasRaw.split(',').map(a => a.trim()) : undefined,
          ...collectDynamicValues('lc-dynamic-attrs', 'lc-attr-'),
        };

        if (subclass === 'BridgeChannel' && !channelData.bridgeName) {
          channelData.bridgeName = name;
        }
        if (subclass === 'EthernetChannel' && !channelData.ethernetName) {
          channelData.ethernetName = name;
        }

        vscode.postMessage({ command: 'addLogicalChannel', channel: channelData });

        document.getElementById('lc-name').value = '';
        document.getElementById('lc-logging-name').value = '';
        document.getElementById('lc-tracer-name').value = '';
        document.getElementById('lc-alias').value = '';
        resetLogicalSubclassSelection();
      } catch (error) {
        showGlobal(error.message || 'Unable to collect logical channel attributes.', 'error');
      }
    });

    document.getElementById('btn-add-hardware').addEventListener('click', () => {
      try {
        const category = document.getElementById('hw-category').value;
        const subclass = document.getElementById('hw-subclass').value;
        if (!state.selectedConfigId) { showGlobal('Load a configuration first.', 'error'); return; }
        if (!category) { showGlobal('Select a hardware category.', 'error'); return; }
        if (!subclass) { showGlobal('Select a hardware subclass.', 'error'); return; }
        const id = 'hw_' + Date.now();
        const channelData = {
          id,
          name: buildAutoHardwareName(subclass),
          type: CHANNEL_TYPES.HARDWARE,
          category,
          subclass,
          ...collectDynamicValues('hw-dynamic-attrs', 'hw-attr-'),
        };
        vscode.postMessage({ command: 'addHardwareChannel', channel: channelData });
        resetHardwareSubclassSelection();
      } catch (error) {
        showGlobal(error.message || 'Unable to collect hardware channel attributes.', 'error');
      }
    });



    document.getElementById('btn-add-mapping').addEventListener('click', () => {
      const logicalId = document.getElementById('map-logical').value;
      const hardwareId = document.getElementById('map-hardware').value;
      if (!logicalId || !hardwareId) { showGlobal('Select both channels.', 'error'); return; }
      if (!state.selectedConfigId) { showGlobal('Load a configuration first.', 'error'); return; }
      const hwChannelRaw = document.getElementById('map-hwChannel').value;
      const operationMode = document.getElementById('map-operationMode').value;
      const keySlotRaw = document.getElementById('map-keySlot').value;
      const nodeType = document.getElementById('map-nodeType').value;
      const wakeUpCluster = document.getElementById('map-wakeUpCluster').checked;
      const params = {};
      if (hwChannelRaw !== '') { params.hwChannel = parseInt(hwChannelRaw, 10); }
      if (operationMode) { params.operationMode = operationMode; }
      if (keySlotRaw !== '') { params.keySlot = parseInt(keySlotRaw, 10); }
      if (nodeType) { params.nodeType = nodeType; }
      params.wakeUpCluster = wakeUpCluster;
      vscode.postMessage({ command: 'addMapping', logicalChannelId: logicalId, hardwareChannelId: hardwareId, configurationId: state.selectedConfigId, params });
    });

    document.getElementById('btn-add-tracer').addEventListener('click', () => {
      const type = document.getElementById('tracer-type').value;
      const name = document.getElementById('tracer-name').value.trim();
      if (!name) return;
      const li = document.createElement('div');
      li.className = 'card';
      li.innerHTML = '<div class="card-header"><span>' + name + ' <span class="badge">' + type + '</span></span><button class="secondary" onclick="this.parentElement.parentElement.remove()">✕</button></div>';
      document.getElementById('tracer-list').appendChild(li);
      const empty = document.querySelector('#tracer-list .list-empty');
      if (empty) empty.remove();
      document.getElementById('tracer-name').value = '';
    });

    document.getElementById('btn-generate-config').addEventListener('click', () => {
      vscode.postMessage({ command: 'generateConfig' });
    });

    document.getElementById('btn-run-ai-validation').addEventListener('click', () => {
      document.getElementById('ai-results').style.display = 'none';
      showMessage('generate-messages', 'Running AI validation...', 'info');
      vscode.postMessage({ command: 'runAIValidation' });
    });

    document.getElementById('btn-refresh-diagram').addEventListener('click', () => {
      renderDiagram();
    });

    // ── Global Render helpers ───────────────────────────────────────────
    function renderConfigList() {
      const container = document.getElementById('config-list');
      if (state.configs.length === 0) { container.innerHTML = '<p class="list-empty">No configurations yet.</p>'; return; }
      container.innerHTML = state.configs.map(c => \`
        <div class="card">
          <div class="card-header">
            <span><strong>\${c.name}</strong> <span class="badge">\${c.id || c.configId}</span></span>
            <div style="display:flex;gap:6px">
              <button class="btn-load-config" data-id="\${c.id || c.configId}">Load</button>
              <button class="secondary btn-delete-config" data-id="\${c.id || c.configId}">✕</button>
            </div>
          </div>
        </div>\`).join('');
      
      // Add listeners to dynamic buttons
      container.querySelectorAll('.btn-load-config').forEach(b => b.addEventListener('click', () => {
        vscode.postMessage({ command: 'loadConfiguration', configId: b.dataset.id });
      }));
      container.querySelectorAll('.btn-delete-config').forEach(b => b.addEventListener('click', () => {
        vscode.postMessage({ command: 'deleteConfiguration', configId: b.dataset.id });
      }));
    }

    function renderLogicalList() {
      const container = document.getElementById('lc-list');
      if (state.logicalChannels.length === 0) { container.innerHTML = '<p class="list-empty">No logical channels defined.</p>'; return; }
      container.innerHTML = state.logicalChannels.map(c => \`
        <div class="card">
          <div class="card-header">
            <span><strong>\${c.name}</strong> <span class="badge">\${c.subclass || c.category || c.type}</span></span>
            <button class="secondary btn-delete-lc" data-id="\${c.id}">✕</button>
          </div>
        </div>\`).join('');

      container.querySelectorAll('.btn-delete-lc').forEach(b => b.addEventListener('click', () => {
        vscode.postMessage({ command: 'deleteLogicalChannel', channelId: b.dataset.id });
      }));
    }

    function renderHardwareList() {
      const container = document.getElementById('hw-list');
      if (state.hardwareChannels.length === 0) { container.innerHTML = '<p class="list-empty">No hardware channels defined.</p>'; return; }
      container.innerHTML = state.hardwareChannels.map(c => \`
        <div class="card">
          <div class="card-header">
            <span><strong>\${c.name}</strong> <span class="badge">\${c.subclass || c.category || c.type}</span></span>
            <button class="secondary btn-delete-hw" data-id="\${c.id}">✕</button>
          </div>
        </div>\`).join('');

      container.querySelectorAll('.btn-delete-hw').forEach(b => b.addEventListener('click', () => {
        vscode.postMessage({ command: 'deleteHardwareChannel', channelId: b.dataset.id });
      }));
    }

    function renderMappingList() {
      const container = document.getElementById('map-list');
      if (state.mappings.length === 0) { container.innerHTML = '<p class="list-empty">No mappings defined.</p>'; return; }
      container.innerHTML = state.mappings.map(m => \`
        <div class="card">
          <div class="card-header">
            <span>🔗 <strong>\${m.logicalChannelName}</strong> → <strong>\${m.hardwareChannelName || m.hardwareChannelId}</strong></span>
            <button class="secondary btn-remove-mapping" data-id="\${m.mappingId}">✕</button>
          </div>
        </div>\`).join('');

      container.querySelectorAll('.btn-remove-mapping').forEach(b => b.addEventListener('click', () => {
        vscode.postMessage({ command: 'removeMapping', mappingId: b.dataset.id });
      }));
    }

    function refreshMappingDropdowns() {
      const lSelect = document.getElementById('map-logical');
      const hSelect = document.getElementById('map-hardware');
      lSelect.innerHTML = '<option value="">-- Select Logical --</option>' + state.logicalChannels.map(c => \`<option value="\${c.id}">\${c.name} (\${c.category || c.type})</option>\`).join('');
      hSelect.innerHTML = '<option value="">-- Select Hardware --</option>' + state.hardwareChannels.map(c => \`<option value="\${c.id}">\${c.name} (\${c.category || c.type})</option>\`).join('');
    }

    function renderAIResults(data) {
      document.getElementById('ai-results').style.display = 'block';
      const errEl = document.getElementById('ai-errors');
      const warnEl = document.getElementById('ai-warnings');
      const sugEl = document.getElementById('ai-suggestions');
      errEl.innerHTML = data.errors.length ? data.errors.map(e => \`<div class="alert error">❌ \${e}</div>\`).join('') : '<div class="alert success">✅ No errors found.</div>';
      warnEl.innerHTML = data.warnings.map(w => \`<div class="alert warning">⚠️ \${w}</div>\`).join('');
      sugEl.innerHTML = data.suggestions.map(s => \`<div class="alert info">💡 \${s}</div>\`).join('');
      showMessage('generate-messages', data.isValid ? 'Configuration is valid!' : 'Validation found issues.', data.isValid ? 'success' : 'error');
    }

    function renderDiagram() {
      const container = document.getElementById('diagram-container');
      container.innerHTML = '';
      const lcNodes = state.logicalChannels;
      const hwNodes = state.hardwareChannels;
      const lcX = 20, hwX = 180;
      const nodeHeight = 50;
      lcNodes.forEach((lc, i) => {
        const node = document.createElement('div');
        node.className = 'diagram-node logical';
        node.style.left = lcX + 'px';
        node.style.top = (20 + i * nodeHeight) + 'px';
        node.textContent = lc.name + ' (' + (lc.subclass || lc.category || lc.type) + ')';
        container.appendChild(node);
      });
      hwNodes.forEach((hw, i) => {
        const node = document.createElement('div');
        node.className = 'diagram-node hardware';
        node.style.left = hwX + 'px';
        node.style.top = (20 + i * nodeHeight) + 'px';
        node.textContent = hw.name + ' (' + (hw.subclass || hw.category || hw.type) + ')';
        container.appendChild(node);
      });
    }

    function showGlobal(msg, type) {
      const el = document.getElementById('global-message');
      el.style.display = 'block';
      el.innerHTML = \`<div class="alert \${type}">\${msg}</div>\`;
      setTimeout(() => { el.style.display = 'none'; }, 4000);
    }

    function showMessage(containerId, msg, type) {
      document.getElementById(containerId).innerHTML = \`<div class="alert \${type}">\${msg}</div>\`;
    }

    // ── Init ─────────────────────────────────────────────────────────────
    renderLogicalCategoryOptions();
    renderHardwareCategoryOptions();
    resetLogicalSubclassSelection();
    resetHardwareSubclassSelection();
    vscode.postMessage({ command: 'getConfigurations' });
  </script>
</body>
</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

