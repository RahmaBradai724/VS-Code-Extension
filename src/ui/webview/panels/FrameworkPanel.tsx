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

function CardRow({ children, style, onRemove }: { children: React.ReactNode; style?: React.CSSProperties; onRemove?: () => void }) {
  return (
    <div style={{ border: '1px solid var(--vscode-panel-border,rgba(255,255,255,.1))', borderRadius: '8px', padding: '12px 14px', marginBottom: '8px', ...style }}>
      {onRemove && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button style={T.btnDanger} onClick={onRemove}>Remove</button>
        </div>
      )}
      {children}
    </div>
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
          <CardRow key={idx} onRemove={() => removeVlanTag(tagType, idx)}>
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
  // ecus may be a string mid-edit; preserve it so the controlled input doesn't reset
  const ctEcuEntries: [string, string[] | string][] = Object.entries(ctEcusRaw).map(([k, v]) => [k, Array.isArray(v) ? v : (typeof v === 'string' ? v : [])]);
  function setCtEcuEntries(entries: [string, string[] | string][]) {
    setEth('channelToEcusMapping', Object.fromEntries(entries));
    setDirty(true);
  }

  // ── shared sub-styles ─────────────────────────────────────────────────────
  const SUB_CARD: React.CSSProperties = {
    background: 'var(--vscode-editor-background)',
    border: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.2))',
    borderRadius: '8px',
    padding: '14px',
    marginBottom: '10px',
  };
  const NAV_PILL: React.CSSProperties = {
    padding: '4px 13px',
    fontSize: '11px',
    borderRadius: '999px',
    border: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.25))',
    background: 'transparent',
    cursor: 'pointer',
    color: 'var(--vscode-editor-foreground)',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  };
  const SUB_TITLE: React.CSSProperties = {
    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.07em', opacity: 0.6, marginBottom: '12px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
        <div>
          <h2 style={T.pageTitle}>Framework Configuration</h2>
          <p style={{ ...T.pageSub, marginBottom: 0 }}>Publisher, tracing and ethernet settings</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            style={{ ...T.btnPrimary, padding: '9px 22px', fontSize: '13px', opacity: dirty ? 1 : 0.5, boxShadow: dirty ? '0 2px 12px var(--vscode-button-background, rgba(0,120,212,0.4))' : 'none' }}
            disabled={!dirty} onClick={handleSave}>
            {dirty ? 'Save Changes' : 'Saved'}
          </button>
          <button style={{ ...T.btnSecondary, padding: '9px 22px', fontSize: '13px' }} onClick={handleSaveToYaml} title="Generate and save to MTF.yaml">
            Save to YAML
          </button>
        </div>
      </div>

      {/* ── Section nav pills ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px', flexShrink: 0 }}>
        {([
          { id: 'fw-connectedEcus', label: 'General' },
          { id: 'fw-publisher',     label: 'Publisher' },
          { id: 'fw-ethernet',      label: 'Ethernet' },
          { id: 'fw-npduConfig',    label: 'NPdu' },
          { id: 'fw-someIPConfig',  label: 'SomeIP' },
          { id: 'fw-appLayerPorts', label: 'App Ports' },
          { id: 'fw-ethernetTopology', label: 'Eth Topology' },
          { id: 'fw-channelToEcusMapping', label: 'CH → ECU' },
        ] as { id: string; label: string }[]).map(s => (
          <button key={s.id} style={NAV_PILL}
            onClick={() => scrollRef.current?.querySelector(`#${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable content ─────────────────────────────────────────────── */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>

        {/* ── Tracers info ───────────────────────────────────────────────────── */}
        <div id="fw-tracers" style={{ ...T.card, marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ ...SUB_TITLE, marginBottom: '2px' }}>Tracers</p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--vscode-descriptionForeground)' }}>
              <strong>{data.tracers?.length ?? 0}</strong> tracer(s) configured — manage in the <strong>Tracers</strong> panel.
            </p>
          </div>
          <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: 'var(--vscode-button-background)', color: 'var(--vscode-button-foreground)', fontWeight: 700 }}>
            {data.tracers?.length ?? 0}
          </span>
        </div>

        {/* ── General ────────────────────────────────────────────────────────── */}
        <div style={{ ...T.card, marginBottom: '10px' }}>
          <p style={SUB_TITLE}>General</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div id="fw-connectedEcus">
              <label style={T.label}>Connected ECUs (DUT's) — comma-separated</label>
              <input style={T.input} placeholder="ECU1, ECU2, ECU3"
                value={ecuInput}
                onChange={e => setEcuInput(e.target.value)}
                onBlur={e => setD('connectedEcus', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
            </div>
            <div id="fw-servicePack">
              <label style={T.label}>Service Pack Name</label>
              <input style={T.input} placeholder="ServicePack_name" value={data.servicePack || ''} onChange={e => setD('servicePack', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Publisher ──────────────────────────────────────────────────────── */}
        <div id="fw-publisher" style={{ ...T.card, marginBottom: '10px' }}>
          <p style={SUB_TITLE}>Publisher Configuration</p>
          <div style={{ marginBottom: '14px', maxWidth: '280px' }}>
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
                    <CardRow key={i} style={isDup ? { borderColor: 'var(--vscode-editorError-foreground)' } : undefined} onRemove={() => setD('channelsGroups', groups.filter((_, j) => j !== i))}>
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
                            <label key={chName} title={wouldDup ? 'Would create a duplicate group' : undefined}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: wouldDup ? 'not-allowed' : 'pointer', padding: '3px 8px', borderRadius: '4px', background: checked ? 'var(--vscode-button-background)' : 'var(--vscode-input-background)', color: checked ? 'var(--vscode-button-foreground)' : 'inherit', border: '1px solid var(--vscode-panel-border,rgba(255,255,255,.1))', opacity: wouldDup ? 0.45 : 1 }}>
                              <input type="checkbox" checked={checked} disabled={wouldDup} style={{ margin: 0 }}
                                onChange={() => { if (wouldDup) return; const updated = [...groups]; updated[i] = nextGrp; setD('channelsGroups', updated); }} />
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

        {/* ── Ethernet Settings ──────────────────────────────────────────────── */}
        <div id="fw-ethernet" style={{ ...T.card, marginBottom: '10px' }}>
          <p style={SUB_TITLE}>Ethernet Settings</p>
          <label style={{ ...T.label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={!!(eth as any).considerOnlyEthernetTopologyEcus}
              onChange={e => setEth('considerOnlyEthernetTopologyEcus', e.target.checked)} />
            ConsiderOnlyEthernetTopologyEcus
          </label>
        </div>

        {/* ── NPdu Configuration ─────────────────────────────────────────────── */}
        <div id="fw-npduConfig" style={{ ...T.card, marginBottom: '10px' }}>
          <p style={SUB_TITLE}>NPdu Configuration</p>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
            <label style={{ ...T.label, display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', userSelect: 'none', marginBottom: 0 }}>
              <input type="checkbox" checked={!!npdu.ManageVlansInCom} onChange={e => setNpdu('ManageVlansInCom', e.target.checked)} />
              ManageVlansInCom
            </label>
            <label style={{ ...T.label, display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', userSelect: 'none', marginBottom: 0 }}>
              <input type="checkbox" checked={!!npdu.RestrictNPduChannelsInCom} onChange={e => setNpdu('RestrictNPduChannelsInCom', e.target.checked)} />
              RestrictNPduChannelsInCom
            </label>
          </div>

          {/* IPMacTable sub-card */}
          <div style={SUB_CARD}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>IPMacTable</span>
              <AddBtn onClick={() => setNpdu('IPMacTable', [...(Array.isArray(npdu.IPMacTable) ? npdu.IPMacTable : []), ['', '']])} label="+ Add Pair" />
            </div>
            {(Array.isArray(npdu.IPMacTable) ? npdu.IPMacTable : []).map((pair: any, idx: number) => (
              <CardRow key={idx} onRemove={() => setNpdu('IPMacTable', (npdu.IPMacTable as any[]).filter((_: any, i: number) => i !== idx))}>
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

          {/* VLans sub-card */}
          <div style={SUB_CARD}>
            <span style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '10px' }}>VLans</span>
            {renderVlanTagSection('InnerTags', innerTags)}
            {renderVlanTagSection('OuterTags', outerTags)}
          </div>
        </div>

        {/* ── SomeIP Configuration ───────────────────────────────────────────── */}
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

        {/* ── AppLayer Ports ─────────────────────────────────────────────────── */}
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

        {/* ── EthernetTopology ───────────────────────────────────────────────── */}
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

        {/* ── ChannelToEcusMapping ───────────────────────────────────────────── */}
        <div id="fw-channelToEcusMapping" style={{ ...T.card, marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ ...SUB_TITLE, marginBottom: 0 }}>Channel → ECU Mapping</p>
            <AddBtn onClick={() => setCtEcuEntries([...ctEcuEntries, ['', []]])} label="+ Add Mapping" />
          </div>
          {ctEcuEntries.map(([ch, ecus], idx) => (
            <CardRow key={idx} onRemove={() => setCtEcuEntries(ctEcuEntries.filter((_, i) => i !== idx))}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div><label style={T.label}>Channel Name</label>
                  <input style={T.input} placeholder="CHANNEL1" value={ch}
                    onChange={e => { const u = [...ctEcuEntries]; u[idx] = [e.target.value, ecus]; setCtEcuEntries(u); }} /></div>
                <div><label style={T.label}>ECUs (comma-separated)</label>
                  <input style={T.input} placeholder="ECU1, ECU2" value={Array.isArray(ecus) ? ecus.join(', ') : (ecus as string)}
                    onChange={e => { const u = [...ctEcuEntries]; u[idx] = [ch, e.target.value]; setCtEcuEntries(u); }}
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
