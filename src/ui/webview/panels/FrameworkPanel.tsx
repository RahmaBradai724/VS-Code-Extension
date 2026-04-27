import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import { FrameworkData, FrameworkSection } from '../types';
import { T } from '../components/shared';
import { GeneralSection } from './framework/GeneralSection';
import { PublisherSection } from './framework/PublisherSection';
import { NpduSection } from './framework/NpduSection';
import { SomeIPSection } from './framework/SomeIPSection';
import { AppPortsSection } from './framework/AppPortsSection';
import { TopologySection } from './framework/TopologySection';
import { ChannelMappingSection } from './framework/ChannelMappingSection';
import { SUB_TITLE } from './framework/shared';

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

function portListToStringInit(v: any): string {
  if (v == null) return '';
  if (Array.isArray(v)) return v.map((p: any) => Array.isArray(p) ? `${p[0]}-${p[1]}` : String(p)).join(', ');
  return String(v);
}

export default function FrameworkPanel() {
  const { state, dispatch, send, notify } = useApp();
  const fw = state.frameworkData;
  const panelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
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

  function scrollToSection(sectionId: string, behavior: ScrollBehavior = 'smooth') {
    const root = panelRef.current;
    const scroller = root?.closest('.ccm-panel-area') as HTMLDivElement | null;
    const target = root?.querySelector<HTMLElement>(`#${sectionId}`);
    if (!scroller || !target) return;

    const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;
    const offset = navHeight + 12;
    const nextTop =
      scroller.scrollTop +
      target.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top -
      offset;

    scroller.scrollTo({ top: Math.max(0, nextTop), behavior });
  }

  useEffect(() => {
    const section = state.frameworkSection;
    if (!section) return;
    scrollToSection(SECTION_IDS[section]);
  }, [state.frameworkSection]);

  // Live-sync local data into global state so the YAML preview stays in sync
  // (same logic as logical channels � immediate, no debounce)

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

  // EthernetTopology
  const topoData = (eth as any).ethernetTopology || {};
  const ethProtoCfg: any[] = topoData.EthProtoPrioConfig || [];
  const topoCfg: any[] = topoData.TopologyConfig || [];
  function setTopo(val: any) { setEth('ethernetTopology', val); setDirty(true); }
  function setTopoProtoCfg(list: any[]) { setTopo({ ...topoData, EthProtoPrioConfig: list }); }
  function setTopoTopoCfg(list: any[]) { setTopo({ ...topoData, TopologyConfig: list }); }

  // ChannelToEcusMapping
  const ctEcusRaw = (eth as any).channelToEcusMapping || {};
  const ctEcuEntries: [string, string[] | string][] = Object.entries(ctEcusRaw).map(([k, v]) => [k, Array.isArray(v) ? v : (typeof v === 'string' ? v : [])]);
  function setCtEcuEntries(entries: [string, string[] | string][]) {
    setEth('channelToEcusMapping', Object.fromEntries(entries));
    setDirty(true);
  }

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

  return (
    <div ref={panelRef} style={{ display: 'flex', flexDirection: 'column' }}>

      {/* -- Header (not sticky) -------------------------------------------- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexShrink: 0 }}>
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

      {/* -- Sticky Section nav pills --------------------------------------- */}
      <div ref={navRef} style={{
        position: 'sticky',
        top: 'calc(-1 * var(--ccm-panel-pad, 24px))',
        zIndex: 5,
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        margin: '0 calc(-1 * var(--ccm-panel-pad, 24px)) 18px',
        padding: '0 var(--ccm-panel-pad, 24px) 14px',
        background: 'var(--vscode-editor-background)',
        borderBottom: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.16))',
      }}>
        {([
          { id: 'fw-connectedEcus', label: 'General' },
          { id: 'fw-publisher',     label: 'Publisher' },
          { id: 'fw-ethernet',      label: 'Ethernet' },
          { id: 'fw-npduConfig',    label: 'NPdu' },
          { id: 'fw-someIPConfig',  label: 'SomeIP' },
          { id: 'fw-appLayerPorts', label: 'App Ports' },
          { id: 'fw-ethernetTopology', label: 'Eth Topology' },
          { id: 'fw-channelToEcusMapping', label: 'ECU Mapping' },
        ] as { id: string; label: string }[]).map(s => (
          <button key={s.id} style={NAV_PILL}
            onClick={() => scrollToSection(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      {/* -- Content ---------------------------------------------------------- */}
      <div style={{ paddingRight: '4px' }}>

        <GeneralSection data={data} ecuInput={ecuInput} setEcuInput={setEcuInput} setD={setD} tracerCount={data.tracers?.length ?? 0} />

        <PublisherSection data={data} setD={setD} logicalChannelNames={state.logicalChannels.map((ch: any) => ch.name).filter(Boolean)} />

        {/* -- Ethernet Settings ------------------------------------------------ */}
        <div id="fw-ethernet" style={{ ...T.card, marginBottom: '10px' }}>
          <p style={SUB_TITLE}>Ethernet Settings</p>
          <label style={{ ...T.label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={!!(eth as any).considerOnlyEthernetTopologyEcus}
              onChange={e => setEth('considerOnlyEthernetTopologyEcus', e.target.checked)} />
            ConsiderOnlyEthernetTopologyEcus
          </label>
        </div>

        <NpduSection npdu={npdu} vlans={vlans} innerTags={innerTags} outerTags={outerTags} setNpdu={setNpdu} setEth={setEth} setDirty={setDirty} />

        <SomeIPSection someip={someip} serverPorts={serverPorts} clientPorts={clientPorts} setEthNested={setEthNested} setSomeIPMapping={setSomeIPMapping} />

        <AppPortsSection appPorts={appPorts} portInputs={portInputs} setPortInputs={setPortInputs} setEth={setEth} setDirty={setDirty} />

        <TopologySection
          ethProtoCfg={ethProtoCfg}
          topoCfg={topoCfg}
          setTopoProtoCfg={setTopoProtoCfg}
          setTopoTopoCfg={setTopoTopoCfg}
          tunTapVirtualAdapterNames={
            (state.hardwareChannels as any[])
              .filter(h => h.subclass === 'TunTapBridge')
              .flatMap((h: any) => (h.tunTapAdapters ?? []).map((a: any) => a.name).filter(Boolean))
          }
        />

        <div style={{ marginBottom: '32px' }}>
          <ChannelMappingSection
            ctEcuEntries={ctEcuEntries}
            setCtEcuEntries={setCtEcuEntries}
            logicalChannelNames={state.logicalChannels.map((ch: any) => ch.name).filter(Boolean)}
          />
        </div>

      </div>
    </div>
  );

}
