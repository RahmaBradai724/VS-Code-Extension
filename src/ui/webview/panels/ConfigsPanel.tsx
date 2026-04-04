import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { T } from '../components/shared';
import { ConfirmModal } from '../components/ConfirmModal';

export default function ConfigsPanel() {
  const { state, send, notify } = useApp();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deletingCfg = state.configs.find(c => c.id === deletingId);

  function handleCreate() {
    const name = newName.trim();
    if (!name) { notify('error', 'Please enter a configuration name.'); return; }
    send('createConfiguration', { name });
    setNewName('');
    setCreating(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') { setCreating(false); setNewName(''); }
  }

  return (
    <div>
      {/* Confirm delete modal */}
      <ConfirmModal
        open={!!deletingId}
        title={`Delete "${deletingCfg?.name ?? ''}"?`}
        message="This configuration and all its channels and mappings will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingId) send('deleteConfiguration', { configId: deletingId });
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <div>
          <h2 style={T.pageTitle}>Configurations</h2>
          <p style={{ ...T.pageSub, marginBottom: 0 }}>Manage your channel configuration files</p>
        </div>
        <div style={T.row}>
          <button style={T.btnSecondary} onClick={() => send('importConfig')}>↑ Import YAML</button>
          <button style={T.btnPrimary} onClick={() => setCreating(v => !v)}>
            {creating ? '✕ Cancel' : '+ New Config'}
          </button>
        </div>
      </div>

      {/* Create form */}
      {creating && (
        <div className="ccm-form-card" style={{ ...T.cardAccent, marginBottom: '20px' }}>
          <p style={{ ...T.cardTitle, marginBottom: '12px' }}>New Configuration</p>
          <label style={T.label}>Configuration Name</label>
          <div style={T.row}>
            <input
              autoFocus
              className="ccm-input"
              style={{ ...T.input, flex: 1 }}
              placeholder="e.g. my_project_config"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={handleKey}
            />
            <button style={T.btnPrimary} onClick={handleCreate}>Create</button>
            <button style={T.btnSecondary} onClick={() => { setCreating(false); setNewName(''); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Config list */}
      {state.configs.length === 0 ? (
        <div style={T.empty}>
          <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.3 }}>📋</div>
          No configurations yet.<br />Create one above or import a YAML file.
        </div>
      ) : (
        <div>
          {state.configs.map(cfg => {
            const isActive  = cfg.id === state.currentConfigId;
            // eslint-disable-next-line eqeqeq
            const isOwner   = cfg.userId == null || cfg.userId == state.authUser?.id;
            return (
              <div
                key={cfg.id}
                className="ccm-config-card"
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 20px',
                  background: isActive
                    ? 'var(--vscode-editorWidget-background)'
                    : 'var(--vscode-editorWidget-background)',
                  border: `1.5px solid ${isActive ? 'var(--vscode-button-background)' : 'var(--vscode-panel-border, rgba(128,128,128,0.2))'}`,
                  borderRadius: '12px', marginBottom: '10px',
                  boxShadow: isActive ? '0 0 0 1px var(--vscode-button-background)30, 0 4px 16px rgba(0,0,0,0.12)' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{cfg.name}</span>
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
                    <span style={{ fontSize: '11px', opacity: 0.4, fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                      {cfg.id}
                    </span>
                  </div>
                </div>

                <div style={T.row}>
                  {!isActive && (
                    <button
                      style={T.btnPrimary}
                      onClick={() => send('loadConfiguration', { configId: cfg.id })}
                    >
                      Load
                    </button>
                  )}
                  {isOwner && (
                    <button
                      style={T.btnDanger}
                      onClick={() => setDeletingId(cfg.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
