import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Toast } from './components/Toast';
import YamlPreview from './components/YamlPreview';
import { Icons } from './components/icons';
import { GlobalStyles } from './GlobalStyles';
import { AppContext } from './hooks/useApp';
import { useMessageHandler } from './hooks/useMessageHandler';
import { useYamlPreview } from './hooks/useYamlPreview';
import { Nav } from './components/Nav';
import DashboardPanel from './panels/DashboardPanel';
import AgentPanel from './panels/AgentPanel';
import ConfigsPanel from './panels/ConfigsPanel';
import DiagramPanel from './panels/DiagramPanel';
import FrameworkPanel from './panels/FrameworkPanel';
import GeneratePanel from './panels/GeneratePanel';
import HardwarePanel from './panels/HardwarePanel';
import LogicalPanel from './panels/LogicalPanel';
import LoginPanel from './panels/LoginPanel';
import MappingsPanel from './panels/MappingsPanel';
import TracerPanel from './panels/TracerPanel';
import { initialState } from './store/initialState';
import { reducer } from './store/reducer';
import { Page } from './types';
import { postMessage } from './vscodeApi';

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const panelAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollToggle, setShowScrollToggle] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  const send = useCallback((command: string, data?: Record<string, any>) => {
    postMessage(command, data);
  }, []);

  const notify = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    dispatch({ type: 'SET_NOTIFICATION', notification: { type, message } });
    setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 4500);
  }, []);

  useMessageHandler({ state, dispatch, send, notify });

  const liveYaml = useYamlPreview(state);
  const showPreview =
    !!state.currentConfigId &&
    state.page !== 'dashboard' &&
    state.page !== 'diagrams' &&
    state.page !== 'agent';
  const scrollToggleTitle = scrollDirection === 'down' ? 'Scroll down' : 'Scroll up';

  const panels: Record<Page, React.ReactNode> = {
    configs: <ConfigsPanel />,
    logical: <LogicalPanel />,
    hardware: <HardwarePanel />,
    mappings: <MappingsPanel />,
    framework: <FrameworkPanel />,
    tracers: <TracerPanel />,
    generate: <GeneratePanel />,
    dashboard: <DashboardPanel />,
    diagrams: <DiagramPanel />,
    agent: <AgentPanel />,
  };

  useEffect(() => {
    const scroller = panelAreaRef.current;
    if (!scroller) {
      setShowScrollToggle(false);
      return;
    }

    let frame = 0;

    const syncScrollToggle = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maxScrollTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        const canScroll = maxScrollTop > 24;
        const isNearBottom = maxScrollTop - scroller.scrollTop <= 24;

        setShowScrollToggle(canScroll);
        setScrollDirection(isNearBottom ? 'up' : 'down');
      });
    };

    syncScrollToggle();
    scroller.addEventListener('scroll', syncScrollToggle, { passive: true });

    const resizeObserver = new ResizeObserver(syncScrollToggle);
    resizeObserver.observe(scroller);

    const content = scroller.firstElementChild;
    if (content) {
      resizeObserver.observe(content);
    }

    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', syncScrollToggle);
      resizeObserver.disconnect();
    };
  }, [state.page, state.currentConfigId, showPreview]);

  const handleScrollToggle = useCallback(() => {
    const scroller = panelAreaRef.current;
    if (!scroller) return;

    const maxScrollTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    if (scrollDirection === 'down') {
      scroller.scrollTo({
        top: maxScrollTop,
        behavior: 'smooth',
      });
      return;
    }

    scroller.scrollTo({ top: 0, behavior: 'smooth' });
  }, [scrollDirection]);

  return (
    <AppContext.Provider value={{ state, dispatch, send, notify }}>
      <GlobalStyles />
      <Toast notification={state.notification} />

      {(!state.authToken || state.authLoading) ? (
        <LoginPanel loading={state.authLoading} authError={state.authError} />
      ) : (
        <div className="ccm-root" style={S.root}>
          <Nav />

          <div className="ccm-main" style={S.main}>
            <div className="ccm-header" style={S.header}>
              <div className="ccm-header-left" style={S.headerLeft}>
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

              <div className="ccm-header-right" style={S.headerRight}>
                <span style={S.userChip}>
                  <span style={S.userAvatar}>
                    {state.authUser?.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                  <span className="ccm-user-name" style={S.userName}>
                    {state.authUser?.name}
                  </span>
                </span>
                <button
                  className="ccm-logout-btn"
                  style={S.logoutBtn}
                  onClick={() => {
                    send('logout');
                    dispatch({ type: 'AUTH_LOGOUT' });
                  }}
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            </div>

            <div className="ccm-work-area" style={S.workArea}>
              <div className="ccm-panel-shell" style={S.panelShell}>
                <div ref={panelAreaRef} className="ccm-panel-area" style={S.panelArea}>
                  {!state.currentConfigId && state.page !== 'configs' ? (
                    <div style={S.noConfig}>
                      <div style={S.noConfigIcon}>⚙</div>
                      <div style={S.noConfigTitle}>No configuration loaded</div>
                      <div style={S.noConfigSub}>
                        Go to <strong>Configurations</strong> and load or create one to get started.
                      </div>
                      <button
                        style={S.btnPrimary}
                        onClick={() => dispatch({ type: 'SET_PAGE', page: 'configs' })}
                      >
                        Open Configurations
                      </button>
                    </div>
                  ) : (
                    <div key={state.page} className="ccm-panel">
                      {panels[state.page]}
                    </div>
                  )}
                </div>

                {showScrollToggle && (
                  <div style={S.scrollToggleWrap}>
                    <button
                      type="button"
                      className="ccm-scroll-toggle"
                      style={S.scrollToggle}
                      title={scrollToggleTitle}
                      aria-label={scrollToggleTitle}
                      onClick={handleScrollToggle}
                    >
                      {Icons.scrollToggle(scrollDirection, 28)}
                    </button>
                  </div>
                )}
              </div>

              {showPreview && (
                <div className="ccm-preview-pane" style={S.previewPane}>
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
  userName: {
    fontWeight: 600,
    fontSize: '12px',
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
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
  previewPane: { width: '300px', flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  workArea: { flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', minHeight: 0 },
  panelShell: { flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' },
  panelArea: {
    height: '100%',
    overflow: 'auto',
    padding: 'var(--ccm-panel-pad, 24px)',
    paddingBottom: 'calc(var(--ccm-panel-pad, 24px) + 88px)',
    minWidth: 0,
  },
  scrollToggleWrap: {
    position: 'absolute',
    right: '20px',
    bottom: '20px',
    display: 'flex',
    pointerEvents: 'none',
    zIndex: 2,
  },
  scrollToggle: {
    width: '58px',
    height: '58px',
    borderRadius: '999px',
    border: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.28))',
    background: 'var(--vscode-editorWidget-background, var(--vscode-editor-background))',
    color: 'var(--vscode-editor-foreground)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 28px rgba(0,0,0,0.28)',
    pointerEvents: 'auto',
    opacity: 0.98,
  },
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
