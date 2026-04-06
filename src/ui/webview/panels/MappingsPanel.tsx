import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { CHANNEL_COLORS, LOGICAL_SUBCLASS_OPTIONS } from '../types';
import { T, Badge, SectionHeader } from '../components/shared';
import { ConfirmModal } from '../components/ConfirmModal';

const OPERATION_MODES = ['Active', 'Passive', 'Monitor'];
const NODE_TYPES = ['ColdStartNode', 'WakeupNode', 'SyncNode'];
const BTS_FUNCTIONS = ['None', 'Relay', 'Potentiometer', 'ElectronicLoad', 'GNDSwitch', 'VBATSwitch', 'VoltageGenerator'];
const BTS_MEASUREMENT_ATTRS = ['Voltage', 'Current', 'PWM'];

export default function MappingsPanel() {
  const { state, send, notify } = useApp();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const removingMapping = state.mappings.find(m => m.mappingId === removingId);
  const removingLc = removingMapping
    ? state.logicalChannels.find(c => c.id === removingMapping.logicalChannelId)
    : null;
  const removingHw = removingMapping
    ? state.hardwareChannels.find(h => h.id === removingMapping.hardwareChannelId)
    : null;

  const [form, setForm] = useState({
    logicalId: '',
    hardwareId: '',
    hwChannel: '',
    operationMode: '',
    keySlot: '',
    nodeType: '',
    wakeUpCluster: false,
    // BTS-REVO fields
    measurementAttribute: '',
    btsFunction: '',
    lineContactState: false,
    gndContactState: false,
    vbatContactState: false,
    staticChannel: false,
    initValue: '',
    channelType: '',
    pwmWindowTime: '',
    // BTS measurement/subscription config
    measurementConfigRaw: '',       // comma-separated IDs
    subId: '',
    subType: '',
    subIsPeriodic: false,
    subPolling: '',
    subUpperThreshold: '',
    subLowerThreshold: '',
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

  function getHardwareSubclass(id: string) {
    const hw = state.hardwareChannels.find(h => h.id === id);
    return hw?.subclass ?? '';
  }

  const isFlexRay = getLogicalCategory(form.logicalId) === 'FLEXRAY';
  const isBTS = getHardwareSubclass(form.hardwareId) === 'BTSRevo';

  function handleAdd() {
    if (!form.logicalId) { notify('error', 'Please select a logical channel.'); return; }
    if (!form.hardwareId) { notify('error', 'Please select a hardware channel.'); return; }
    send('addMapping', {
      logicalChannelId: form.logicalId,
      hardwareChannelId: form.hardwareId,
      configurationId: state.currentConfigId,
      params: {
        hwChannel: form.hwChannel ? Number(form.hwChannel) : undefined,
        operationMode: form.operationMode || undefined,
        keySlot: form.keySlot ? Number(form.keySlot) : undefined,
        nodeType: isFlexRay ? (form.nodeType || undefined) : undefined,
        wakeUpCluster: isFlexRay ? form.wakeUpCluster : undefined,
        measurementAttribute: isBTS ? (form.measurementAttribute || undefined) : undefined,
        btsFunction: isBTS ? (form.btsFunction || undefined) : undefined,
        lineContactState: isBTS ? form.lineContactState : undefined,
        gndContactState: isBTS ? form.gndContactState : undefined,
        vbatContactState: isBTS ? form.vbatContactState : undefined,
        staticChannel: isBTS ? form.staticChannel : undefined,
        initValue: isBTS ? (form.initValue || undefined) : undefined,
        channelType: isBTS ? (form.channelType || undefined) : undefined,
        pwmWindowTime: isBTS && form.pwmWindowTime ? Number(form.pwmWindowTime) : undefined,
        measurementConfig: isBTS && form.measurementConfigRaw
          ? form.measurementConfigRaw.split(',').map(s => s.trim()).filter(Boolean)
          : undefined,
        subscriptionConfig: isBTS && (form.subId || form.subType) ? {
          ID: form.subId || undefined,
          Type: form.subType || undefined,
          IsPeriodic: form.subIsPeriodic,
          Polling: form.subPolling ? Number(form.subPolling) : undefined,
          UpperThreshold: form.subUpperThreshold ? Number(form.subUpperThreshold) : undefined,
          LowerThreshold: form.subLowerThreshold ? Number(form.subLowerThreshold) : undefined,
        } : undefined,
      },
    });
    setForm({ logicalId: '', hardwareId: '', hwChannel: '', operationMode: '', keySlot: '', nodeType: '', wakeUpCluster: false, measurementAttribute: '', btsFunction: '', lineContactState: false, gndContactState: false, vbatContactState: false, staticChannel: false, initValue: '', channelType: '', pwmWindowTime: '', measurementConfigRaw: '', subId: '', subType: '', subIsPeriodic: false, subPolling: '', subUpperThreshold: '', subLowerThreshold: '' });
    setShowForm(false);
  }

  function getLabel(ch: { subclass?: string; category?: string; name: string }) {
    return ch.subclass || ch.category || '';
  }

  return (
    <div>
      <ConfirmModal
        open={!!removingId}
        title="Remove this mapping?"
        message={
          removingLc && removingHw
            ? `The mapping between "${removingLc.name}" and "${removingHw.name}" will be removed.`
            : 'This mapping will be permanently removed.'
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (removingId) send('removeMapping', { mappingId: removingId });
          setRemovingId(null);
        }}
        onCancel={() => setRemovingId(null)}
      />

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
        <div className="ccm-form-card" style={{ ...T.cardAccent, marginBottom: '20px' }}>
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
            {isBTS && (
              <>
                <div>
                  <label style={T.label}>Measurement Attribute *</label>
                  <select style={T.select} value={form.measurementAttribute} onChange={e => setF('measurementAttribute', e.target.value)}>
                    <option value="">-- Select --</option>
                    {BTS_MEASUREMENT_ATTRS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={T.label}>Function *</label>
                  <select style={T.select} value={form.btsFunction} onChange={e => setF('btsFunction', e.target.value)}>
                    <option value="">-- Select --</option>
                    {BTS_FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label style={T.label}>Init Value</label>
                  <input style={T.input} placeholder="" value={form.initValue} onChange={e => setF('initValue', e.target.value)} />
                </div>
                <div>
                  <label style={T.label}>Channel Type</label>
                  <input style={T.input} placeholder="e.g. HC" value={form.channelType} onChange={e => setF('channelType', e.target.value)} />
                </div>
                <div>
                  <label style={T.label}>PWM Window Time (ms)</label>
                  <input style={T.input} type="number" placeholder="e.g. 200" value={form.pwmWindowTime} onChange={e => setF('pwmWindowTime', e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '12px', gridColumn: '1 / -1' }}>
                  {([
                    { id: 'lineContactState', label: 'Line Contact State (Open Load)' },
                    { id: 'gndContactState',  label: 'GND Contact State (Short to GND)' },
                    { id: 'vbatContactState', label: 'VBAT Contact State' },
                    { id: 'staticChannel',    label: 'Static Channel' },
                  ] as const).map(({ id, label }) => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="checkbox" id={id} checked={form[id] as boolean} onChange={e => setF(id, e.target.checked)} style={{ cursor: 'pointer' }} />
                      <label htmlFor={id} style={{ ...T.label, marginBottom: 0, cursor: 'pointer' }}>{label}</label>
                    </div>
                  ))}
                </div>
                {/* Measurement Config */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={T.label}>Measurement Config IDs (comma-separated)</label>
                  <input style={T.input} placeholder="e.g. cfg1, cfg2" value={form.measurementConfigRaw} onChange={e => setF('measurementConfigRaw', e.target.value)} />
                </div>
                {/* Subscription Config */}
                <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                  <p style={{ ...T.cardTitle, marginBottom: '8px' }}>Subscription Config (optional)</p>
                  <div style={T.grid2}>
                    <div>
                      <label style={T.label}>ID</label>
                      <input style={T.input} placeholder="" value={form.subId} onChange={e => setF('subId', e.target.value)} />
                    </div>
                    <div>
                      <label style={T.label}>Type (Measurement Attribute)</label>
                      <select style={T.select} value={form.subType} onChange={e => setF('subType', e.target.value)}>
                        <option value="">-- None --</option>
                        {BTS_MEASUREMENT_ATTRS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={T.label}>Upper Threshold</label>
                      <input style={T.input} type="number" placeholder="" value={form.subUpperThreshold} onChange={e => setF('subUpperThreshold', e.target.value)} />
                    </div>
                    <div>
                      <label style={T.label}>Lower Threshold</label>
                      <input style={T.input} type="number" placeholder="" value={form.subLowerThreshold} onChange={e => setF('subLowerThreshold', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                      <input type="checkbox" id="subIsPeriodic" checked={form.subIsPeriodic} onChange={e => setF('subIsPeriodic', e.target.checked)} style={{ cursor: 'pointer' }} />
                      <label htmlFor="subIsPeriodic" style={{ ...T.label, marginBottom: 0, cursor: 'pointer' }}>Is Periodic</label>
                    </div>
                    {form.subIsPeriodic && (
                      <div>
                        <label style={T.label}>Polling (ms)</label>
                        <select style={T.select} value={form.subPolling} onChange={e => setF('subPolling', e.target.value)}>
                          <option value="">-- Select --</option>
                          {[5, 10, 25, 50, 100, 250, 500, 1000].map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
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
                  onClick={() => setRemovingId(m.mappingId)}
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
