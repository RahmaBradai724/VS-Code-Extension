import React from 'react';
import { FieldDef } from '../types';

// ── Shared style tokens ───────────────────────────────────────────────────
export const T = {
  card: {
    background: 'var(--vscode-editorWidget-background)',
    border: '1px solid var(--vscode-panel-border, #3a3a3a)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  } as React.CSSProperties,
  cardTitle: { fontSize: '13px', fontWeight: 600, marginBottom: '12px', opacity: 0.9 } as React.CSSProperties,
  pageTitle: { fontSize: '19px', fontWeight: 700, marginBottom: '20px' } as React.CSSProperties,
  label: { fontSize: '11px', opacity: 0.65, marginBottom: '4px', display: 'block' } as React.CSSProperties,
  input: {
    width: '100%', padding: '7px 10px',
    background: 'var(--vscode-input-background)',
    color: 'var(--vscode-input-foreground)',
    border: '1px solid var(--vscode-input-border, var(--vscode-panel-border, #3a3a3a))',
    borderRadius: '4px', fontSize: '12px', outline: 'none', boxSizing: 'border-box',
  } as React.CSSProperties,
  textarea: {
    width: '100%', padding: '7px 10px',
    background: 'var(--vscode-input-background)',
    color: 'var(--vscode-input-foreground)',
    border: '1px solid var(--vscode-input-border, var(--vscode-panel-border, #3a3a3a))',
    borderRadius: '4px', fontSize: '12px', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  select: {
    width: '100%', padding: '7px 10px',
    background: 'var(--vscode-dropdown-background, var(--vscode-input-background))',
    color: 'var(--vscode-dropdown-foreground, var(--vscode-input-foreground))',
    border: '1px solid var(--vscode-dropdown-border, var(--vscode-panel-border, #3a3a3a))',
    borderRadius: '4px', fontSize: '12px', outline: 'none', cursor: 'pointer',
  } as React.CSSProperties,
  btnPrimary: {
    padding: '7px 16px',
    background: 'var(--vscode-button-background)', color: 'var(--vscode-button-foreground)',
    border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
  btnSecondary: {
    padding: '7px 16px',
    background: 'transparent', color: 'var(--vscode-editor-foreground)',
    border: '1px solid var(--vscode-panel-border, #3a3a3a)', borderRadius: '5px', cursor: 'pointer',
    fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap',
  } as React.CSSProperties,
  btnDanger: {
    padding: '5px 12px',
    background: 'transparent', color: '#f87171',
    border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', fontSize: '11px',
  } as React.CSSProperties,
  btnSmall: {
    padding: '4px 10px',
    background: 'var(--vscode-button-background)', color: 'var(--vscode-button-foreground)',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 500,
  } as React.CSSProperties,
  row: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } as React.CSSProperties,
  divider: { height: '1px', background: 'var(--vscode-panel-border, #3a3a3a)', margin: '12px 0' } as React.CSSProperties,
  empty: {
    padding: '32px 16px', textAlign: 'center', opacity: 0.45, fontSize: '13px',
    border: '1px dashed var(--vscode-panel-border, #3a3a3a)', borderRadius: '6px',
  } as React.CSSProperties,
};

// ── DynamicField: renders a form field from FieldDef ──────────────────────
interface DynamicFieldProps {
  def: FieldDef;
  value: any;
  onChange: (key: string, value: any) => void;
}

export function DynamicField({ def, value, onChange }: DynamicFieldProps) {
  if (def.type === 'checkbox') {
    return (
      <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          id={def.key}
          checked={!!value}
          onChange={e => onChange(def.key, e.target.checked)}
          style={{ width: 'auto', cursor: 'pointer' }}
        />
        <label htmlFor={def.key} style={{ ...T.label, marginBottom: 0, cursor: 'pointer', opacity: 0.8 }}>
          {def.label}
        </label>
      </div>
    );
  }
  if (def.type === 'select') {
    return (
      <div style={{ marginBottom: '10px' }}>
        <label style={T.label}>{def.label}</label>
        <select style={T.select} value={value ?? ''} onChange={e => onChange(def.key, e.target.value)}>
          <option value="">-- None --</option>
          {def.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: '10px' }}>
      <label style={T.label}>{def.label}</label>
      <input
        style={T.input}
        type={def.type === 'number' ? 'number' : 'text'}
        placeholder={def.placeholder || ''}
        value={value ?? ''}
        onChange={e => onChange(def.key, def.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
      />
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────
interface BadgeProps { label: string; color?: string; }
export function Badge({ label, color = '#569cd6' }: BadgeProps) {
  return (
    <span style={{
      fontSize: '10px', padding: '2px 7px', borderRadius: '10px',
      background: color + '22', color, fontWeight: 600, border: `1px solid ${color}44`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

// ── ChannelRow ─────────────────────────────────────────────────────────────
interface ChannelRowProps {
  name: string;
  badgeLabel: string;
  badgeColor?: string;
  meta?: string;
  onDelete: () => void;
}
export function ChannelRow({ name, badgeLabel, badgeColor, meta, onDelete }: ChannelRowProps) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px',
      background: 'var(--vscode-editorWidget-background)',
      border: '1px solid var(--vscode-panel-border, #3a3a3a)',
      borderRadius: '6px', marginBottom: '6px',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '13px' }}>{name}</span>
          <Badge label={badgeLabel} color={badgeColor} />
        </div>
        {meta && <span style={{ fontSize: '11px', opacity: 0.5 }}>{meta}</span>}
      </div>
      <button style={T.btnDanger} onClick={onDelete}>Remove</button>
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────
interface SectionHeaderProps { title: string; count?: number; action?: React.ReactNode; }
export function SectionHeader({ title, count, action }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h2 style={{ fontSize: '19px', fontWeight: 700, margin: 0 }}>{title}</h2>
        {count !== undefined && count > 0 && (
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
            background: 'var(--vscode-button-background)', color: 'var(--vscode-button-foreground)',
          }}>{count}</span>
        )}
      </div>
      {action}
    </div>
  );
}
