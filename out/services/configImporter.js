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
exports.ConfigImporter = void 0;
const vscode = __importStar(require("vscode"));
const yaml = __importStar(require("js-yaml"));
const path = __importStar(require("path"));
const enums_1 = require("../models/enums");
/**
 * ConfigImporter handles importing YAML config files
 * and parsing them back into Configuration objects.
 */
class ConfigImporter {
    constructor(storageService) {
        this.storageService = storageService;
    }
    async importFromFile() {
        const uris = await vscode.window.showOpenDialog({
            filters: { 'YAML Files': ['yaml', 'yml'] },
            canSelectMany: false,
            title: 'Import config.yaml',
        });
        if (!uris || uris.length === 0) {
            return undefined;
        }
        const fileContent = await vscode.workspace.fs.readFile(uris[0]);
        const yamlText = Buffer.from(fileContent).toString('utf8');
        return this.parseYAML(yamlText, path.basename(uris[0].fsPath));
    }
    parseYAML(yamlText, sourceName = 'imported') {
        const warnings = [];
        let parsed;
        try {
            parsed = yaml.load(yamlText);
        }
        catch (err) {
            throw new Error(`Invalid YAML format: ${err.message}`);
        }
        if (!parsed || typeof parsed !== 'object') {
            throw new Error('YAML content is empty or not an object.');
        }
        // Detect duplicate logical channel names
        const channels = parsed.channels || {};
        const logicalNames = Object.keys(channels);
        const seenNames = new Set();
        for (const name of logicalNames) {
            if (seenNames.has(name)) {
                warnings.push(`Duplicate logical channel name detected: "${name}".`);
            }
            seenNames.add(name);
        }
        // Detect duplicate hardware channel names
        const hardware = parsed.hardware || {};
        const hwNames = Object.keys(hardware);
        const seenHwNames = new Set();
        for (const name of hwNames) {
            if (seenHwNames.has(name)) {
                warnings.push(`Duplicate hardware channel name detected: "${name}".`);
            }
            seenHwNames.add(name);
        }
        // Check for duplicate mappings
        const mappings = parsed.mappings || [];
        const seenMappings = new Set();
        for (const m of mappings) {
            const key = `${m.logicalChannel}:${m.hardwareChannel}`;
            if (seenMappings.has(key)) {
                warnings.push(`Duplicate mapping: "${m.logicalChannel}" → "${m.hardwareChannel}".`);
            }
            seenMappings.add(key);
        }
        // Build a Configuration-like object from the parsed YAML
        const configId = parsed.configId || `imported_${Date.now()}`;
        const config = {
            configId,
            name: parsed.name || sourceName,
            userId: 'imported',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            logicalChannels: logicalNames.map(name => ({
                id: `lc_${name}`,
                name,
                ...channels[name],
                type: enums_1.ChannelType.LOGICAL,
            })),
            hardwareChannels: hwNames.map(name => ({
                id: `hw_${name}`,
                name,
                ...hardware[name],
                type: enums_1.ChannelType.HARDWARE,
            })),
            mappings: mappings.map((m, i) => ({
                mappingId: `mapping_${i}`,
                configurationId: configId,
                logicalChannelId: `lc_${m.logicalChannel}`,
                logicalChannelName: m.logicalChannel,
                hardwareChannelId: `hw_${m.hardwareChannel}`,
                hardwareChannelName: m.hardwareChannel,
                createdAt: new Date().toISOString(),
            })),
            frameworkConfig: parsed.frameworkConfig || {},
        };
        return { config, warnings };
    }
}
exports.ConfigImporter = ConfigImporter;
//# sourceMappingURL=configImporter.js.map