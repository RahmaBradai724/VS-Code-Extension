import React, { useReducer, useEffect, useCallback, createContext, useContext } from 'react';
import { AppState, AppAction, Page, FrameworkData } from './types';
import { postMessage } from './vscodeApi';
import { Nav } from './components/Nav';
import ConfigsPanel from './panels/ConfigsPanel';
import LogicalPanel from './panels/LogicalPanel';
import HardwarePanel from './panels/HardwarePanel';
import MappingsPanel from './panels/MappingsPanel';
import FrameworkPanel from './panels/FrameworkPanel';
import GeneratePanel from './panels/GeneratePanel';
import DiagramPanel from './panels/DiagramPanel';

const initialFrameworkData: FrameworkData = {
  tracers: [],
  publisherType: 'SingleThreaded',
  channelsGroups: [],
  connectedEcus: [],
  servicePack: '',
  ethernetConfig: {},
};

const initialState: AppState = {
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

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PAGE': return { ...state, page: action.page };
    case 'SET_CONFIGS': return { ...state, configs: action.configs };
    case 'CONFIG_CREATED': return { ...state, configs: [...state.configs, action.config] };
    case 'CONFIG_DELETED':
      return { ...state, configs: state.configs.filter((c: any) => (c.id || c.configId) !== action.configId) };
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
    case 'LOGICAL_ADDED': return { ...state, logicalChannels: [...state.logicalChannels, action.channel] };
    case 'LOGICAL_DELETED':
      return { ...state, logicalChannels: state.logicalChannels.filter((c: any) => c.id !== action.id) };
    case 'HARDWARE_ADDED': return { ...state, hardwareChannels: [...state.hardwareChannels, action.channel] };
    case 'HARDWARE_DELETED':
      return { ...state, hardwareChannels: state.hardwareChannels.filter((c: any) => c.id !== action.id) };
    case 'MAPPING_ADDED': return { ...state, mappings: [...state.mappings, action.mapping] };
    case 'MAPPING_DELETED':
      return { ...state, mappings: state.mappings.filter((m: any) => m.mappingId !== action.id) };
    case 'SET_NOTIFICATION': return { ...state, notification: action.notification };
    case 'SET_YAML': return { ...state, yamlContent: action.yaml, generating: false };
    case 'SET_AI_RESULT': return { ...state, aiResult: action.result, aiValidating: false };
    case 'UPDATE_FRAMEWORK':
      return { ...state, frameworkData: { ...state.frameworkData, ...action.data } };
    case 'SET_GENERATING': return { ...state, generating: action.generating };
    case 'SET_AI_VALIDATING': return { ...state, aiValidating: action.validating };
    default: return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  send: (command: string, data?: Record<string, any>) => void;
  notify: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const AppContext = createContext<AppContextValue>({} as AppContextValue);
export const useApp = () => useContext(AppContext);

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const send = useCallback((command: string, data?: Record<string, any>) => {
    postMessage(command, data);
  }, []);

  const notify = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    dispatch({ type: 'SET_NOTIFICATION', notification: { type, message } });
    setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 4500);
  }, []);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      switch (msg.command) {
        case 'configurationsLoaded':
          dispatch({ type: 'SET_CONFIGS', configs: msg.data || [] });
          break;
        case 'configurationCreated':
          dispatch({ type: 'CONFIG_CREATED', config: msg.data });
          notify('success', 'Configuration created!');
          break;
        case 'configurationDeleted':
          dispatch({ type: 'CONFIG_DELETED', configId: msg.configId });
          break;
        case 'configurationLoaded':
          if (msg.data) {
            dispatch({ type: 'CONFIG_LOADED', data: msg.data });
            notify('success', `Configuration "${msg.data.name}" loaded.`);
          }
          break;
        case 'success':
          if (msg.action === 'addLogicalChannel') {
            dispatch({ type: 'LOGICAL_ADDED', channel: msg.data });
            notify('success', 'Logical channel added.');
          } else if (msg.action === 'deleteLogicalChannel') {
            dispatch({ type: 'LOGICAL_DELETED', id: msg.id });
          } else if (msg.action === 'addHardwareChannel') {
            dispatch({ type: 'HARDWARE_ADDED', channel: msg.data });
            notify('success', 'Hardware channel added.');
          } else if (msg.action === 'deleteHardwareChannel') {
            dispatch({ type: 'HARDWARE_DELETED', id: msg.id });
          } else if (msg.action === 'addMapping') {
            dispatch({ type: 'MAPPING_ADDED', mapping: msg.data });
            notify('success', 'Mapping created.');
          } else if (msg.action === 'removeMapping') {
            dispatch({ type: 'MAPPING_DELETED', id: msg.id });
          }
          break;
        case 'error':
          notify('error', msg.message);
          dispatch({ type: 'SET_GENERATING', generating: false });
          dispatch({ type: 'SET_AI_VALIDATING', validating: false });
          break;
        case 'configGenerated':
          dispatch({ type: 'SET_YAML', yaml: msg.yaml });
          notify('success', 'config.yaml generated!');
          dispatch({ type: 'SET_PAGE', page: 'generate' });
          break;
        case 'aiValidationResult':
          dispatch({ type: 'SET_AI_RESULT', result: msg.data });
          break;
        case 'importedConfig':
          notify('info', 'YAML file imported.');
          break;
      }
    };
    window.addEventListener('message', handler);
    send('getConfigurations');
    return () => window.removeEventListener('message', handler);
  }, []);

  const panels: Record<Page, React.ReactNode> = {
    configs: <ConfigsPanel />,
    logical: <LogicalPanel />,
    hardware: <HardwarePanel />,
    mappings: <MappingsPanel />,
    framework: <FrameworkPanel />,
    generate: <GeneratePanel />,
    diagram: <DiagramPanel />,
  };

  const toastColors: Record<string, React.CSSProperties> = {
    success: { background: '#14532d', border: '1px solid #22c55e', color: '#bbf7d0' },
    error: { background: '#450a0a', border: '1px solid #f87171', color: '#fecaca' },
    warning: { background: '#431407', border: '1px solid #f59e0b', color: '#fde68a' },
    info: { background: '#0c1a2e', border: '1px solid #60a5fa', color: '#bfdbfe' },
  };

  return (
    <AppContext.Provider value={{ state, dispatch, send, notify }}>
      <div style={S.root}>
        {/* Toast notification */}
        {state.notification && (
          <div style={{ ...S.toast, ...toastColors[state.notification.type] }}>
            <span style={S.toastIcon}>
              {state.notification.type === 'success' ? '✓' :
               state.notification.type === 'error' ? '✕' :
               state.notification.type === 'warning' ? '⚠' : 'ℹ'}
            </span>
            {state.notification.message}
          </div>
        )}

        <Nav />

        <div style={S.main}>
          {/* Top header bar */}
          <div style={S.header}>
            <div style={S.headerLeft}>
              <span style={S.headerTitle}>
                {state.currentConfigName || 'Channel Config Manager'}
              </span>
              {state.currentConfigId && (
                <span style={S.activeBadge}>● Active</span>
              )}
            </div>
            <button style={S.fullPanelBtn} onClick={() => send('openFullPanel')} title="Open as full panel">
              ⤢ Full Panel
            </button>
          </div>

          {/* Panel content */}
          <div style={S.content}>
            {!state.currentConfigId && state.page !== 'configs' ? (
              <div style={S.noConfig}>
                <div style={S.noConfigIcon}>📁</div>
                <div style={S.noConfigTitle}>No configuration loaded</div>
                <div style={S.noConfigSub}>Go to <strong>Configurations</strong> and load or create one first.</div>
                <button style={S.btnPrimary} onClick={() => dispatch({ type: 'SET_PAGE', page: 'configs' })}>
                  Go to Configurations
                </button>
              </div>
            ) : (
              panels[state.page]
            )}
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: 'var(--vscode-editor-background)',
    color: 'var(--vscode-editor-foreground)',
    fontFamily: 'var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
    fontSize: '13px',
  },
  toast: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '10px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    zIndex: 9999,
    maxWidth: '380px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    animation: 'none',
  },
  toastIcon: { fontSize: '14px', fontWeight: 700 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    height: '44px',
    borderBottom: '1px solid var(--vscode-panel-border, #3a3a3a)',
    background: 'var(--vscode-editor-background)',
    flexShrink: 0,
    gap: '12px',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 },
  headerTitle: { fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  activeBadge: { fontSize: '11px', color: '#4ade80', whiteSpace: 'nowrap' },
  fullPanelBtn: {
    padding: '4px 10px',
    background: 'transparent',
    color: 'var(--vscode-editor-foreground)',
    border: '1px solid var(--vscode-panel-border, #3a3a3a)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    whiteSpace: 'nowrap',
    opacity: 0.7,
  },
  content: { flex: 1, overflow: 'auto', padding: '24px' },
  noConfig: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: '12px', textAlign: 'center',
  },
  noConfigIcon: { fontSize: '48px', opacity: 0.4 },
  noConfigTitle: { fontSize: '18px', fontWeight: 600, opacity: 0.7 },
  noConfigSub: { fontSize: '13px', opacity: 0.5, maxWidth: '300px', lineHeight: 1.6 },
  btnPrimary: {
    padding: '8px 18px', background: 'var(--vscode-button-background)', color: 'var(--vscode-button-foreground)',
    border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, marginTop: '8px',
  },
};
