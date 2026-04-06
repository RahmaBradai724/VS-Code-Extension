import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import {
  LOGICAL_SUBCLASS_OPTIONS, LOGICAL_EXTRA_FIELDS,
  CHANNEL_COLORS, LogicalChannel,
} from '../types';
import { T, DynamicField, ChannelRow, SectionHeader, Badge } from '../components/shared';

const CATEGORY_OF: Record<string, string> = {};
LOGICAL_SUBCLASS_OPTIONS.forEach(o => { CATEGORY_OF[o.value] = o.category; });

function initExtras(subclass: string): Record<string, any> {
  const fields = LOGICAL_EXTRA_FIELDS[subclass] ?? [];
  const obj: Record<string, any> = {};
  fields.forEach(f => { obj[f.key] = f.type === 'checkbox' ? false : ''; });
  return obj;
}

export default function LogicalPanel() {
  const { state, dispatch, send, notify } = useApp();
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: '', channelId: '', loggingName: '', tracerName: '', aliases: '',
    subclass: LOGICAL_SUBCLASS_OPTIONS[0].value,
    extras: initExtras(LOGICAL_SUBCLASS_OPTIONS[0].value),
  });

  function pushDraft(nextForm: typeof form) {
    if (!nextForm.name.trim()) {
      dispatch({ type: 'SET_DRAFT_LOGICAL', draft: null });
      return;
    }
    const opt = LOGICAL_SUBCLASS_OPTIONS.find(o => o.value === nextForm.subclass)!;
    dispatch({
      type: 'SET_DRAFT_LOGICAL',
      draft: {
        id: '__draft__',
        name: nextForm.name.trim(),
        channelId: nextForm.channelId ? Number(nextForm.channelId) : undefined,
        loggingName: nextForm.loggingName.trim(),
        tracerName: nextForm.tracerName.trim(),
        alias: nextForm.aliases.split(',').map(s => s.trim()).filter(Boolean),
        type: 'LOGICAL',
        category: opt.category,
        subclass: nextForm.subclass,
        ...nextForm.extras,
      },
    });
  }

  function setField(key: string, val: any) {
    setForm(f => {
      const next = { ...f, [key]: val };
      pushDraft(next);
      return next;
    });
  }

  function setSubclass(val: string) {
    setForm(f => {
      const next = { ...f, subclass: val, extras: initExtras(val) };
      pushDraft(next);
      return next;
    });
  }

  function setExtra(key: string, val: any) {
    setForm(f => {
      const next = { ...f, extras: { ...f.extras, [key]: val } };
      pushDraft(next);
      return next;
    });
  }

  function handleAdd() {
    if (!form.name.trim()) { notify('error', 'Channel name is required.'); return; }
    const selectedOpt = LOGICAL_SUBCLASS_OPTIONS.find(o => o.value === form.subclass)!;
    const channel: LogicalChannel = {
      id: `lc_${Date.now()}`,
      name: form.name.trim(),
      channelId: form.channelId ? Number(form.channelId) : undefined,
      loggingName: form.loggingName.trim(),
      tracerName: form.tracerName.trim(),
      alias: form.aliases.split(',').map(s => s.trim()).filter(Boolean),
      type: 'LOGICAL',
      category: selectedOpt.category,
      subclass: form.subclass,
      ...form.extras,
    };
    send('addLogicalChannel', { channel });
    setForm({ name: '', channelId: '', loggingName: '', tracerName: '', aliases: '', subclass: LOGICAL_SUBCLASS_OPTIONS[0].value, extras: initExtras(LOGICAL_SUBCLASS_OPTIONS[0].value) });
    setShowForm(false);
  }

  function handleCancelForm() {
    dispatch({ type: 'SET_DRAFT_LOGICAL', draft: null });
    setForm({ name: '', channelId: '', loggingName: '', tracerName: '', aliases: '', subclass: LOGICAL_SUBCLASS_OPTIONS[0].value, extras: initExtras(LOGICAL_SUBCLASS_OPTIONS[0].value) });
    setShowForm(false);
  }

  const extraFields = LOGICAL_EXTRA_FIELDS[form.subclass] ?? [];
  const selectedOpt = LOGICAL_SUBCLASS_OPTIONS.find(o => o.value === form.subclass);

  return (
    <div>
      <SectionHeader
        title="Logical Channels"
        count={state.logicalChannels.length}
        action={
          <button style={T.btnPrimary} onClick={() => showForm ? handleCancelForm() : setShowForm(true)}>
            {showForm ? 'Cancel' : '+ Add Channel'}
          </button>
        }
      />

      {/* Add form */}
      {showForm && (
        <div className="ccm-form-card" style={{ ...T.cardAccent, marginBottom: '20px' }}>
          <p style={T.cardTitle}>New Logical Channel</p>
          <div style={T.grid2}>
            <div>
              <label style={T.label}>Name *</label>
              <input style={T.input} placeholder="e.g. CAN_Channel_1" value={form.name} onChange={e => setField('name', e.target.value)} />
            </div>
            <div>
              <label style={T.label}>Channel ID</label>
              <input style={T.input} type="number" placeholder="e.g. 1" value={form.channelId} onChange={e => setField('channelId', e.target.value)} />
            </div>
            <div>
              <label style={T.label}>Logging Name</label>
              <input style={T.input} placeholder="optional" value={form.loggingName} onChange={e => setField('loggingName', e.target.value)} />
            </div>
            <div>
              <label style={T.label}>Tracer Name</label>
              <input style={T.input} placeholder="optional" value={form.tracerName} onChange={e => setField('tracerName', e.target.value)} />
            </div>
            <div>
              <label style={T.label}>Aliases (comma-separated)</label>
              <input style={T.input} placeholder="alias1, alias2" value={form.aliases} onChange={e => setField('aliases', e.target.value)} />
            </div>
          </div>

          <div style={T.divider} />

          <div style={{ marginBottom: '12px' }}>
            <label style={T.label}>Type / Subclass *</label>
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

          {extraFields.length > 0 && (
            <>
              <div style={T.divider} />
              <p style={{ ...T.cardTitle, marginBottom: '8px', opacity: 0.7 }}>Type-specific fields</p>
              <div style={T.grid2}>
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
      )}

      {/* Channel list */}
      {state.logicalChannels.length === 0 ? (
        <div style={T.empty}>No logical channels yet. Add one above.</div>
      ) : (
        <div>
          {state.logicalChannels.map(ch => {
            const color = CHANNEL_COLORS[ch.category] ?? '#888';
            const meta = [ch.loggingName, ch.tracerName].filter(Boolean).join(' • ');
            return (
              <ChannelRow
                key={ch.id}
                name={ch.name}
                badgeLabel={ch.subclass || ch.category}
                badgeColor={color}
                meta={meta || undefined}
                onDelete={() => send('deleteLogicalChannel', { channelId: ch.id })}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
