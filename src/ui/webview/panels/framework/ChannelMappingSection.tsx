import React from 'react';
import { T } from '../../components/shared';
import { CardRow, AddBtn, SUB_TITLE } from './shared';

interface Props {
  ctEcuEntries: [string, string[] | string][];
  setCtEcuEntries: (entries: [string, string[] | string][]) => void;
  logicalChannelNames: string[];
}

export function ChannelMappingSection({ ctEcuEntries, setCtEcuEntries, logicalChannelNames }: Props) {
  return (
    <div id="fw-channelToEcusMapping" style={{ ...T.card, marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <p style={{ ...SUB_TITLE, marginBottom: 0 }}>ChannelToEcusMapping</p>
        <AddBtn onClick={() => setCtEcuEntries([...ctEcuEntries, ['', []]])} label="+ Add Mapping" />
      </div>
      {ctEcuEntries.map(([ch, ecus], idx) => (
        <CardRow key={idx} onRemove={() => setCtEcuEntries(ctEcuEntries.filter((_: any, i: number) => i !== idx))}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={T.label}>Channel Name</label>
              <select style={T.input} value={ch}
                onChange={e => { const l = [...ctEcuEntries] as [string, string[] | string][]; l[idx] = [e.target.value, ecus]; setCtEcuEntries(l); }}>
                <option value="">-- select channel --</option>
                {logicalChannelNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={T.label}>ECUs (comma-separated)</label>
              <input style={T.input} placeholder="ECU1, ECU2"
                value={Array.isArray(ecus) ? ecus.join(', ') : (ecus || '')}
                onChange={e => { const l = [...ctEcuEntries] as [string, string[] | string][]; l[idx] = [ch, e.target.value]; setCtEcuEntries(l); }}
                onBlur={e => { const l = [...ctEcuEntries] as [string, string[] | string][]; l[idx] = [ch, e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)]; setCtEcuEntries(l); }} />
            </div>
          </div>
        </CardRow>
      ))}
      {ctEcuEntries.length === 0 && <p style={{ ...T.pageSub, fontSize: '12px', margin: '4px 0' }}>No channel-to-ECU mappings defined.</p>}
    </div>
  );
}
