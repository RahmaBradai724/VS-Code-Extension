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
   * Called on startup when MTF.yaml already existed.
   * Tries to reuse the previously stored config for this workspace.
   * If none found, falls through to createFreshConfig.
   */
  const WS_KEY = 'mtfConfigId';

  const handleExistingFile = async (uri: vscode.Uri) => {
    const storedId = context.workspaceState.get<string>(WS_KEY);
    if (storedId) {
      const existing = storageService.getConfigurationById(storedId) as any;
      if (existing) {
        setAutoLoad(existing);
        return;
      }
    }
    // No stored config (first run or storage cleared) → create fresh
    await createFreshConfig(uri);
  };

  /**
   * Called whenever MTF.yaml is freshly created (onDidCreate watcher).
   * Always produces a brand-new empty config — no ctime check needed
   * because the watcher event already tells us the file is new.
   */
  const createFreshConfig = async (uri: vscode.Uri) => {
    try {
      const rawBytes = await vscode.workspace.fs.readFile(uri);
      const text = Buffer.from(rawBytes).toString('utf8').trim();
      if (!text) {
        await vscode.workspace.fs.writeFile(uri, Buffer.from(DEFAULT_MTF_YAML, 'utf8'));
      }
      const ts = Date.now();
      const newId   = `mtf_${ts}`;
      const newName = `MTF_${new Date(ts).toISOString().slice(0, 10)}_${ts.toString().slice(-5)}`;
      await context.workspaceState.update(WS_KEY, newId);
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
      console.warn(`createFreshConfig failed: ${err.message}`);
    }
  };

  // Handle MTF.yaml already present when the workspace opens
  const existingMTF = await vscode.workspace.findFiles('**/MTF.yaml', null, 1);
  if (existingMTF.length > 0) {
    await handleExistingFile(existingMTF[0]);
    openPanel();
  }

  // Watch for MTF.yaml being created — always produce a fresh config
  const mtfWatcher = vscode.workspace.createFileSystemWatcher('**/MTF.yaml');

  mtfWatcher.onDidCreate(async (uri) => {
    await createFreshConfig(uri);
    if (WebviewProvider.hasInstance()) {
      WebviewProvider.applyPendingLoad();
      WebviewProvider.open(context.extensionUri, context); // reveal
    } else {
      openPanel(); // new panel; pending config consumed on first checkAuth
    }
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
