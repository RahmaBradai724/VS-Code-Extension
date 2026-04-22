import React from 'react';
import { T } from '../../components/shared';

interface Props {
  referencedNames: string[];
  configuredNames: Set<string>;
  unconfiguredNames: string[];
  onConfigure: (name: string) => void;
}

export function ReferencedTracersCard({ referencedNames, configuredNames, unconfiguredNames, onConfigure }: Props) {
  if (referencedNames.length === 0) return null;

  return (
    <div style={{ ...T.card, marginBottom: '16px' }}>
      <p style={{ ...T.cardTitle, marginBottom: '12px' }}>Tracer Names from Logical Channels</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {referencedNames.map(name => {
          const isConfigured = configuredNames.has(name);
          return (
            <div
              key={name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '5px',
                background: 'var(--vscode-input-background)',
                border: `1px solid ${isConfigured ? '#2d6a2d' : '#6a4a2d'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                  background: isConfigured ? '#4caf50' : '#ff9800',
                }} />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{name}</span>
                <span style={{ fontSize: '11px', opacity: 0.5 }}>
                  {isConfigured ? 'Configured' : 'Not configured'}
                </span>
              </div>
              {!isConfigured && (
                <button
                  style={{ ...T.btnSmall }}
                  onClick={() => onConfigure(name)}
                >
                  Configure →
                </button>
              )}
            </div>
          );
        })}
      </div>
      {unconfiguredNames.length > 0 && (
        <p style={{ fontSize: '11px', opacity: 0.45, marginTop: '10px', marginBottom: 0 }}>
          {unconfiguredNames.length} tracer{unconfiguredNames.length > 1 ? 's' : ''} referenced by channels but not yet configured.
        </p>
      )}
    </div>
  );
}
