import React from 'react';
import { T } from '../../components/shared';
import { SUB_TITLE } from './shared';

interface Props {
  appPorts: any;
  portInputs: Record<string, string>;
  setPortInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setEth: (key: string, val: any) => void;
  setDirty: (d: boolean) => void;
}

/** Parse "3000, 3100-3200, 3208" → [3000, [3100, 3200], 3208] */
function parsePortList(raw: string): (number | [number, number])[] | undefined {
  const trimmed = raw.trim();
  if (!trimmed) { return undefined; }
  const entries = trimmed.split(',').map(s => s.trim()).filter(Boolean);
  const result: (number | [number, number])[] = [];
  for (const entry of entries) {
    const range = entry.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (range) {
      result.push([Number(range[1]), Number(range[2])]);
    } else if (/^\d+$/.test(entry)) {
      result.push(Number(entry));
    }
  }
  return result.length > 0 ? result : undefined;
}

/** Format [3000, [3100, 3200], 3208] → "3000, 3100-3200, 3208" */
function formatPortList(val: any): string {
  if (val == null) { return ''; }
  if (Array.isArray(val)) {
    return val.map((e: any) => Array.isArray(e) ? `${e[0]}-${e[1]}` : String(e)).join(', ');
  }
  return String(val);
}

export function AppPortsSection({ appPorts, portInputs, setPortInputs, setEth, setDirty }: Props) {
  return (
    <div id="fw-appLayerPorts" style={{ ...T.card, marginBottom: '10px' }}>
      <p style={SUB_TITLE}>AppLayer Ports</p>
      <p style={{ fontSize: '11px', color: 'var(--vscode-descriptionForeground)', marginBottom: '10px' }}>
        Enter comma-separated ports and/or ranges (e.g. <code>3000, 3100-3200, 3208</code>).
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {(['NPdu', 'SomeIp', 'UDPNM', 'DLT', 'SomeIpSD'] as const).map(proto => (
          <div key={proto}>
            <label style={T.label}>{proto}</label>
            <input
              style={T.input}
              type="text"
              placeholder="e.g. 3000, 3100-3200"
              value={portInputs[proto] ?? formatPortList(appPorts?.[proto])}
              onChange={e => {
                setPortInputs(p => ({ ...p, [proto]: e.target.value }));
                const parsed = parsePortList(e.target.value);
                setEth('appLayerPorts', { ...appPorts, [proto]: parsed });
                setDirty(true);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
