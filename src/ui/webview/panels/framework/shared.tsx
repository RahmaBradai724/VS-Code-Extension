import React from 'react';
import { T } from '../../components/shared';

export function CardRow({ children, style, onRemove }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onRemove?: () => void;
}) {
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

export function AddBtn({ onClick, label }: { onClick: () => void; label?: string }) {
  return <button style={{ ...T.btnSecondary, padding: '3px 10px', fontSize: '11px' }} onClick={onClick}>{label ?? '+ Add'}</button>;
}

export function portListToString(v: any): string {
  if (!v) return '';
  if (Array.isArray(v)) return v.map((p: any) => Array.isArray(p) ? `${p[0]}-${p[1]}` : String(p)).join(', ');
  return String(v);
}

export const SUB_CARD: React.CSSProperties = {
  background: 'var(--vscode-editor-background)',
  border: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.2))',
  borderRadius: '8px',
  padding: '14px',
  marginBottom: '10px',
};

export const SUB_TITLE: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.07em', opacity: 0.6, marginBottom: '12px',
};
