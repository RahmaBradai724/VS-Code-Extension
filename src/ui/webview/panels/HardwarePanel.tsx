import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import {
  HARDWARE_SUBCLASS_OPTIONS, HARDWARE_EXTRA_FIELDS, HardwareChannel,
} from '../types';
import { T, DynamicField, ChannelRow, SectionHeader } from '../components/shared';

function initExtras(subclass: string): Record<string, any> {
  const fields = HARDWARE_EXTRA_FIELDS[subclass] ?? [];
  const obj: Record<string, any> = {};
  fields.forEach(f => { obj[f.key] = f.type === 'checkbox' ? false : ''; });
  return obj;
}

const SUBCLASS_COLOR: Record<string, string> = {
  CANInterface: '#569cd6', CIBInterface: '#569cd6', CMInterface: '#9cdcfe',
  LINCard: '#dcb67a', EthernetAdapter: '#4ec9b0', RelayBoard: '#c678dd',
  HIDRelay: '#c678dd', SerialPort: '#d4d4d4', AnalogDevice: '#f0c040',
  TEAnalog: '#f0c040', HHLoad: '#f87171',
};

export default function HardwarePanel() {
  const { state, send, notify } = useApp();
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    subclass: HARDWARE_SUBCLASS_OPTIONS[0].value,
    extras: initExtras(HARDWARE_SUBCLASS_OPTIONS[0].value),
  });

  function setField(key: string, val: any) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function setSubclass(val: string) {
    setForm(f => ({ ...f, subclass: val, extras: initExtras(val) }));
  }

  function setExtra(key: string, val: any) {
    setForm(f => ({ ...f, extras: { ...f.extras, [key]: val } }));
  }

  function handleAdd() {
    if (!form.name.trim()) { notify('error', 'Channel name is required.'); return; }
    const channel: HardwareChannel = {
      id: `hw_${Date.now()}`,
      name: form.name.trim(),
      type: 'HARDWARE',
      subclass: form.subclass,
      ...form.extras,
    };
    send('addHardwareChannel', { channel });
    setForm({ name: '', subclass: HARDWARE_SUBCLASS_OPTIONS[0].value, extras: initExtras(HARDWARE_SUBCLASS_OPTIONS[0].value) });
    setShowForm(false);
  }

  function handleCancelForm() {
    setForm({ name: '', subclass: HARDWARE_SUBCLASS_OPTIONS[0].value, extras: initExtras(HARDWARE_SUBCLASS_OPTIONS[0].value) });
    setShowForm(false);
  }

  const extraFields = HARDWARE_EXTRA_FIELDS[form.subclass] ?? [];

  return (
    <div>
      <SectionHeader
        title="Hardware Channels"
        count={state.hardwareChannels.length}
        action={
          <button style={T.btnPrimary} onClick={() => showForm ? handleCancelForm() : setShowForm(true)}>
            {showForm ? 'Cancel' : '+ Add Channel'}
          </button>
        }
      />

      {showForm && (
        <div className="ccm-form-card" style={{ ...T.cardAccent, marginBottom: '20px' }}>
          <p style={T.cardTitle}>New Hardware Channel</p>

          <div style={{ marginBottom: '12px' }}>
            <label style={T.label}>Name *</label>
            <input style={T.input} placeholder="e.g. CAN_Interface_1" value={form.name} onChange={e => setField('name', e.target.value)} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={T.label}>Hardware Type / Subclass *</label>
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

      {state.hardwareChannels.length === 0 ? (
        <div style={T.empty}>No hardware channels yet. Add one above.</div>
      ) : (
        <div>
          {state.hardwareChannels.map(hw => {
            const color = SUBCLASS_COLOR[hw.subclass] ?? '#888';
            const label = HARDWARE_SUBCLASS_OPTIONS.find(o => o.value === hw.subclass)?.label ?? hw.subclass;
            return (
              <ChannelRow
                key={hw.id}
                name={hw.name}
                badgeLabel={label}
                badgeColor={color}
                onDelete={() => send('deleteHardwareChannel', { channelId: hw.id })}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
