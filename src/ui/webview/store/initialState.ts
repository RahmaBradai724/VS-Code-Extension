import { AppState, FrameworkData } from '../types';

export const initialFrameworkData: FrameworkData = {
  tracers: [],
  publisherType: 'SingleThreaded',
  channelsGroups: [],
  connectedEcus: [],
  servicePack: '',
  ethernetConfig: {},
};

export const initialState: AppState = {
  page: 'configs',
  configs: [],
  currentConfigId: null,
  currentConfigName: '',
  logicalChannels: [],
  hardwareChannels: [],
  mappings: [],
  frameworkData: initialFrameworkData,
  draftLogical: null,
  notification: null,
  yamlContent: '',
  aiResult: null,
  generating: false,
  aiValidating: false,
  authToken: null,
  authUser: null,
  authLoading: true,   // true while checkAuth is in-flight
  authError: null,
  // MTF Agent
  agentMessages: [],
  agentLoading: false,
  agentStreamingText: '',
  // Framework
  frameworkSection: null,
  // Hardware discovery
  discoveredHardware: null,
  hardwareDiscovering: false,
};
