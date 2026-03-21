import * as vscode from 'vscode';
import { WebviewProvider } from './ui/webviewProvider';
import { StorageService } from './services/storageService';
import { ConfigImporter } from './services/configImporter';

export function activate(context: vscode.ExtensionContext) {
  console.log('Channel Configuration Manager is now active.');

  const storageService = new StorageService(context);
  const importer = new ConfigImporter(storageService);

  // Register the webview sidebar provider
  const provider = new WebviewProvider(context.extensionUri, context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(WebviewProvider.viewType, provider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  // Register commands
  const commands: [string, () => void][] = [
    ['channelConfig.openDashboard', () => {
      vscode.commands.executeCommand('channelConfig.mainView.focus');
    }],

    ['channelConfig.importConfig', async () => {
      try {
        const result = await importer.importFromFile();
        if (!result) { return; }
        storageService.saveConfiguration(result.config as any);
        const warnings = result.warnings;
        if (warnings.length > 0) {
          vscode.window.showWarningMessage(`Config imported with ${warnings.length} warning(s):\n${warnings.join('\n')}`);
        } else {
          vscode.window.showInformationMessage('Configuration imported successfully!');
        }
      } catch (err: any) {
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
      const items = configs.map((c: any) => ({ label: c.name, description: c.configId, config: c }));
      const selected = await vscode.window.showQuickPick(items, { placeHolder: 'Select configuration to export' });
      if (!selected) { return; }
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

export function deactivate() {
  console.log('Channel Configuration Manager deactivated.');
}
