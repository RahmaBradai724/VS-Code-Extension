import React from 'react';
import { T } from '../../components/shared';
import { PRODUCT_CATALOGUE } from './constants';

interface Props {
  openUrl: (url: string) => void;
}

export function ProductCatalogue({ openUrl }: Props) {
  return (
    <>
      {/* 3. Full product reference catalogue */}
      <p style={{ ...T.cardTitle, marginBottom: 6, fontSize: 13 }}>Hardware Product Reference</p>
      <p style={{ fontSize: 11, opacity: 0.5, marginBottom: 18 }}>
        All hardware types supported by MTF. Click any card to open the official product page.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 16 }}>
        {PRODUCT_CATALOGUE.map(p => (
          <button
            key={p.label}
            onClick={() => openUrl(p.url)}
            style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', borderRadius: 8, border: `1px solid ${p.color}40`, overflow: 'hidden', background: 'var(--vscode-editorWidget-background)', textAlign: 'left', transition: 'border-color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = p.color + 'a0'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = p.color + '40'; }}
          >
            {/* Image area */}
            <div style={{ height: 120, background: p.image ? '#fff' : `linear-gradient(135deg, ${p.color}10, ${p.color}25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {p.image ? (
                <img src={p.image} alt={p.label} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', padding: 10 }} />
              ) : (
                <svg width={44} height={44} viewBox="0 0 16 16" fill={p.color} opacity={0.4}>
                  <path d={p.icon} />
                </svg>
              )}
              {/* external link icon overlay */}
              <span style={{ position: 'absolute', top: 6, right: 8, opacity: 0.3 }}>
                <svg width={11} height={11} viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                  <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                </svg>
              </span>
            </div>

            {/* Card body */}
            <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: p.color, lineHeight: 1.25 }}>{p.label}</div>
                <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2 }}>{p.subtitle}</div>
              </div>
              <p style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.55, margin: 0 }}>{p.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 'auto' }}>
                {p.protocols.map(proto => (
                  <span key={proto} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: p.color + '22', color: p.color, fontWeight: 600 }}>{proto}</span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      <p style={{ fontSize: 11, opacity: 0.3, textAlign: 'center', marginTop: 8 }}>
        Source: technica-engineering.de/en-gb/products/hardware-products
      </p>
    </>
  );
}
