import * as vscode from 'vscode';
import { WebviewProvider } from './ui/webviewProvider';
import { StorageService } from './services/storageService';
import { ConfigImporter } from './services/configImporter';
import { testDatabaseConnection, initializeDatabase, saveUserToDb, findUserByNameAndEmail } from './services/databaseService';
import { User } from './models';

export function activate(context: vscode.ExtensionContext) {
  console.log('Channel Configuration Manager is now active.');

  const storageService = new StorageService(context);

  // 1. First thing: Connect the user
  promptForUserAndConnect(storageService).then(() => {
    // 2. Then ensure the dashboard is focused/opened after the prompt is done
    vscode.commands.executeCommand('channelConfig.mainView.focus');
  });

  // 3. Silently initialize database in the background
  testDatabaseConnection().then(async (connected) => {
    if (connected) {
      await initializeDatabase();
    }
  });

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
    ['channelConfig.connectUser', async () => {
      await promptForUserAndConnect(storageService, true);
    }],
    ['channelConfig.disconnectUser', async () => {
      storageService.clearCurrentUser();
      vscode.window.showInformationMessage('You have been disconnected.');
      // Optional: Ask if they want to connect as someone else immediately
      const reconnect = await vscode.window.showInformationMessage('Do you want to connect as a different user?', 'Yes', 'No');
      if (reconnect === 'Yes') {
        await promptForUserAndConnect(storageService, true);
      }
    }],
  ];

  for (const [cmd, handler] of commands) {
    context.subscriptions.push(vscode.commands.registerCommand(cmd, handler));
  }
}

/**
 * Prompt the user for their information and save to DB/Storage
 */
async function promptForUserAndConnect(storageService: StorageService, force: boolean = false): Promise<void> {
  const existingUser = storageService.getCurrentUser();
  if (existingUser && !force) {
    return;
  }

  const name = await vscode.window.showInputBox({
    prompt: 'Welcome! Please enter your name to connect to the Configuration Manager',
    placeHolder: 'e.g. John Doe',
    ignoreFocusOut: true
  });

  if (!name) return;

  const email = await vscode.window.showInputBox({
    prompt: 'Enter your email to identify yourself',
    placeHolder: 'john@example.com',
    ignoreFocusOut: true
  });

  if (email === undefined) return; // ESC pressed

  // Check if user exists in DB
  const existingDbUser = await findUserByNameAndEmail(name, email || '');

  let user: User;
  if (existingDbUser) {
    user = new User(existingDbUser.id.toString(), existingDbUser.name, existingDbUser.email);
    vscode.window.showInformationMessage(`Welcome back, ${name}!`);
  } else {
    // Save new user (ID is generated by DB)
    const newUser = await saveUserToDb(name, email || '');
    user = new User(newUser.id.toString(), newUser.name, newUser.email);
    vscode.window.showInformationMessage(`Connected successfully as ${name}!`);
  }

  // Save to VS Code Global Storage (Context)
  storageService.setCurrentUser(user);
}

export function deactivate() {
  console.log('Channel Configuration Manager deactivated.');
}
