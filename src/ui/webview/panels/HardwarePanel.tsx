import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import {
  HARDWARE_SUBCLASS_OPTIONS, HARDWARE_EXTRA_FIELDS, HardwareChannel,
} from '../types';
import { T, SectionHeader } from '../components/shared';
import { AddChannelForm } from './hardware/AddChannelForm';
import { HardwareList } from './hardware/HardwareList';

function initExtras(subclass: string): Record<string, any> {
  const fields = HARDWARE_EXTRA_FIELDS[subclass] ?? [];
  const obj: Record<string, any> = {};
  fields.forEach(f => { obj[f.key] = f.type === 'checkbox' ? false : ''; });
  if (subclass === 'TunTapBridge') {
    obj.tunTapAdapters = [];
  }
  return obj;
}

const HW_NAME_RE = /^[A-Za-z_][A-Za-z0-9_\-]*$/;

export default function HardwarePanel() {
  const { state, send, notify, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [nameError, setNameError] = useState('');

  const [form, setForm] = useState({
    name: '',
    subclass: HARDWARE_SUBCLASS_OPTIONS[0].value,
    extras: initExtras(HARDWARE_SUBCLASS_OPTIONS[0].value),
  });

  function setField(key: string, val: any) {
    setForm(f => ({ ...f, [key]: val }));
    if (key === 'name') {
      const v = String(val).trim();
      if (!v) {
        setNameError('Name is required.');
      } else if (!HW_NAME_RE.test(v)) {
        setNameError('Invalid name, It must start with a letter or underscore, no spaces are allowed. Allowed: [A-Z]');
      } else {
        setNameError('');
      }
    }
  }

  function setSubclass(val: string) {
    setForm(f => ({ ...f, subclass: val, extras: initExtras(val) }));
  }

  function setExtra(key: string, val: any) {
    setForm(f => ({ ...f, extras: { ...f.extras, [key]: val } }));
  }

  function handleAdd() {
    if (!form.name.trim()) { notify('error', 'Channel name is required.'); return; }
    if (!HW_NAME_RE.test(form.name.trim())) {
      setNameError('Invalid name â€” must start with a letter or underscore; no spaces.');
      notify('error', 'Please fix the highlighted errors before adding.');
      return;
    }
    const channel: HardwareChannel = {
      id: `hw_${Date.now()}`,
      name: form.name.trim(),
      type: 'HARDWARE',
      subclass: form.subclass,
      ...form.extras,
    };
    send('addHardwareChannel', { channel });
    setNameError('');
    setForm({ name: '', subclass: HARDWARE_SUBCLASS_OPTIONS[0].value, extras: initExtras(HARDWARE_SUBCLASS_OPTIONS[0].value) });
    setShowForm(false);
  }

  function handleCancelForm() {
    setNameError('');
    setForm({ name: '', subclass: HARDWARE_SUBCLASS_OPTIONS[0].value, extras: initExtras(HARDWARE_SUBCLASS_OPTIONS[0].value) });
    setShowForm(false);
  }

  return (
    <div>
      <SectionHeader
        title="Hardware Channels"
        count={state.hardwareChannels.length}
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{ ...T.btnSecondary, opacity: state.hardwareDiscovering ? 0.6 : 1 }}
              disabled={state.hardwareDiscovering}
              title="Scan the network for Capture Modules and host Ethernet adapters via cmconfig"
              onClick={() => {
                dispatch({ type: 'HARDWARE_DISCOVERY_START' });
                send('discoverHardware');
              }}
            >
              {state.hardwareDiscovering ? 'Scanning…' : '⟳ Scan Devices'}
            </button>
            <button style={T.btnPrimary} onClick={() => showForm ? handleCancelForm() : setShowForm(true)}>
              {showForm ? 'Cancel' : '+ Add Channel'}
            </button>
          </div>
        }
      />

      {/* Discovery results banner */}
      {state.discoveredHardware && !state.hardwareDiscovering && (
        <div style={{
          background: 'rgba(78,201,176,0.06)',
          border: '1px solid rgba(78,201,176,0.25)',
          borderRadius: '6px',
          padding: '10px 14px',
          marginBottom: '14px',
          fontSize: '12px',
          color: 'var(--vscode-foreground)',
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>🔍</span>
            <strong style={{ fontSize: '12px' }}>Scan results</strong>
            <span style={{ opacity: 0.45, fontSize: '11px', marginLeft: '4px' }}>
              {new Date(state.discoveredHardware.timestamp).toLocaleTimeString()}
            </span>
            {state.discoveredHardware.capture_modules.length > 0 || state.discoveredHardware.ethernet_adapters.length > 0 ? (
              <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '11px' }}>
                ↳ dropdowns auto-populated in "Add Channel"
              </span>
            ) : null}
          </div>

          {/* Capture Modules */}
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#569cd6', fontWeight: 600 }}>
              Capture Modules ({state.discoveredHardware.capture_modules.length})
            </span>
            {state.discoveredHardware.capture_modules.length === 0 ? (
              <span style={{ opacity: 0.5, marginLeft: '8px' }}>none detected on this network</span>
            ) : (
              <table style={{ marginTop: '5px', width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ opacity: 0.5 }}>
                    <th style={{ textAlign: 'left', paddingRight: '16px', fontWeight: 600 }}>CM ID</th>
                    <th style={{ textAlign: 'left', paddingRight: '16px', fontWeight: 600 }}>IP Address</th>
                    <th style={{ textAlign: 'left', paddingRight: '16px', fontWeight: 600 }}>MAC</th>
                    <th style={{ textAlign: 'left', paddingRight: '16px', fontWeight: 600 }}>Product</th>
                    <th style={{ textAlign: 'left', fontWeight: 600 }}>SW Version</th>
                  </tr>
                </thead>
                <tbody>
                  {state.discoveredHardware.capture_modules.map((cm, i) => (
                    <tr key={i}>
                      <td style={{ paddingRight: '16px', color: '#569cd6', fontWeight: 700 }}>{cm.id}</td>
                      <td style={{ paddingRight: '16px', fontFamily: 'monospace' }}>{cm.ip}</td>
                      <td style={{ paddingRight: '16px', fontFamily: 'monospace', opacity: 0.7 }}>{cm.mac}</td>
                      <td style={{ paddingRight: '16px' }}>{cm.product_name || cm.product_family}</td>
                      <td style={{ opacity: 0.7 }}>{cm.sw_version ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Ethernet Adapters */}
          <div>
            <span style={{ color: '#4ec9b0', fontWeight: 600 }}>
              Ethernet Adapters ({state.discoveredHardware.ethernet_adapters.length})
            </span>
            {state.discoveredHardware.ethernet_adapters.length === 0 ? (
              <span style={{ opacity: 0.5, marginLeft: '8px' }}>none detected</span>
            ) : (
              <table style={{ marginTop: '5px', width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ opacity: 0.5 }}>
                    <th style={{ textAlign: 'left', paddingRight: '16px', fontWeight: 600 }}>Friendly Name</th>
                    <th style={{ textAlign: 'left', paddingRight: '16px', fontWeight: 600 }}>Description</th>
                    <th style={{ textAlign: 'left', paddingRight: '16px', fontWeight: 600 }}>MAC</th>
                    <th style={{ textAlign: 'left', fontWeight: 600 }}>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {state.discoveredHardware.ethernet_adapters.map((a, i) => (
                    <tr key={i}>
                      <td style={{ paddingRight: '16px', color: '#4ec9b0', fontFamily: 'monospace' }}>{a.friendly_name}</td>
                      <td style={{ paddingRight: '16px', opacity: 0.8 }}>{a.description}</td>
                      <td style={{ paddingRight: '16px', fontFamily: 'monospace', opacity: 0.7 }}>{a.mac}</td>
                      <td style={{ opacity: 0.7 }}>{a.ports?.[0]?.linkup ? '🟢 up' : '🔴 down'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <AddChannelForm
          form={form}
          nameError={nameError}
          setField={setField}
          setSubclass={setSubclass}
          setExtra={setExtra}
          handleAdd={handleAdd}
          handleCancelForm={handleCancelForm}
          adapterFriendlyNames={(
            state.hardwareChannels as any[]
          ).filter(h => h.subclass === 'EthernetAdapter' && h.friendlyName).map((h: any) => h.friendlyName as string)}
          discoveredCaptureModules={state.discoveredHardware?.capture_modules ?? []}
          discoveredEthernetAdapters={state.discoveredHardware?.ethernet_adapters ?? []}
        />
      )}

      <HardwareList hardwareChannels={state.hardwareChannels} send={send} />
    </div>
  );
}
