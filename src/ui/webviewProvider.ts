import * as vscode from 'vscode';
import { StorageService } from '../services/storageService';
import { AIValidator } from '../ai/aiValidator';
import { TokenStorage } from '../services/auth/TokenStorage';
import { MessageHandler } from './MessageHandler';
import { getHtmlForWebview } from './webviewHtml';

/**
 * PanelProvider manages a singleton full-editor-tab WebviewPanel.
 * Call PanelProvider.open() to create or reveal it.
 */
export class WebviewProvider {
  public static readonly viewType = 'channelConfig.mainPanel';

  /** Singleton panel instance */
  private static _instance: WebviewProvider | undefined;

  private _panel: vscode.WebviewPanel;
  private readonly handler: MessageHandler;

  private constructor(
    extensionUri: vscode.Uri,
    context: vscode.ExtensionContext,
  ) {
    const storageService = new StorageService(context);
    const tokenStorage   = new TokenStorage(context);
    const apiKey = vscode.workspace.getConfiguration('channelConfig').get<string>('geminiApiKey') || '';
    const aiValidator = new AIValidator(apiKey);
    this.handler = new MessageHandler(storageService, tokenStorage, aiValidator, extensionUri);

    this._panel = vscode.window.createWebviewPanel(
      WebviewProvider.viewType,
      'Channel Config Manager',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri],
        retainContextWhenHidden: true,
      },
    );

    this._panel.webview.html = getHtmlForWebview(this._panel.webview, extensionUri);

    this._panel.webview.onDidReceiveMessage(async (message) => {
      await this.handler.handle(message, this._panel.webview);
    });

    // Clean up when the user closes the tab
    this._panel.onDidDispose(() => {
      WebviewProvider._instance = undefined;
    });
  }

  /** Open or reveal the singleton panel. */
  public static open(extensionUri: vscode.Uri, context: vscode.ExtensionContext): void {
    if (WebviewProvider._instance) {
      WebviewProvider._instance._panel.reveal(vscode.ViewColumn.One);
    } else {
      WebviewProvider._instance = new WebviewProvider(extensionUri, context);
    }
  }

  /** Returns true if a panel is currently open. */
  public static hasInstance(): boolean {
    return WebviewProvider._instance !== undefined;
  }

  /**
   * If the panel is open and the user is authenticated, immediately apply
   * the pending auto-load config (set by autoCreate when MTF.yaml is created).
   * If the panel is not open, the pending config will be consumed naturally
   * on the next checkAuth call when the panel is opened.
   */
  public static applyPendingLoad(): void {
    const inst = WebviewProvider._instance;
    if (inst) {
      inst.handler.applyAutoLoad(inst._panel.webview);
    }
  }
}

