import 'reflect-metadata';
import * as vscode from 'vscode';
import { WebviewProvider } from './ui/webviewProvider';
import { StorageService } from './services/storageService';
import { ConfigImporter } from './services/configImporter';
import { testDatabaseConnection, initializeDatabase } from './services/databaseService';

export function activate(context: vscode.ExtensionContext) {
  console.log('Channel Configuration Manager is now active.');

  // Open the full-tab panel automatically on activation
  WebviewProvider.open(context.extensionUri, context);

  // Silently initialize database in the background
  testDatabaseConnection().then(async (connected) => {
    if (connected) {
      await initializeDatabase();
    }
  });

  const storageService = new StorageService(context);
  const importer       = new ConfigImporter(storageService);

  /** Helper: open/reveal the main panel */
  const openPanel = () => WebviewProvider.open(context.extensionUri, context);

  // Register commands
  const commands: [string, (...args: any[]) => any][] = [
    ['channelConfig.openDashboard',          openPanel],
    ['channelConfig.manageLogicalChannels',  openPanel],
    ['channelConfig.manageHardwareChannels', openPanel],
    ['channelConfig.manageMappings',         openPanel],
    ['channelConfig.generateConfig',         openPanel],
    ['channelConfig.runAIValidation',        openPanel],
    ['channelConfig.visualizeDiagram',       openPanel],
    ['channelConfig.configureFramework',     openPanel],

    ['channelConfig.importConfig', async () => {
      openPanel();
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

    // connectUser / disconnectUser kept as no-ops (auth is now in the webview)
    ['channelConfig.connectUser',    openPanel],
    ['channelConfig.disconnectUser', openPanel],
  ];

  for (const [cmd, handler] of commands) {
    context.subscriptions.push(vscode.commands.registerCommand(cmd, handler));
  }
}

export function deactivate() {
  console.log('Channel Configuration Manager deactivated.');
}
