import React, { useReducer, useCallback } from 'react';
import { Page } from './types';
import { postMessage } from './vscodeApi';
import { reducer } from './store/reducer';
import { initialState } from './store/initialState';
import { AppContext } from './hooks/useApp';
import { useMessageHandler } from './hooks/useMessageHandler';
import { Nav } from './components/Nav';
import { Toast } from './components/Toast';
import YamlPreview from './components/YamlPreview';
import { useYamlPreview } from './hooks/useYamlPreview';
import { GlobalStyles } from './GlobalStyles';
import LoginPanel from './panels/LoginPanel';
import ConfigsPanel from './panels/ConfigsPanel';
import LogicalPanel from './panels/LogicalPanel';
import HardwarePanel from './panels/HardwarePanel';
import MappingsPanel from './panels/MappingsPanel';
import FrameworkPanel from './panels/FrameworkPanel';
import TracerPanel from './panels/TracerPanel';
import GeneratePanel from './panels/GeneratePanel';
import DiagramPanel from './panels/DiagramPanel';

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const send = useCallback((command: string, data?: Record<string, any>) => {
    postMessage(command, data);
  }, []);

  const notify = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    dispatch({ type: 'SET_NOTIFICATION', notification: { type, message } });
    setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 4500);
  }, []);

  useMessageHandler({ state, dispatch, send, notify });

  const liveYaml = useYamlPreview(state);
  const showPreview = !!state.currentConfigId && state.page !== 'diagram';

  const panels: Record<Page, React.ReactNode> = {
    configs: <ConfigsPanel />,
    logical: <LogicalPanel />,
    hardware: <HardwarePanel />,
    mappings: <MappingsPanel />,
    framework: <FrameworkPanel />,
    tracers: <TracerPanel />,
    generate: <GeneratePanel />,
    diagram: <DiagramPanel />,
  };

  return (
    <AppContext.Provider value={{ state, dispatch, send, notify }}>
      <GlobalStyles />
      <Toast notification={state.notification} />

      {/* ── Auth gate ───────────────────────────────────────────────── */}
      {(!state.authToken || state.authLoading) ? (
        <LoginPanel
          loading={state.authLoading}
          authError={state.authError}
        />
      ) : (
        /* ── Main application UI ──────────────────────────────────── */
        <div style={S.root}>
          <Nav />

          <div style={S.main}>
            {/* Top header bar */}
            <div style={S.header}>
              <div style={S.headerLeft}>
                <span style={S.headerTitle}>
                  {state.currentConfigName || 'Channel Config Manager'}
                </span>
                {state.currentConfigId && (
                  <span style={S.activeBadge}>
                    <span style={S.activeDot} />
                    Active
                  </span>
                )}
              </div>

              {/* User info + logout */}
              <div style={S.headerRight}>
                <span style={S.userChip}>
                  <span style={S.userAvatar}>
                    {state.authUser?.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                  <span style={S.userName}>{state.authUser?.name}</span>
                </span>
                <button
                  style={S.logoutBtn}
                  onClick={() => { send('logout'); dispatch({ type: 'AUTH_LOGOUT' }); }}
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            </div>

            {/* Panel content — split when preview is visible */}
            <div style={S.workArea}>
              <div style={S.panelArea}>
              {!state.currentConfigId && state.page !== 'configs' ? (
                <div style={S.noConfig}>
                  <div style={S.noConfigIcon}>⚙</div>
                  <div style={S.noConfigTitle}>No configuration loaded</div>
                  <div style={S.noConfigSub}>
                    Go to <strong>Configurations</strong> and load or create one to get started.
                  </div>
                  <button style={S.btnPrimary} onClick={() => dispatch({ type: 'SET_PAGE', page: 'configs' })}>
                    Open Configurations
                  </button>
                </div>
              ) : (
                <div key={state.page} className="ccm-panel">
                  {panels[state.page]}
                </div>
              )}
              </div>

              {/* Live YAML preview pane */}
              {showPreview && (
                <div style={S.previewPane}>
                  <YamlPreview yaml={liveYaml} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 22px',
    height: '48px',
    borderBottom: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.2))',
    background: 'var(--vscode-editor-background)',
    flexShrink: 0,
    gap: '12px',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },
  userChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    fontSize: '12px',
    color: 'var(--vscode-descriptionForeground, rgba(204,204,204,0.7))',
  },
  userAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'var(--vscode-button-background)',
    color: 'var(--vscode-button-foreground)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '11px',
    flexShrink: 0,
  },
  userName: { fontWeight: 600, fontSize: '12px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: {
    padding: '4px 12px',
    borderRadius: '999px',
    border: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.25))',
    background: 'transparent',
    color: 'var(--vscode-descriptionForeground, rgba(204,204,204,0.7))',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    letterSpacing: '-0.01em',
  },
  activeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    color: '#4ade80',
    background: 'rgba(74,222,128,0.1)',
    border: '1px solid rgba(74,222,128,0.3)',
    padding: '2px 9px',
    borderRadius: '999px',
    whiteSpace: 'nowrap',
    fontWeight: 600,
  },
  activeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#4ade80',
    flexShrink: 0,
  },
  contentSolo: { flex: 1, overflow: 'auto', padding: '24px' },
  splitRow: { flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', minHeight: 0 },
  previewPane: { width: '380px', flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  workArea: { flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', minHeight: 0 },
  panelArea: { flex: 1, overflow: 'auto', padding: '24px', minWidth: 0 },
  noConfig: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '14px',
    textAlign: 'center',
  },
  noConfigIcon: {
    fontSize: '48px',
    opacity: 0.18,
    lineHeight: 1,
    marginBottom: '4px',
    filter: 'grayscale(1)',
  },
  noConfigTitle: {
    fontSize: '18px',
    fontWeight: 700,
    opacity: 0.65,
    letterSpacing: '-0.02em',
  },
  noConfigSub: {
    fontSize: '13px',
    opacity: 0.45,
    maxWidth: '300px',
    lineHeight: 1.7,
  },
  btnPrimary: {
    padding: '9px 22px',
    background: 'var(--vscode-button-background)',
    color: 'var(--vscode-button-foreground)',
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '12.5px',
    fontWeight: 600,
    marginTop: '6px',
    letterSpacing: '0.01em',
  },
};
