import React, { useState } from 'react';
import { AgentSource } from '../../types';
import { tokens } from '../../theme';

interface SourceBadgesProps {
  sources: AgentSource[];
}

export function SourceBadges({ sources }: SourceBadgesProps) {
  const [open, setOpen] = useState(false);
  if (!sources.length) { return null; }

  const directCount = sources.filter(s => !s.fromGraph).length;
  const graphCount  = sources.length - directCount;

  return (
    <div style={{ marginTop: 6 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none',
          border: `1px solid ${tokens.border}`,
          color: tokens.fgMuted,
          borderRadius: 4,
          padding: '2px 8px',
          fontSize: 11,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {open ? '▾' : '▸'}
        {' '}{directCount} source{directCount !== 1 ? 's' : ''}
        {graphCount > 0 && (
          <span style={{ color: tokens.info, opacity: 0.8 }}>
            +{graphCount} related
          </span>
        )}
      </button>

      {open && (
        <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none' }}>
          {sources.map((s, i) => (
            <li
              key={i}
              style={{
                fontSize: 11,
                marginBottom: 5,
                padding: '6px 8px',
                background: tokens.bgAlt,
                borderRadius: 4,
                border: `1px solid ${tokens.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                {s.source_url ? (
                  <a
                    href={s.source_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: tokens.info,
                      textDecoration: 'none',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 260,
                    }}
                    title={s.title}
                  >
                    {s.title || s.section}
                  </a>
                ) : (
                  <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                    {s.title || s.section}
                  </strong>
                )}
                {s.fromGraph && (
                  <span style={{
                    flexShrink: 0,
                    fontSize: 10,
                    background: 'rgba(96,165,250,0.12)',
                    color: tokens.info,
                    border: `1px solid rgba(96,165,250,0.4)`,
                    borderRadius: 3,
                    padding: '1px 4px',
                  }}>
                    related
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', color: tokens.fgMuted, gap: 4 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.section}{s.subsection ? ` › ${s.subsection}` : ''}
                </span>
                <span style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  {Math.round(s.score * 100)}%
                  <span style={{ opacity: 0.55, marginLeft: 3 }}>
                    (vec {Math.round(s.vectorScore * 100)}%)
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
