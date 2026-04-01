import React from 'react';
import { useApp } from '../App';
import { Page } from '../types';

interface NavItem {
  id: Page;
  label: string;
  icon: string;
  countKey?: 'logicalChannels' | 'hardwareChannels' | 'mappings';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'configs',   label: 'Configurations',    icon: '📁' },
  { id: 'logical',   label: 'Logical Channels',  icon: '📡', countKey: 'logicalChannels' },
  { id: 'hardware',  label: 'Hardware Channels', icon: '🔌', countKey: 'hardwareChannels' },
  { id: 'mappings',  label: 'Mappings',          icon: '🔗', countKey: 'mappings' },
  { id: 'framework', label: 'Framework',         icon: '⚡' },
  { id: 'generate',  label: 'Generate',          icon: '🚀' },
  { id: 'diagram',   label: 'Diagram',           icon: '📊' },
];

export function Nav() {
  const { state, dispatch } = useApp();

  return (
    <aside style={S.aside}>
      {/* Logo */}
      <div style={S.logo}>
        <div style={S.logoIcon}>⚙</div>
        <span style={S.logoText}>CCM</span>
      </div>

      {/* Nav Items */}
      <nav style={S.navList}>
        {NAV_ITEMS.map(item => {
          const isActive = state.page === item.id;
          const count = item.countKey ? (state as any)[item.countKey]?.length : 0;
          return (
            <button
              key={item.id}
              style={{ ...S.item, ...(isActive ? S.itemActive : {}) }}
              onClick={() => dispatch({ type: 'SET_PAGE', page: item.id })}
              title={item.label}
            >
              {isActive && <div style={S.activeBar} />}
              <span style={S.itemIcon}>{item.icon}</span>
              <span style={S.itemLabel}>{item.label}</span>
              {count > 0 && (
                <span style={{ ...S.badge, ...(isActive ? S.badgeActive : {}) }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer: current config indicator */}
      <div style={S.footer}>
        {state.currentConfigName ? (
          <div style={S.configInfo}>
            <div style={S.configInfoLabel}>Current config</div>
            <div style={S.configInfoName} title={state.currentConfigName}>
              {state.currentConfigName}
            </div>
          </div>
        ) : (
          <div style={S.noConfigHint}>No config loaded</div>
        )}
      </div>
    </aside>
  );
}

const S: Record<string, React.CSSProperties> = {
  aside: {
    width: '210px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--vscode-sideBar-background, var(--vscode-editor-background))',
    borderRight: '1px solid var(--vscode-panel-border, #3a3a3a)',
    overflow: 'hidden',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 16px',
    height: '44px',
    borderBottom: '1px solid var(--vscode-panel-border, #3a3a3a)',
    flexShrink: 0,
  },
  logoIcon: {
    width: '26px', height: '26px',
    background: 'var(--vscode-button-background)',
    color: 'var(--vscode-button-foreground)',
    borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: 700, flexShrink: 0,
  },
  logoText: { fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' },
  navList: {
    flex: 1,
    padding: '8px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    overflowY: 'auto',
  },
  item: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 16px 9px 20px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--vscode-editor-foreground)',
    fontSize: '12.5px',
    textAlign: 'left',
    width: '100%',
    borderRadius: '0',
    opacity: 0.75,
    transition: 'opacity 0.1s, background 0.1s',
  },
  itemActive: {
    background: 'var(--vscode-list-activeSelectionBackground, rgba(255,255,255,0.08))',
    color: 'var(--vscode-list-activeSelectionForeground, var(--vscode-editor-foreground))',
    fontWeight: 600,
    opacity: 1,
  },
  activeBar: {
    position: 'absolute',
    left: 0, top: '4px', bottom: '4px',
    width: '3px',
    background: 'var(--vscode-button-background)',
    borderRadius: '0 2px 2px 0',
  },
  itemIcon: { fontSize: '15px', flexShrink: 0, width: '20px', textAlign: 'center' },
  itemLabel: { flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  badge: {
    fontSize: '10px',
    padding: '1px 6px',
    borderRadius: '10px',
    background: 'var(--vscode-badge-background, #4d4d4d)',
    color: 'var(--vscode-badge-foreground, #fff)',
    fontWeight: 600,
    flexShrink: 0,
  },
  badgeActive: {
    background: 'var(--vscode-button-background)',
    color: 'var(--vscode-button-foreground)',
  },
  footer: {
    padding: '12px',
    borderTop: '1px solid var(--vscode-panel-border, #3a3a3a)',
    flexShrink: 0,
  },
  configInfo: {
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '5px',
    borderLeft: '3px solid var(--vscode-button-background)',
  },
  configInfoLabel: { fontSize: '10px', opacity: 0.5, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  configInfoName: { fontSize: '11px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  noConfigHint: { fontSize: '11px', opacity: 0.4, textAlign: 'center' },
};
