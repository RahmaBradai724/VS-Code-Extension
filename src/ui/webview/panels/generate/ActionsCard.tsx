import React from 'react';
import { T } from '../../components/shared';

interface Props {
  generating: boolean;
  aiValidating: boolean;
  yamlContent: string | null | undefined;
  frameworkData: any;
  send: (type: string, payload?: any) => void;
}

export function ActionsCard({ generating, aiValidating, yamlContent, frameworkData, send }: Props) {
  return (
    <div style={{ ...T.card, padding: '20px 22px' }}>
      <p style={{ ...T.cardTitle, marginBottom: '16px' }}>Actions</p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          style={{
            ...T.btnPrimary,
            padding: '10px 22px',
            fontSize: '13px',
            gap: '8px',
            opacity: generating ? 0.6 : 1,
            boxShadow: generating ? 'none' : '0 2px 12px var(--vscode-button-background, rgba(0,120,212,0.4))',
          }}
          disabled={generating}
          onClick={() => send('generateConfig', { frameworkData })}
        >
          {generating ? 'Generating…' : 'Generate config.yaml'}
        </button>
        <button
          style={{
            ...T.btnSecondary,
            padding: '10px 22px',
            fontSize: '13px',
            gap: '8px',
            opacity: (aiValidating || !yamlContent) ? 0.5 : 1,
          }}
          disabled={aiValidating || !yamlContent}
          onClick={() => send('runAIValidation')}
          title={!yamlContent ? 'Generate a config first' : ''}
        >
          {aiValidating ? 'Analyzing…' : 'Analyze Configuration'}
        </button>
      </div>
      {!yamlContent && (
        <p style={{ ...T.label, marginTop: '12px', marginBottom: 0, fontStyle: 'italic', opacity: 0.6 }}>
          Generate a configuration first to enable validation analysis.
        </p>
      )}
    </div>
  );
}
