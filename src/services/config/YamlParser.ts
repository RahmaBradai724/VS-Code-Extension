import * as yaml from 'js-yaml';
import { ChannelType } from '../../models/enums';

export class YamlParser {
  parse(yamlText: string, sourceName: string = 'imported'): { config: object; warnings: string[] } {
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

    const channels = parsed.channels || {};
    const logicalNames = Object.keys(channels);
    const seenNames = new Set<string>();
    for (const name of logicalNames) {
      if (seenNames.has(name)) {
        warnings.push(`Duplicate logical channel name detected: "${name}".`);
      }
      seenNames.add(name);
    }

    const hardware = parsed.hardware || {};
    const hwNames = Object.keys(hardware);
    const seenHwNames = new Set<string>();
    for (const name of hwNames) {
      if (seenHwNames.has(name)) {
        warnings.push(`Duplicate hardware channel name detected: "${name}".`);
      }
      seenHwNames.add(name);
    }

    const mappings: any[] = parsed.mappings || [];
    const seenMappings = new Set<string>();
    for (const m of mappings) {
      const key = `${m.logicalChannel}:${m.hardwareChannel}`;
      if (seenMappings.has(key)) {
        warnings.push(`Duplicate mapping: "${m.logicalChannel}" → "${m.hardwareChannel}".`);
      }
      seenMappings.add(key);
    }

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
