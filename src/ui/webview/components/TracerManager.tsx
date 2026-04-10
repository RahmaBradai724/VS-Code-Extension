import React, { useState, useEffect } from 'react';
import { TracerConfig } from '../types';
import { T, Badge } from './shared';

const TIMESTAMP_OPTIONS = ['Microsecond', 'Nanosecond'];
const LOGGING_TYPES = ['MultipleAdapterMode', 'PerformanceMode', 'StandardMode'];
const BASE_OPTIONS = ['Hex', 'Decimal'];
const TIMESTAMP_SETTINGS = ['Absolute', 'Relative'];
const EXTENSIONS_PCAP = ['.pcap', '.pcapng', '.pcapng.zst'];
const EXTENSIONS_ASCII = ['.asc', '.blf', '.csv'];

type TracerWithId = TracerConfig & { _id: string };

function emptyTracer(): TracerWithId {
  return {
    _id: `t_${Date.now()}_${Math.random()}`,
    name: '',
    Type: 'PCAP',
    Timestamp: 'Microsecond',
    LoggingType: 'MultipleAdapterMode',
    LoggerConfiguration: {
      FileConfig: { BaseFileName: '', Extension: '.pcapng', MaxFileSize: undefined, MaxFile: undefined },
      BufferConfig: { BufferSize: undefined },
    },
  };
}

interface Props {
  tracers: TracerWithId[];
  onChange: (tracers: TracerWithId[]) => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
  /** Tracer names referenced by logical channels but not yet configured */
  suggestedNames?: string[];
  /** When set, opens the add-form pre-filled with this name */
  preselectName?: string | null;
  onPreselectConsumed?: () => void;
}

export default function TracerManager({ tracers, onChange, onNotify, suggestedNames = [], preselectName, onPreselectConsumed }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newTracer, setNewTracer] = useState<TracerWithId>(emptyTracer());
  const [useCustomName, setUseCustomName] = useState(false);

  // Open form pre-filled when parent requests a specific name
  useEffect(() => {
    if (preselectName) {
      setNewTracer({ ...emptyTracer(), name: preselectName });
      setUseCustomName(false);
      setShowForm(true);
      onPreselectConsumed?.();
    }
  }, [preselectName]); // eslint-disable-line react-hooks/exhaustive-deps

  // â”€â”€ Helpers for newTracer form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function setNT(key: keyof TracerConfig, val: any) {
    setNewTracer(t => ({ ...t, [key]: val }));
  }
  function setNTFile(key: string, val: any) {
    setNewTracer(t => ({
      ...t,
      LoggerConfiguration: {
        ...t.LoggerConfiguration,
        FileConfig: { ...t.LoggerConfiguration?.FileConfig, [key]: val },
      },
    }));
  }
  function setNTBuffer(key: string, val: any) {
    setNewTracer(t => ({
      ...t,
      LoggerConfiguration: {
        ...t.LoggerConfiguration,
        BufferConfig: { ...t.LoggerConfiguration?.BufferConfig, [key]: val },
      },
    }));
  }

  // â”€â”€ Helpers for existing tracer edit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function update(id: string, key: keyof TracerConfig, val: any) {
    onChange(tracers.map(t => t._id === id ? { ...t, [key]: val } : t));
  }
  function updateFile(id: string, key: string, val: any) {
    onChange(tracers.map(t => t._id === id ? {
      ...t,
      LoggerConfiguration: {
        ...t.LoggerConfiguration,
        FileConfig: { ...t.LoggerConfiguration?.FileConfig, [key]: val },
      },
    } : t));
  }
  function updateBuffer(id: string, key: string, val: any) {
    onChange(tracers.map(t => t._id === id ? {
      ...t,
      LoggerConfiguration: {
        ...t.LoggerConfiguration,
        BufferConfig: { ...t.LoggerConfiguration?.BufferConfig, [key]: val },
      },
    } : t));
  }

  function addTracer() {
    if (!newTracer.name.trim()) { onNotify('error', 'Tracer name is required.'); return; }
    if (tracers.some(t => t.name === newTracer.name.trim())) {
      onNotify('error', 'A tracer with this name already exists.'); return;
    }
    onChange([...tracers, { ...newTracer, name: newTracer.name.trim(), _id: `t_${Date.now()}` }]);
    setNewTracer(emptyTracer());
    setShowForm(false);
  }

  function removeTracer(id: string) {
    onChange(tracers.filter(t => t._id !== id));
  }

  // â”€â”€ Shared form fields renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function renderPcapFields(t: TracerWithId, isNew: boolean) {
    const fc = t.LoggerConfiguration?.FileConfig;
    const bc = t.LoggerConfiguration?.BufferConfig;
    const isPerfMode = t.LoggingType === 'PerformanceMode';
    const isZst = fc?.Extension === '.pcapng.zst';
    const setF = isNew ? setNTFile : (key: string, val: any) => updateFile(t._id, key, val);
    const setB = isNew ? setNTBuffer : (key: string, val: any) => updateBuffer(t._id, key, val);
    const setT = isNew ? (k: keyof TracerConfig, v: any) => setNT(k, v) : (k: keyof TracerConfig, v: any) => update(t._id, k, v);

    return (
      <>
        <div>
          <label style={T.label}>Logging Type</label>
          <select style={T.select} value={t.LoggingType || 'MultipleAdapterMode'} onChange={e => setT('LoggingType', e.target.value)}>
            {LOGGING_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div style={{ ...T.divider, gridColumn: '1 / -1', margin: '4px 0' }} />
        <p style={{ ...T.label, gridColumn: '1 / -1', marginBottom: 0, fontWeight: 600 }}>File Config</p>

        <div>
          <label style={T.label}>Base File Name</label>
          <input style={T.input} placeholder="e.g. trace_eth_1" value={fc?.BaseFileName || ''} onChange={e => setF('BaseFileName', e.target.value)} />
        </div>
        <div>
          <label style={T.label}>Extension</label>
          <select style={T.select} value={fc?.Extension || '.pcapng'} onChange={e => setF('Extension', e.target.value)}>
            {EXTENSIONS_PCAP.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        {isZst && t.LoggingType === 'MultipleAdapterMode' && (
          <div>
            <label style={T.label}>Compression Level</label>
            <input style={T.input} type="number" min={1} max={9} placeholder="1-9" value={fc?.CompressionLevel ?? ''} onChange={e => setF('CompressionLevel', e.target.value === '' ? undefined : Number(e.target.value))} />
          </div>
        )}
        <div>
          <label style={T.label}>Max File Size (MB)</label>
          <input style={T.input} type="number" placeholder="optional" value={fc?.MaxFileSize ?? ''} onChange={e => setF('MaxFileSize', e.target.value === '' ? undefined : Number(e.target.value))} />
        </div>
        <div>
          <label style={T.label}>Max Files</label>
          <input style={T.input} type="number" placeholder="optional" value={fc?.MaxFile ?? ''} onChange={e => setF('MaxFile', e.target.value === '' ? undefined : Number(e.target.value))} />
        </div>

        <div style={{ ...T.divider, gridColumn: '1 / -1', margin: '4px 0' }} />
        <p style={{ ...T.label, gridColumn: '1 / -1', marginBottom: 0, fontWeight: 600 }}>Buffer Config</p>

        <div>
          <label style={T.label}>Buffer Size</label>
          <input style={T.input} type="number" placeholder="e.g. 200" value={bc?.BufferSize ?? ''} onChange={e => setB('BufferSize', e.target.value === '' ? undefined : Number(e.target.value))} />
        </div>
        {isPerfMode && (
          <>
            <div>
              <label style={T.label}>Buffer Number</label>
              <input style={T.input} type="number" placeholder="e.g. 4" value={bc?.BufferNumber ?? ''} onChange={e => setB('BufferNumber', e.target.value === '' ? undefined : Number(e.target.value))} />
            </div>
            <div>
              <label style={T.label}>Write Burst Size</label>
              <input style={T.input} type="number" placeholder="e.g. 128" value={bc?.WriteBurstSize ?? ''} onChange={e => setB('WriteBurstSize', e.target.value === '' ? undefined : Number(e.target.value))} />
            </div>
          </>
        )}
      </>
    );
  }

  function renderAsciiFields(t: TracerWithId, isNew: boolean) {
    const fc = t.LoggerConfiguration?.FileConfig;
    const setF = isNew ? setNTFile : (key: string, val: any) => updateFile(t._id, key, val);
    const setT = isNew ? (k: keyof TracerConfig, v: any) => setNT(k, v) : (k: keyof TracerConfig, v: any) => update(t._id, k, v);

    return (
      <>
        <div>
          <label style={T.label}>Base</label>
          <select style={T.select} value={t.Base || 'Hex'} onChange={e => setT('Base', e.target.value)}>
            {BASE_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label style={T.label}>Timestamp Setting</label>
          <select style={T.select} value={t.TimeStampSetting || 'Absolute'} onChange={e => setT('TimeStampSetting', e.target.value)}>
            {TIMESTAMP_SETTINGS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px' }}>
          <input
            type="checkbox"
            id={isNew ? 'new-iel' : `iel-${t._id}`}
            checked={!!t.InternalEventLogged}
            onChange={e => setT('InternalEventLogged', e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <label htmlFor={isNew ? 'new-iel' : `iel-${t._id}`} style={{ ...T.label, marginBottom: 0, cursor: 'pointer' }}>Internal Event Logged</label>
        </div>

        <div style={{ ...T.divider, gridColumn: '1 / -1', margin: '4px 0' }} />
        <p style={{ ...T.label, gridColumn: '1 / -1', marginBottom: 0, fontWeight: 600 }}>File Config</p>

        <div>
          <label style={T.label}>Base File Name</label>
          <input style={T.input} placeholder="e.g. can_trace" value={fc?.BaseFileName || ''} onChange={e => setF('BaseFileName', e.target.value)} />
        </div>
        <div>
          <label style={T.label}>Extension</label>
          <select style={T.select} value={fc?.Extension || '.asc'} onChange={e => setF('Extension', e.target.value)}>
            {EXTENSIONS_ASCII.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label style={T.label}>Max File Size (MB)</label>
          <input style={T.input} type="number" placeholder="e.g. 200" value={fc?.MaxFileSize ?? ''} onChange={e => setF('MaxFileSize', e.target.value === '' ? undefined : Number(e.target.value))} />
        </div>
        <div>
          <label style={T.label}>Max Files</label>
          <input style={T.input} type="number" placeholder="e.g. 150" value={fc?.MaxFile ?? ''} onChange={e => setF('MaxFile', e.target.value === '' ? undefined : Number(e.target.value))} />
        </div>
      </>
    );
  }

  return (
    <div style={T.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p style={{ ...T.cardTitle, marginBottom: 0 }}>Tracers ({tracers.length})</p>
        <button style={T.btnSmall} onClick={() => { setShowForm(v => !v); setNewTracer(emptyTracer()); setUseCustomName(false); }}>
          {showForm ? 'Cancel' : '+ Add Tracer'}
        </button>
      </div>

      {/* â”€â”€ Add form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showForm && (
        <div style={{ background: 'var(--vscode-input-background)', borderRadius: '6px', padding: '14px', marginBottom: '12px', border: '1px solid var(--vscode-panel-border, #3a3a3a)' }}>
          <p style={{ ...T.cardTitle, marginBottom: '12px' }}>New Tracer</p>
          <div style={T.grid2}>
            <div style={{ gridColumn: suggestedNames.length > 0 && !useCustomName ? undefined : undefined }}>
              <label style={T.label}>Name *</label>
              {suggestedNames.length > 0 && !useCustomName ? (
                <select
                  style={T.select}
                  value={newTracer.name}
                  onChange={e => {
                    if (e.target.value === '__custom__') { setUseCustomName(true); setNT('name', ''); }
                    else { setNT('name', e.target.value); }
                  }}
                >
                  <option value="">— select a tracer name —</option>
                  {suggestedNames.map(n => <option key={n} value={n}>{n}</option>)}
                  <option value="__custom__">Other (custom)…</option>
                </select>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input style={{ ...T.input, flex: 1 }} placeholder="e.g. PCAP_Tracer_ETH" value={newTracer.name} onChange={e => setNT('name', e.target.value)} />
                  {suggestedNames.length > 0 && (
                    <button style={{ ...T.btnSecondary, padding: '4px 8px', fontSize: '11px' }} onClick={() => { setUseCustomName(false); setNT('name', ''); }}>↩ List</button>
                  )}
                </div>
              )}
            </div>
            <div>
              <label style={T.label}>Type</label>
              <select style={T.select} value={newTracer.Type} onChange={e => {
                const type = e.target.value as 'PCAP' | 'ASCII';
                setNewTracer(emptyTracer());
                setNewTracer(t => ({ ...t, Type: type }));
              }}>
                <option value="PCAP">PCAP</option>
                <option value="ASCII">ASCII</option>
              </select>
            </div>
            <div>
              <label style={T.label}>Timestamp</label>
              <select style={T.select} value={newTracer.Timestamp || 'Microsecond'} onChange={e => setNT('Timestamp', e.target.value)}>
                {TIMESTAMP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div />
            {newTracer.Type === 'PCAP'
              ? renderPcapFields(newTracer, true)
              : renderAsciiFields(newTracer, true)
            }
          </div>
          <div style={{ ...T.row, justifyContent: 'flex-end', marginTop: '12px' }}>
            <button style={T.btnSecondary} onClick={() => { setShowForm(false); setUseCustomName(false); }}>Cancel</button>
            <button style={T.btnPrimary} onClick={addTracer}>Add Tracer</button>
          </div>
        </div>
      )}

      {tracers.length === 0 && !showForm && (
        <div style={T.empty}>No tracers configured. Click "+ Add Tracer" to get started.</div>
      )}

      {/* â”€â”€ Tracer list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {tracers.map(t => (
        <div key={t._id} style={{ border: '1px solid var(--vscode-panel-border, #3a3a3a)', borderRadius: '6px', marginBottom: '8px', overflow: 'hidden' }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--vscode-input-background)', cursor: 'pointer' }}
            onClick={() => setEditing(editing === t._id ? null : t._id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge label={t.Type} color={t.Type === 'PCAP' ? '#4ec9b0' : '#dcb67a'} />
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{t.name || '(unnamed)'}</span>
              {t.LoggingType && <span style={{ fontSize: '11px', opacity: 0.45 }}>{t.LoggingType}</span>}
              {t.LoggerConfiguration?.FileConfig?.BaseFileName && (
                <span style={{ fontSize: '11px', opacity: 0.35 }}>{t.LoggerConfiguration.FileConfig.BaseFileName}{t.LoggerConfiguration.FileConfig.Extension}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ opacity: 0.5, fontSize: '12px' }}>{editing === t._id ? 'â–²' : 'â–¼'}</span>
              <button style={T.btnDanger} onClick={e => { e.stopPropagation(); removeTracer(t._id); }}>Remove</button>
            </div>
          </div>

          {editing === t._id && (
            <div style={{ padding: '14px', background: 'var(--vscode-editorWidget-background)' }}>
              <div style={T.grid2}>
                <div>
                  <label style={T.label}>Name</label>
                  <input style={T.input} value={t.name} onChange={e => update(t._id, 'name', e.target.value)} />
                </div>
                <div>
                  <label style={T.label}>Type</label>
                  <select style={T.select} value={t.Type} onChange={e => update(t._id, 'Type', e.target.value as 'PCAP' | 'ASCII')}>
                    <option value="PCAP">PCAP</option>
                    <option value="ASCII">ASCII</option>
                  </select>
                </div>
                <div>
                  <label style={T.label}>Timestamp</label>
                  <select style={T.select} value={t.Timestamp || 'Microsecond'} onChange={e => update(t._id, 'Timestamp', e.target.value)}>
                    {TIMESTAMP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div />
                {t.Type === 'PCAP'
                  ? renderPcapFields(t, false)
                  : renderAsciiFields(t, false)
                }
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
