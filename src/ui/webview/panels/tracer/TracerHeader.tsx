import React from 'react';
import { T } from '../../components/shared';

interface Props {
  dirty: boolean;
  onSave: () => void;
}

export function TracerHeader({ dirty, onSave }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
      <div>
        <h2 style={T.pageTitle}>Tracers</h2>
        <p style={{ ...T.pageSub, marginBottom: 0 }}>Manage PCAP and ASCII tracers for this configuration</p>
      </div>
      <button
        style={{
          ...T.btnPrimary,
          padding: '9px 22px',
          fontSize: '13px',
          opacity: dirty ? 1 : 0.5,
          boxShadow: dirty ? '0 2px 12px var(--vscode-button-background, rgba(0,120,212,0.4))' : 'none',
        }}
        disabled={!dirty}
        onClick={onSave}
      >
        Save Tracers
      </button>
    </div>
  );
}
