import React from 'react';
import { T } from '../../components/shared';
import { REGEX } from '../../types';
import { CardRow, AddBtn, SUB_CARD, SUB_TITLE } from './shared';

const ERR_COLOR = 'var(--vscode-editorError-foreground, #f44747)';
const errStyle = (invalid: boolean) => invalid ? { borderColor: ERR_COLOR, outline: `1px solid ${ERR_COLOR}` } : {};
const errText = (msg: string) => <span style={{ fontSize: '11px', color: ERR_COLOR, display: 'block', marginTop: '2px' }}>{msg}</span>;

function ipErr(val: string): string | null {
  return val && !REGEX.IPV4.test(val) && !REGEX.IPV6.test(val) ? 'Expected a valid IPv4 or IPv6 address' : null;
}
function macErr(val: string): string | null {
  return val && !REGEX.MAC.test(val) ? 'Expected: XX:XX:XX:XX:XX:XX (hex pairs, colon-separated)' : null;
}
function ipListErr(raw: string | string[]): string | null {
  const items = (Array.isArray(raw) ? raw : raw.split(',')).map(s => s.trim()).filter(Boolean);
  const bad = items.filter(ip => !REGEX.IPV4.test(ip) && !REGEX.IPV6.test(ip));
  return bad.length ? `Invalid IP(s): ${bad.join(', ')}` : null;
}

interface Props {
  npdu: any;
  vlans: any;
  innerTags: any[];
  outerTags: any[];
  setNpdu: (key: string, val: any) => void;
  setEth: (key: string, val: any) => void;
  setDirty: (d: boolean) => void;
}

export function NpduSection({ npdu, vlans, innerTags, outerTags, setNpdu, setEth, setDirty }: Props) {
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
            <input style={{ ...T.input, ...errStyle(!!ipListErr(tag.IPList)) }}
              placeholder="160.48.199.57, 160.48.199.100"
              value={Array.isArray(tag.IPList) ? tag.IPList.join(', ') : (tag.IPList || '')}
              onChange={e => setVlanTag(tagType, idx, 'IPList', e.target.value)}
              onBlur={e => setVlanTag(tagType, idx, 'IPList', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} />
            {ipListErr(tag.IPList) && errText(ipListErr(tag.IPList)!)}
          </CardRow>
        ))}
        {tags.length === 0 && <p style={{ ...T.pageSub, fontSize: '12px', margin: '4px 0' }}>No {tagType} defined.</p>}
      </div>
    );
  }

  return (
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
                <input style={{ ...T.input, ...errStyle(!!ipErr(Array.isArray(pair) ? (pair[0] || '') : '')) }}
                  placeholder="160.48.199.57"
                  value={Array.isArray(pair) ? (pair[0] || '') : ''}
                  onChange={e => { const t = [...(npdu.IPMacTable as any[])]; t[idx] = [e.target.value, Array.isArray(pair) ? pair[1] : '']; setNpdu('IPMacTable', t); }} />
                {ipErr(Array.isArray(pair) ? (pair[0] || '') : '') && errText(ipErr(Array.isArray(pair) ? (pair[0] || '') : '')!)}
              </div>
              <div><label style={T.label}>MAC Address</label>
                <input style={{ ...T.input, ...errStyle(!!macErr(Array.isArray(pair) ? (pair[1] || '') : '')) }}
                  placeholder="00:00:00:00:00:39"
                  value={Array.isArray(pair) ? (pair[1] || '') : ''}
                  onChange={e => { const t = [...(npdu.IPMacTable as any[])]; t[idx] = [Array.isArray(pair) ? pair[0] : '', e.target.value]; setNpdu('IPMacTable', t); }} />
                {macErr(Array.isArray(pair) ? (pair[1] || '') : '') && errText(macErr(Array.isArray(pair) ? (pair[1] || '') : '')!)}
              </div>
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
  );
}
