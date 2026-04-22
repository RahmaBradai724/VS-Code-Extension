import React from 'react';
import { T } from '../../components/shared';

interface StatItem {
  label: string;
  value: number;
  color: string;
  icon: string;
}

interface Props {
  logicalCount: number;
  hardwareCount: number;
  mappingsCount: number;
}

export function StatCards({ logicalCount, hardwareCount, mappingsCount }: Props) {
  const items: StatItem[] = [
    { label: 'Logical Channels',  value: logicalCount,   color: '#569cd6', icon: '⬡' },
    { label: 'Hardware Channels', value: hardwareCount,  color: '#4ec9b0', icon: '⬢' },
    { label: 'Mappings',          value: mappingsCount,  color: '#c678dd', icon: '⟷' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
      {items.map(({ label, value, color, icon }) => (
        <div
          key={label}
          className="ccm-stat-card"
          style={{
            ...T.card,
            textAlign: 'center',
            borderColor: color + '50',
            marginBottom: 0,
            padding: '20px 16px',
            background: `linear-gradient(135deg, var(--vscode-editorWidget-background), ${color}08)`,
            boxShadow: `0 2px 12px rgba(0,0,0,0.1), inset 0 1px 0 ${color}20`,
          }}
        >
          <div style={{ fontSize: '22px', opacity: 0.3, marginBottom: '6px', color }}>{icon}</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: '11px', opacity: 0.55, marginTop: '6px', fontWeight: 500 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}
