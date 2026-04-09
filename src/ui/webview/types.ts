export type Page = 'configs' | 'logical' | 'hardware' | 'mappings' | 'framework' | 'generate' | 'diagram';

export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface TracerConfig {
  name: string;
  tracerType: 'PCAP' | 'ASCII';
  timestampMode?: string;
  filter?: string;
  file?: { path?: string; splitSize?: number; splitTime?: number; cyclic?: boolean };
  pcapInterface?: string;
  ethernetPaddingActive?: boolean;
  asciiOutputLineSeparator?: string;
  asciiMsgTextSeparator?: string;
}

export interface EthernetConfigData {
  considerOnlyEthernetTopologyEcus?: boolean;
  npduConfig?: any;
  someIPConfig?: any;
  appLayerPorts?: any;
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
  | { type: 'AUTH_ERROR'; error: string | null };

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'checkbox' | 'select';
  placeholder?: string;
  options?: string[];
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
    { key: 'applicationProtocol', label: 'Application Protocol', type: 'select', options: ['SOMEIP', 'DOIP', 'UDPNM', 'DLT', 'NPDU', 'RAW'] },
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
  { value: 'CANInterface', label: 'CAN Interface (CM)', category: 'CAN_INTERFACE' },
  { value: 'CIBInterface', label: 'CIB Interface (CM)', category: 'CAN_INTERFACE' },
  { value: 'CMInterface', label: 'CM Interface', category: 'CAN_INTERFACE' },
  { value: 'LINCard', label: 'LIN Card (CM)', category: 'CAN_INTERFACE' },
  { value: 'EthernetAdapter', label: 'Ethernet Adapter (PCAP)', category: 'ETHERNET_ADAPTER' },
  { value: 'SerialPort', label: 'Serial Port', category: 'SERIAL_PORT' },
  { value: 'RelayBoard', label: 'Relay Board', category: 'RELAY_BOARD' },
  { value: 'HIDRelay', label: 'HID Relay', category: 'HID_RELAY' },
  { value: 'AnalogDevice', label: 'Analog Device', category: 'ANALOG_DEVICE' },
  { value: 'TEAnalog', label: 'TE Analog', category: 'TE_ANALOG' },
  { value: 'HHLoad', label: 'HH Load', category: 'HH_LOAD' },
  { value: 'BTSRevo', label: 'BTS-REVO', category: 'BTS_REVO' },
];

export const HARDWARE_EXTRA_FIELDS: Record<string, FieldDef[]> = {
  CANInterface: [
    { key: 'cmId', label: 'CM ID', type: 'number', placeholder: 'e.g. 1' },
    { key: 'cmType', label: 'CM Type', type: 'select', options: ['CAN_Combo', 'LIN_Combo'] },
  ],
  CIBInterface: [
    { key: 'cmId', label: 'CM ID', type: 'number', placeholder: 'e.g. 1' },
    { key: 'cmType', label: 'CM Type', type: 'text', placeholder: 'e.g. CAN_Combo' },
    { key: 'bitRate', label: 'Bit Rate', type: 'number', placeholder: '' },
  ],
  CMInterface: [
    { key: 'cmId', label: 'CM ID', type: 'number', placeholder: 'e.g. 1' },
    { key: 'cmType', label: 'CM Type', type: 'text', placeholder: 'e.g. CAN_Combo' },
    { key: 'bitrate', label: 'Bitrate', type: 'number', placeholder: '' },
  ],
  LINCard: [
    { key: 'cmId', label: 'CM ID', type: 'number', placeholder: 'e.g. 1' },
    { key: 'cmType', label: 'CM Type', type: 'text', placeholder: 'e.g. LIN_Combo' },
  ],
  EthernetAdapter: [
    { key: 'macAddress', label: 'MAC Address', type: 'text', placeholder: 'e.g. 00:00:00:00:00:01' },
    { key: 'ipAddress', label: 'IP Address', type: 'text', placeholder: 'e.g. 192.168.1.1' },
    { key: 'friendlyName', label: 'Friendly Name', type: 'text', placeholder: '' },
    { key: 'interface', label: 'Interface Name', type: 'text', placeholder: '' },
    { key: 'bufferSize', label: 'Buffer Size', type: 'number', placeholder: '' },
    { key: 'bpFilter', label: 'BPF Filter', type: 'text', placeholder: 'e.g. tcp' },
    { key: 'timeout', label: 'Timeout (ms)', type: 'number', placeholder: 'e.g. 100' },
    { key: 'timeStampPrecision', label: 'Timestamp Precision', type: 'text', placeholder: '' },
    { key: 'timeStampSource', label: 'Timestamp Source', type: 'text', placeholder: '' },
    { key: 'immediateMode', label: 'Immediate Mode', type: 'checkbox' },
    { key: 'snapshotLength', label: 'Snapshot Length', type: 'number', placeholder: 'e.g. 65535' },
    { key: 'pcapDeviceMode', label: 'PCAP Device Mode', type: 'text', placeholder: 'e.g. Promiscuous' },
    { key: 'useDataLoggerTimeStamp', label: 'Use DataLogger Timestamp', type: 'checkbox' },
    { key: 'removeDataLoggerMetaData', label: 'Remove DataLogger Metadata', type: 'checkbox' },
    { key: 'dataLoggerType', label: 'DataLogger Type', type: 'text', placeholder: 'e.g. MDF' },
    { key: 'packetProcessingActive', label: 'Packet Processing Active', type: 'checkbox' },
    { key: 'packetIdentificationActive', label: 'Packet Identification Active', type: 'checkbox' },
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
    { key: 'maxLoad', label: 'Max Load', type: 'number', placeholder: '' },
    { key: 'deviceId', label: 'Device ID', type: 'number', placeholder: '' },
    { key: 'portName', label: 'Port Name', type: 'text', placeholder: '' },
    { key: 'bitRate', label: 'Bit Rate', type: 'number', placeholder: '' },
    { key: 'loadType', label: 'Load Type', type: 'text', placeholder: '' },
  ],
  BTSRevo: [
    { key: 'addressPrefix', label: 'Address Prefix (first 3 IP octets)', type: 'text', placeholder: 'e.g. 10.104.3' },
    { key: 'boardId', label: 'Board ID (4th IP byte)', type: 'number', placeholder: 'e.g. 160' },
    { key: 'ethernetPort', label: 'Ethernet Port', type: 'number', placeholder: 'e.g. 5001' },
  ],
};
