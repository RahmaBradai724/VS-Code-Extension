import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { FrameworkData } from '../types';
import { T } from '../components/shared';

const PUBLISHER_TYPES = ['SingleThreaded', 'MultiThreaded'];

export default function FrameworkPanel() {
  const { state, dispatch, send, notify } = useApp();
  const fw = state.frameworkData;

  // Local editable copy
  const [data, setData] = useState<FrameworkData>(() => ({ ...fw }));
  const [dirty, setDirty] = useState(false);

  function setD(key: keyof FrameworkData, val: any) {
    setData(d => ({ ...d, [key]: val }));
    setDirty(true);
  }

  function handleSave() {
    const saved: FrameworkData = {
      ...data,
      channelsGroups: typeof data.channelsGroups === 'string'
        ? (data.channelsGroups as any).split(',').map((s: string) => s.trim()).filter(Boolean)
        : data.channelsGroups,
      connectedEcus: typeof data.connectedEcus === 'string'
        ? (data.connectedEcus as any).split(',').map((s: string) => s.trim()).filter(Boolean)
        : data.connectedEcus,
    };
    dispatch({ type: 'UPDATE_FRAMEWORK', data: saved });
    send('saveFramework', { frameworkData: saved });
    setDirty(false);
    notify('success', 'Framework settings saved.');
  }

  const ethCfg = data.ethernetConfig || {};
  function setEth(key: string, val: any) {
    setD('ethernetConfig', { ...(data.ethernetConfig || {}), [key]: val });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <div>
          <h2 style={T.pageTitle}>Framework Configuration</h2>
          <p style={{ ...T.pageSub, marginBottom: 0 }}>Configure publisher and ethernet settings</p>
        </div>
        <button
          style={{
            ...T.btnPrimary,
            padding: '9px 22px',
            fontSize: '13px',
            opacity: dirty ? 1 : 0.5,
            boxShadow: dirty ? '0 2px 12px var(--vscode-button-background, rgba(0,120,212,0.4))' : 'none',
          }}
          onClick={handleSave}
        >
          {dirty ? '💾 Save Changes' : '✓ Saved'}
        </button>
      </div>

      {/* Publisher */}
      <div style={T.card}>
        <p style={T.cardTitle}>Publisher</p>
        <div className="ccm-grid2" style={T.grid2}>
          <div>
            <label style={T.label}>Publisher Type</label>
            <select style={T.select} value={data.publisherType || 'SingleThreaded'} onChange={e => setD('publisherType', e.target.value)}>
              {PUBLISHER_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={T.label}>Service Pack</label>
            <input style={T.input} placeholder="optional" value={data.servicePack || ''} onChange={e => setD('servicePack', e.target.value)} />
          </div>
        </div>
        {data.publisherType === 'MultiThreaded' && (
          <div style={{ marginTop: '12px' }}>
            <label style={T.label}>Channels Groups (comma-separated)</label>
            <input
              style={T.input}
              placeholder="group1, group2"
              value={Array.isArray(data.channelsGroups) ? data.channelsGroups.join(', ') : (data.channelsGroups || '')}
              onChange={e => setD('channelsGroups', e.target.value)}
            />
          </div>
        )}
        <div style={{ marginTop: '12px' }}>
          <label style={T.label}>Connected ECUs (comma-separated)</label>
          <input
            style={T.input}
            placeholder="ECU_1, ECU_2"
            value={Array.isArray(data.connectedEcus) ? data.connectedEcus.join(', ') : (data.connectedEcus || '')}
            onChange={e => setD('connectedEcus', e.target.value)}
          />
        </div>
      </div>

      {/* Ethernet Config */}
      <div style={T.card}>
        <p style={T.cardTitle}>Ethernet Configuration (optional)</p>
        <div className="ccm-grid2" style={T.grid2}>
          {[
            { key: 'pdus', label: 'PDUs' },
            { key: 'ipduContainers', label: 'iPDU Containers' },
            { key: 'frames', label: 'Frames' },
            { key: 'vmGroups', label: 'VM Groups' },
            { key: 'vmFibex', label: 'VM Fibex' },
            { key: 'systemSignals', label: 'System Signals' },
            { key: 'comSignals', label: 'COM Signals' },
            { key: 'ecu', label: 'ECU' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={T.label}>{label}</label>
              <input style={T.input} placeholder="optional" value={(ethCfg as any)[key] || ''} onChange={e => setEth(key, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
