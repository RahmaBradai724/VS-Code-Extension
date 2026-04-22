import React from 'react';
import { CHANNEL_COLORS, LOGICAL_SUBCLASS_OPTIONS } from '../../types';
import { T, Badge } from '../../components/shared';

interface Props {
  mappings: any[];
  logicalChannels: any[];
  hardwareChannels: any[];
  onRemove: (id: string) => void;
}

export function MappingList({ mappings, logicalChannels, hardwareChannels, onRemove }: Props) {
  if (mappings.length === 0) {
    return <div style={T.empty}>No mappings yet. Add one above.</div>;
  }

  return (
    <div>
      {mappings.map(m => {
        const lc = logicalChannels.find(c => c.id === m.logicalChannelId);
        const hw = hardwareChannels.find(h => h.id === m.hardwareChannelId);
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
              onClick={() => onRemove(m.mappingId)}
            >
              Remove
            </button>
          </div>
        );
      })}
    </div>
  );
}
