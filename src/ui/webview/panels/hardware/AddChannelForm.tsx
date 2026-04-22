import React from 'react';
import { HARDWARE_SUBCLASS_OPTIONS, HARDWARE_EXTRA_FIELDS } from '../../types';
import { T, DynamicField } from '../../components/shared';

const HW_S_ERR: React.CSSProperties = {
  display: 'block',
  marginTop: '4px',
  fontSize: '11px',
  color: '#f87171',
  lineHeight: 1.4,
};

interface Props {
  form: { name: string; subclass: string; extras: Record<string, any> };
  nameError: string;
  setField: (key: string, val: any) => void;
  setSubclass: (val: string) => void;
  setExtra: (key: string, val: any) => void;
  handleAdd: () => void;
  handleCancelForm: () => void;
}

export function AddChannelForm({ form, nameError, setField, setSubclass, setExtra, handleAdd, handleCancelForm }: Props) {
  const extraFields = HARDWARE_EXTRA_FIELDS[form.subclass] ?? [];

  return (
    <div className="ccm-form-card" style={{ ...T.cardAccent, marginBottom: '20px' }}>
      <p style={T.cardTitle}>New Hardware Channel</p>

      <div style={{ marginBottom: '12px' }}>
        <label style={T.label}>Name *</label>
        <input
          style={{ ...T.input, ...(nameError ? { borderColor: '#f87171', outline: '1px solid #f87171' } : {}) }}
          placeholder="e.g. CAN_Interface_1"
          value={form.name}
          onChange={e => setField('name', e.target.value)}
        />
        {nameError && <span style={HW_S_ERR}>{nameError}</span>}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={T.label}>Hardware Type *</label>
        <select style={T.select} value={form.subclass} onChange={e => setSubclass(e.target.value)}>
          {HARDWARE_SUBCLASS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {extraFields.length > 0 && (
        <>
          <div style={T.divider} />
          <p style={{ ...T.cardTitle, marginBottom: '8px', opacity: 0.7 }}>Hardware-specific fields</p>
          <div className="ccm-grid2" style={T.grid2}>
            {extraFields.map(f => (
              <DynamicField key={f.key} def={f} value={form.extras[f.key]} onChange={setExtra} />
            ))}
          </div>
        </>
      )}

      <div style={{ ...T.divider, marginTop: '16px' }} />
      <div style={{ ...T.row, justifyContent: 'flex-end' }}>
        <button style={T.btnSecondary} onClick={handleCancelForm}>Cancel</button>
        <button style={T.btnPrimary} onClick={handleAdd}>Add Channel</button>
      </div>
    </div>
  );
}
