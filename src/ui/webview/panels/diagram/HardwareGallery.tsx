import React from 'react';
import { T } from '../../components/shared';
import { HW_COLORS, HW_IMAGES, PRODUCT_CATALOGUE } from './constants';

interface Props {
  hardwareChannels: any[];
  hwToLogical: Map<string, string[]>;
  openUrl: (url: string) => void;
}

export function HardwareGallery({ hardwareChannels, hwToLogical, openUrl }: Props) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ ...T.cardTitle, marginBottom: 6, fontSize: 13 }}>Hardware Devices in This Config</p>
      <p style={{ fontSize: 11, opacity: 0.5, marginBottom: 16 }}>
        Each device with its product image and the logical channels mapped to it.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
        {hardwareChannels.map(hw => {
          const color   = HW_COLORS[hw.subclass] ?? '#888';
          const imgSrc  = HW_IMAGES[hw.subclass];
          const mapped  = hwToLogical.get(hw.id) ?? [];
          const prodUrl = PRODUCT_CATALOGUE.find(p => p.protocols.some(() => true) && imgSrc && p.image === imgSrc)?.url
                       ?? 'https://technica-engineering.de/en-gb/products/hardware-products';
          return (
            <div key={hw.id} style={{ borderRadius: 8, border: `1px solid ${color}40`, overflow: 'hidden', background: 'var(--vscode-editorWidget-background)', display: 'flex', flexDirection: 'column' }}>
              {/* Product image or placeholder */}
              <div style={{ height: 140, background: imgSrc ? '#fff' : color + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={hw.subclass}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', padding: 8 }}
                  />
                ) : (
                  <svg width={56} height={56} viewBox="0 0 16 16" fill={color} opacity={0.3}>
                    <path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 2v8h8V4H4zm1 2h6v1H5V6zm0 2h6v1H5V8zm0 2h4v1H5v-1z"/>
                  </svg>
                )}
                {/* subclass badge */}
                <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: color + 'cc', color: '#fff', letterSpacing: '0.04em' }}>
                  {hw.subclass}
                </span>
              </div>

              {/* Card body */}
              <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color }}>{hw.name}</div>

                {mapped.length > 0 ? (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.45, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Mapped logical channels
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {mapped.map(name => (
                        <div key={name} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 11, opacity: 0.35, fontStyle: 'italic' }}>No mappings yet</div>
                )}

                {imgSrc && (
                  <button
                    onClick={() => openUrl(prodUrl)}
                    style={{ all: 'unset', cursor: 'pointer', marginTop: 'auto', paddingTop: 8, fontSize: 11, color, opacity: 0.75, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <svg width={10} height={10} viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                      <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                    </svg>
                    View product page
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
