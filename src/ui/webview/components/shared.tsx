import React from 'react';
import { FieldDef } from '../types';
import { T } from '../theme';
export { T }; // re-export for backward compat with panels

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
      fontSize: '10px', padding: '3px 9px', borderRadius: '999px',
      background: color + '20', color, fontWeight: 700,
      border: `1px solid ${color}45`,
      whiteSpace: 'nowrap',
      letterSpacing: '0.02em',
      boxShadow: `0 0 8px ${color}18`,
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
    <div
      className="ccm-row"
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '11px 16px',
        background: 'var(--vscode-editorWidget-background)',
        border: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.2))',
        borderRadius: '10px', marginBottom: '6px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          {badgeColor && (
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: badgeColor, flexShrink: 0,
              boxShadow: `0 0 6px ${badgeColor}80`,
            }} />
          )}
          <span style={{ fontWeight: 600, fontSize: '13px' }}>{name}</span>
          <Badge label={badgeLabel} color={badgeColor} />
        </div>
        {meta && <span style={{ fontSize: '11px', opacity: 0.45, paddingLeft: badgeColor ? '17px' : '0' }}>{meta}</span>}
      </div>
      <button style={T.btnDanger} onClick={onDelete}>Remove</button>
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────
interface SectionHeaderProps { title: string; count?: number; action?: React.ReactNode; }
export function SectionHeader({ title, count, action }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>{title}</h2>
        {count !== undefined && count > 0 && (
          <span
            className="ccm-badge"
            style={{
              fontSize: '11px', padding: '3px 10px', borderRadius: '999px',
              background: 'var(--vscode-button-background)',
              color: 'var(--vscode-button-foreground)',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}
