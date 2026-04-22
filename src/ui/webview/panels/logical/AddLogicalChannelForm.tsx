import React from 'react';
import { LOGICAL_SUBCLASS_OPTIONS, CHANNEL_COLORS } from '../../types';
import { T, DynamicField, Badge } from '../../components/shared';

const S_ERR: React.CSSProperties = {
  display: 'block',
  marginTop: '4px',
  fontSize: '11px',
  color: '#f87171',
  lineHeight: 1.4,
};

type LogicalSubclassOption = { value: string; label: string; category: string };

interface Props {
  form: {
    name: string;
    channelId: string;
    loggingName: string;
    tracerName: string;
    aliases: string;
    subclass: string;
    extras: Record<string, any>;
  };
  fieldErrors: Record<string, string>;
  extraFields: any[];
  selectedOpt: LogicalSubclassOption | undefined;
  isBridge: boolean;
  canSubmit: boolean;
  setField: (key: string, val: any) => void;
  setSubclass: (val: string) => void;
  setExtra: (key: string, val: any) => void;
  handleAdd: () => void;
  handleCancelForm: () => void;
}

export function AddLogicalChannelForm({
  form, fieldErrors, extraFields, selectedOpt, isBridge, canSubmit,
  setField, setSubclass, setExtra, handleAdd, handleCancelForm,
}: Props) {
  return (
    <div className="ccm-form-card" style={{ ...T.cardAccent, marginBottom: '20px' }}>
      <p style={T.cardTitle}>New Logical Channel</p>

      <div style={{ marginBottom: '12px' }}>
        <label style={T.label}>Type *</label>
        <select style={T.select} value={form.subclass} onChange={e => setSubclass(e.target.value)}>
          {LOGICAL_SUBCLASS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {selectedOpt && (
          <div style={{ marginTop: '6px' }}>
            <Badge label={selectedOpt.category} color={CHANNEL_COLORS[selectedOpt.category] ?? '#888'} />
          </div>
        )}
      </div>

      <div style={T.divider} />

      <div className="ccm-grid2" style={T.grid2}>
        <div>
          <label style={T.label}>Name *</label>
          <input
            style={{ ...T.input, ...(fieldErrors.name ? { borderColor: '#f87171', outline: '1px solid #f87171' } : {}) }}
            placeholder="e.g. CAN_Channel_1"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
          />
          {fieldErrors.name && <span style={S_ERR}>{fieldErrors.name}</span>}
        </div>
        <div>
          <label style={T.label}>Channel ID *</label>
          <input
            style={{ ...T.input, ...(fieldErrors.channelId ? { borderColor: '#f87171', outline: '1px solid #f87171' } : {}) }}
            type="number"
            placeholder="e.g. 1"
            value={form.channelId}
            onChange={e => setField('channelId', e.target.value)}
          />
          {fieldErrors.channelId && <span style={S_ERR}>{fieldErrors.channelId}</span>}
        </div>
        {extraFields.map(f => (
          <DynamicField key={f.key} def={f} value={form.extras[f.key]} onChange={setExtra} />
        ))}
        {!isBridge && (
          <div>
            <label style={T.label}>Logging Name</label>
            <input style={T.input} placeholder="optional" value={form.loggingName} onChange={e => setField('loggingName', e.target.value)} />
          </div>
        )}
        {!isBridge && (
          <div>
            <label style={T.label}>Tracer Name</label>
            <input style={T.input} placeholder="optional" value={form.tracerName} onChange={e => setField('tracerName', e.target.value)} />
          </div>
        )}
        {!isBridge && (
          <div>
            <label style={T.label}>Aliases (comma-separated)</label>
            <input
              style={{ ...T.input, ...(fieldErrors.aliases ? { borderColor: '#f87171', outline: '1px solid #f87171' } : {}) }}
              placeholder="alias1, alias2"
              value={form.aliases}
              onChange={e => setField('aliases', e.target.value)}
            />
            {fieldErrors.aliases && <span style={S_ERR}>{fieldErrors.aliases}</span>}
          </div>
        )}
      </div>

      <div style={{ ...T.divider, marginTop: '16px' }} />
      <div style={{ ...T.row, justifyContent: 'flex-end' }}>
        <button style={T.btnSecondary} onClick={handleCancelForm}>Cancel</button>
        <button style={{ ...T.btnPrimary, opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? 'pointer' : 'not-allowed' }} disabled={!canSubmit} onClick={handleAdd}>Add Channel</button>
      </div>
    </div>
  );
}
