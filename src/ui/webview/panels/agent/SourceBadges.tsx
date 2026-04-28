import React, { useState } from 'react';
import { AgentSource } from '../../types';
import { tokens } from '../../theme';

interface SourceBadgesProps {
  sources: AgentSource[];
}

export function SourceBadges({ sources }: SourceBadgesProps) {
  const [open, setOpen] = useState(false);
  if (!sources.length) { return null; }

  const directCount = sources.filter(source => !source.fromGraph).length;
  const graphCount = sources.length - directCount;

  return (
    <div style={{ marginTop: 6 }}>
      <button
        onClick={() => setOpen(value => !value)}
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
        {open ? 'v' : '>'}
        {' '}{directCount} source{directCount !== 1 ? 's' : ''}
        {graphCount > 0 && (
          <span style={{ color: tokens.info, opacity: 0.8 }}>
            +{graphCount} related
          </span>
        )}
      </button>

      {open && (
        <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none' }}>
          {sources.map((source, index) => (
            <li
              key={index}
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
                {source.source_url ? (
                  <a
                    href={source.source_url}
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
                    title={source.title}
                  >
                    {source.title || source.section}
                  </a>
                ) : (
                  <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                    {source.title || source.section}
                  </strong>
                )}

                {source.fromGraph && (
                  <span style={{
                    flexShrink: 0,
                    fontSize: 10,
                    background: 'rgba(96,165,250,0.12)',
                    color: tokens.info,
                    border: '1px solid rgba(96,165,250,0.4)',
                    borderRadius: 3,
                    padding: '1px 4px',
                  }}>
                    related
                  </span>
                )}

                {source.sourceType === 'workspace' && (
                  <span style={{
                    flexShrink: 0,
                    fontSize: 10,
                    background: 'rgba(34,197,94,0.12)',
                    color: '#6ee7b7',
                    border: '1px solid rgba(34,197,94,0.35)',
                    borderRadius: 3,
                    padding: '1px 4px',
                  }}>
                    workspace
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', color: tokens.fgMuted, gap: 4 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {source.section}{source.subsection ? ` > ${source.subsection}` : ''}
                </span>
                {typeof source.score === 'number' && (
                  <span style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    {Math.round(source.score * 100)}%
                    {typeof source.vectorScore === 'number' && (
                      <span style={{ opacity: 0.55, marginLeft: 3 }}>
                        (vec {Math.round(source.vectorScore * 100)}%)
                      </span>
                    )}
                  </span>
                )}
              </div>

              {source.summary && (
                <div style={{ marginTop: 4, fontSize: 11, color: tokens.fgMuted, lineHeight: 1.45 }}>
                  {source.summary}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
