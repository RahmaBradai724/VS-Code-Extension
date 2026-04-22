import React from 'react';
import { T } from '../../components/shared';
import { FrameworkData } from '../../types';
import { CardRow, AddBtn, SUB_TITLE } from './shared';

const PUBLISHER_TYPES = ['SingleThreaded', 'MultiThreaded'];

interface Props {
  data: FrameworkData;
  setD: (key: keyof FrameworkData, val: any) => void;
  logicalChannelNames: string[];
}

export function PublisherSection({ data, setD, logicalChannelNames }: Props) {
  const groups: string[][] = Array.isArray(data.channelsGroups) ? data.channelsGroups : [];
  const groupKey = (g: string[]) => [...g].sort().join('|');
  const isDuplicateGroup = (candidate: string[], excludeIdx: number) =>
    candidate.length > 0 && groups.some((g, j) => j !== excludeIdx && groupKey(g) === groupKey(candidate));

  return (
    <div id="fw-publisher" style={{ ...T.card, marginBottom: '10px' }}>
      <p style={SUB_TITLE}>Publisher Configuration</p>
      <div style={{ marginBottom: '14px', maxWidth: '280px' }}>
        <label style={T.label}>Publisher Type</label>
        <select style={T.select} value={data.publisherType || 'SingleThreaded'} onChange={e => setD('publisherType', e.target.value)}>
          {PUBLISHER_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {data.publisherType === 'MultiThreaded' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ ...T.label, marginBottom: 0 }}>ChannelsGroups</label>
            <AddBtn onClick={() => setD('channelsGroups', [...groups, []])} label="+ Add Group" />
          </div>
          {logicalChannelNames.length === 0 && (
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
                  {logicalChannelNames.map(chName => {
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
      )}
    </div>
  );
}
