export declare const REGEX: {
    readonly IPV4: RegExp;
    readonly IPV6: RegExp;
    readonly IP: RegExp;
    readonly MAC: RegExp;
    readonly IP_PREFIX: RegExp;
};
export type Page = 'configs' | 'logical' | 'hardware' | 'mappings' | 'framework' | 'tracers' | 'generate' | 'dashboard' | 'diagrams' | 'agent';
export type FrameworkSection = 'tracers' | 'connectedEcus' | 'servicePack' | 'publisher' | 'ethernet' | 'npduConfig' | 'someIPConfig' | 'appLayerPorts' | 'ethernetTopology' | 'channelToEcusMapping';
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
    authToken: string | null;
    authUser: {
        id: number;
        name: string;
        email: string;
    } | null;
    authLoading: boolean;
    authError: string | null;
    agentMessages: AgentMessage[];
    agentLoading: boolean;
    agentStreamingText: string;
    frameworkSection: FrameworkSection | null;
}
export interface AgentSource {
    section: string;
    subsection: string;
    title: string;
    source_url: string;
    score?: number;
    vectorScore?: number;
    fromGraph?: boolean;
    sourceType?: 'documentation' | 'workspace';
    summary?: string;
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
    sources?: AgentSource[];
    meta?: AgentResponseMeta;
    streaming?: boolean;
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
} | {
    type: 'AGENT_USER_MSG';
    content: string;
} | {
    type: 'AGENT_CHUNK';
    token: string;
} | {
    type: 'AGENT_DONE';
    sources: AgentMessage['sources'];
    meta?: AgentMessage['meta'];
} | {
    type: 'AGENT_ERROR';
    error: string;
} | {
    type: 'AGENT_CLEAR';
} | {
    type: 'SET_FRAMEWORK_SECTION';
    section: FrameworkSection | null;
};
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
    pattern?: RegExp;
    patternError?: string;
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
