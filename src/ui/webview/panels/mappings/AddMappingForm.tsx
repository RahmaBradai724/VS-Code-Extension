import React from 'react';
import { T } from '../../components/shared';

const OPERATION_MODES = ['Normal', 'Spy', 'TxOnly', 'RxOnly'];
const NODE_TYPES = ['ColdStartFollowing', 'ColdStartLeading', 'NonColdStartNonSync', 'NonColdStartSync'];
const BTS_FUNCTIONS = ['None', 'Relay', 'Potentiometer', 'ElectronicLoad', 'GNDSwitch', 'VBATSwitch', 'VoltageGenerator'];
const BTS_MEASUREMENT_ATTRS = ['Voltage', 'Current', 'PWM'];

type MappingForm = {
  logicalId: string;
  hardwareId: string;
  hwChannel: string;
  operationMode: string;
  keySlot: string;
  nodeType: string;
  wakeUpCluster: boolean;
  measurementAttribute: string;
  btsFunction: string;
  lineContactState: boolean;
  gndContactState: boolean;
  vbatContactState: boolean;
  staticChannel: boolean;
  initValue: string;
  channelType: string;
  pwmWindowTime: string;
  measurementConfigRaw: string;
  subId: string;
  subType: string;
  subIsPeriodic: boolean;
  subPolling: string;
  subUpperThreshold: string;
  subLowerThreshold: string;
};

interface Props {
  form: MappingForm;
  logicalChannels: any[];
  hardwareChannels: any[];
  isFlexRay: boolean;
  isBTS: boolean;
  setF: (key: string, val: any) => void;
  handleAdd: () => void;
  onCancel: () => void;
}

export function AddMappingForm({ form, logicalChannels, hardwareChannels, isFlexRay, isBTS, setF, handleAdd, onCancel }: Props) {
  return (
    <div className="ccm-form-card" style={{ ...T.cardAccent, marginBottom: '20px' }}>
      <p style={T.cardTitle}>New Channel Mapping</p>
      <div className="ccm-grid2" style={T.grid2}>
        <div>
          <label style={T.label}>Logical Channel *</label>
          <select style={T.select} value={form.logicalId} onChange={e => setF('logicalId', e.target.value)}>
            <option value="">-- Select Logical --</option>
            {logicalChannels.map(ch => (
              <option key={ch.id} value={ch.id}>{ch.name} ({ch.category})</option>
            ))}
          </select>
        </div>
        <div>
          <label style={T.label}>Hardware Channel *</label>
          <select style={T.select} value={form.hardwareId} onChange={e => setF('hardwareId', e.target.value)}>
            <option value="">-- Select Hardware --</option>
            {hardwareChannels.map(hw => (
              <option key={hw.id} value={hw.id}>{hw.name} ({hw.subclass})</option>
            ))}
          </select>
        </div>
        <div>
          <label style={T.label}>HW Channel (CM Web Interface ID)</label>
          <input style={T.input} placeholder="e.g. 619" value={form.hwChannel} onChange={e => setF('hwChannel', e.target.value)} />
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
              <div className="ccm-grid2" style={T.grid2}>
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
        <button style={T.btnSecondary} onClick={onCancel}>Cancel</button>
        <button style={T.btnPrimary} onClick={handleAdd}>Add Mapping</button>
      </div>
    </div>
  );
}
