import React from 'react';
import { CHANNEL_COLORS } from '../../types';
import { T } from '../../components/shared';
import { HW_COLORS, HW_IMAGES, ROW_H, ROW_GAP, hdrStyle } from './constants';

interface Props {
  logicalChannels: any[];
  hardwareChannels: any[];
  mappings: any[];
  currentConfigId: any;
  currentConfigName: any;
  mappedLogicalIds: Set<string>;
  mappedHardwareIds: Set<string>;
  logicalYMap: Map<string, number>;
  hardwareYMap: Map<string, number>;
  svgHeight: number;
}

export function MappingTopology({
  logicalChannels, hardwareChannels, mappings,
  currentConfigId, currentConfigName,
  mappedLogicalIds, mappedHardwareIds,
  logicalYMap, hardwareYMap, svgHeight,
}: Props) {
  return (
    <div style={{ ...T.card, marginBottom: 24 }}>
      <p style={T.cardTitle}>
        Mapping Topology
        {currentConfigName && (
          <span style={{ fontWeight: 400, opacity: 0.45, marginLeft: 8, fontSize: 11 }}>- {currentConfigName}</span>
        )}
      </p>

      {!currentConfigId ? (
        <div style={T.empty}>Load a configuration to see the mapping topology.</div>
      ) : logicalChannels.length === 0 && hardwareChannels.length === 0 ? (
        <div style={T.empty}>No channels defined yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', marginBottom: 12 }}>
            <span style={hdrStyle}>Logical Channels</span>
            <span style={{ ...hdrStyle, textAlign: 'center' }}>Connections</span>
            <span style={{ ...hdrStyle, textAlign: 'right' }}>Hardware</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', alignItems: 'start' }}>

            {/* Logical column */}
            <div>
              {logicalChannels.map(ch => {
                const color = CHANNEL_COLORS[ch.category] ?? '#888';
                const mapped = mappedLogicalIds.has(ch.id);
                return (
                  <div key={ch.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    paddingLeft: 14, paddingRight: 12,
                    border: `1px solid ${mapped ? color : 'var(--vscode-panel-border,#3a3a3a)'}`,
                    background: mapped ? color + '15' : 'var(--vscode-editorWidget-background)',
                    borderRadius: 8, marginBottom: ROW_GAP, height: ROW_H,
                  }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}99` }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</div>
                      <div style={{ fontSize: 10, opacity: 0.45, marginTop: 3 }}>{ch.category}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SVG animated connectors */}
            <div>
              <svg width="120" height={svgHeight} style={{ display: 'block', overflow: 'visible' }}>
                <defs>
                  {mappings.map(m => {
                    const lch = logicalChannels.find(c => c.id === m.logicalChannelId);
                    const color = CHANNEL_COLORS[lch?.category ?? ''] ?? '#569cd6';
                    return (
                      <linearGradient key={`grad-${m.id}`} id={`grad-${m.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="50%" stopColor={color} stopOpacity="0.9" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.2" />
                      </linearGradient>
                    );
                  })}
                </defs>
                {mappings.map(m => {
                  const ly = logicalYMap.get(m.logicalChannelId);
                  const hy = hardwareYMap.get(m.hardwareChannelId);
                  if (ly === undefined || hy === undefined) { return null; }
                  const lch = logicalChannels.find(c => c.id === m.logicalChannelId);
                  const color = CHANNEL_COLORS[lch?.category ?? ''] ?? '#569cd6';
                  const pathD = `M 0 ${ly} C 60 ${ly}, 60 ${hy}, 120 ${hy}`;
                  return (
                    <g key={m.id}>
                      <path d={pathD} stroke={color} strokeWidth="6" fill="none" strokeOpacity="0.07" />
                      <path d={pathD} stroke={`url(#grad-${m.id})`} strokeWidth="2" fill="none" />
                      <circle r="3.5" fill={color}>
                        <animateMotion dur="1.8s" repeatCount="indefinite" path={pathD} />
                      </circle>
                    </g>
                  );
                })}
                {mappings.length === 0 && (
                  <text x="60" y={svgHeight / 2} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.3">no mappings</text>
                )}
              </svg>
            </div>

            {/* Hardware column with product image thumbnails */}
            <div>
              {hardwareChannels.map(hw => {
                const color  = HW_COLORS[hw.subclass] ?? '#888';
                const mapped = mappedHardwareIds.has(hw.id);
                const imgSrc = HW_IMAGES[hw.subclass];
                return (
                  <div key={hw.id} style={{
                    display: 'flex', alignItems: 'center',
                    border: `1px solid ${mapped ? color : 'var(--vscode-panel-border,#3a3a3a)'}`,
                    background: mapped ? color + '12' : 'var(--vscode-editorWidget-background)',
                    borderRadius: 8, marginBottom: ROW_GAP, height: ROW_H, overflow: 'hidden',
                  }}>
                    <div style={{
                      width: ROW_H, height: ROW_H, flexShrink: 0,
                      background: imgSrc ? '#fff' : color + '18',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRight: `1px solid ${color}30`,
                    }}>
                      {imgSrc ? (
                        <img src={imgSrc} alt={hw.subclass}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
                      ) : (
                        <svg width={30} height={30} viewBox="0 0 16 16" fill={color} opacity={0.4}>
                          <path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 2v8h8V4H4zm1 2h6v1H5V6zm0 2h6v1H5V8zm0 2h4v1H5v-1z"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', padding: '0 12px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hw.name}</div>
                      <div style={{ fontSize: 10, opacity: 0.45, marginTop: 3 }}>{hw.subclass}</div>
                    </div>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, marginRight: 12, boxShadow: `0 0 8px ${color}99` }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
