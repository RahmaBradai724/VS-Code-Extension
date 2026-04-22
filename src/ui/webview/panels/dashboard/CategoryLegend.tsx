import React from 'react';
import { CHANNEL_COLORS } from '../../types';
import { T } from '../../components/shared';

export function CategoryLegend() {
  return (
    <div style={T.card}>
      <p style={T.cardTitle}>Category Legend</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {Object.entries(CHANNEL_COLORS).map(([cat, color]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '11px', opacity: 0.7 }}>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
