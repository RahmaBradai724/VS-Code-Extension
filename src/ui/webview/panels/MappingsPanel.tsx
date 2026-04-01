import React, { useState } from 'react';
import { useApp } from '../App';
import { CHANNEL_COLORS, LOGICAL_SUBCLASS_OPTIONS } from '../types';
import { T, Badge, SectionHeader } from '../components/shared';

const OPERATION_MODES = ['Active', 'Passive', 'Monitor'];
const NODE_TYPES = ['ColdStartNode', 'WakeupNode', 'SyncNode'];

export default function MappingsPanel() {
  const { state, send, notify } = useApp();

  const [form, setForm] = useState({
    logicalId: '',
    hardwareId: '',
    hwChannel: '',
    operationMode: '',
    keySlot: '',
    nodeType: '',
    wakeUpCluster: false,
  });
  const [showForm, setShowForm] = useState(false);

  function setF(key: string, val: any) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function getLogicalCategory(id: string) {
    const ch = state.logicalChannels.find(c => c.id === id);
    if (!ch) return '';
    return ch.category;
  }

  const isFlexRay = getLogicalCategory(form.logicalId) === 'FLEXRAY';

  function handleAdd() {
    if (!form.logicalId) { notify('error', 'Please select a logical channel.'); return; }
    if (!form.hardwareId) { notify('error', 'Please select a hardware channel.'); return; }
    send('addMapping', {
      logicalChannelId: form.logicalId,
      hardwareChannelId: form.hardwareId,
      configurationId: state.currentConfigId,
      params: {
        hwChannel: form.hwChannel || undefined,
        operationMode: form.operationMode || undefined,
        keySlot: form.keySlot ? Number(form.keySlot) : undefined,
        nodeType: isFlexRay ? (form.nodeType || undefined) : undefined,
        wakeUpCluster: isFlexRay ? form.wakeUpCluster : undefined,
      },
    });
    setForm({ logicalId: '', hardwareId: '', hwChannel: '', operationMode: '', keySlot: '', nodeType: '', wakeUpCluster: false });
    setShowForm(false);
  }

  function getLabel(ch: { subclass?: string; category?: string; name: string }) {
    return ch.subclass || ch.category || '';
  }

  return (
    <div>
      <SectionHeader
        title="Mappings"
        count={state.mappings.length}
        action={
          <button style={T.btnPrimary} onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Cancel' : '+ Add Mapping'}
          </button>
        }
      />

      {showForm && (
        <div style={{ ...T.card, borderColor: 'var(--vscode-button-background)' }}>
          <p style={T.cardTitle}>New Channel Mapping</p>
          <div style={T.grid2}>
            <div>
              <label style={T.label}>Logical Channel *</label>
              <select style={T.select} value={form.logicalId} onChange={e => setF('logicalId', e.target.value)}>
                <option value="">-- Select Logical --</option>
                {state.logicalChannels.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.name} ({ch.category})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={T.label}>Hardware Channel *</label>
              <select style={T.select} value={form.hardwareId} onChange={e => setF('hardwareId', e.target.value)}>
                <option value="">-- Select Hardware --</option>
                {state.hardwareChannels.map(hw => (
                  <option key={hw.id} value={hw.id}>{hw.name} ({hw.subclass})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={T.label}>HW Channel</label>
              <input style={T.input} placeholder="e.g. 1" value={form.hwChannel} onChange={e => setF('hwChannel', e.target.value)} />
            </div>
            <div>
              <label style={T.label}>Operation Mode</label>
              <select style={T.select} value={form.operationMode} onChange={e => setF('operationMode', e.target.value)}>
                <option value="">-- None --</option>
                {OPERATION_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {isFlexRay && (
              <>
                <div>
                  <label style={T.label}>Key Slot (FlexRay)</label>
                  <input style={T.input} type="number" placeholder="e.g. 1" value={form.keySlot} onChange={e => setF('keySlot', e.target.value)} />
                </div>
                <div>
                  <label style={T.label}>Node Type (FlexRay)</label>
                  <select style={T.select} value={form.nodeType} onChange={e => setF('nodeType', e.target.value)}>
                    <option value="">-- None --</option>
                    {NODE_TYPES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <input type="checkbox" id="wakeUpCluster" checked={form.wakeUpCluster} onChange={e => setF('wakeUpCluster', e.target.checked)} style={{ cursor: 'pointer' }} />
                  <label htmlFor="wakeUpCluster" style={{ ...T.label, marginBottom: 0, cursor: 'pointer' }}>Wake-Up Cluster</label>
                </div>
              </>
            )}
          </div>

          <div style={{ ...T.divider, marginTop: '16px' }} />
          <div style={{ ...T.row, justifyContent: 'flex-end' }}>
            <button style={T.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
            <button style={T.btnPrimary} onClick={handleAdd}>Add Mapping</button>
          </div>
        </div>
      )}

      {state.mappings.length === 0 ? (
        <div style={T.empty}>No mappings yet. Add one above.</div>
      ) : (
        <div>
          {state.mappings.map(m => {
            const lc = state.logicalChannels.find(c => c.id === m.logicalChannelId);
            const hw = state.hardwareChannels.find(h => h.id === m.hardwareChannelId);
            const lcColor = CHANNEL_COLORS[lc?.category ?? ''] ?? '#888';
            const lcLabel = LOGICAL_SUBCLASS_OPTIONS.find(o => o.value === lc?.subclass)?.label ?? lc?.category ?? 'Unknown';

            return (
              <div
                key={m.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--vscode-editorWidget-background)',
                  border: '1px solid var(--vscode-panel-border, #3a3a3a)',
                  borderRadius: '7px', marginBottom: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Badge label={lcLabel} color={lcColor} />
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{lc?.name ?? m.logicalChannelId}</span>
                    </div>
                    <span style={{ fontSize: '11px', opacity: 0.45 }}>Logical</span>
                  </div>
                  <span style={{ fontSize: '18px', opacity: 0.5 }}>→</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Badge label={hw?.subclass ?? 'Hardware'} color="#9cdcfe" />
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{hw?.name ?? m.hardwareChannelId}</span>
                    </div>
                    <span style={{ fontSize: '11px', opacity: 0.45 }}>
                      {[m.hwChannel && `ch: ${m.hwChannel}`, m.operationMode].filter(Boolean).join(' • ')}
                    </span>
                  </div>
                </div>
                <button
                  style={T.btnDanger}
                  onClick={() => send('removeMapping', { mappingId: m.id })}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
