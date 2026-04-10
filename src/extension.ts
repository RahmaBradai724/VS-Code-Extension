import 'reflect-metadata';
import * as vscode from 'vscode';
import { WebviewProvider } from './ui/webviewProvider';
import { StorageService } from './services/storageService';
import { ConfigImporter } from './services/configImporter';
import { testDatabaseConnection, initializeDatabase, saveConfigurationToDb } from './services/databaseService';
import { setAutoLoad } from './ui/autoLoadState';

export async function activate(context: vscode.ExtensionContext) {
  console.log('Channel Configuration Manager is now active.');

  // Silently initialize database in the background
  testDatabaseConnection().then(async (connected) => {
    if (connected) {
      await initializeDatabase();
    }
  });

  const storageService = new StorageService(context);
  const importer       = new ConfigImporter(storageService);

  /** Default content written to a freshly created MTF.yaml */
  const DEFAULT_MTF_YAML = [
    'Channels: {}',
    'Mappings: {}',
    'FrameworkConfig:',
    '  PublisherConfig:',
    '    PublisherType: SingleThreaded',
    '',
  ].join('\n');

  /** Helper: open/reveal the main panel */
  const openPanel = () => WebviewProvider.open(context.extensionUri, context);

  /**
   * Called when MTF.yaml is detected (created or already exists).
   * - workspaceState stores the config ID so the same session reuses the same config.
   * - A new MTF.yaml always generates a fresh unique ID + name.
   */
  const WS_KEY = 'mtfConfigId';

  const autoCreate = async (uri: vscode.Uri) => {
    try {
      const storedId = context.workspaceState.get<string>(WS_KEY);

      if (storedId) {
        const existing = storageService.getConfigurationById(storedId) as any;
        if (existing) {
          // Config already exists for this workspace — queue it for auto-load
          setAutoLoad(existing);
          return;
        }
        // Stored ID but no config (e.g. storage cleared) — fall through to recreate
      }

      // Write default template to MTF.yaml if it is empty
      const rawBytes = await vscode.workspace.fs.readFile(uri);
      const text = Buffer.from(rawBytes).toString('utf8').trim();
      if (!text) {
        await vscode.workspace.fs.writeFile(uri, Buffer.from(DEFAULT_MTF_YAML, 'utf8'));
      }

      // Generate a unique ID and name for every new MTF.yaml
      const ts = Date.now();
      const newId   = `mtf_${ts}`;
      const newName = `MTF_${new Date(ts).toISOString().slice(0, 10)}_${ts.toString().slice(-5)}`;

      // Persist the workspace-scoped ID for future reloads
      await context.workspaceState.update(WS_KEY, newId);

      // Queue metadata for auto-load — saving to DB/globalState happens after auth
      // so the config is stored with the real logged-in userId (foreign key)
      setAutoLoad({
        id: newId,
        name: newName,
        userId: null,
        logicalChannels: [],
        hardwareChannels: [],
        mappings: [],
        frameworkConfig: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.warn(`autoCreate MTF.yaml failed: ${err.message}`);
    }
  };

  // Handle MTF.yaml already present when the workspace opens
  const existingMTF = await vscode.workspace.findFiles('**/MTF.yaml', null, 1);
  if (existingMTF.length > 0) {
    await autoCreate(existingMTF[0]);
    openPanel();
  }

  // Watch for MTF.yaml being created
  const mtfWatcher = vscode.workspace.createFileSystemWatcher('**/MTF.yaml');
  mtfWatcher.onDidCreate(async (uri) => {
    await autoCreate(uri);
    openPanel();
    vscode.window.showInformationMessage('MTF.yaml detected — Channel Configuration Manager opened.');
  });
  context.subscriptions.push(mtfWatcher);

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
        const plainConfig = result.config as any;
        const id = plainConfig.id || plainConfig.configId;
        const name = plainConfig.name || 'imported';
        storageService.saveRaw(plainConfig);
        try {
          await saveConfigurationToDb(id, name, plainConfig.userId ?? null, JSON.stringify(plainConfig));
        } catch (dbErr: any) {
          console.warn(`Config saved locally but DB insert failed: ${dbErr.message}`);
        }
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
