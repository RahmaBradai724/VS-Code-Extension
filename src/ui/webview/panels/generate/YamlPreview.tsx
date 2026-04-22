import React from 'react';
import { T } from '../../components/shared';

interface Props {
  yamlContent: string;
}

export function YamlPreview({ yamlContent }: Props) {
  return (
    <div style={T.card}>
      <p style={T.cardTitle}>Generated YAML</p>
      <pre style={{
        fontSize: '12px', lineHeight: '1.6', overflowX: 'auto',
        background: 'var(--vscode-input-background)',
        padding: '16px', borderRadius: '10px',
        border: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.2))',
        boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.12)',
        letterSpacing: '0.01em',
        maxHeight: '460px', overflowY: 'auto',
        whiteSpace: 'pre', fontFamily: 'var(--vscode-editor-font-family, monospace)',
      }}>
        {yamlContent}
      </pre>
    </div>
  );
}
