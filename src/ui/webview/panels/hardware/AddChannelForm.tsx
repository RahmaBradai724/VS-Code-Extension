import React, { useState } from 'react';
import { HARDWARE_SUBCLASS_OPTIONS, HARDWARE_EXTRA_FIELDS } from '../../types';
import { T, DynamicField } from '../../components/shared';

// ── Local types (mirror of models/hardware/TunTapBridge.ts) ──────────────
interface VlanConfig {
  vlanId?: string;
  vlanEthertype?: string;
  vlanPriorityTag?: number;
  vlanCfi?: boolean;
}

interface TunTapAdapterConfig {
  name: string;
  manipulatePackets?: boolean;
  innerVlan?: VlanConfig;
  outerVlan?: VlanConfig;
}

const HW_S_ERR: React.CSSProperties = {
  display: 'block',
  marginTop: '4px',
  fontSize: '11px',
  color: '#f87171',
  lineHeight: 1.4,
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  opacity: 0.55,
  marginBottom: '8px',
  marginTop: '12px',
};

// ── Empty VLAN helper ─────────────────────────────────────────────────────
function emptyVlan(): VlanConfig {
  return { vlanId: '', vlanEthertype: '', vlanPriorityTag: 0, vlanCfi: false };
}

// ── TunTapAdaptersEditor ──────────────────────────────────────────────────
interface AdaptersEditorProps {
  adapters: TunTapAdapterConfig[];
  onChange: (adapters: TunTapAdapterConfig[]) => void;
}

function VlanSection({
  title,
  vlan,
  onChange,
}: {
  title: string;
  vlan: VlanConfig;
  onChange: (v: VlanConfig) => void;
}) {
  return (
    <div style={{ marginTop: '10px' }}>
      <p style={SECTION_LABEL}>{title}</p>
      <div className="ccm-grid2" style={T.grid2}>
        <div>
          <label style={T.label}>VLAN ID (hex)</label>
          <input style={T.input} placeholder="e.g. 0x12" value={vlan.vlanId ?? ''} onChange={e => onChange({ ...vlan, vlanId: e.target.value })} />
        </div>
        <div>
          <label style={T.label}>Ethertype (hex)</label>
          <input style={T.input} placeholder="e.g. 0x8100" value={vlan.vlanEthertype ?? ''} onChange={e => onChange({ ...vlan, vlanEthertype: e.target.value })} />
        </div>
        <div>
          <label style={T.label}>Priority Tag</label>
          <input style={T.input} type="number" placeholder="0" value={vlan.vlanPriorityTag ?? 0} onChange={e => onChange({ ...vlan, vlanPriorityTag: Number(e.target.value) })} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px' }}>
          <input type="checkbox" id={`${title}_cfi`} checked={!!vlan.vlanCfi} onChange={e => onChange({ ...vlan, vlanCfi: e.target.checked })} style={{ cursor: 'pointer' }} />
          <label htmlFor={`${title}_cfi`} style={{ ...T.label, marginBottom: 0, cursor: 'pointer' }}>CFI</label>
        </div>
      </div>
    </div>
  );
}

function emptyDraft(): TunTapAdapterConfig {
  return { name: '', manipulatePackets: false, innerVlan: emptyVlan(), outerVlan: emptyVlan() };
}

function TunTapAdaptersEditor({ adapters, onChange }: AdaptersEditorProps) {
  const [draft, setDraft] = useState<TunTapAdapterConfig>(emptyDraft());
  const [draftErr, setDraftErr] = useState('');

  function setDraftField<K extends keyof TunTapAdapterConfig>(key: K, val: TunTapAdapterConfig[K]) {
    setDraft(d => ({ ...d, [key]: val }));
  }

  function addAdapter() {
    if (!draft.name.trim()) { setDraftErr('Adapter name is required.'); return; }
    onChange([...adapters, { ...draft, name: draft.name.trim() }]);
    setDraft(emptyDraft());
    setDraftErr('');
  }

  function removeAdapter(i: number) {
    onChange(adapters.filter((_, idx) => idx !== i));
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={T.divider} />
      <p style={{ ...T.cardTitle, marginBottom: '8px', opacity: 0.7 }}>Virtual (TUN/TAP) Adapters</p>

      {/* Existing adapters */}
      {adapters.map((a, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 12px', marginBottom: '6px', borderRadius: '8px',
          background: 'var(--vscode-editorWidget-background)',
          border: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.2))',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>{a.name}</span>
            <span style={{ fontSize: '11px', opacity: 0.5 }}>
              {a.manipulatePackets ? 'Packet manipulation enabled' : `Inner ${a.innerVlan?.vlanId ?? '—'} / Outer ${a.outerVlan?.vlanId ?? '—'}`}
            </span>
          </div>
          <button style={T.btnDanger} onClick={() => removeAdapter(i)}>Remove</button>
        </div>
      ))}

      {/* Draft form */}
      <div style={{
        padding: '12px', marginTop: '8px', borderRadius: '8px',
        background: 'rgba(56, 189, 248, 0.05)',
        border: '1px dashed rgba(56, 189, 248, 0.3)',
      }}>
        <p style={SECTION_LABEL}>New Virtual Adapter</p>

        <div className="ccm-grid2" style={T.grid2}>
          <div>
            <label style={T.label}>Adapter Name *</label>
            <input
              style={{ ...T.input, ...(draftErr ? { borderColor: '#f87171', outline: '1px solid #f87171' } : {}) }}
              placeholder="e.g. Virtual_tap1"
              value={draft.name}
              onChange={e => { setDraft(d => ({ ...d, name: e.target.value })); setDraftErr(''); }}
            />
            {draftErr && <span style={HW_S_ERR}>{draftErr}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px' }}>
            <input
              type="checkbox"
              id="draft_manipulate"
              checked={!!draft.manipulatePackets}
              onChange={e => setDraftField('manipulatePackets', e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="draft_manipulate" style={{ ...T.label, marginBottom: 0, cursor: 'pointer' }}>
              Manipulate Packets
            </label>
          </div>
        </div>

        {!draft.manipulatePackets && (
          <>
            <VlanSection
              title="Inner VLAN"
              vlan={draft.innerVlan ?? emptyVlan()}
              onChange={v => setDraftField('innerVlan', v)}
            />
            <VlanSection
              title="Outer VLAN"
              vlan={draft.outerVlan ?? emptyVlan()}
              onChange={v => setDraftField('outerVlan', v)}
            />
          </>
        )}

        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          <button style={T.btnPrimary} onClick={addAdapter}>+ Add Adapter</button>
        </div>
      </div>
    </div>
  );
}

// ── Main AddChannelForm ───────────────────────────────────────────────────
interface Props {
  form: { name: string; subclass: string; extras: Record<string, any> };
  nameError: string;
  setField: (key: string, val: any) => void;
  setSubclass: (val: string) => void;
  setExtra: (key: string, val: any) => void;
  handleAdd: () => void;
  handleCancelForm: () => void;
  adapterFriendlyNames?: string[];
  /** CM devices discovered via cmconfig topology */
  discoveredCaptureModules?: Array<{ id: number; name: string; ip: string; product_family: string }>;
  /** Ethernet adapters discovered via cmconfig topology */
  discoveredEthernetAdapters?: Array<{ friendly_name: string; description: string }>;
}

export function AddChannelForm({ form, nameError, setField, setSubclass, setExtra, handleAdd, handleCancelForm,
  adapterFriendlyNames = [], discoveredCaptureModules = [], discoveredEthernetAdapters = [] }: Props) {
  const rawExtraFields = HARDWARE_EXTRA_FIELDS[form.subclass] ?? [];
  const extraFields = rawExtraFields.map(f => {
    if (f.key === 'physicalAdapterName' && adapterFriendlyNames.length > 0) {
      return { ...f, type: 'select' as const, options: ['', ...adapterFriendlyNames] };
    }
    // CM ID → dropdown with discovered devices
    if (f.key === 'cmId' && discoveredCaptureModules.length > 0) {
      const opts = discoveredCaptureModules.map(cm => ({
        value: String(cm.id),
        label: `${cm.id}  –  ${cm.ip}  (${cm.name || cm.product_family})`,
      }));
      return { ...f, type: 'select' as const, options: [{ value: '', label: '— select device —' }, ...opts] };
    }
    // EthernetAdapter friendlyName → dropdown with discovered adapters
    if (f.key === 'friendlyName' && discoveredEthernetAdapters.length > 0) {
      const opts = discoveredEthernetAdapters.map(a => ({
        value: a.friendly_name,
        label: a.friendly_name + (a.description ? `  (${a.description})` : ''),
      }));
      return { ...f, type: 'select' as const, options: [{ value: '', label: '— select adapter —' }, ...opts] };
    }
    return f;
  });
  const isTunTap = form.subclass === 'TunTapBridge';

  return (
    <div className="ccm-form-card" style={{ ...T.cardAccent, marginBottom: '20px' }}>
      <p style={T.cardTitle}>New Hardware Channel</p>

      <div style={{ marginBottom: '12px' }}>
        <label style={T.label}>Name *</label>
        <input
          style={{ ...T.input, ...(nameError ? { borderColor: '#f87171', outline: '1px solid #f87171' } : {}) }}
          placeholder="e.g. CAN_Interface_1"
          value={form.name}
          onChange={e => setField('name', e.target.value)}
        />
        {nameError && <span style={HW_S_ERR}>{nameError}</span>}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={T.label}>Hardware Type *</label>
        <select style={T.select} value={form.subclass} onChange={e => setSubclass(e.target.value)}>
          {HARDWARE_SUBCLASS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {extraFields.length > 0 && (
        <>
          <div style={T.divider} />
          <p style={{ ...T.cardTitle, marginBottom: '8px', opacity: 0.7 }}>Hardware-specific fields</p>
          <div className="ccm-grid2" style={T.grid2}>
            {extraFields.map(f => (
              <DynamicField key={f.key} def={f} value={form.extras[f.key]} onChange={setExtra} />
            ))}
          </div>
        </>
      )}

      {isTunTap && (
        <TunTapAdaptersEditor
          adapters={form.extras.tunTapAdapters ?? []}
          onChange={list => setExtra('tunTapAdapters', list)}
        />
      )}

      <div style={{ ...T.divider, marginTop: '16px' }} />
      <div style={{ ...T.row, justifyContent: 'flex-end' }}>
        <button style={T.btnSecondary} onClick={handleCancelForm}>Cancel</button>
        <button style={T.btnPrimary} onClick={handleAdd}>Add Channel</button>
      </div>
    </div>
  );
}

