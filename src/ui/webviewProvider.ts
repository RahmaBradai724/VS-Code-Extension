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

          // Re-populate in-memory ChannelManager (lost on extension reload)
          this.channelManager = new ChannelManager();
          this.mappingManager = new MappingManager(this.channelManager);

          for (const ch of this.currentConfig.logicalChannels) {
            const factory = logicalChannelFactories[(ch as any).subclass];
            if (factory) {
              const rebuilt: any = factory(ch.id, ch.name);
              Object.assign(rebuilt, ch);
              this.channelManager.addLogicalChannel(rebuilt);
            }
          }
          for (const hw of this.currentConfig.hardwareChannels) {
            const factory = hardwareChannelFactories[(hw as any).subclass];
            if (factory) {
              const rebuilt: any = factory(hw.id, hw.name);
              Object.assign(rebuilt, hw);
              this.channelManager.addHardwareChannel(rebuilt);
            }
          }
          // Re-populate mappings into MappingManager's internal map
          for (const m of this.currentConfig.mappings) {
            (this.mappingManager as any).mappings.set(m.mappingId, m);
            this.channelManager.registerMappingForChannel(m.logicalChannelId, m.mappingId);
            this.channelManager.registerMappingForChannel(m.hardwareChannelId, m.mappingId);
          }
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
          // Merge framework data from UI into the configuration before generation
          if (message.frameworkData) {
            const fw = message.frameworkData;
            if (!this.currentConfig.frameworkConfig) {
              (this.currentConfig as any).frameworkConfig = {};
            }
            const fc = this.currentConfig.frameworkConfig as any;
            fc.tracers = fw.tracers || [];
            fc.publisherType = fw.publisherType;
            fc.channelsGroups = fw.channelsGroups || [];
            fc.connectedEcus = fw.connectedEcus || [];
            fc.servicePack = fw.servicePack;
            if (fw.ethernetConfig) { fc.ethernetConfig = fw.ethernetConfig; }
            this._saveCurrentConfig();
          }
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

      case 'openFullPanel': {
        const panel = vscode.window.createWebviewPanel(
          'channelConfig.fullPanel',
          'Channel Config Manager',
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
            retainContextWhenHidden: true,
          },
        );
        panel.webview.html = this._getHtmlForWebview(panel.webview);
        panel.webview.onDidReceiveMessage(async (msg) => {
          await this._handleMessage(msg, panel.webview);
        });
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
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'webview.js')
    );
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

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

