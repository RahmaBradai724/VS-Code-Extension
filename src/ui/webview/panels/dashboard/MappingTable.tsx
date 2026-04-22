import React from 'react';
import { CHANNEL_COLORS } from '../../types';
import { T } from '../../components/shared';

interface Props {
  mappings: any[];
  logicalChannels: any[];
  hardwareChannels: any[];
}

export function MappingTable({ mappings, logicalChannels, hardwareChannels }: Props) {
  if (mappings.length === 0) return null;

  return (
    <>
      <div style={T.divider} />
      <p style={{ ...T.cardTitle, marginBottom: '10px' }}>Mapping Details</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {mappings.map(m => {
          const lc = logicalChannels.find(c => c.id === m.logicalChannelId);
          const hw = hardwareChannels.find(h => h.id === m.hardwareChannelId);
          const color = CHANNEL_COLORS[lc?.category ?? ''] ?? '#888';
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '5px 8px', borderRadius: '4px', background: 'var(--vscode-input-background)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontWeight: 500 }}>{lc?.name ?? m.logicalChannelId}</span>
              <span style={{ opacity: 0.4 }}>→</span>
              <span style={{ fontWeight: 500 }}>{hw?.name ?? m.hardwareChannelId}</span>
              {m.operationMode && <span style={{ fontSize: '10px', opacity: 0.5, marginLeft: 'auto' }}>{m.operationMode}</span>}
            </div>
          );
        })}
      </div>
    </>
  );
}
