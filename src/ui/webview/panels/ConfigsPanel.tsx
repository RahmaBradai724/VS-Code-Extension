import React, { useState } from 'react';
import { useApp } from '../App';
import { T } from '../components/shared';

export default function ConfigsPanel() {
  const { state, send, notify } = useApp();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={T.pageTitle}>Configurations</h2>
        <div style={T.row}>
          <button style={T.btnSecondary} onClick={() => send('importConfig')}>↑ Import YAML</button>
          <button style={T.btnPrimary} onClick={() => setCreating(v => !v)}>+ New Config</button>
        </div>
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ ...T.card, borderColor: 'var(--vscode-button-background)' }}>
          <label style={T.label}>Configuration Name</label>
          <div style={T.row}>
            <input
              autoFocus
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
          No configurations yet. Create one above or import a YAML file.
        </div>
      ) : (
        <div>
          {state.configs.map(cfg => {
            const isActive = cfg.id === state.currentConfigId;
            return (
              <div
                key={cfg.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 18px',
                  background: isActive
                    ? 'var(--vscode-button-background)1a'
                    : 'var(--vscode-editorWidget-background)',
                  border: `1px solid ${isActive ? 'var(--vscode-button-background)' : 'var(--vscode-panel-border, #3a3a3a)'}`,
                  borderRadius: '8px', marginBottom: '8px',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isActive && (
                    <span style={{
                      fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
                      background: 'var(--vscode-button-background)',
                      color: 'var(--vscode-button-foreground)', fontWeight: 600,
                    }}>Active</span>
                  )}
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{cfg.name}</span>
                  <span style={{ fontSize: '11px', opacity: 0.45 }}>id: {cfg.id}</span>
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
                  <button
                    style={T.btnDanger}
                    onClick={() => {
                      if (confirm(`Delete "${cfg.name}"? This cannot be undone.`)) {
                        send('deleteConfiguration', { configId: cfg.id });
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
