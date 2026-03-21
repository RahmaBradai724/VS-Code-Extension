import { PublisherMode, TimestampPrecision } from './enums';

// ─────────────────────────────────────────────
//  Tracer Models
// ─────────────────────────────────────────────

export abstract class Tracer {
  id: string;
  name: string;
  loggingType?: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  abstract toYAML(): object;
  abstract toJSON(): object;
}

export class PCAPTracer extends Tracer {
  loggingFilePath: string = '';
  loggingFileLong?: string;

  constructor(id: string, name: string) {
    super(id, name);
    this.loggingType = 'PCAP';
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: 'PCAP', loggingFilePath: this.loggingFilePath };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: 'PCAP', loggingFilePath: this.loggingFilePath, loggingFileLong: this.loggingFileLong };
  }
}

export class ABCFTracer extends Tracer {
  base: string = '';
  loggingFileLong?: string;
  timestampPrecision?: TimestampPrecision;

  constructor(id: string, name: string) {
    super(id, name);
    this.loggingType = 'ABCF';
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: 'ABCF', base: this.base, timestampPrecision: this.timestampPrecision };
  }

  toJSON(): object {
    return { ...this.toYAML(), loggingFileLong: this.loggingFileLong };
  }
}

// ─────────────────────────────────────────────
//  Publisher Config
// ─────────────────────────────────────────────
export class PublisherConfig {
  publisherType: string = PublisherMode.SingleThreaded;
  topicCancel?: string;
  channelGroups: string[][] = [];

  toYAML(): object {
    return { type: this.publisherType, channelGroups: this.channelGroups };
  }

  toJSON(): object {
    return { publisherType: this.publisherType, topicCancel: this.topicCancel, channelGroups: this.channelGroups };
  }
}

// ─────────────────────────────────────────────
//  Ethernet Config
// ─────────────────────────────────────────────
export class EthernetConfig {
  autoDetectEthSettings?: boolean;
  maxDataCols?: string;
  protocol?: string;
  build?: string;
  appLayerPort?: number;
  appLayerPorts?: number[];

  toYAML(): object {
    return { autoDetectEthSettings: this.autoDetectEthSettings, protocol: this.protocol, appLayerPort: this.appLayerPort };
  }

  toJSON(): object {
    return { ...this };
  }
}

// ─────────────────────────────────────────────
//  Diagnostics Config
// ─────────────────────────────────────────────
export class DiagnosticsConfig {
  ecuAddress: string = '';
  testerAddress: string = '';
  protocol: string = '';
  build: string = '';
  rai?: string;

  toYAML(): object {
    return { ecuAddress: this.ecuAddress, testerAddress: this.testerAddress, protocol: this.protocol };
  }

  toJSON(): object {
    return { ...this };
  }
}

// ─────────────────────────────────────────────
//  Framework Config
// ─────────────────────────────────────────────
export class FrameworkConfig {
  keys: Map<string, string> = new Map();
  channels: Map<string, string[]> = new Map();
  publisher: PublisherConfig = new PublisherConfig();
  diagnostics: DiagnosticsConfig = new DiagnosticsConfig();
  ethernet: EthernetConfig = new EthernetConfig();
  tracing: Tracer[] = [];
  serverUrls: string = '';
  channelListMapping: Map<string, string[]> = new Map();

  toYAML(): object {
    const tracers: object[] = this.tracing.map(t => t.toYAML());
    return {
      publisher: this.publisher.toYAML(),
      diagnostics: this.diagnostics.toYAML(),
      ethernet: this.ethernet.toYAML(),
      tracing: tracers,
    };
  }

  toJSON(): object {
    return {
      keys: Object.fromEntries(this.keys),
      channels: Object.fromEntries(this.channels),
      publisher: this.publisher.toJSON(),
      diagnostics: this.diagnostics.toJSON(),
      ethernet: this.ethernet.toJSON(),
      tracing: this.tracing.map(t => t.toJSON()),
      serverUrls: this.serverUrls,
    };
  }
}
