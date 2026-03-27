import * as vscode from 'vscode';
import * as path from 'path';
import { StorageService } from '../storage/StorageService';
import { YamlParser } from './YamlParser';

/**
 * ConfigImporter handles file I/O for importing YAML config files.
 * SRP: file I/O and VS Code dialog only — YAML parsing delegated to YamlParser.
 * DIP: accepts YamlParser via constructor for testability.
 */
export class ConfigImporter {
  private storageService: StorageService;
  private parser: YamlParser;

  constructor(
    storageService: StorageService,
    parser: YamlParser = new YamlParser(),
  ) {
    this.storageService = storageService;
    this.parser = parser;
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

    return this.parser.parse(yamlText, path.basename(uris[0].fsPath));
  }

  parseYAML(yamlText: string, sourceName: string = 'imported'): { config: object; warnings: string[] } {
    return this.parser.parse(yamlText, sourceName);
  }
}
