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
  notification: null,
  yamlContent: '',
  aiResult: null,
  generating: false,
  aiValidating: false,
};
