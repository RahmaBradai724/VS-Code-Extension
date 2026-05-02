// ── Address format regexes (shared across forms) ────────────────────────────
export const REGEX = {
  /** IPv4: 0.0.0.0 – 255.255.255.255 */
  IPV4: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,

  /**
   * IPv6: full (8 groups of 1–4 hex digits, colon-separated)
   *   or compressed with :: (e.g. 2001:db8::8a2e:370:7334)
   */
  IPV6: /^(([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(([0-9A-Fa-f]{1,4}:){1,7}:)|(([0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,5}(:[0-9A-Fa-f]{1,4}){1,2})|(([0-9A-Fa-f]{1,4}:){1,4}(:[0-9A-Fa-f]{1,4}){1,3})|(([0-9A-Fa-f]{1,4}:){1,3}(:[0-9A-Fa-f]{1,4}){1,4})|(([0-9A-Fa-f]{1,4}:){1,2}(:[0-9A-Fa-f]{1,4}){1,5})|([0-9A-Fa-f]{1,4}:(:[0-9A-Fa-f]{1,4}){1,6})|(:(:[0-9A-Fa-f]{1,4}){1,7})|::)$/,

  /** IPv4 or IPv6 */
  IP: /^(((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$|^(([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(([0-9A-Fa-f]{1,4}:){1,7}:)|(([0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,5}(:[0-9A-Fa-f]{1,4}){1,2})|(([0-9A-Fa-f]{1,4}:){1,4}(:[0-9A-Fa-f]{1,4}){1,3})|(([0-9A-Fa-f]{1,4}:){1,3}(:[0-9A-Fa-f]{1,4}){1,4})|(([0-9A-Fa-f]{1,4}:){1,2}(:[0-9A-Fa-f]{1,4}){1,5})|([0-9A-Fa-f]{1,4}:(:[0-9A-Fa-f]{1,4}){1,6})|(:(:[0-9A-Fa-f]{1,4}){1,7})|::)$/,

  /** MAC: six colon-separated hex byte pairs e.g. AA:BB:CC:DD:EE:FF */
  MAC: /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/,

  /** First 3 octets of an IPv4 prefix e.g. 10.104.3 */
  IP_PREFIX: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
} as const;

export type Page = 'configs' | 'logical' | 'hardware' | 'mappings' | 'framework' | 'tracers' | 'generate' | 'dashboard' | 'diagrams' | 'agent';

export type FrameworkSection =
  | 'tracers'
  | 'connectedEcus'
  | 'servicePack'
  | 'publisher'
  | 'ethernet'
  | 'npduConfig'
  | 'someIPConfig'
  | 'appLayerPorts'
  | 'ethernetTopology'
  | 'channelToEcusMapping';

export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface TracerFileConfig {
  BaseFileName?: string;
  Extension?: string;
  MaxFile?: number;
  MaxFileSize?: number;
  CompressionLevel?: number;
}

export interface TracerBufferConfig {
  BufferSize?: number;
  BufferNumber?: number;
  WriteBurstSize?: number;
}

export interface TracerLoggerConfiguration {
  FileConfig?: TracerFileConfig;
  BufferConfig?: TracerBufferConfig;
}

export interface TracerConfig {
  /** Key name in the YAML Tracing section */
  name: string;
  Type: 'PCAP' | 'ASCII';
  Timestamp?: 'Microsecond' | 'Nanosecond';
  LoggerConfiguration?: TracerLoggerConfiguration;
  // PCAP-specific
  LoggingType?: 'MultipleAdapterMode' | 'PerformanceMode' | 'StandardMode';
  // ASCII-specific
  Base?: 'Hex' | 'Decimal';
  InternalEventLogged?: boolean;
  TimeStampSetting?: 'Absolute' | 'Relative';
}

export interface EthernetConfigData {
  considerOnlyEthernetTopologyEcus?: boolean;
  npduConfig?: any;
  someIPConfig?: any;
  appLayerPorts?: any;
  ethernetTopology?: any;
  channelToEcusMapping?: Record<string, string[]>;
}

export interface FrameworkData {
  tracers: TracerConfig[];
  publisherType: string;
  channelsGroups: string[][];
  connectedEcus: string[];
  servicePack: string;
  ethernetConfig: EthernetConfigData;
}

export interface AiResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  diagnostics?: Array<{
    code: string;
    severity: 'error' | 'warning' | 'suggestion';
    source: 'configuration' | 'mapping' | 'yaml' | 'generation';
    message: string;
    path?: string;
    fix?: string;
    evidence?: string;
  }>;
}

export interface LogicalChannel {
  id: string;
  name: string;
  channelId?: number;
  loggingName?: string;
  tracerName?: string;
  alias?: string[];
  type: 'LOGICAL';
  category: string;
  subclass: string;
  [key: string]: any;
}

export interface HardwareChannel {
  id: string;
  name: string;
  type: 'HARDWARE';
  subclass: string;
  [key: string]: any;
}

export interface AppState {
  page: Page;
  configs: any[];
  currentConfigId: string | null;
  currentConfigName: string;
  logicalChannels: any[];
  hardwareChannels: any[];
  mappings: any[];
  frameworkData: FrameworkData;
  draftLogical: any | null;
  notification: Notification | null;
  yamlContent: string;
  aiResult: AiResult | null;
  generating: boolean;
  aiValidating: boolean;
  // Auth
  authToken: string | null;
  authUser: { id: number; name: string; email: string } | null;
  authLoading: boolean;
  authError: string | null;
  // MTF Agent
  agentMessages: AgentMessage[];
  agentLoading: boolean;
  agentStreamingText: string;
  // Framework
  frameworkSection: FrameworkSection | null;
}

export interface AgentSource {
  section:     string;
  subsection:  string;
  title:       string;
  source_url:  string;
  score?:      number;
  vectorScore?: number;
  fromGraph?:  boolean;
  sourceType?: 'documentation' | 'workspace';
  summary?:    string;
}

export interface AgentResponseMeta {
  confidence: 'high' | 'medium' | 'low';
  verification: 'diagnostics' | 'documentation' | 'mixed' | 'limited';
  patchSafety: 'verified' | 'blocked' | 'not-needed';
  notes: string[];
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  /** Section sources (only on assistant messages) */
  sources?: AgentSource[];
  meta?: AgentResponseMeta;
  /** True while the message is still being streamed */
  streaming?: boolean;
}

export type AppAction =
  | { type: 'SET_PAGE'; page: Page }
  | { type: 'SET_CONFIGS'; configs: any[] }
  | { type: 'CONFIG_CREATED'; config: any }
  | { type: 'CONFIG_LOADED'; data: any }
  | { type: 'CONFIG_DELETED'; configId: string }
  | { type: 'LOGICAL_ADDED'; channel: any }
  | { type: 'LOGICAL_DELETED'; id: string }
  | { type: 'HARDWARE_ADDED'; channel: any }
  | { type: 'HARDWARE_DELETED'; id: string }
  | { type: 'MAPPING_ADDED'; mapping: any }
  | { type: 'MAPPING_DELETED'; id: string }
  | { type: 'SET_NOTIFICATION'; notification: Notification | null }
  | { type: 'SET_YAML'; yaml: string }
  | { type: 'SET_AI_RESULT'; result: AiResult }
  | { type: 'UPDATE_FRAMEWORK'; data: Partial<FrameworkData> }
  | { type: 'SET_GENERATING'; generating: boolean }
  | { type: 'SET_AI_VALIDATING'; validating: boolean }
  | { type: 'SET_DRAFT_LOGICAL'; draft: any | null }
  | { type: 'AUTH_SUCCESS'; token: string; user: { id: number; name: string; email: string } }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_LOADING'; loading: boolean }
  | { type: 'AUTH_ERROR'; error: string | null }
  | { type: 'AGENT_USER_MSG'; content: string }
  | { type: 'AGENT_CHUNK'; token: string }
  | { type: 'AGENT_DONE'; sources: AgentMessage['sources']; meta?: AgentMessage['meta'] }
  | { type: 'AGENT_ERROR'; error: string }
  | { type: 'AGENT_CLEAR' }
  | { type: 'SET_FRAMEWORK_SECTION'; section: FrameworkSection | null };

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'checkbox' | 'select' | 'json';
  placeholder?: string;
  options?: (string | SelectOption)[];
  defaultValue?: string | number | boolean;
  /** Regex to validate the value (only applied when the field is non-empty). */
  pattern?: RegExp;
  /** Error message shown when the value does not match `pattern`. */
  patternError?: string;
}

// ── Channel type badge colors ─────────────────────────────────────────────
export const CHANNEL_COLORS: Record<string, string> = {
  CAN: '#569cd6',
  CANFD: '#569cd6',
  LIN: '#dcb67a',
  ETHERNET: '#4ec9b0',
  FLEXRAY: '#c678dd',
  FR: '#c678dd',
  SERIAL: '#98c379',
  IOINPUT: '#e06c75',
  IOOUTPUT: '#f472b6',
  TE_ANALOG: '#e5c07b',
  BRIDGE: '#93c5fd',
  PS: '#80cbc4',
  IOSERIAL: '#fb923c',
  CAN_INTERFACE: '#569cd6',
  ETHERNET_ADAPTER: '#4ec9b0',
  SERIAL_PORT: '#98c379',
  RELAY_BOARD: '#e06c75',
  HID_RELAY: '#f472b6',
  ANALOG_DEVICE: '#e5c07b',
  HH_LOAD: '#fb923c',
  BTS_REVO: '#f97316',
  TUNTAP_BRIDGE: '#38bdf8',
  TunTapBridge: '#38bdf8',
};

// ── Logical channel subclass → extra fields ───────────────────────────────
export const LOGICAL_SUBCLASS_OPTIONS = [
  { value: 'CANChannel', label: 'CAN Channel', category: 'CAN' },
  { value: 'LINChannel', label: 'LIN Channel', category: 'LIN' },
  { value: 'FlexRayChannel', label: 'FlexRay Channel', category: 'FLEXRAY' },
  { value: 'EthernetChannel', label: 'Ethernet Channel', category: 'ETHERNET' },
  { value: 'SerialChannel', label: 'Serial Channel', category: 'SERIAL' },
  { value: 'IOInputChannel', label: 'IO Input Channel', category: 'IOINPUT' },
  { value: 'IOOutputChannel', label: 'IO Output Channel', category: 'IOOUTPUT' },
  { value: 'BridgeChannel', label: 'Bridge Channel', category: 'BRIDGE' },
  { value: 'PSChannel', label: 'PS Channel', category: 'PS' },
  { value: 'IOSerialChannel', label: 'IO Serial Channel', category: 'IOSERIAL' },
];

export const LOGICAL_EXTRA_FIELDS: Record<string, FieldDef[]> = {
  CANChannel: [{ key: 'protocol', label: 'Protocol', type: 'text', placeholder: 'e.g. CANFD or CAN20' }],
  LINChannel: [{ key: 'protocol', label: 'Protocol', type: 'text', placeholder: 'e.g. 2.1' }],
  FlexRayChannel: [],
  EthernetChannel: [
    { key: 'applicationProtocol', label: 'Application Protocol', type: 'select', options: ['XCP', 'DIAG', 'VIS', 'Nothing', 'All'], defaultValue: 'All' },
  ],
  SerialChannel: [],
  IOInputChannel: [
    { key: 'loggingBusIndex', label: 'Logging Bus Index', type: 'number', placeholder: 'e.g. 45' },
  ],
  IOOutputChannel: [
    { key: 'loggingBusIndex', label: 'Logging Bus Index', type: 'number', placeholder: 'e.g. 45' },
  ],
  BridgeChannel: [],
  PSChannel: [],
  IOSerialChannel: [],
};

// ── Hardware channel subclass → extra fields ──────────────────────────────
export const HARDWARE_SUBCLASS_OPTIONS = [
  { value: 'CANInterface', label: 'Capture Module – CAN / CAN-FD / FlexRay (CM)', category: 'CAN_INTERFACE' },
  { value: 'LINCard',      label: 'Capture Module – LIN (CM)',                  category: 'CAN_INTERFACE' },
  { value: 'EthernetAdapter',      label: 'Network Adapter (PCAP)',             category: 'ETHERNET_ADAPTER' },
  { value: 'SerialPort',           label: 'Serial Port',                        category: 'SERIAL_PORT' },
  { value: 'RelayBoard',           label: 'SHS Relay Board (Technica)',         category: 'RELAY_BOARD' },
  { value: 'HIDRelay',             label: 'HID Relay Board (DCTTECH)',          category: 'HID_RELAY' },
  { value: 'AnalogDevice',         label: 'Analog Device',                     category: 'ANALOG_DEVICE' },
  { value: 'TEAnalog',             label: 'TE-Analog (LIN/CM-sense)',           category: 'TE_ANALOG' },
  { value: 'HHLoad',               label: 'H\&H Electrical Load (PLI/PMLI)',   category: 'HH_LOAD' },
  { value: 'BTSRevo',              label: 'BTS-REVO (Body Electronics)',        category: 'BTS_REVO' },
  { value: 'GenesysPowerSupply',   label: 'Genesys Power Supply',              category: 'GENESYS_PS' },
  { value: 'MansonPowerSupply',    label: 'Manson Power Supply',               category: 'MANSON_PS' },
  { value: 'TunTapBridge',         label: 'TUN/TAP Bridge',                    category: 'TUNTAP_BRIDGE' },
];

export const HARDWARE_EXTRA_FIELDS: Record<string, FieldDef[]> = {
  // CIBInterface / CMInterface are legacy subclass values — keep entries here so
  // existing channels still render their fields correctly.
  CANInterface: [
    { key: 'cmId',   label: 'CM ID (last byte of IP)', type: 'number', placeholder: 'e.g. 64' },
    { key: 'cmType', label: 'CM Type',                 type: 'select', options: [
      { value: 'CAN_Combo', label: 'CAN_Combo – CAN / CAN-FD / FlexRay' },
      { value: 'LIN_Combo', label: 'LIN_Combo – LIN' },
    ]},
  ],
  CIBInterface: [
    { key: 'cmId',   label: 'CM ID (last byte of IP)', type: 'number', placeholder: 'e.g. 64' },
    { key: 'cmType', label: 'CM Type',                 type: 'select', options: [
      { value: 'CAN_Combo', label: 'CAN_Combo – CAN / CAN-FD / FlexRay' },
      { value: 'LIN_Combo', label: 'LIN_Combo – LIN' },
    ]},
  ],
  CMInterface: [
    { key: 'cmId',   label: 'CM ID (last byte of IP)', type: 'number', placeholder: 'e.g. 64' },
    { key: 'cmType', label: 'CM Type',                 type: 'select', options: [
      { value: 'CAN_Combo', label: 'CAN_Combo – CAN / CAN-FD / FlexRay' },
      { value: 'LIN_Combo', label: 'LIN_Combo – LIN' },
    ]},
  ],
  LINCard: [
    { key: 'cmId',   label: 'CM ID (last byte of IP)', type: 'number', placeholder: 'e.g. 64' },
    { key: 'cmType', label: 'CM Type',                 type: 'select', options: [
      { value: 'CAN_Combo', label: 'CAN_Combo – CAN / CAN-FD / FlexRay' },
      { value: 'LIN_Combo', label: 'LIN_Combo – LIN' },
    ]},
  ],
  EthernetAdapter: [
    { key: 'friendlyName', label: 'Friendly Name (AdapterFriendlyName)', type: 'text', placeholder: 'e.g. Ethernet-ch' },
    { key: 'interface', label: 'Interface Name', type: 'text', placeholder: 'e.g. ensp04 or DeviceNPF_{...}' },
    { key: 'bufferSize', label: 'Buffer Size (MB)', type: 'number', placeholder: 'e.g. 8' },
    { key: 'bpFilter', label: 'BPF Filter', type: 'text', placeholder: 'e.g. ip src 192.168.0.1' },
    { key: 'timeout', label: 'Timeout (ms)', type: 'number', placeholder: 'e.g. 1' },
    { key: 'timeStampPrecision', label: 'Timestamp Precision', type: 'select', options: ['', 'Microsecond', 'Nanosecond'] },
    { key: 'timeStampSource', label: 'Timestamp Source', type: 'select', options: ['', 'TimeStampHost', 'TimeStampHostLowPrecision', 'TimeStampHostHighPrecisionSync', 'TimeStampAdapterUnsync', 'TimeStampHostHighPrecisionUnsync'] },
    { key: 'immediateMode', label: 'Immediate Mode', type: 'checkbox' },
    { key: 'snapshotLength', label: 'Snapshot Length', type: 'number', placeholder: 'e.g. 65536' },
    { key: 'pcapDeviceMode', label: 'PCAP Device Mode', type: 'select', options: ['', 'Promiscuous'] },
    { key: 'useDataLoggerTimeStamp', label: 'Use DataLogger Timestamp', type: 'checkbox' },
    { key: 'removeDataLoggerMetaData', label: 'Remove DataLogger Metadata', type: 'checkbox' },
    { key: 'dataLoggerType', label: 'DataLogger Type', type: 'text', placeholder: 'e.g. NotDefined, TECMP' },
    { key: 'packetProcessingActive', label: 'Packet Processing Active', type: 'checkbox' },
    { key: 'packetIdentificationActive', label: 'Packet Identification Active', type: 'checkbox' },
    { key: 'differentHandlerForTxAndRx', label: 'Different Handler For Tx And Rx', type: 'checkbox' },
    { key: 'tecmpPacketizationActive', label: 'TECMP Packetization Active', type: 'checkbox' },
  ],
  SerialPort: [
    { key: 'portName', label: 'Port Name', type: 'text', placeholder: 'e.g. COM1' },
    { key: 'baudRate', label: 'Baud Rate', type: 'number', placeholder: 'e.g. 9600' },
    { key: 'parity', label: 'Parity', type: 'select', options: ['None', 'Even', 'Odd'] },
    { key: 'dataBits', label: 'Data Bits', type: 'number', placeholder: 'e.g. 8' },
    { key: 'stopBits', label: 'Stop Bits', type: 'text', placeholder: 'e.g. 1' },
    { key: 'flowControl', label: 'Flow Control', type: 'select', options: ['None', 'RTS_CTS', 'XOn_XOff'] },
    { key: 'separationTimeMs', label: 'Separation Time (ms)', type: 'number', placeholder: 'e.g. 0' },
    { key: 'maxReceivedDataSize', label: 'Max Received Data Size', type: 'number', placeholder: 'e.g. 0' },
  ],
  RelayBoard: [
    { key: 'relayCount', label: 'Relay Count', type: 'number', placeholder: '' },
    { key: 'boardId', label: 'Board ID', type: 'number', placeholder: '' },
    { key: 'channelName', label: 'Channel Name', type: 'text', placeholder: '' },
  ],
  HIDRelay: [
    { key: 'vendorId', label: 'Vendor ID', type: 'text', placeholder: '' },
    { key: 'productId', label: 'Product ID', type: 'text', placeholder: '' },
    { key: 'deviceSerial', label: 'Device Serial', type: 'text', placeholder: '' },
  ],
  AnalogDevice: [
    { key: 'channels', label: 'Channels', type: 'number', placeholder: '' },
    { key: 'resolution', label: 'Resolution', type: 'number', placeholder: '' },
    { key: 'hwChannel', label: 'HW Channel', type: 'number', placeholder: '' },
    { key: 'measurementAttribute', label: 'Measurement Attribute', type: 'text', placeholder: '' },
  ],
  TEAnalog: [
    { key: 'sensorType', label: 'Sensor Type', type: 'text', placeholder: '' },
    { key: 'hwChannel', label: 'HW Channel', type: 'number', placeholder: '' },
    { key: 'deviceId', label: 'Device ID', type: 'number', placeholder: '' },
  ],
  HHLoad: [
    { key: 'deviceId',  label: 'Device ID',            type: 'number',  placeholder: 'e.g. 2' },
    { key: 'portName',  label: 'Port Name',             type: 'text',    placeholder: 'e.g. COM19' },
    { key: 'loadType',  label: 'Device Type',           type: 'select',  options: ['PLI', 'PMLI'] },
    { key: 'bitRate',   label: 'Bit Rate',              type: 'number',  placeholder: 'e.g. 115200' },
  ],
  GenesysPowerSupply: [
    { key: 'communicationProtocol', label: 'Communication Protocol', type: 'select', options: ['Serial', 'Tcp'] },
    { key: 'defaultVoltage',        label: 'Default Voltage (V)',    type: 'number', placeholder: 'e.g. 12' },
    { key: 'maxVoltage',            label: 'Max Voltage (V)',        type: 'number', placeholder: 'e.g. 20' },
    { key: 'defaultMaxCurrent',     label: 'Default Max Current (A)', type: 'number', placeholder: 'e.g. 35' },
    { key: 'samplingInterval',      label: 'Sampling Interval (ms)', type: 'number', placeholder: 'e.g. 100' },
    // Serial fields
    { key: 'portName',              label: 'Port Name (Serial)',     type: 'text',   placeholder: 'e.g. COM2' },
    { key: 'bitRate',               label: 'Bit Rate (Serial)',      type: 'number', placeholder: 'e.g. 19200' },
    // TCP fields
    { key: 'ip',                    label: 'IP Address (TCP)',       type: 'text',   placeholder: 'e.g. 169.254.16.136',
      pattern: REGEX.IP, patternError: 'Expected a valid IPv4 (e.g. 169.254.16.136) or IPv6 (e.g. 2001:db8::1) address' },
    { key: 'port',                  label: 'TCP Port',               type: 'number', placeholder: 'e.g. 8003' },
    { key: 'language',              label: 'Language',               type: 'select', options: ['SCPI', 'GEN'] },
    { key: 'continuousMonitoringActive', label: 'Continuous Monitoring', type: 'checkbox' },
    { key: 'keepStatus',            label: 'Keep Status between tests', type: 'checkbox' },
  ],
  MansonPowerSupply: [
    { key: 'portName',               label: 'Port Name',              type: 'text',   placeholder: 'e.g. COM3' },
    { key: 'bitRate',                label: 'Bit Rate',               type: 'number', placeholder: 'e.g. 9600' },
    { key: 'maxVoltage',             label: 'Max Voltage (V)',        type: 'number', placeholder: 'e.g. 20' },
    { key: 'maxCurrent',             label: 'Max Current (A)',        type: 'number', placeholder: 'e.g. 12' },
    { key: 'defaultVoltage',         label: 'Default Voltage (V)',    type: 'number', placeholder: 'e.g. 12' },
    { key: 'keepStatus',             label: 'Keep Status between tests', type: 'checkbox' },
    { key: 'continuousRead',         label: 'Continuous Read',        type: 'checkbox' },
    { key: 'continuousReadingInterval', label: 'Continuous Reading Interval (ms)', type: 'number', placeholder: 'e.g. 1000' },
  ],
  BTSRevo: [
    { key: 'addressPrefix', label: 'Address Prefix (first 3 IP octets)', type: 'text', placeholder: 'e.g. 10.104.3',
      pattern: REGEX.IP_PREFIX, patternError: 'Expected 3 octets: e.g. 10.104.3' },
    { key: 'boardId', label: 'Board ID (4th IP byte)', type: 'number', placeholder: 'e.g. 160' },
    { key: 'ethernetPort', label: 'Ethernet Port', type: 'number', placeholder: 'e.g. 5001' },
  ],
  TunTapBridge: [
    {
      key: 'physicalAdapterName',
      label: 'Physical Adapter (friendly name)',
      type: 'text',
      placeholder: 'e.g. Ethernet adapter',
    },
    // tunTapAdapters is managed by the dedicated TunTapAdaptersEditor in AddChannelForm
    // (not a simple FieldDef — it's an array of structured objects)
  ],
};
