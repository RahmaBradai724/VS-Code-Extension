import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { Icons } from './icons';
import { tokens } from '../theme';
import { Page } from '../types';

interface NavItem {
  id: Page;
  label: string;
  Icon: () => React.ReactElement;
  countKey?: 'logicalChannels' | 'hardwareChannels' | 'mappings';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'configs',   label: 'Configurations',    Icon: Icons.configs },
  { id: 'logical',   label: 'Logical Channels',  Icon: Icons.logical,   countKey: 'logicalChannels' },
  { id: 'hardware',  label: 'Hardware Channels', Icon: Icons.hardware,  countKey: 'hardwareChannels' },
  { id: 'mappings',  label: 'Mappings',          Icon: Icons.mappings,  countKey: 'mappings' },
  { id: 'framework', label: 'Framework',         Icon: Icons.framework },
  { id: 'tracers',   label: 'Tracers',           Icon: Icons.tracers },
  { id: 'generate',  label: 'Generate',          Icon: Icons.generate },
  { id: 'dashboard', label: 'Dashboard',          Icon: Icons.dashboard },
  { id: 'diagrams',  label: 'Diagrams',           Icon: Icons.diagrams  },
  { id: 'agent',     label: 'MTF Agent',           Icon: Icons.agent    },
];

export function Nav() {
  const { state, dispatch, send } = useApp();
  const [hoveredItem, setHoveredItem] = useState<Page | null>(null);

  return (
    <aside className="ccm-nav" style={{
      width: '215px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: tokens.bgSidebar,
      borderRight: `1px solid ${tokens.border}`,
      overflow: 'hidden',
    }}>
      {/* Logo bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '0 14px',
        height: '48px',
        borderBottom: `1px solid ${tokens.border}`,
        flexShrink: 0,
      }}>
        <div
          className="ccm-logo"
          style={{
            width: '30px', height: '30px',
            background: `linear-gradient(135deg, ${tokens.accent}, ${tokens.accentHover})`,
            color: tokens.accentFg,
            borderRadius: tokens.radius.md,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 2px 8px ${tokens.accent}50`,
          }}
        >
          <Icons.gear />
        </div>
        <span style={{ fontWeight: 700, fontSize: '13.5px', letterSpacing: '-0.02em', flex: 1 }}>CCM</span>
        <button
          onClick={() => send('openFullPanel')}
          title="Open as full panel"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: tokens.fgMuted, padding: '4px', borderRadius: tokens.radius.sm,
            display: 'flex', alignItems: 'center',
            opacity: 0.5,
          }}
        >
          <Icons.expand />
        </button>
      </div>

      {/* Active config chip */}
      <div className="ccm-nav-config-chip" style={{
        padding: '8px 10px',
        borderBottom: `1px solid ${tokens.border}`,
        flexShrink: 0,
        minHeight: '46px',
        display: 'flex',
        alignItems: 'center',
      }}>
        {state.currentConfigName ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '6px 10px',
            background: `rgba(34,197,94,0.1)`,
            border: `1px solid rgba(34,197,94,0.3)`,
            borderRadius: tokens.radius.xl,
            width: '100%', minWidth: 0,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>
            <span style={{
              width: '7px', height: '7px',
              borderRadius: '50%',
              background: tokens.success,
              flexShrink: 0,
              boxShadow: `0 0 6px ${tokens.success}`,
            }} />
            <span style={{ fontSize: '11.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, color: '#4ade80' }}>
              {state.currentConfigName}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: '11px', color: tokens.fgMuted, padding: '0 4px', opacity: 0.7 }}>No config loaded</span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ id, label, Icon, countKey }) => {
          const isActive = state.page === id;
          const isHovered = hoveredItem === id;
          const count = countKey ? (state as any)[countKey]?.length ?? 0 : 0;

          return (
            <button
              key={id}
              className="ccm-nav-item"
              data-active={isActive ? 'true' : 'false'}
              onClick={() => dispatch({ type: 'SET_PAGE', page: id })}
              onMouseEnter={() => setHoveredItem(id)}
              onMouseLeave={() => setHoveredItem(null)}
              title={label}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '8px 10px 8px 14px',
                background: isActive
                  ? `linear-gradient(90deg, ${tokens.accent}22, ${tokens.accent}0a)`
                  : isHovered ? tokens.bgHover : 'transparent',
                border: 'none',
                borderRadius: tokens.radius.md,
                cursor: 'pointer',
                color: isActive ? tokens.fg : tokens.fgMuted,
                fontSize: '12.5px',
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
                width: '100%',
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute',
                  left: 0, top: '6px', bottom: '6px',
                  width: '3px',
                  background: `linear-gradient(180deg, ${tokens.accent}, ${tokens.accentHover})`,
                  borderRadius: '0 3px 3px 0',
                  boxShadow: `2px 0 8px ${tokens.accent}60`,
                }} />
              )}
              <span style={{
                color: isActive ? tokens.accent : 'currentColor',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                opacity: isActive ? 1 : 0.75,
              }}>
                <Icon />
              </span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="ccm-nav-label">{label}</span>
              {count > 0 && (
                <span
                  className="ccm-badge"
                  style={{
                    fontSize: '10px', padding: '2px 7px',
                    borderRadius: tokens.radius.pill,
                    background: isActive ? tokens.accent : `${tokens.accent}30`,
                    color: isActive ? tokens.accentFg : tokens.accent,
                    fontWeight: 700, flexShrink: 0, minWidth: '22px', textAlign: 'center',
                    border: `1px solid ${tokens.accent}40`,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Stats footer */}
      {state.currentConfigId && (
        <div className="ccm-nav-stats" style={{
          padding: '10px',
          borderTop: `1px solid ${tokens.border}`,
          flexShrink: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '5px',
        }}>
          {[
            { label: 'Logical', value: state.logicalChannels.length },
            { label: 'HW', value: state.hardwareChannels.length },
            { label: 'Maps', value: state.mappings.length },
          ].map(({ label, value }) => (
            <div key={label} style={{
              textAlign: 'center', padding: '5px 2px',
              background: tokens.bgAlt,
              borderRadius: tokens.radius.md,
              border: `1px solid ${tokens.border}`,
            }}>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: '9px', color: tokens.fgMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
