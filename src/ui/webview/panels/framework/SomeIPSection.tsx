import React from 'react';
import { T } from '../../components/shared';
import { CardRow, AddBtn, SUB_CARD, SUB_TITLE } from './shared';

const ENDPOINT_IMPLS = ['boost', 'lwip'];

interface Props {
  someip: any;
  serverPorts: any[];
  clientPorts: any[];
  setEthNested: (section: string, key: string, val: any) => void;
  setSomeIPMapping: (sp: any[], cp: any[]) => void;
}

export function SomeIPSection({ someip, serverPorts, clientPorts, setEthNested, setSomeIPMapping }: Props) {
  return (
    <div id="fw-someIPConfig" style={{ ...T.card, marginBottom: '10px' }}>
      <p style={SUB_TITLE}>SomeIP Configuration</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={T.label}>EndpointImplementation</label>
          <select style={T.select} value={someip.EndpointImplementation || 'boost'} onChange={e => setEthNested('someIPConfig', 'EndpointImplementation', e.target.value)}>
            {ENDPOINT_IMPLS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={T.label}>AdapterName (for LWIP)</label>
          <input style={T.input} placeholder="interface name, friendly name or description"
            value={someip.AdapterName || ''} onChange={e => setEthNested('someIPConfig', 'AdapterName', e.target.value)} />
        </div>
      </div>

      {/* Port range mapping sub-card */}
      <div style={SUB_CARD}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>ServerToClientPortRangeMapping</span>
          <AddBtn onClick={() => setSomeIPMapping([...serverPorts, ['', '']], [...clientPorts, ['', '']])} label="+ Add Range Pair" />
        </div>
        {serverPorts.map((_: any, idx: number) => (
          <CardRow key={idx} onRemove={() => setSomeIPMapping(serverPorts.filter((_: any, i: number) => i !== idx), clientPorts.filter((_: any, i: number) => i !== idx))}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ ...T.label, marginBottom: '4px' }}>Server Port Range {idx + 1}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <input style={T.input} placeholder="start e.g. 30501"
                    value={Array.isArray(serverPorts[idx]) ? (serverPorts[idx][0] ?? '') : ''}
                    onChange={e => { const v = e.target.value; const n = v === '' ? '' : !isNaN(Number(v)) ? Number(v) : v; const s = [...serverPorts]; s[idx] = [n, Array.isArray(s[idx]) ? s[idx][1] : '']; setSomeIPMapping(s, clientPorts); }} />
                  <input style={T.input} placeholder="end e.g. 30599"
                    value={Array.isArray(serverPorts[idx]) ? (serverPorts[idx][1] ?? '') : ''}
                    onChange={e => { const v = e.target.value; const n = v === '' ? '' : !isNaN(Number(v)) ? Number(v) : v; const s = [...serverPorts]; s[idx] = [Array.isArray(s[idx]) ? s[idx][0] : '', n]; setSomeIPMapping(s, clientPorts); }} />
                </div>
              </div>
              <div>
                <label style={{ ...T.label, marginBottom: '4px' }}>Client Port Range {idx + 1}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <input style={T.input} placeholder="start e.g. 30491"
                    value={Array.isArray(clientPorts[idx]) ? (clientPorts[idx][0] ?? '') : ''}
                    onChange={e => { const v = e.target.value; const n = v === '' ? '' : !isNaN(Number(v)) ? Number(v) : v; const c = [...clientPorts]; c[idx] = [n, Array.isArray(c[idx]) ? c[idx][1] : '']; setSomeIPMapping(serverPorts, c); }} />
                  <input style={T.input} placeholder="end e.g. 30499"
                    value={Array.isArray(clientPorts[idx]) ? (clientPorts[idx][1] ?? '') : ''}
                    onChange={e => { const v = e.target.value; const n = v === '' ? '' : !isNaN(Number(v)) ? Number(v) : v; const c = [...clientPorts]; c[idx] = [Array.isArray(c[idx]) ? c[idx][0] : '', n]; setSomeIPMapping(serverPorts, c); }} />
                </div>
              </div>
            </div>
          </CardRow>
        ))}
        {serverPorts.length === 0 && <p style={{ ...T.pageSub, fontSize: '12px', margin: '4px 0' }}>No port range mappings defined.</p>}
      </div>
    </div>
  );
}
