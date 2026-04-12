"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewProvider = void 0;
const vscode = __importStar(require("vscode"));
const storageService_1 = require("../services/storageService");
const aiValidator_1 = require("../ai/aiValidator");
const TokenStorage_1 = require("../services/auth/TokenStorage");
const MessageHandler_1 = require("./MessageHandler");
const webviewHtml_1 = require("./webviewHtml");
/**
 * PanelProvider manages a singleton full-editor-tab WebviewPanel.
 * Call PanelProvider.open() to create or reveal it.
 */
class WebviewProvider {
    constructor(extensionUri, context) {
        const storageService = new storageService_1.StorageService(context);
        const tokenStorage = new TokenStorage_1.TokenStorage(context);
        const apiKey = vscode.workspace.getConfiguration('channelConfig').get('geminiApiKey') || '';
        const aiValidator = new aiValidator_1.AIValidator(apiKey);
        this.handler = new MessageHandler_1.MessageHandler(storageService, tokenStorage, aiValidator, extensionUri);
        this._panel = vscode.window.createWebviewPanel(WebviewProvider.viewType, 'Channel Config Manager', vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [extensionUri],
            retainContextWhenHidden: true,
        });
        this._panel.webview.html = (0, webviewHtml_1.getHtmlForWebview)(this._panel.webview, extensionUri);
        this._panel.webview.onDidReceiveMessage(async (message) => {
            await this.handler.handle(message, this._panel.webview);
        });
        // Clean up when the user closes the tab
        this._panel.onDidDispose(() => {
            WebviewProvider._instance = undefined;
        });
    }
    /** Open or reveal the singleton panel. */
    static open(extensionUri, context) {
        if (WebviewProvider._instance) {
            // Panel already exists – just bring it to the front
            WebviewProvider._instance._panel.reveal(vscode.ViewColumn.One);
        }
        else {
            WebviewProvider._instance = new WebviewProvider(extensionUri, context);
        }
    }
}
exports.WebviewProvider = WebviewProvider;
WebviewProvider.viewType = 'channelConfig.mainPanel';
//# sourceMappingURL=webviewProvider.js.map