import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { TracerConfig, FrameworkData } from '../types';
import { T, Badge } from '../components/shared';

const PUBLISHER_TYPES = ['SingleThreaded', 'MultiThreaded'];
const TRACER_TYPES = ['PCAP', 'ASCII'];
const TIMESTAMP_MODES = ['Absolute', 'Relative', 'Delta'];

function emptyTracer(): TracerConfig & { _id: string } {
  return {
    _id: `t_${Date.now()}_${Math.random()}`,
    name: '', tracerType: 'PCAP', timestampMode: 'Absolute',
    filter: '', file: { path: '', splitSize: undefined, splitTime: undefined, cyclic: false },
    pcapInterface: '', ethernetPaddingActive: false,
    asciiOutputLineSeparator: '', asciiMsgTextSeparator: '',
  };
}

export default function FrameworkPanel() {
  const { state, dispatch, notify } = useApp();
  const fw = state.frameworkData;

  // Local editable copy
  const [data, setData] = useState<FrameworkData>(() => ({ ...fw }));
  const [tracers, setTracers] = useState<Array<TracerConfig & { _id: string }>>(() =>
    (fw.tracers || []).map(t => ({ ...t, _id: `t_${Date.now()}_${Math.random()}` }))
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [newTracer, setNewTracer] = useState<TracerConfig & { _id: string }>(emptyTracer());
  const [showTracerForm, setShowTracerForm] = useState(false);
  const [dirty, setDirty] = useState(false);

  function setD(key: keyof FrameworkData, val: any) {
    setData(d => ({ ...d, [key]: val }));
    setDirty(true);
  }

  function addTracer() {
    if (!newTracer.name.trim()) { notify('error', 'Tracer name is required.'); return; }
    setTracers(ts => [...ts, { ...newTracer, _id: `t_${Date.now()}` }]);
    setNewTracer(emptyTracer());
    setShowTracerForm(false);
    setDirty(true);
  }

  function removeTracer(id: string) {
    setTracers(ts => ts.filter(t => t._id !== id));
    setDirty(true);
  }

  function updateTracer(id: string, key: string, val: any) {
    setTracers(ts => ts.map(t => t._id === id ? { ...t, [key]: val } : t));
    setDirty(true);
  }

  function updateTracerFile(id: string, key: string, val: any) {
    setTracers(ts => ts.map(t => t._id === id ? { ...t, file: { ...t.file, [key]: val } } : t));
    setDirty(true);
  }

  function setNewT(key: string, val: any) {
    setNewTracer(t => ({ ...t, [key]: val }));
  }
  function setNewTFile(key: string, val: any) {
    setNewTracer(t => ({ ...t, file: { ...t.file, [key]: val } }));
  }

  function handleSave() {
    const saved: FrameworkData = {
      ...data,
      tracers: tracers.map(({ _id, ...rest }) => rest as TracerConfig),
      channelsGroups: typeof data.channelsGroups === 'string'
        ? (data.channelsGroups as any).split(',').map((s: string) => s.trim()).filter(Boolean)
        : data.channelsGroups,
      connectedEcus: typeof data.connectedEcus === 'string'
        ? (data.connectedEcus as any).split(',').map((s: string) => s.trim()).filter(Boolean)
        : data.connectedEcus,
    };
    dispatch({ type: 'UPDATE_FRAMEWORK', data: saved });
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
          <p style={{ ...T.pageSub, marginBottom: 0 }}>Configure publisher, tracers and diagnostics</p>
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
        <div style={T.grid2}>
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

      {/* Tracers */}
      <div style={T.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <p style={{ ...T.cardTitle, marginBottom: 0 }}>Tracers ({tracers.length})</p>
          <button style={T.btnSmall} onClick={() => setShowTracerForm(v => !v)}>
            {showTracerForm ? 'Cancel' : '+ Add Tracer'}
          </button>
        </div>

        {showTracerForm && (
          <div style={{ background: 'var(--vscode-input-background)', borderRadius: '6px', padding: '14px', marginBottom: '12px', border: '1px solid var(--vscode-panel-border, #3a3a3a)' }}>
            <p style={{ ...T.cardTitle, marginBottom: '12px' }}>New Tracer</p>
            <div style={T.grid2}>
              <div>
                <label style={T.label}>Name *</label>
                <input style={T.input} placeholder="TracerName" value={newTracer.name} onChange={e => setNewT('name', e.target.value)} />
              </div>
              <div>
                <label style={T.label}>Type</label>
                <select style={T.select} value={newTracer.tracerType} onChange={e => setNewT('tracerType', e.target.value)}>
                  {TRACER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={T.label}>Timestamp Mode</label>
                <select style={T.select} value={newTracer.timestampMode || 'Absolute'} onChange={e => setNewT('timestampMode', e.target.value)}>
                  {TIMESTAMP_MODES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={T.label}>Filter</label>
                <input style={T.input} placeholder="optional filter" value={newTracer.filter || ''} onChange={e => setNewT('filter', e.target.value)} />
              </div>
              {newTracer.tracerType === 'PCAP' ? (
                <>
                  <div>
                    <label style={T.label}>PCAP Interface</label>
                    <input style={T.input} placeholder="e.g. eth0" value={newTracer.pcapInterface || ''} onChange={e => setNewT('pcapInterface', e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px' }}>
                    <input type="checkbox" id="padding" checked={!!newTracer.ethernetPaddingActive} onChange={e => setNewT('ethernetPaddingActive', e.target.checked)} style={{ cursor: 'pointer' }} />
                    <label htmlFor="padding" style={{ ...T.label, marginBottom: 0, cursor: 'pointer' }}>Ethernet Padding Active</label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={T.label}>Line Separator</label>
                    <input style={T.input} placeholder="e.g. \\n" value={newTracer.asciiOutputLineSeparator || ''} onChange={e => setNewT('asciiOutputLineSeparator', e.target.value)} />
                  </div>
                  <div>
                    <label style={T.label}>Message Separator</label>
                    <input style={T.input} placeholder="e.g. ;" value={newTracer.asciiMsgTextSeparator || ''} onChange={e => setNewT('asciiMsgTextSeparator', e.target.value)} />
                  </div>
                </>
              )}
            </div>
            <div style={{ ...T.divider, margin: '10px 0' }} />
            <p style={{ ...T.label, marginBottom: '8px' }}>File Output</p>
            <div style={T.grid2}>
              <div>
                <label style={T.label}>Path</label>
                <input style={T.input} placeholder="./traces/output" value={newTracer.file?.path || ''} onChange={e => setNewTFile('path', e.target.value)} />
              </div>
              <div>
                <label style={T.label}>Split Size (MB)</label>
                <input style={T.input} type="number" placeholder="optional" value={newTracer.file?.splitSize ?? ''} onChange={e => setNewTFile('splitSize', e.target.value === '' ? undefined : Number(e.target.value))} />
              </div>
              <div>
                <label style={T.label}>Split Time (s)</label>
                <input style={T.input} type="number" placeholder="optional" value={newTracer.file?.splitTime ?? ''} onChange={e => setNewTFile('splitTime', e.target.value === '' ? undefined : Number(e.target.value))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px' }}>
                <input type="checkbox" id="cyclic" checked={!!newTracer.file?.cyclic} onChange={e => setNewTFile('cyclic', e.target.checked)} style={{ cursor: 'pointer' }} />
                <label htmlFor="cyclic" style={{ ...T.label, marginBottom: 0, cursor: 'pointer' }}>Cyclic</label>
              </div>
            </div>
            <div style={{ ...T.row, justifyContent: 'flex-end', marginTop: '12px' }}>
              <button style={T.btnSecondary} onClick={() => setShowTracerForm(false)}>Cancel</button>
              <button style={T.btnPrimary} onClick={addTracer}>Add Tracer</button>
            </div>
          </div>
        )}

        {tracers.length === 0 && !showTracerForm && (
          <div style={T.empty}>No tracers configured.</div>
        )}

        {tracers.map(t => (
          <div key={t._id} style={{ border: '1px solid var(--vscode-panel-border, #3a3a3a)', borderRadius: '6px', marginBottom: '8px', overflow: 'hidden' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--vscode-input-background)', cursor: 'pointer' }}
              onClick={() => setEditing(editing === t._id ? null : t._id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge label={t.tracerType} color={t.tracerType === 'PCAP' ? '#4ec9b0' : '#dcb67a'} />
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{t.name || '(unnamed)'}</span>
                {t.file?.path && <span style={{ fontSize: '11px', opacity: 0.45 }}>{t.file.path}</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ opacity: 0.5, fontSize: '12px' }}>{editing === t._id ? '▲' : '▼'}</span>
                <button style={T.btnDanger} onClick={e => { e.stopPropagation(); removeTracer(t._id); }}>Remove</button>
              </div>
            </div>
            {editing === t._id && (
              <div style={{ padding: '14px', background: 'var(--vscode-editorWidget-background)' }}>
                <div style={T.grid2}>
                  <div>
                    <label style={T.label}>Name</label>
                    <input style={T.input} value={t.name} onChange={e => updateTracer(t._id, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label style={T.label}>Timestamp Mode</label>
                    <select style={T.select} value={t.timestampMode || 'Absolute'} onChange={e => updateTracer(t._id, 'timestampMode', e.target.value)}>
                      {TIMESTAMP_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={T.label}>Filter</label>
                    <input style={T.input} value={t.filter || ''} onChange={e => updateTracer(t._id, 'filter', e.target.value)} />
                  </div>
                  <div>
                    <label style={T.label}>File Path</label>
                    <input style={T.input} value={t.file?.path || ''} onChange={e => updateTracerFile(t._id, 'path', e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ethernet Config */}
      <div style={T.card}>
        <p style={T.cardTitle}>Ethernet Configuration (optional)</p>
        <div style={T.grid2}>
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
