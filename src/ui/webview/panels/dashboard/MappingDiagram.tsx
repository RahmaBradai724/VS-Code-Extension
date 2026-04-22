import React from 'react';
import { CHANNEL_COLORS } from '../../types';
import { T } from '../../components/shared';

const HW_COLORS: Record<string, string> = {
  CANInterface: '#569cd6', CIBInterface: '#569cd6', CMInterface: '#9cdcfe',
  LINCard: '#dcb67a', EthernetAdapter: '#4ec9b0', RelayBoard: '#c678dd',
  HIDRelay: '#c678dd', SerialPort: '#d4d4d4', AnalogDevice: '#f0c040',
  TEAnalog: '#f0c040', HHLoad: '#f87171',
};

interface Props {
  logicalChannels: any[];
  hardwareChannels: any[];
  mappings: any[];
  mappedLogical: Set<string>;
  mappedHardware: Set<string>;
}

export function MappingDiagram({ logicalChannels, hardwareChannels, mappings, mappedLogical, mappedHardware }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: '0', minHeight: '200px' }}>
      {/* Logical side */}
      <div>
        <p style={{ ...T.cardTitle, textAlign: 'center', marginBottom: '16px', fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Logical</p>
        {logicalChannels.length === 0
          ? <div style={{ ...T.empty, fontSize: '11px' }}>None</div>
          : logicalChannels.map((ch, i) => {
              const color = CHANNEL_COLORS[ch.category] ?? '#888';
              const isMapped = mappedLogical.has(ch.id);
              return (
                <div
                  key={ch.id}
                  style={{
                    padding: '9px 12px', marginBottom: '6px', borderRadius: '6px',
                    border: `1px solid ${isMapped ? color : 'var(--vscode-panel-border, #3a3a3a)'}`,
                    background: isMapped ? color + '18' : 'var(--vscode-editorWidget-background)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
                  {!isMapped && <span style={{ fontSize: '10px', opacity: 0.4, marginLeft: 'auto', flexShrink: 0 }}>unmapped</span>}
                </div>
              );
            })}
      </div>

      {/* Middle — mapping lines (visual only) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '32px 0' }}>
        {mappings.length > 0
          ? mappings.map(m => (
              <div key={m.id} style={{ fontSize: '16px', opacity: 0.5 }}>⟵⟶</div>
            ))
          : <span style={{ fontSize: '11px', opacity: 0.3, textAlign: 'center' }}>no mappings</span>}
      </div>

      {/* Hardware side */}
      <div>
        <p style={{ ...T.cardTitle, textAlign: 'center', marginBottom: '16px', fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hardware</p>
        {hardwareChannels.length === 0
          ? <div style={{ ...T.empty, fontSize: '11px' }}>None</div>
          : hardwareChannels.map(hw => {
              const color = HW_COLORS[hw.subclass] ?? '#888';
              const isMapped = mappedHardware.has(hw.id);
              return (
                <div
                  key={hw.id}
                  style={{
                    padding: '9px 12px', marginBottom: '6px', borderRadius: '6px',
                    border: `1px solid ${isMapped ? color : 'var(--vscode-panel-border, #3a3a3a)'}`,
                    background: isMapped ? color + '18' : 'var(--vscode-editorWidget-background)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hw.name}</span>
                  {!isMapped && <span style={{ fontSize: '10px', opacity: 0.4, marginLeft: 'auto', flexShrink: 0 }}>unmapped</span>}
                </div>
              );
            })}
      </div>
    </div>
  );
}
