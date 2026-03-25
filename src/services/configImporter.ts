import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { Configuration } from '../models';
import { ChannelType } from '../models/enums';
import { StorageService } from '../services/storageService';
import { ConfigGenerator } from '../services/configGenerator';
import { ChannelManager } from '../services/channelManager';
import { MappingManager } from '../services/mappingManager';

/**
 * ConfigImporter handles importing YAML config files
 * and parsing them back into Configuration objects.
 */
export class ConfigImporter {
  private storageService: StorageService;

  constructor(storageService: StorageService) {
    this.storageService = storageService;
  }

  async importFromFile(): Promise<{ config: object; warnings: string[] } | undefined> {
    const uris = await vscode.window.showOpenDialog({
      filters: { 'YAML Files': ['yaml', 'yml'] },
      canSelectMany: false,
      title: 'Import config.yaml',
    });

    if (!uris || uris.length === 0) { return undefined; }

    const fileContent = await vscode.workspace.fs.readFile(uris[0]);
    const yamlText = Buffer.from(fileContent).toString('utf8');

    return this.parseYAML(yamlText, path.basename(uris[0].fsPath));
  }

  parseYAML(yamlText: string, sourceName: string = 'imported'): { config: object; warnings: string[] } {
    const warnings: string[] = [];
    let parsed: any;

    try {
      parsed = yaml.load(yamlText);
    } catch (err: any) {
      throw new Error(`Invalid YAML format: ${err.message}`);
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('YAML content is empty or not an object.');
    }

    // Detect duplicate logical channel names
    const channels = parsed.channels || {};
    const logicalNames = Object.keys(channels);
    const seenNames = new Set<string>();
    for (const name of logicalNames) {
      if (seenNames.has(name)) {
        warnings.push(`Duplicate logical channel name detected: "${name}".`);
      }
      seenNames.add(name);
    }

    // Detect duplicate hardware channel names
    const hardware = parsed.hardware || {};
    const hwNames = Object.keys(hardware);
    const seenHwNames = new Set<string>();
    for (const name of hwNames) {
      if (seenHwNames.has(name)) {
        warnings.push(`Duplicate hardware channel name detected: "${name}".`);
      }
      seenHwNames.add(name);
    }

    // Check for duplicate mappings
    const mappings: any[] = parsed.mappings || [];
    const seenMappings = new Set<string>();
    for (const m of mappings) {
      const key = `${m.logicalChannel}:${m.hardwareChannel}`;
      if (seenMappings.has(key)) {
        warnings.push(`Duplicate mapping: "${m.logicalChannel}" → "${m.hardwareChannel}".`);
      }
      seenMappings.add(key);
    }

    // Build a Configuration-like object from the parsed YAML
    const configId = parsed.configId || `imported_${Date.now()}`;
    const config: object = {
      configId,
      name: parsed.name || sourceName,
      userId: 'imported',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logicalChannels: logicalNames.map(name => ({
        id: `lc_${name}`,
        name,
        ...channels[name],
        type: ChannelType.LOGICAL,
      })),
      hardwareChannels: hwNames.map(name => ({
        id: `hw_${name}`,
        name,
        ...hardware[name],
        type: ChannelType.HARDWARE,
      })),
      mappings: mappings.map((m: any, i: number) => ({
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
