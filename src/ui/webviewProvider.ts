import * as vscode from 'vscode';
import * as path from 'path';
import { Configuration } from '../models';
import { ChannelManager } from '../services/channelManager';
import { MappingManager } from '../services/mappingManager';
import { StorageService } from '../services/storageService';
import { ConfigGenerator } from '../services/configGenerator';
import { AIValidator } from '../ai/aiValidator';

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
        const config = new Configuration(id, message.name, message.userId || 'anonymous');
        this.storageService.saveConfiguration(config);
        webview.postMessage({ command: 'configurationCreated', data: config.toJSON() });
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
            raw.configId,
            raw.name,
            raw.userId
          );

          this.currentConfig.logicalChannels = raw.logicalChannels || [];
          this.currentConfig.hardwareChannels = raw.hardwareChannels || [];
          this.currentConfig.mappings = raw.mappings || [];
        }

        webview.postMessage({ command: 'configurationLoaded', data: raw });
        break;
      }

      case 'addLogicalChannel': {
        try {
          this.channelManager.addLogicalChannel(message.channel);
          webview.postMessage({ command: 'success', action: 'addLogicalChannel', data: message.channel });
        } catch (e: any) {
          webview.postMessage({ command: 'error', message: e.message });
        }
        break;
      }

      case 'deleteLogicalChannel': {
        try {
          this.channelManager.deleteLogicalChannel(message.channelId);
          webview.postMessage({ command: 'success', action: 'deleteLogicalChannel', id: message.channelId });
        } catch (e: any) {
          webview.postMessage({ command: 'error', message: e.message });
        }
        break;
      }

      case 'addHardwareChannel': {
        try {
          this.channelManager.addHardwareChannel(message.channel);
          webview.postMessage({ command: 'success', action: 'addHardwareChannel', data: message.channel });
        } catch (e: any) {
          webview.postMessage({ command: 'error', message: e.message });
        }
        break;
      }

      case 'deleteHardwareChannel': {
        try {
          this.channelManager.deleteHardwareChannel(message.channelId);
          webview.postMessage({ command: 'success', action: 'deleteHardwareChannel', id: message.channelId });
        } catch (e: any) {
          webview.postMessage({ command: 'error', message: e.message });
        }
        break;
      }

      case 'addMapping': {
        try {
          const mapping = this.mappingManager.addMapping(
            message.logicalChannelId,
            message.hardwareChannelId,
            message.configurationId,
          );
          webview.postMessage({ command: 'success', action: 'addMapping', data: mapping.toJSON() });
        } catch (e: any) {
          webview.postMessage({ command: 'error', message: e.message });
        }
        break;
      }

      case 'removeMapping': {
        try {
          this.mappingManager.removeMapping(message.mappingId);
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
          const mappings = this.mappingManager.getMappingsByConfigId(this.currentConfig.configId);
          const result = await this.aiValidator.runAIValidation(this.currentConfig, mappings, yamlContent);
          webview.postMessage({ command: 'aiValidationResult', data: result });
        } catch (e: any) {
          // Run local only
          const mappings = this.mappingManager.getMappingsByConfigId(this.currentConfig?.configId || '');
          const result = this.aiValidator.runLocalValidation(this.currentConfig!, mappings);
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

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();
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
    <button class="tab active" onclick="showTab(event, 'configs')">Configurations</button>
    <button class="tab" onclick="showTab(event, 'logical')">Logical Channels</button>
    <button class="tab" onclick="showTab(event, 'hardware')">Hardware Channels</button>
    <button class="tab" onclick="showTab(event, 'mappings')">Mappings</button>
    <button class="tab" onclick="showTab(event, 'framework')">Framework</button>
    <button class="tab" onclick="showTab(event, 'generate')">Generate</button>
    <button class="tab" onclick="showTab(event, 'diagram')">Diagram</button>
  </div>

  <!-- CONFIGURATIONS PANEL -->
  <div id="panel-configs" class="panel active">
    <h3>Configurations</h3>
    <div class="form-group">
      <label>New Configuration Name</label>
      <input id="new-config-name" type="text" placeholder="e.g. ECU_Config_v1" />
    </div>
    <div class="btn-row">
      <button onclick="createConfiguration()">+ Create</button>
      <button class="secondary" onclick="importConfig()">↑ Import YAML</button>
    </div>
    <div id="config-list" style="margin-top:12px"><p class="list-empty">No configurations yet.</p></div>
  </div>

  <!-- LOGICAL CHANNELS PANEL -->
  <div id="panel-logical" class="panel">
    <h3>Logical Channels</h3>
    <div class="card">
      <div class="form-group">
        <label>Name</label>
        <input id="lc-name" type="text" placeholder="e.g. CAN_BUS_1" />
      </div>
      <div class="form-group">
        <label>Type</label>
        <select id="lc-type">
          <option value="CAN">CAN</option>
          <option value="CAN-FD">CAN-FD</option>
          <option value="LIN">LIN</option>
          <option value="FLEXRAY">FLEXRAY</option>
          <option value="ETHERNET">ETHERNET</option>
          <option value="SERIAL">SERIAL</option>
          <option value="IOINPUT">IO INPUT</option>
          <option value="IOOUTPUT">IO OUTPUT</option>
          <option value="BRIDGE">BRIDGE</option>
          <option value="ANALOG">ANALOG</option>
          <option value="TE_ANALOG">TE_ANALOG</option>
        </select>
      </div>
      <button onclick="addLogicalChannel()">+ Add Channel</button>
    </div>
    <div id="lc-list"><p class="list-empty">No logical channels defined.</p></div>
  </div>

  <!-- HARDWARE CHANNELS PANEL -->
  <div id="panel-hardware" class="panel">
    <h3>Hardware Channels</h3>
    <div class="card">
      <div class="form-group">
        <label>Name</label>
        <input id="hw-name" type="text" placeholder="e.g. CAN_IF_0" />
      </div>
      <div class="form-group">
        <label>Type</label>
        <select id="hw-type">
          <option value="CAN_INTERFACE">CAN Interface</option>
          <option value="ETHERNET_ADAPTER">Ethernet Adapter</option>
          <option value="SERIAL_PORT">Serial Port</option>
          <option value="RELAY_BOARD">Relay Board</option>
          <option value="HID_RELAY">HID Relay</option>
          <option value="ANALOG_DEVICE">Analog Device</option>
          <option value="TE_ANALOG">TE Analog</option>
        </select>
      </div>
      <button onclick="addHardwareChannel()">+ Add Hardware</button>
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
      <button onclick="addMapping()">+ Create Mapping</button>
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
        <select id="tracer-type"><option value="PCAP">PCAP Tracer</option><option value="ABCF">ABCF Tracer</option></select>
        <input id="tracer-name" type="text" placeholder="Tracer name" style="margin:0"/>
        <button onclick="addTracer()" style="white-space:nowrap">+ Add</button>
      </div>
      <div id="tracer-list" style="margin-top:8px"><p class="list-empty">No tracers.</p></div>
    </div>
  </div>

  <!-- GENERATE PANEL -->
  <div id="panel-generate" class="panel">
    <h3>Generate &amp; Validate</h3>
    <div class="btn-row">
      <button onclick="generateConfig()">⚡ Generate config.yaml</button>
      <button onclick="runAIValidation()">🤖 Run AI Validation</button>
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
    <button onclick="renderDiagram()" style="margin-bottom:10px">🔄 Refresh Diagram</button>
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
    function showTab(event, name) {
      const panel = document.getElementById('panel-' + name);
      if (!panel) {
        console.error('Panel not found:', 'panel-' + name);
        return;
      }
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      
      panel.classList.add('active');
      if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
      }
      
      if (name === 'mappings') { refreshMappingDropdowns(); }
      if (name === 'diagram') { renderDiagram(); }
    }

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
            state.selectedConfigId = msg.data.configId;
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

    // ── Configuration actions ───────────────────────────────────────────
    function createConfiguration() {
      const name = document.getElementById('new-config-name').value.trim();
      if (!name) { showGlobal('Please enter a configuration name.', 'error'); return; }
      vscode.postMessage({ command: 'createConfiguration', name });
      document.getElementById('new-config-name').value = '';
    }

    function loadConfig(configId) {
      vscode.postMessage({ command: 'loadConfiguration', configId });
    }

    function deleteConfig(configId) {
      vscode.postMessage({ command: 'deleteConfiguration', configId });
    }

    function importConfig() {
      vscode.postMessage({ command: 'importConfig' });
    }

    // ── Channel actions ─────────────────────────────────────────────────
    function addLogicalChannel() {
      const name = document.getElementById('lc-name').value.trim();
      const type = document.getElementById('lc-type').value;
      if (!name) { showGlobal('Enter a channel name.', 'error'); return; }
      if (!state.selectedConfigId) { showGlobal('Load a configuration first.', 'error'); return; }
      const id = 'lc_' + Date.now();
      vscode.postMessage({ command: 'addLogicalChannel', channel: { id, name, type } });
      document.getElementById('lc-name').value = '';
    }

    function deleteLogicalChannel(id) {
      vscode.postMessage({ command: 'deleteLogicalChannel', channelId: id });
    }

    function addHardwareChannel() {
      const name = document.getElementById('hw-name').value.trim();
      const type = document.getElementById('hw-type').value;
      if (!name) { showGlobal('Enter a hardware channel name.', 'error'); return; }
      if (!state.selectedConfigId) { showGlobal('Load a configuration first.', 'error'); return; }
      const id = 'hw_' + Date.now();
      vscode.postMessage({ command: 'addHardwareChannel', channel: { id, name, type } });
      document.getElementById('hw-name').value = '';
    }

    function deleteHardwareChannel(id) {
      vscode.postMessage({ command: 'deleteHardwareChannel', channelId: id });
    }

    // ── Mapping actions ─────────────────────────────────────────────────
    function addMapping() {
      const logicalId = document.getElementById('map-logical').value;
      const hardwareId = document.getElementById('map-hardware').value;
      if (!logicalId || !hardwareId) { showGlobal('Select both channels.', 'error'); return; }
      if (!state.selectedConfigId) { showGlobal('Load a configuration first.', 'error'); return; }
      vscode.postMessage({ command: 'addMapping', logicalChannelId: logicalId, hardwareChannelId: hardwareId, configurationId: state.selectedConfigId });
    }

    function removeMapping(id) {
      vscode.postMessage({ command: 'removeMapping', mappingId: id });
    }

    // ── Generate & AI ───────────────────────────────────────────────────
    function generateConfig() {
      vscode.postMessage({ command: 'generateConfig' });
    }

    function runAIValidation() {
      document.getElementById('ai-results').style.display = 'none';
      showMessage('generate-messages', 'Running AI validation...', 'info');
      vscode.postMessage({ command: 'runAIValidation' });
    }

    function addTracer() {
      const type = document.getElementById('tracer-type').value;
      const name = document.getElementById('tracer-name').value.trim();
      if (!name) return;
      const li = document.createElement('div');
      li.className = 'card';
      li.innerHTML = '<div class="card-header"><span>' + name + ' <span class="badge">' + type + '</span></span><button class="secondary" onclick="this.parentElement.parentElement.remove()">✕</button></div>';
      document.getElementById('tracer-list').appendChild(li);
      document.querySelector('#tracer-list .list-empty') && document.querySelector('#tracer-list .list-empty').remove();
      document.getElementById('tracer-name').value = '';
    }

    // ── Render helpers ──────────────────────────────────────────────────
    function renderConfigList() {
      const container = document.getElementById('config-list');
      if (state.configs.length === 0) { container.innerHTML = '<p class="list-empty">No configurations yet.</p>'; return; }
      container.innerHTML = state.configs.map(c => \`
        <div class="card">
          <div class="card-header">
            <span><strong>\${c.name}</strong> <span class="badge">\${c.configId}</span></span>
            <div style="display:flex;gap:6px">
              <button onclick="loadConfig('\${c.configId}')">Load</button>
              <button class="secondary" onclick="deleteConfig('\${c.configId}')">✕</button>
            </div>
          </div>
        </div>\`).join('');
    }

    function renderLogicalList() {
      const container = document.getElementById('lc-list');
      if (state.logicalChannels.length === 0) { container.innerHTML = '<p class="list-empty">No logical channels defined.</p>'; return; }
      container.innerHTML = state.logicalChannels.map(c => \`
        <div class="card">
          <div class="card-header">
            <span><strong>\${c.name}</strong> <span class="badge">\${c.type}</span></span>
            <button class="secondary" onclick="deleteLogicalChannel('\${c.id}')">✕</button>
          </div>
        </div>\`).join('');
    }

    function renderHardwareList() {
      const container = document.getElementById('hw-list');
      if (state.hardwareChannels.length === 0) { container.innerHTML = '<p class="list-empty">No hardware channels defined.</p>'; return; }
      container.innerHTML = state.hardwareChannels.map(c => \`
        <div class="card">
          <div class="card-header">
            <span><strong>\${c.name}</strong> <span class="badge">\${c.type}</span></span>
            <button class="secondary" onclick="deleteHardwareChannel('\${c.id}')">✕</button>
          </div>
        </div>\`).join('');
    }

    function renderMappingList() {
      const container = document.getElementById('map-list');
      if (state.mappings.length === 0) { container.innerHTML = '<p class="list-empty">No mappings defined.</p>'; return; }
      container.innerHTML = state.mappings.map(m => \`
        <div class="card">
          <div class="card-header">
            <span>🔗 <strong>\${m.logicalChannelName}</strong> → <strong>\${m.hardwareChannelName || m.hardwareChannelId}</strong></span>
            <button class="secondary" onclick="removeMapping('\${m.mappingId}')">✕</button>
          </div>
        </div>\`).join('');
    }

    function refreshMappingDropdowns() {
      const lSelect = document.getElementById('map-logical');
      const hSelect = document.getElementById('map-hardware');
      lSelect.innerHTML = '<option value="">-- Select Logical --</option>' + state.logicalChannels.map(c => \`<option value="\${c.id}">\${c.name} (\${c.type})</option>\`).join('');
      hSelect.innerHTML = '<option value="">-- Select Hardware --</option>' + state.hardwareChannels.map(c => \`<option value="\${c.id}">\${c.name} (\${c.type})</option>\`).join('');
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
      const lcX = 20, hwX = 260;
      const nodeHeight = 50;
      lcNodes.forEach((lc, i) => {
        const node = document.createElement('div');
        node.className = 'diagram-node logical';
        node.style.left = lcX + 'px';
        node.style.top = (20 + i * nodeHeight) + 'px';
        node.textContent = lc.name + ' (' + lc.type + ')';
        container.appendChild(node);
      });
      hwNodes.forEach((hw, i) => {
        const node = document.createElement('div');
        node.className = 'diagram-node hardware';
        node.style.left = hwX + 'px';
        node.style.top = (20 + i * nodeHeight) + 'px';
        node.textContent = hw.name + ' (' + hw.type + ')';
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
