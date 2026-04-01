import React, { useMemo } from 'react';
import { useApp } from '../App';
import { CHANNEL_COLORS, LOGICAL_SUBCLASS_OPTIONS } from '../types';
import { T, Badge } from '../components/shared';

const HW_COLORS: Record<string, string> = {
  CANInterface: '#569cd6', CIBInterface: '#569cd6', CMInterface: '#9cdcfe',
  LINCard: '#dcb67a', EthernetAdapter: '#4ec9b0', RelayBoard: '#c678dd',
  HIDRelay: '#c678dd', SerialPort: '#d4d4d4', AnalogDevice: '#f0c040',
  TEAnalog: '#f0c040', HHLoad: '#f87171',
};

export default function DiagramPanel() {
  const { state } = useApp();
  const { logicalChannels, hardwareChannels, mappings } = state;

  const mappedLogical = useMemo(() => new Set(mappings.map(m => m.logicalChannelId)), [mappings]);
  const mappedHardware = useMemo(() => new Set(mappings.map(m => m.hardwareChannelId)), [mappings]);

  const total = logicalChannels.length + hardwareChannels.length;
  const totalMappings = mappings.length;

  return (
    <div>
      <h2 style={T.pageTitle}>Channel Diagram</h2>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Logical Channels', value: logicalChannels.length, color: '#569cd6' },
          { label: 'Hardware Channels', value: hardwareChannels.length, color: '#4ec9b0' },
          { label: 'Mappings', value: totalMappings, color: '#c678dd' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...T.card, textAlign: 'center', borderColor: color + '44', marginBottom: 0 }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <div style={T.empty}>
          No channels defined yet. Add logical and hardware channels then create mappings to see the diagram.
        </div>
      ) : (
        <div style={T.card}>
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

          {/* Mapping table */}
          {mappings.length > 0 && (
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
          )}
        </div>
      )}

      {/* Category legend */}
      <div style={T.card}>
        <p style={T.cardTitle}>Category Legend</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.entries(CHANNEL_COLORS).map(([cat, color]) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
              <span style={{ fontSize: '11px', opacity: 0.7 }}>{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
