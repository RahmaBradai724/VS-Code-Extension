import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import { FrameworkData, FrameworkSection } from '../types';
import { T } from '../components/shared';

const PUBLISHER_TYPES = ['SingleThreaded', 'MultiThreaded'];
const PROTO_TYPES = ['TCP', 'UDP', 'ICMPv6'];
const ENDPOINT_IMPLS = ['boost', 'lwip'];
const PORT_TYPE_OPTIONS = ['SrcPort', 'DstPort', 'SrcPortRange', 'DstPortRange'];

const SECTION_IDS: Record<FrameworkSection, string> = {
  tracers:              'fw-tracers',
  connectedEcus:        'fw-connectedEcus',
  servicePack:          'fw-servicePack',
  publisher:            'fw-publisher',
  ethernet:             'fw-ethernet',
  npduConfig:           'fw-npduConfig',
  someIPConfig:         'fw-someIPConfig',
  appLayerPorts:        'fw-appLayerPorts',
  ethernetTopology:     'fw-ethernetTopology',
  channelToEcusMapping: 'fw-channelToEcusMapping',
};

function CardRow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ border: '1px solid var(--vscode-panel-border,rgba(255,255,255,.1))', borderRadius: '6px', padding: '10px', marginBottom: '8px', position: 'relative', ...style }}>
      {children}
    </div>
  );
}
function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ position: 'absolute', top: '6px', right: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#f44336', fontSize: '14px', lineHeight: 1 }}
      title="Remove">X</button>
  );
}
function AddBtn({ onClick, label }: { onClick: () => void; label?: string }) {
  return <button style={{ ...T.btnSecondary, padding: '3px 10px', fontSize: '11px' }} onClick={onClick}>{label ?? '+ Add'}</button>;
}
function SectionDivider(extra?: React.CSSProperties): React.CSSProperties {
  return { borderTop: '1px solid var(--vscode-panel-border,rgba(255,255,255,.1))', paddingTop: '20px', marginTop: '24px', ...extra };
}
function portListToStringInit(v: any): string {
  if (!v) return '';
  if (Array.isArray(v)) return v.map((p: any) => Array.isArray(p) ? `${p[0]}-${p[1]}` : String(p)).join(', ');
  return String(v);
}

export default function FrameworkPanel() {
  const { state, dispatch, send, notify } = useApp();
  const fw = state.frameworkData;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<FrameworkData>(() => ({ ...fw }));
  const [dirty, setDirty] = useState(false);
  const [ecuInput, setEcuInput] = useState(() =>
    Array.isArray(fw.connectedEcus) ? fw.connectedEcus.join(', ') : ''
  );
  const initAppPorts = (fw as any).ethernetConfig?.appLayerPorts || {};
  const [portInputs, setPortInputs] = useState<Record<string, string>>(() => ({
    NPdu: portListToStringInit(initAppPorts.NPdu),
    SomeIp: portListToStringInit(initAppPorts.SomeIp),
    UDPNM: portListToStringInit(initAppPorts.UDPNM),
    DLT: portListToStringInit(initAppPorts.DLT),
    SomeIpSD: portListToStringInit(initAppPorts.SomeIpSD),
  }));

  useEffect(() => {
    const section = state.frameworkSection;
    if (!section) return;
    const el = scrollRef.current?.querySelector(`#${SECTION_IDS[section]}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [state.frameworkSection]);

  // Live-sync local data into global state so the YAML preview stays in sync
  // (same logic as logical channels — immediate, no debounce)

  function setD(key: keyof FrameworkData, val: any) {
    const updated = { ...data, [key]: val };
    setData(updated);
    dispatch({ type: 'UPDATE_FRAMEWORK', data: updated });
    setDirty(true);
  }
  function setEth(key: string, val: any) {
    setD('ethernetConfig', { ...(data.ethernetConfig || {}), [key]: val });
  }
  function setEthNested(section: string, key: string, val: any) {
    const eth = data.ethernetConfig || {};
    const prev = (eth as any)[section] || {};
    setD('ethernetConfig', { ...eth, [section]: { ...prev, [key]: val } });
  }
  function handleSave() {
    dispatch({ type: 'UPDATE_FRAMEWORK', data });
    send('saveFramework', { frameworkData: data });
    setDirty(false);
    notify('success', 'Framework settings saved.');
  }
  function handleSaveToYaml() {
    dispatch({ type: 'UPDATE_FRAMEWORK', data });
    send('generateConfig', { frameworkData: data });
  }

  const eth = data.ethernetConfig || {};

  // NPduConfig
  const npdu = (eth as any).npduConfig || {};
  const vlans = npdu.VLans || {};
  const innerTags: any[] = vlans.InnerTags || [];
  const outerTags: any[] = vlans.OuterTags || [];
  function setNpdu(key: string, val: any) { setEthNested('npduConfig', key, val); }
  function setVlanTag(tagType: 'InnerTags' | 'OuterTags', idx: number, field: string, val: any) {
    const tags = [...(vlans[tagType] || [])];
    tags[idx] = { ...tags[idx], [field]: val };
    setEth('npduConfig', { ...npdu, VLans: { ...vlans, [tagType]: tags } });
    setDirty(true);
  }
  function addVlanTag(tagType: 'InnerTags' | 'OuterTags') {
    const tags = [...(vlans[tagType] || []), { ID: '', Priority: '', IPList: [] }];
    setEth('npduConfig', { ...npdu, VLans: { ...vlans, [tagType]: tags } });
    setDirty(true);
  }
  function removeVlanTag(tagType: 'InnerTags' | 'OuterTags', idx: number) {
    const tags = (vlans[tagType] || []).filter((_: any, i: number) => i !== idx);
    setEth('npduConfig', { ...npdu, VLans: { ...vlans, [tagType]: tags } });
    setDirty(true);
  }
  function renderVlanTagSection(tagType: 'InnerTags' | 'OuterTags', tags: any[]) {
    return (
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ ...T.label, marginBottom: 0, fontWeight: 600 }}>{tagType}</label>
          <AddBtn onClick={() => addVlanTag(tagType)} />
        </div>
        {tags.map((tag, idx) => (
          <CardRow key={idx}>
            <RemoveBtn onClick={() => removeVlanTag(tagType, idx)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div><label style={T.label}>ID (mandatory)</label>
                <input style={T.input} placeholder="e.g. 68" value={tag.ID ?? ''}
                  onChange={e => { const v = e.target.value; setVlanTag(tagType, idx, 'ID', v === '' ? '' : !isNaN(Number(v)) ? Number(v) : v); }} /></div>
              <div><label style={T.label}>Priority (mandatory)</label>
                <input style={T.input} placeholder="0-7" value={tag.Priority ?? ''}
                  onChange={e => { const v = e.target.value; setVlanTag(tagType, idx, 'Priority', v === '' ? '' : !isNaN(Number(v)) ? Number(v) : v); }} /></div>
            </div>
            <label style={T.label}>IPList (mandatory, comma-separated)</label>
            <input style={T.input} placeholder="160.48.199.57, 160.48.199.100"
              value={Array.isArray(tag.IPList) ? tag.IPList.join(', ') : (tag.IPList || '')}
              onChange={e => setVlanTag(tagType, idx, 'IPList', e.target.value)}
              onBlur={e => setVlanTag(tagType, idx, 'IPList', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} />
          </CardRow>
        ))}
        {tags.length === 0 && <p style={{ ...T.pageSub, fontSize: '12px', margin: '4px 0' }}>No {tagType} defined.</p>}
      </div>
    );
  }

  // SomeIPConfig
  const someip = (eth as any).someIPConfig || {};
  const srvMapping = someip.ServerToClientPortRangeMapping || {};
  const serverPorts: any[] = srvMapping.ServerPorts || [];
  const clientPorts: any[] = srvMapping.ClientPorts || [];
  function setSomeIPMapping(sp: any[], cp: any[]) {
    setEth('someIPConfig', { ...someip, ServerToClientPortRangeMapping: { ServerPorts: sp, ClientPorts: cp } });
    setDirty(true);
  }

  // AppLayerPorts
  const appPorts = (eth as any).appLayerPorts || {};
  function portListToString(v: any): string { return portListToStringInit(v); }
  function parsePortList(s: string): any[] {
    return s.split(',').map(x => x.trim()).filter(Boolean).map(x => {
      const m = x.match(/^(\d+)-(\d+)$/);
      return m ? [Number(m[1]), Number(m[2])] : (isNaN(Number(x)) ? x : Number(x));
    });
  }

  // EthernetTopology
  const topoData = (eth as any).ethernetTopology || {};
  const ethProtoCfg: any[] = topoData.EthProtoPrioConfig || [];
  const topoCfg: any[] = topoData.TopologyConfig || [];
  function setTopo(val: any) { setEth('ethernetTopology', val); setDirty(true); }
  function setTopoProtoCfg(list: any[]) { setTopo({ ...topoData, EthProtoPrioConfig: list }); }
  function setTopoTopoCfg(list: any[]) { setTopo({ ...topoData, TopologyConfig: list }); }

  // ChannelToEcusMapping
  const ctEcusRaw = (eth as any).channelToEcusMapping || {};
  const ctEcuEntries: [string, string[]][] = Object.entries(ctEcusRaw).map(([k, v]) => [k, Array.isArray(v) ? v : []]);
  function setCtEcuEntries(entries: [string, string[]][]) {
    setEth('channelToEcusMapping', Object.fromEntries(entries));
    setDirty(true);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexShrink: 0 }}>
        <div>
          <h2 style={T.pageTitle}>Framework Configuration</h2>
          <p style={{ ...T.pageSub, marginBottom: 0 }}>Configure publisher, tracing and ethernet settings</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button style={{ ...T.btnPrimary, padding: '9px 22px', fontSize: '13px', opacity: dirty ? 1 : 0.5 }} onClick={handleSave}>
            {dirty ? 'Save Changes' : 'Saved'}
          </button>
          <button style={{ ...T.btnSecondary, padding: '9px 22px', fontSize: '13px' }} onClick={handleSaveToYaml} title="Generate and save to MTF.yaml">
            Save to YAML
          </button>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>

        {/* Tracers */}
        <div id="fw-tracers">
          <h3 style={T.cardTitle}>Tracers</h3>
          <p style={{ ...T.pageSub, marginBottom: 0 }}>{data.tracers?.length ?? 0} tracer(s) — manage in the <strong>Tracers</strong> panel.</p>
        </div>

        {/* ConnectedEcus */}
        <div id="fw-connectedEcus" style={SectionDivider()}>
          <h3 style={{ ...T.cardTitle, marginBottom: '12px' }}>ConnectedEcus (DUT's)</h3>
          <label style={T.label}>ECU Names (comma-separated)</label>
          <input style={T.input} placeholder="ECU1, ECU2, ECU3"
            value={ecuInput}
            onChange={e => setEcuInput(e.target.value)}
            onBlur={e => setD('connectedEcus', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
        </div>

        {/* ServicePack */}
        <div id="fw-servicePack" style={SectionDivider()}>
          <h3 style={{ ...T.cardTitle, marginBottom: '12px' }}>ServicePack</h3>
          <label style={T.label}>Service Pack Name</label>
          <input style={T.input} placeholder="ServicePack_name" value={data.servicePack || ''} onChange={e => setD('servicePack', e.target.value)} />
        </div>

        {/* Publisher Configuration */}
        <div id="fw-publisher" style={SectionDivider()}>
          <h3 style={{ ...T.cardTitle, marginBottom: '12px' }}>Publisher Configuration</h3>
          <div style={{ marginBottom: '12px', maxWidth: '280px' }}>
            <label style={T.label}>Publisher Type</label>
            <select style={T.select} value={data.publisherType || 'SingleThreaded'} onChange={e => setD('publisherType', e.target.value)}>
              {PUBLISHER_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {data.publisherType === 'MultiThreaded' && (() => {
            const groups: string[][] = Array.isArray(data.channelsGroups) ? data.channelsGroups : [];
            const availableChannels: string[] = state.logicalChannels.map((ch: any) => ch.name).filter(Boolean);
            const groupKey = (g: string[]) => [...g].sort().join('|');
            const isDuplicateGroup = (candidate: string[], excludeIdx: number) =>
              candidate.length > 0 && groups.some((g, j) => j !== excludeIdx && groupKey(g) === groupKey(candidate));
            return (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ ...T.label, marginBottom: 0 }}>ChannelsGroups</label>
                  <AddBtn onClick={() => setD('channelsGroups', [...groups, []])} label="+ Add Group" />
                </div>
                {availableChannels.length === 0 && (
                  <p style={{ ...T.pageSub, fontSize: '12px', margin: '0 0 8px 0', color: 'var(--vscode-editorWarning-foreground)' }}>
                    No logical channels defined yet. Add channels first.
                  </p>
                )}
                {groups.map((grp, i) => {
                  const isDup = isDuplicateGroup(Array.isArray(grp) ? grp : [], i);
                  return (
                  <CardRow key={i} style={isDup ? { borderColor: 'var(--vscode-editorError-foreground)' } : undefined}>
                    <RemoveBtn onClick={() => setD('channelsGroups', groups.filter((_, j) => j !== i))} />
                    <label style={{ ...T.label, marginBottom: '6px' }}>Group {i + 1}</label>
                    {isDup && (
                      <p style={{ fontSize: '11px', margin: '0 0 6px 0', color: 'var(--vscode-editorError-foreground)' }}>
                        ⚠ Identical to another group — duplicates are not allowed.
                      </p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {availableChannels.map(chName => {
                        const checked = Array.isArray(grp) && grp.includes(chName);
                        const nextGrp = checked
                          ? (Array.isArray(grp) ? grp : []).filter(n => n !== chName)
                          : [...(Array.isArray(grp) ? grp : []), chName];
                        const wouldDup = isDuplicateGroup(nextGrp, i);
                        return (
                          <label key={chName} title={wouldDup ? 'Would create a duplicate group' : undefined} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: wouldDup ? 'not-allowed' : 'pointer', padding: '3px 8px', borderRadius: '4px', background: checked ? 'var(--vscode-button-background)' : 'var(--vscode-input-background)', color: checked ? 'var(--vscode-button-foreground)' : 'inherit', border: '1px solid var(--vscode-panel-border,rgba(255,255,255,.1))', opacity: wouldDup ? 0.45 : 1 }}>
                            <input type="checkbox" checked={checked} disabled={wouldDup} style={{ margin: 0 }}
                              onChange={() => {
                                if (wouldDup) return;
                                const updated = [...groups];
                                updated[i] = nextGrp;
                                setD('channelsGroups', updated);
                              }} />
                            {chName}
                          </label>
                        );
                      })}
                    </div>
                    {(!Array.isArray(grp) || grp.length === 0) && (
                      <p style={{ ...T.pageSub, fontSize: '11px', margin: '4px 0 0 0' }}>No channels selected for this group.</p>
                    )}
                  </CardRow>
                  );
                })}
                {groups.length === 0 && <p style={{ ...T.pageSub, fontSize: '12px', margin: '4px 0' }}>No groups defined.</p>}
              </div>
            );
          })()}
        </div>

        {/* Ethernet Configuration */}
        <div id="fw-ethernet" style={SectionDivider()}>
          <h3 style={{ ...T.cardTitle, marginBottom: '12px' }}>Ethernet Configuration</h3>
          <label style={{ ...T.label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!(eth as any).considerOnlyEthernetTopologyEcus}
              onChange={e => setEth('considerOnlyEthernetTopologyEcus', e.target.checked)} />
            ConsiderOnlyEthernetTopologyEcus
          </label>
        </div>

        {/* NPduConfig */}
        <div id="fw-npduConfig" style={SectionDivider()}>
          <h3 style={{ ...T.cardTitle, marginBottom: '12px' }}>NPdu configuration</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <label style={{ ...T.label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!npdu.ManageVlansInCom} onChange={e => setNpdu('ManageVlansInCom', e.target.checked)} />
              ManageVlansInCom
            </label>
            <label style={{ ...T.label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!npdu.RestrictNPduChannelsInCom} onChange={e => setNpdu('RestrictNPduChannelsInCom', e.target.checked)} />
              RestrictNPduChannelsInCom
            </label>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ ...T.label, marginBottom: 0 }}>IPMacTable</label>
              <AddBtn onClick={() => setNpdu('IPMacTable', [...(Array.isArray(npdu.IPMacTable) ? npdu.IPMacTable : []), ['', '']])} label="+ Add Pair" />
            </div>

            {(Array.isArray(npdu.IPMacTable) ? npdu.IPMacTable : []).map((pair: any, idx: number) => (
              <CardRow key={idx}>
                <RemoveBtn onClick={() => setNpdu('IPMacTable', (npdu.IPMacTable as any[]).filter((_: any, i: number) => i !== idx))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div><label style={T.label}>IP Address</label>
                    <input style={T.input} placeholder="160.48.199.57"
                      value={Array.isArray(pair) ? (pair[0] || '') : ''}
                      onChange={e => { const t = [...(npdu.IPMacTable as any[])]; t[idx] = [e.target.value, Array.isArray(pair) ? pair[1] : '']; setNpdu('IPMacTable', t); }} /></div>
                  <div><label style={T.label}>MAC Address</label>
                    <input style={T.input} placeholder="00:00:00:00:00:39"
                      value={Array.isArray(pair) ? (pair[1] || '') : ''}
                      onChange={e => { const t = [...(npdu.IPMacTable as any[])]; t[idx] = [Array.isArray(pair) ? pair[0] : '', e.target.value]; setNpdu('IPMacTable', t); }} /></div>
                </div>
              </CardRow>
            ))}
            {(!npdu.IPMacTable || (npdu.IPMacTable as any[]).length === 0) && <p style={{ ...T.pageSub, fontSize: '12px', margin: '4px 0' }}>No IP/MAC pairs defined.</p>}
          </div>
          <label style={{ ...T.label, fontWeight: 700, fontSize: '12.5px' }}>VLans</label>
          {renderVlanTagSection('InnerTags', innerTags)}
          {renderVlanTagSection('OuterTags', outerTags)}
        </div>

        {/* SomeIPConfig */}
        <div id="fw-someIPConfig" style={SectionDivider()}>
          <h3 style={{ ...T.cardTitle, marginBottom: '12px' }}>SomeIP configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
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
          <div style={{ border: '1px solid var(--vscode-panel-border,rgba(255,255,255,.1))', borderRadius: '6px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ ...T.label, marginBottom: 0, fontWeight: 700 }}>ServerToClientPortRangeMapping</label>
              <AddBtn onClick={() => setSomeIPMapping([...serverPorts, ['', '']], [...clientPorts, ['', '']])} label="+ Add Range Pair" />
            </div>
            {serverPorts.map((_: any, idx: number) => (
              <CardRow key={idx}>
                <RemoveBtn onClick={() => setSomeIPMapping(serverPorts.filter((_: any, i: number) => i !== idx), clientPorts.filter((_: any, i: number) => i !== idx))} />
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

        {/* AppLayer Ports */}
        <div id="fw-appLayerPorts" style={SectionDivider()}>
          <h3 style={{ ...T.cardTitle, marginBottom: '12px' }}>AppLayer Ports</h3>
          {(['NPdu', 'SomeIp', 'UDPNM', 'DLT', 'SomeIpSD'] as const).map(proto => (
            <div key={proto} style={{ marginBottom: '12px' }}>
              <label style={T.label}>{proto}</label>
              <input style={T.input} placeholder="e.g. 3000, 3100-3200, 3208"
                value={portInputs[proto] ?? ''}
                onChange={e => setPortInputs(p => ({ ...p, [proto]: e.target.value }))}
                onBlur={e => { setEth('appLayerPorts', { ...appPorts, [proto]: parsePortList(e.target.value) }); setDirty(true); }} />
            </div>
          ))}
        </div>

        {/* EthernetTopology */}
        <div id="fw-ethernetTopology" style={SectionDivider()}>
          <h3 style={{ ...T.cardTitle, marginBottom: '12px' }}>EthernetTopology</h3>

          {/* EthProtoPrioConfig */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ ...T.label, marginBottom: 0, fontWeight: 700 }}>EthProtoPrioConfig</label>
              <AddBtn onClick={() => setTopoProtoCfg([...ethProtoCfg, { Protocol: 'TCP', DefaultPriority: 0, Ports: [] }])} label="+ Add Protocol" />
            </div>

            {ethProtoCfg.map((entry: any, idx: number) => (
              <CardRow key={idx}>
                <RemoveBtn onClick={() => setTopoProtoCfg(ethProtoCfg.filter((_: any, i: number) => i !== idx))} />
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
                        <div key={pi} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px 28px', gap: '6px', alignItems: 'end', marginBottom: '6px' }}>
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
                          <button onClick={() => setPorts(ports.filter((_: any, j: number) => j !== pi))}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#f44336', fontSize: '14px', paddingBottom: '4px' }}>X</button>
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

          {/* TopologyConfig */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ ...T.label, marginBottom: 0, fontWeight: 700 }}>TopologyConfig</label>
              <AddBtn onClick={() => setTopoTopoCfg([...topoCfg, { EcuName: '', SrcIpList: [], SrcMacAdr: '', TunTapAdapterName: '' }])} label="+ Add ECU" />
            </div>

            {topoCfg.map((ecu: any, idx: number) => (
              <CardRow key={idx}>
                <RemoveBtn onClick={() => setTopoTopoCfg(topoCfg.filter((_: any, i: number) => i !== idx))} />
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
                <div>
                  <label style={T.label}>TunTapAdapterName (optional)</label>
                  <input style={T.input} placeholder="tap adapter name" value={ecu.TunTapAdapterName || ''}
                    onChange={e => { const l = [...topoCfg]; l[idx] = { ...l[idx], TunTapAdapterName: e.target.value }; setTopoTopoCfg(l); }} />
                </div>
              </CardRow>
            ))}
            {topoCfg.length === 0 && <p style={{ ...T.pageSub, fontSize: '12px', margin: '4px 0' }}>No ECU topology entries defined.</p>}
          </div>
        </div>

        {/* ChannelToEcusMapping */}
        <div id="fw-channelToEcusMapping" style={{ ...SectionDivider(), marginBottom: '32px' }}>
          <h3 style={{ ...T.cardTitle, marginBottom: '12px' }}>ChannelToEcusMapping</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ ...T.label, marginBottom: 0 }}>Channel to ECU List</label>
            <AddBtn onClick={() => setCtEcuEntries([...ctEcuEntries, ['', []]])} label="+ Add Mapping" />
          </div>
          {ctEcuEntries.map(([ch, ecus], idx) => (
            <CardRow key={idx}>
              <RemoveBtn onClick={() => setCtEcuEntries(ctEcuEntries.filter((_, i) => i !== idx))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div><label style={T.label}>Channel Name</label>
                  <input style={T.input} placeholder="CHANNEL1" value={ch}
                    onChange={e => { const u = [...ctEcuEntries]; u[idx] = [e.target.value, ecus]; setCtEcuEntries(u); }} /></div>
                <div><label style={T.label}>ECUs (comma-separated)</label>
                  <input style={T.input} placeholder="ECU1, ECU2" value={Array.isArray(ecus) ? ecus.join(', ') : ecus}
                    onChange={e => { const u = [...ctEcuEntries]; u[idx] = [ch, e.target.value as any]; setCtEcuEntries(u); }}
                    onBlur={e => { const u = [...ctEcuEntries]; u[idx] = [ch, e.target.value.split(',').map(s => s.trim()).filter(Boolean)]; setCtEcuEntries(u); }} /></div>
              </div>
            </CardRow>
          ))}
          {ctEcuEntries.length === 0 && <p style={{ ...T.pageSub, fontSize: '12px', margin: '4px 0' }}>No channel-to-ECU mappings defined.</p>}
        </div>

      </div>
    </div>
  );
}
