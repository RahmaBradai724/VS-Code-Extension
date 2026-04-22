import React from 'react';
import { T } from '../../components/shared';

interface Props {
  newName: string;
  setNewName: (v: string) => void;
  onCreate: () => void;
  onCancel: () => void;
}

export function CreateConfigForm({ newName, setNewName, onCreate, onCancel }: Props) {
  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') onCreate();
    if (e.key === 'Escape') onCancel();
  }

  return (
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
        <button style={T.btnPrimary} onClick={onCreate}>Create</button>
        <button style={T.btnSecondary} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
