import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { T } from '../components/shared';
import { ConfirmModal } from '../components/ConfirmModal';
import { ConfigCard } from './configs/ConfigCard';
import { CreateConfigForm } from './configs/CreateConfigForm';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
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
        <CreateConfigForm
          newName={newName}
          setNewName={setNewName}
          onCreate={handleCreate}
          onCancel={() => { setCreating(false); setNewName(''); }}
        />
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
            const isActive = cfg.id === state.currentConfigId;
            // eslint-disable-next-line eqeqeq
            const isOwner  = cfg.userId == null || cfg.userId == state.authUser?.id;
            return (
              <ConfigCard
                key={cfg.id}
                cfg={cfg}
                isActive={isActive}
                isOwner={isOwner}
                onLoad={() => send('loadConfiguration', { configId: cfg.id })}
                onDelete={() => setDeletingId(cfg.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
