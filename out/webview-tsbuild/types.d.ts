export type Page = 'configs' | 'logical' | 'hardware' | 'mappings' | 'framework' | 'tracers' | 'generate' | 'diagram';
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
    name: string;
    Type: 'PCAP' | 'ASCII';
    Timestamp?: 'Microsecond' | 'Nanosecond';
    LoggerConfiguration?: TracerLoggerConfiguration;
    LoggingType?: 'MultipleAdapterMode' | 'PerformanceMode' | 'StandardMode';
    Base?: 'Hex' | 'Decimal';
    InternalEventLogged?: boolean;
    TimeStampSetting?: 'Absolute' | 'Relative';
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
    authToken: string | null;
    authUser: {
        id: number;
        name: string;
        email: string;
    } | null;
    authLoading: boolean;
    authError: string | null;
}
export type AppAction = {
    type: 'SET_PAGE';
    page: Page;
} | {
    type: 'SET_CONFIGS';
    configs: any[];
} | {
    type: 'CONFIG_CREATED';
    config: any;
} | {
    type: 'CONFIG_LOADED';
    data: any;
} | {
    type: 'CONFIG_DELETED';
    configId: string;
} | {
    type: 'LOGICAL_ADDED';
    channel: any;
} | {
    type: 'LOGICAL_DELETED';
    id: string;
} | {
    type: 'HARDWARE_ADDED';
    channel: any;
} | {
    type: 'HARDWARE_DELETED';
    id: string;
} | {
    type: 'MAPPING_ADDED';
    mapping: any;
} | {
    type: 'MAPPING_DELETED';
    id: string;
} | {
    type: 'SET_NOTIFICATION';
    notification: Notification | null;
} | {
    type: 'SET_YAML';
    yaml: string;
} | {
    type: 'SET_AI_RESULT';
    result: AiResult;
} | {
    type: 'UPDATE_FRAMEWORK';
    data: Partial<FrameworkData>;
} | {
    type: 'SET_GENERATING';
    generating: boolean;
} | {
    type: 'SET_AI_VALIDATING';
    validating: boolean;
} | {
    type: 'SET_DRAFT_LOGICAL';
    draft: any | null;
} | {
    type: 'AUTH_SUCCESS';
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
} | {
    type: 'AUTH_LOGOUT';
} | {
    type: 'AUTH_LOADING';
    loading: boolean;
} | {
    type: 'AUTH_ERROR';
    error: string | null;
};
export interface FieldDef {
    key: string;
    label: string;
    type: 'text' | 'number' | 'checkbox' | 'select';
    placeholder?: string;
    options?: string[];
}
export declare const CHANNEL_COLORS: Record<string, string>;
export declare const LOGICAL_SUBCLASS_OPTIONS: {
    value: string;
    label: string;
    category: string;
}[];
export declare const LOGICAL_EXTRA_FIELDS: Record<string, FieldDef[]>;
export declare const HARDWARE_SUBCLASS_OPTIONS: {
    value: string;
    label: string;
    category: string;
}[];
export declare const HARDWARE_EXTRA_FIELDS: Record<string, FieldDef[]>;
