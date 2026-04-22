import React from 'react';
import { T } from '../../components/shared';

interface Props {
  cfg: any;
  isActive: boolean;
  isOwner: boolean;
  onLoad: () => void;
  onDelete: () => void;
}

export function ConfigCard({ cfg, isActive, isOwner, onLoad, onDelete }: Props) {
  return (
    <div
      className="ccm-config-card"
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '10px',
        padding: '16px 20px',
        background: isActive
          ? 'var(--vscode-editorWidget-background)'
          : 'var(--vscode-editorWidget-background)',
        border: `1.5px solid ${isActive ? 'var(--vscode-button-background)' : 'var(--vscode-panel-border, rgba(128,128,128,0.2))'}`,
        borderRadius: '12px', marginBottom: '10px',
        boxShadow: isActive ? '0 0 0 1px var(--vscode-button-background)30, 0 4px 16px rgba(0,0,0,0.12)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        <div style={{
          width: '38px', height: '38px',
          borderRadius: '10px',
          background: isActive ? 'var(--vscode-button-background)22' : 'rgba(128,128,128,0.08)',
          border: `1px solid ${isActive ? 'var(--vscode-button-background)40' : 'rgba(128,128,128,0.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
          flexShrink: 0,
        }}>
          {isActive ? '✓' : '📄'}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{cfg.name}</span>
            {isActive && (
              <span style={{
                fontSize: '10px', padding: '2px 10px', borderRadius: '999px',
                background: 'var(--vscode-button-background)',
                color: 'var(--vscode-button-foreground)',
                fontWeight: 700, letterSpacing: '0.04em',
              }}>ACTIVE</span>
            )}
            {!isOwner && (
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '999px',
                background: 'rgba(251,191,36,0.12)',
                color: '#fbbf24',
                border: '1px solid rgba(251,191,36,0.3)',
                fontWeight: 600,
              }}>read-only</span>
            )}
          </div>
          <span style={{ fontSize: '11px', opacity: 0.4, fontFamily: 'monospace', letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '220px' }}>
            {cfg.id}
          </span>
        </div>
      </div>

      <div style={T.row}>
        {!isActive && (
          <button style={T.btnPrimary} onClick={onLoad}>Load</button>
        )}
        {isOwner && (
          <button style={T.btnDanger} onClick={onDelete}>Delete</button>
        )}
      </div>
    </div>
  );
}
