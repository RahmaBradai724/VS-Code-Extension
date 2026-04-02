import { AppState, AppAction } from '../types';
import { initialFrameworkData } from './initialState';

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.page };

    case 'SET_CONFIGS':
      return { ...state, configs: action.configs };

    case 'CONFIG_CREATED':
      return { ...state, configs: [...state.configs, action.config] };

    case 'CONFIG_DELETED':
      return {
        ...state,
        configs: state.configs.filter(
          (c: any) => (c.id || c.configId) !== action.configId,
        ),
      };

    case 'CONFIG_LOADED':
      return {
        ...state,
        currentConfigId: action.data.id || action.data.configId,
        currentConfigName: action.data.name || '',
        logicalChannels: action.data.logicalChannels || [],
        hardwareChannels: action.data.hardwareChannels || [],
        mappings: action.data.mappings || [],
        frameworkData: {
          ...initialFrameworkData,
          ...(action.data.frameworkConfig || {}),
          tracers: action.data.frameworkConfig?.tracers || [],
        },
      };

    case 'LOGICAL_ADDED':
      return { ...state, logicalChannels: [...state.logicalChannels, action.channel] };

    case 'LOGICAL_DELETED':
      return {
        ...state,
        logicalChannels: state.logicalChannels.filter((c: any) => c.id !== action.id),
      };

    case 'HARDWARE_ADDED':
      return { ...state, hardwareChannels: [...state.hardwareChannels, action.channel] };

    case 'HARDWARE_DELETED':
      return {
        ...state,
        hardwareChannels: state.hardwareChannels.filter((c: any) => c.id !== action.id),
      };

    case 'MAPPING_ADDED':
      return { ...state, mappings: [...state.mappings, action.mapping] };

    case 'MAPPING_DELETED':
      return {
        ...state,
        mappings: state.mappings.filter((m: any) => m.mappingId !== action.id),
      };

    case 'SET_NOTIFICATION':
      return { ...state, notification: action.notification };

    case 'SET_YAML':
      return { ...state, yamlContent: action.yaml, generating: false };

    case 'SET_AI_RESULT':
      return { ...state, aiResult: action.result, aiValidating: false };

    case 'UPDATE_FRAMEWORK':
      return { ...state, frameworkData: { ...state.frameworkData, ...action.data } };

    case 'SET_GENERATING':
      return { ...state, generating: action.generating };

    case 'SET_AI_VALIDATING':
      return { ...state, aiValidating: action.validating };

    default:
      return state;
  }
}
