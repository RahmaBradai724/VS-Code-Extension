import React from 'react';
import { T } from '../../components/shared';
import { CardRow, AddBtn, SUB_CARD, SUB_TITLE } from './shared';

const PROTO_TYPES = ['TCP', 'UDP', 'ICMPv6'];
const PORT_TYPE_OPTIONS = ['SrcPort', 'DstPort', 'SrcPortRange', 'DstPortRange'];

function renderVlanTagBlock(tagKey: 'InnerVlanTag' | 'OuterVlanTag', parent: any, setParent: (p: any) => void) {
  const tag = parent?.[tagKey];
  const ethOpts = tagKey === 'InnerVlanTag'
    ? [{ v: 33024, l: '0x8100 (IEEE 802.1Q)' }]
    : [{ v: 34984, l: '0x88a8 (IEEE 802.1ad)' }, { v: 37120, l: '0x9100 (q-in-q)' }];
  return (
    <div key={tagKey} style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <label style={{ ...T.label, marginBottom: 0, fontSize: '11px', fontWeight: 600 }}>{tagKey}</label>
        {!tag && <AddBtn onClick={() => setParent({ ...parent, [tagKey]: { Id: '', Ethertype: ethOpts[0].v, VlanPriorityTag: 0, VlanCfi: false } })} label="+ Add" />}
        {tag && <button style={T.btnDanger} onClick={() => { const rest = { ...parent }; delete rest[tagKey]; setParent(rest); }}>Remove</button>}
      </div>
      {tag && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '6px', alignItems: 'end', paddingLeft: '8px' }}>
          <div>
            <label style={{ ...T.label, fontSize: '10px' }}>Id</label>
            <input style={{ ...T.input, fontSize: '11px' }} type="number" value={tag.Id ?? ''} onChange={e => { const v = e.target.value; setParent({ ...parent, [tagKey]: { ...tag, Id: v === '' ? '' : Number(v) } }); }} />
          </div>
          <div>
            <label style={{ ...T.label, fontSize: '10px' }}>Ethertype</label>
            <select style={{ ...T.select, fontSize: '11px' }} value={tag.Ethertype ?? ethOpts[0].v} onChange={e => setParent({ ...parent, [tagKey]: { ...tag, Ethertype: Number(e.target.value) } })}>
              {ethOpts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ ...T.label, fontSize: '10px' }}>VlanPriorityTag (0-7)</label>
            <input style={{ ...T.input, fontSize: '11px' }} type="number" min={0} max={7} value={tag.VlanPriorityTag ?? ''} onChange={e => setParent({ ...parent, [tagKey]: { ...tag, VlanPriorityTag: Number(e.target.value) } })} />
          </div>
          <div>
            <label style={{ ...T.label, fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!tag.VlanCfi} onChange={e => setParent({ ...parent, [tagKey]: { ...tag, VlanCfi: e.target.checked } })} />
              VlanCfi
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function renderVlanTagPair(pairObj: any, setPair: (p: any) => void) {
  return (
    <div style={{ paddingLeft: '8px', borderLeft: '2px solid var(--vscode-panel-border,rgba(255,255,255,.1))', marginTop: '4px' }}>
      {renderVlanTagBlock('InnerVlanTag', pairObj, setPair)}
      {renderVlanTagBlock('OuterVlanTag', pairObj, setPair)}
    </div>
  );
}

interface Props {
  ethProtoCfg: any[];
  topoCfg: any[];
  setTopoProtoCfg: (list: any[]) => void;
  setTopoTopoCfg: (list: any[]) => void;
}

export function TopologySection({ ethProtoCfg, topoCfg, setTopoProtoCfg, setTopoTopoCfg }: Props) {
  return (
    <div id="fw-ethernetTopology" style={{ ...T.card, marginBottom: '10px' }}>
      <p style={SUB_TITLE}>EthernetTopology</p>

      {/* EthProtoPrioConfig sub-card */}
      <div style={SUB_CARD}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>EthProtoPrioConfig</span>
          <AddBtn onClick={() => setTopoProtoCfg([...ethProtoCfg, { Protocol: 'TCP', DefaultPriority: 0, Ports: [] }])} label="+ Add Protocol" />
        </div>
        {ethProtoCfg.map((entry: any, idx: number) => (
          <CardRow key={idx} onRemove={() => setTopoProtoCfg(ethProtoCfg.filter((_: any, i: number) => i !== idx))}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <div>
                <label style={T.label}>Protocol</label>
                <select style={T.select} value={entry.Protocol || 'TCP'}
                  onChange={e => { const l = [...ethProtoCfg]; l[idx] = { ...l[idx], Protocol: e.target.value }; setTopoProtoCfg(l); }}>
                  {PROTO_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={T.label}>DefaultPriority (0-7, mandatory)</label>
                <input style={T.input} type="number" min={0} max={7} placeholder="0"
                  value={entry.DefaultPriority ?? ''}
                  onChange={e => { const l = [...ethProtoCfg]; l[idx] = { ...l[idx], DefaultPriority: Number(e.target.value) }; setTopoProtoCfg(l); }} />
              </div>
            </div>
            {(() => {
              const ports: any[] = entry.Ports || [];
              function setPorts(p: any[]) { const l = [...ethProtoCfg]; l[idx] = { ...l[idx], Ports: p }; setTopoProtoCfg(l); }
              return (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ ...T.label, marginBottom: 0, fontSize: '11px' }}>Port Priority Overrides (optional)</label>
                    <AddBtn onClick={() => setPorts([...ports, { portType: 'SrcPort', value: '', Priority: 0 }])} label="+ Add Port Override" />
                  </div>
                  {ports.map((port: any, pi: number) => (
                    <div key={pi} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px auto', gap: '6px', alignItems: 'end', marginBottom: '6px' }}>
                      <div>
                        <label style={{ ...T.label, fontSize: '10px' }}>Type</label>
                        <select style={{ ...T.select, fontSize: '11px' }} value={port.portType || 'SrcPort'}
                          onChange={e => { const p = [...ports]; p[pi] = { ...p[pi], portType: e.target.value }; setPorts(p); }}>
                          {PORT_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ ...T.label, fontSize: '10px' }}>Value / Range</label>
                        <input style={T.input} placeholder="port or start-end"
                          value={port.value || ''}
                          onChange={e => { const p = [...ports]; p[pi] = { ...p[pi], value: e.target.value }; setPorts(p); }} />
                      </div>
                      <div>
                        <label style={{ ...T.label, fontSize: '10px' }}>Priority</label>
                        <input style={T.input} type="number" min={0} max={7} value={port.Priority ?? ''}
                          onChange={e => { const p = [...ports]; p[pi] = { ...p[pi], Priority: Number(e.target.value) }; setPorts(p); }} />
                      </div>
                      <button style={T.btnDanger} onClick={() => setPorts(ports.filter((_: any, j: number) => j !== pi))}>Remove</button>
                    </div>
                  ))}
                  {ports.length === 0 && <p style={{ ...T.pageSub, fontSize: '11px', margin: '2px 0' }}>No port overrides.</p>}
                </div>
              );
            })()}
          </CardRow>
        ))}
        {ethProtoCfg.length === 0 && <p style={{ ...T.pageSub, fontSize: '12px', margin: '4px 0' }}>No protocol priority configs defined.</p>}
      </div>

      {/* TopologyConfig sub-card */}
      <div style={SUB_CARD}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>TopologyConfig</span>
          <AddBtn onClick={() => setTopoTopoCfg([...topoCfg, { EcuName: '', SrcIpList: [], SrcMacAdr: '', TunTapAdapterName: '' }])} label="+ Add ECU" />
        </div>
        {topoCfg.map((ecu: any, idx: number) => (
          <CardRow key={idx} onRemove={() => setTopoTopoCfg(topoCfg.filter((_: any, i: number) => i !== idx))}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div><label style={T.label}>EcuName (optional)</label>
                <input style={T.input} placeholder="e.g. ECU1" value={ecu.EcuName || ''}
                  onChange={e => { const l = [...topoCfg]; l[idx] = { ...l[idx], EcuName: e.target.value }; setTopoTopoCfg(l); }} /></div>
              <div><label style={T.label}>SrcMacAdr (optional)</label>
                <input style={T.input} placeholder="AA:BB:CC:DD:EE:FF" value={ecu.SrcMacAdr || ''}
                  onChange={e => { const l = [...topoCfg]; l[idx] = { ...l[idx], SrcMacAdr: e.target.value }; setTopoTopoCfg(l); }} /></div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={T.label}>SrcIpList (mandatory, comma-separated)</label>
              <input style={T.input} placeholder="192.168.1.1, 192.168.1.2"
                value={Array.isArray(ecu.SrcIpList) ? ecu.SrcIpList.join(', ') : (ecu.SrcIpList || '')}
                onChange={e => { const l = [...topoCfg]; l[idx] = { ...l[idx], SrcIpList: e.target.value }; setTopoTopoCfg(l); }}
                onBlur={e => { const l = [...topoCfg]; l[idx] = { ...l[idx], SrcIpList: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }; setTopoTopoCfg(l); }} />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={T.label}>TunTapAdapterName (optional)</label>
              <input style={T.input} placeholder="tap adapter name" value={ecu.TunTapAdapterName || ''}
                onChange={e => { const l = [...topoCfg]; l[idx] = { ...l[idx], TunTapAdapterName: e.target.value }; setTopoTopoCfg(l); }} />
            </div>
            {/* Vlans */}
            {(() => {
              const vl: any = ecu.Vlans ?? null;
              function setVlans(v: any) { const l = [...topoCfg]; l[idx] = { ...l[idx], Vlans: v }; setTopoTopoCfg(l); }
              function removeVlans() { const l = [...topoCfg]; const e = { ...l[idx] }; delete e.Vlans; l[idx] = e; setTopoTopoCfg(l); }
              const mvf: any[] = vl?.MulticastVlanForwarding || [];
              const dim: any[] = vl?.DstIpVlanMapping || [];
              return (
                <div style={{ marginTop: '10px', borderTop: '1px solid var(--vscode-panel-border,rgba(255,255,255,.1))', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Vlans (optional)</span>
                    {!vl && <AddBtn onClick={() => setVlans({})} label="+ Add Vlans" />}
                    {vl && <button style={T.btnDanger} onClick={removeVlans}>Remove Vlans</button>}
                  </div>
                  {vl && (
                    <div style={{ paddingLeft: '10px', borderLeft: '2px solid var(--vscode-panel-border,rgba(255,255,255,.1))' }}>
                      {/* DefaultVlan */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label style={{ ...T.label, marginBottom: 0, fontWeight: 600, fontSize: '12px' }}>DefaultVlan (optional)</label>
                          {!vl.DefaultVlan && <AddBtn onClick={() => setVlans({ ...vl, DefaultVlan: {} })} label="+ Add" />}
                          {vl.DefaultVlan && <button style={T.btnDanger} onClick={() => { const rest = { ...vl }; delete rest.DefaultVlan; setVlans(rest); }}>Remove</button>}
                        </div>
                        {vl.DefaultVlan && renderVlanTagPair(vl.DefaultVlan, (dv: any) => setVlans({ ...vl, DefaultVlan: dv }))}
                      </div>
                      {/* MulticastVlanForwarding */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label style={{ ...T.label, marginBottom: 0, fontWeight: 600, fontSize: '12px' }}>MulticastVlanForwarding (optional)</label>
                          <AddBtn onClick={() => setVlans({ ...vl, MulticastVlanForwarding: [...mvf, {}] })} label="+ Add" />
                        </div>
                        {mvf.map((item: any, mi: number) => (
                          <div key={mi} style={{ border: '1px solid var(--vscode-panel-border,rgba(255,255,255,.1))', borderRadius: '6px', padding: '8px', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                              <button style={T.btnDanger} onClick={() => setVlans({ ...vl, MulticastVlanForwarding: mvf.filter((_: any, j: number) => j !== mi) })}>Remove</button>
                            </div>
                            {renderVlanTagPair(item, (p: any) => { const a = [...mvf]; a[mi] = p; setVlans({ ...vl, MulticastVlanForwarding: a }); })}
                          </div>
                        ))}
                        {mvf.length === 0 && <p style={{ ...T.pageSub, fontSize: '11px', margin: '2px 0' }}>No multicast VLAN forwarding entries.</p>}
                      </div>
                      {/* DstIpVlanMapping */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label style={{ ...T.label, marginBottom: 0, fontWeight: 600, fontSize: '12px' }}>DstIpVlanMapping (optional)</label>
                          <AddBtn onClick={() => setVlans({ ...vl, DstIpVlanMapping: [...dim, { DstIp: '' }] })} label="+ Add" />
                        </div>
                        {dim.map((item: any, di: number) => (
                          <div key={di} style={{ border: '1px solid var(--vscode-panel-border,rgba(255,255,255,.1))', borderRadius: '6px', padding: '8px', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                              <button style={T.btnDanger} onClick={() => setVlans({ ...vl, DstIpVlanMapping: dim.filter((_: any, j: number) => j !== di) })}>Remove</button>
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                              <label style={{ ...T.label, fontSize: '11px' }}>DstIp</label>
                              <input style={{ ...T.input, fontSize: '11px' }} placeholder="e.g. 2001:db8::ff00:42:8329" value={item.DstIp || ''} onChange={e => { const a = [...dim]; a[di] = { ...a[di], DstIp: e.target.value }; setVlans({ ...vl, DstIpVlanMapping: a }); }} />
                            </div>
                            {renderVlanTagPair(item, (p: any) => { const a = [...dim]; a[di] = { ...a[di], ...p }; setVlans({ ...vl, DstIpVlanMapping: a }); })}
                          </div>
                        ))}
                        {dim.length === 0 && <p style={{ ...T.pageSub, fontSize: '11px', margin: '2px 0' }}>No destination IP VLAN mappings.</p>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardRow>
        ))}
        {topoCfg.length === 0 && <p style={{ ...T.pageSub, fontSize: '12px', margin: '4px 0' }}>No ECU topology entries defined.</p>}
      </div>
    </div>
  );
}
