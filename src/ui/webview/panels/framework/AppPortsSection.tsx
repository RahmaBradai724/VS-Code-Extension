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

export function AppPortsSection({ appPorts, portInputs, setPortInputs, setEth, setDirty }: Props) {
  return (
    <div id="fw-appLayerPorts" style={{ ...T.card, marginBottom: '10px' }}>
      <p style={SUB_TITLE}>AppLayer Ports</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {(['NPdu', 'SomeIp', 'UDPNM', 'DLT', 'SomeIpSD'] as const).map(proto => (
          <div key={proto}>
            <label style={T.label}>{proto}</label>
            <input
              style={T.input}
              type="number"
              min={0}
              max={65535}
              placeholder="e.g. 3000"
              value={portInputs[proto] ?? ''}
              onChange={e => {
                setPortInputs(p => ({ ...p, [proto]: e.target.value }));
                const num = e.target.value === '' ? undefined : Number(e.target.value);
                setEth('appLayerPorts', { ...appPorts, [proto]: num });
                setDirty(true);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
