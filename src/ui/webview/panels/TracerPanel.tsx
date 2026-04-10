import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { TracerConfig } from '../types';
import { T } from '../components/shared';
import TracerManager from '../components/TracerManager';

type TracerWithId = TracerConfig & { _id: string };

export default function TracerPanel() {
  const { state, dispatch, send, notify } = useApp();
  const fw = state.frameworkData;

  const [tracers, setTracers] = useState<TracerWithId[]>(() =>
    (fw.tracers || []).map(t => ({ ...t, _id: `t_${Date.now()}_${Math.random()}` }))
  );
  const [dirty, setDirty] = useState(false);
  const [preselectName, setPreselectName] = useState<string | null>(null);

  useEffect(() => {
    setTracers((fw.tracers || []).map(t => ({ ...t, _id: `t_${Date.now()}_${Math.random()}` })));
    setDirty(false);
  }, [state.currentConfigId]);

  // Collect all unique non-empty tracer names referenced by logical channels
  const referencedNames: string[] = Array.from(new Set(
    state.logicalChannels
      .map((ch: any) => ch.tracerName as string | undefined)
      .filter((n): n is string => !!n && n.trim() !== '')
  ));

  const configuredNames = new Set(tracers.map(t => t.name));
  const unconfiguredNames = referencedNames.filter(n => !configuredNames.has(n));
  const suggestedNames = unconfiguredNames;

  function handleSave() {
    const saved = {
      ...fw,
      tracers: tracers.map(({ _id, ...rest }) => rest as TracerConfig),
    };
    dispatch({ type: 'UPDATE_FRAMEWORK', data: saved });
    send('saveFramework', { frameworkData: saved });
    setDirty(false);
    notify('success', 'Tracers saved.');
  }

  return (
    <div>
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
          onClick={handleSave}
        >
          Save Tracers
        </button>
      </div>

      {/* ── Referenced tracer names from logical channels ─────────── */}
      {referencedNames.length > 0 && (
        <div style={{ ...T.card, marginBottom: '16px' }}>
          <p style={{ ...T.cardTitle, marginBottom: '12px' }}>Tracer Names from Logical Channels</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {referencedNames.map(name => {
              const isConfigured = configuredNames.has(name);
              return (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '5px',
                    background: 'var(--vscode-input-background)',
                    border: `1px solid ${isConfigured ? '#2d6a2d' : '#6a4a2d'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                      background: isConfigured ? '#4caf50' : '#ff9800',
                    }} />
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{name}</span>
                    <span style={{ fontSize: '11px', opacity: 0.5 }}>
                      {isConfigured ? 'Configured' : 'Not configured'}
                    </span>
                  </div>
                  {!isConfigured && (
                    <button
                      style={{ ...T.btnSmall }}
                      onClick={() => setPreselectName(name)}
                    >
                      Configure →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {unconfiguredNames.length > 0 && (
            <p style={{ fontSize: '11px', opacity: 0.45, marginTop: '10px', marginBottom: 0 }}>
              {unconfiguredNames.length} tracer{unconfiguredNames.length > 1 ? 's' : ''} referenced by channels but not yet configured.
            </p>
          )}
        </div>
      )}

      <TracerManager
        tracers={tracers}
        onChange={(updated) => { setTracers(updated); setDirty(true); }}
        onNotify={notify}
        suggestedNames={suggestedNames}
        preselectName={preselectName}
        onPreselectConsumed={() => setPreselectName(null)}
      />
    </div>
  );
}

