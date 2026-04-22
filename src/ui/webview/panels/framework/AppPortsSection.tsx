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

function parsePortList(s: string): any[] {
  return s.split(',').map(x => x.trim()).filter(Boolean).map(x => {
    const m = x.match(/^(\d+)-(\d+)$/);
    return m ? [Number(m[1]), Number(m[2])] : (isNaN(Number(x)) ? x : Number(x));
  });
}

export function AppPortsSection({ appPorts, portInputs, setPortInputs, setEth, setDirty }: Props) {
  return (
    <div id="fw-appLayerPorts" style={{ ...T.card, marginBottom: '10px' }}>
      <p style={SUB_TITLE}>AppLayer Ports</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {(['NPdu', 'SomeIp', 'UDPNM', 'DLT', 'SomeIpSD'] as const).map(proto => (
          <div key={proto}>
            <label style={T.label}>{proto}</label>
            <input style={T.input} placeholder="ports or ranges, comma-separated (e.g. 3000, 3100-3200, 3208)"
              value={portInputs[proto] ?? ''}
              onChange={e => setPortInputs(p => ({ ...p, [proto]: e.target.value }))}
              onBlur={e => { setEth('appLayerPorts', { ...appPorts, [proto]: parsePortList(e.target.value) }); setDirty(true); }} />
          </div>
        ))}
      </div>
    </div>
  );
}
