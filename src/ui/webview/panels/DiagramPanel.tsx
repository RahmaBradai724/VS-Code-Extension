import React, { useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { CHANNEL_COLORS } from '../types';
import { T } from '../components/shared';

// Real product images from Technica CDN
const CDN = 'https://cdn.prod.website-files.com/696a0fa6916b6d0324673bba/';
const HW_IMAGES: Record<string, string> = {
  CANInterface:        CDN + '699c3a76b8031b1ce951b424_TE-1171_CM-CAN-COMBO_2.0_WEB_FRONT.png',
  CIBInterface:        CDN + '699c3a76b8031b1ce951b424_TE-1171_CM-CAN-COMBO_2.0_WEB_FRONT.png',
  CMInterface:         CDN + '699c3a76b8031b1ce951b424_TE-1171_CM-CAN-COMBO_2.0_WEB_FRONT.png',
  LINCard:             CDN + '699c3a5d092a1a0d3adca266_TE-1170_CM-LIN-COMBO_2.0_WEB_FRONT.png',
  EthernetAdapter:     CDN + '699c3a8adc743999bba27c4d_TE-1175_CM-ETH-COMBO-88Q2112-A2_2.0_WEB_FRONT.png',
  BTSRevo:             CDN + '69985affaf0a081b104bd619_bts-side-768x768.png',
  TEAnalog:            CDN + '699c3d6cda3e061978968d78_TE-1165_CM-SENSE_1.0_Web_FRONT.png',
};

const HW_COLORS: Record<string, string> = {
  CANInterface: '#569cd6', CIBInterface: '#569cd6', CMInterface: '#9cdcfe',
  LINCard: '#dcb67a', EthernetAdapter: '#4ec9b0', RelayBoard: '#c678dd',
  HIDRelay: '#c678dd', SerialPort: '#d4d4d4', AnalogDevice: '#f0c040',
  TEAnalog: '#e5c07b', HHLoad: '#f87171', BTSRevo: '#c678dd',
  GenesysPowerSupply: '#80cbc4', MansonPowerSupply: '#80cbc4',
};

// Product catalogue with real Technica images
interface ProductCard {
  label: string;
  subtitle: string;
  description: string;
  protocols: string[];
  url: string;
  color: string;
  image?: string;    // real CDN image URL (Technica hardware only)
  icon: string;      // SVG path fallback
}

const PRODUCT_CATALOGUE: ProductCard[] = [
  {
    label: 'Capture Module (CAN Combo)',
    subtitle: 'CM CAN-Combo · CIB-Combo · CM Interface',
    description: 'Records CAN, CAN-FD, FlexRay, and LIN bus traffic with nanosecond timestamps. Used as CANInterface, CIBInterface, or CMInterface in MTF configurations.',
    protocols: ['CAN', 'CAN-FD', 'FlexRay', 'LIN'],
    url: 'https://technica-engineering.de/en-gb/hardware-products/capture-module-can-combo',
    color: '#569cd6',
    image: HW_IMAGES.CANInterface,
    icon: 'M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 2v8h8V4H4zm1 2h6v1H5V6zm0 2h6v1H5V8zm0 2h4v1H5v-1z',
  },
  {
    label: 'Capture Module (LIN Combo)',
    subtitle: 'CM LIN-Combo · LIN Card',
    description: 'Dedicated LIN-bus capture module for multi-channel LIN recording with precise per-frame timestamps. Maps to LINCard in MTF.',
    protocols: ['LIN'],
    url: 'https://technica-engineering.de/en-gb/hardware-products/capture-module-lin-combo',
    color: '#dcb67a',
    image: HW_IMAGES.LINCard,
    icon: 'M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zM7 5.75A.75.75 0 0 1 7.75 5h.5a.75.75 0 0 1 .75.75v1.5h1.25a.75.75 0 0 1 0 1.5H7.75A.75.75 0 0 1 7 8V5.75z',
  },
  {
    label: 'Capture Module (Ethernet Combo)',
    subtitle: 'CM Ethernet Combo · Ethernet Adapter',
    description: 'Captures raw Ethernet frames (PCAP/PCAPNG) and supports TECMP packetisation, time-stamped logging, and filtering. Maps to EthernetAdapter in MTF.',
    protocols: ['ETHERNET', 'PCAP'],
    url: 'https://technica-engineering.de/en-gb/hardware-products/capture-module-ethernet-combo',
    color: '#4ec9b0',
    image: HW_IMAGES.EthernetAdapter,
    icon: 'M1 4.5A1.5 1.5 0 0 1 2.5 3h11A1.5 1.5 0 0 1 15 4.5v7A1.5 1.5 0 0 1 13.5 13h-11A1.5 1.5 0 0 1 1 11.5v-7zM2.5 4.5v7h11v-7h-11zm2 5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 7h6v1H5V7z',
  },
  {
    label: 'CM Sense (TE-Analog)',
    subtitle: 'Capture Module Sense · TE Analog',
    description: 'Captures analog signals from Technica LIN cards and CM-Sense devices. Identified by HW channel ID and device ID. Maps to TEAnalog in MTF.',
    protocols: ['TE_ANALOG'],
    url: 'https://technica-engineering.de/en-gb/hardware-products/capture-module-sense',
    color: '#e5c07b',
    image: HW_IMAGES.TEAnalog,
    icon: 'M1 12 L5 4 L9 9 L12 6 L15 12 Z',
  },
  {
    label: 'Body Electronic Test System',
    subtitle: 'BTS-REVO · HIL I/O Simulation',
    description: 'Simulates up to 448 I/O channels: buttons, sensors, actuators. Supports short-to-GND/VBAT, open-load, relay switching, voltage/current measurement. Maps to BTSRevo in MTF.',
    protocols: ['IOOUTPUT', 'IOINPUT'],
    url: 'https://technica-engineering.de/en-gb/hardware-products/body-electronic-test-system',
    color: '#c678dd',
    image: HW_IMAGES.BTSRevo,
    icon: 'M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h8v2H2v-2zm10 1 2-2 2 2-2 2-2-2z',
  },
  {
    label: 'SHS Relay Board (Technica)',
    subtitle: 'CAN-controlled Relay Board',
    description: 'Technica SHS relay board controlled over CAN bus. Each relay individually switchable with configurable default/init states. Multiple boards can be daisy-chained.',
    protocols: ['IOOUTPUT'],
    url: 'https://technica-engineering.de/en-gb/products/hardware-products',
    color: '#c678dd',
    icon: 'M4 3h8v2H4V3zm0 4h8v2H4V7zm0 4h4v2H4v-2zm8 1 1 1-1 1-1-1 1-1z',
  },
  {
    label: 'HID Relay Board (DCTTECH)',
    subtitle: 'USB HID Relay',
    description: 'USB HID relay board from DCTTECH. Plug-and-play USB relay controller identified by board serial number. Up to 8 relays per board.',
    protocols: ['IOOUTPUT'],
    url: 'https://technica-engineering.de/en-gb/products/hardware-products',
    color: '#a78bfa',
    icon: 'M4 3h8v2H4V3zm0 4h8v2H4V7zm0 4h4v2H4v-2zm8 1 1 1-1 1-1-1 1-1z',
  },
  {
    label: 'H&H Electrical Load',
    subtitle: 'PLI / PMLI Series',
    description: 'H&H Electrical Load device for load simulation. PLI is single-channel; PMLI is multi-channel. Communicates via RS-232/USB serial.',
    protocols: ['IOOUTPUT', 'IOINPUT'],
    url: 'https://technica-engineering.de/en-gb/products/hardware-products',
    color: '#f87171',
    icon: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm9 1H7V5h2v4zm0 2H7v2h2v-2z',
  },
  {
    label: 'Genesys Power Supply',
    subtitle: 'TCP / Serial (SCPI · GEN)',
    description: 'Programmable DC power supply. Supports TCP or RS-232 connection. Voltage, current limit and monitoring configurable via MTF SCPI commands.',
    protocols: ['PS'],
    url: 'https://technica-engineering.de/en-gb/products/hardware-products',
    color: '#80cbc4',
    icon: 'M1 5h14v6H1V5zm1 1v4h12V6H2zm2 1h8v2H4V7zM0 12h16v1H0v-1z',
  },
  {
    label: 'Manson Power Supply',
    subtitle: 'Serial (RS-232 / USB)',
    description: 'Manson bench power supply via USB-serial adapter. Configurable voltage, current limit, continuous read, and keep-status options.',
    protocols: ['PS'],
    url: 'https://technica-engineering.de/en-gb/products/hardware-products',
    color: '#80cbc4',
    icon: 'M1 5h14v6H1V5zm1 1v4h12V6H2zm2 1h8v2H4V7zM0 12h16v1H0v-1z',
  },
  {
    label: 'Serial Port',
    subtitle: 'USB-Serial / RS-232',
    description: 'Generic RS-232 / RS-485 / USB-serial adapter. Used for SCPI commands, ECU communication, or test equipment via COM ports.',
    protocols: ['SERIAL', 'IOSERIAL'],
    url: 'https://technica-engineering.de/en-gb/products/hardware-products',
    color: '#d4d4d4',
    icon: 'M5 2h6a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 2v1h4V4H6zM5 10h6a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1zm1 2v1h4v-1H6z',
  },
];

// Layout constants
const ROW_H   = 88;   // tall enough for product image thumbnail
const ROW_GAP = 10;

export default function DiagramPanel() {
  const { state, send } = useApp();
  const { logicalChannels, hardwareChannels, mappings, currentConfigId, currentConfigName } = state;

  const mappedLogicalIds  = useMemo(() => new Set(mappings.map(m => m.logicalChannelId)),  [mappings]);
  const mappedHardwareIds = useMemo(() => new Set(mappings.map(m => m.hardwareChannelId)), [mappings]);

  // y-positions for SVG connectors
  const logicalYMap = useMemo(() => {
    const m = new Map<string, number>();
    logicalChannels.forEach((ch, i) => { m.set(ch.id, i * (ROW_H + ROW_GAP) + ROW_H / 2); });
    return m;
  }, [logicalChannels]);

  const hardwareYMap = useMemo(() => {
    const m = new Map<string, number>();
    hardwareChannels.forEach((hw, i) => { m.set(hw.id, i * (ROW_H + ROW_GAP) + ROW_H / 2); });
    return m;
  }, [hardwareChannels]);

  const svgHeight = Math.max(
    logicalChannels.length * (ROW_H + ROW_GAP),
    hardwareChannels.length * (ROW_H + ROW_GAP),
    60,
  );

  // logical channels mapped to each hardware channel (for the gallery cards)
  const hwToLogical = useMemo(() => {
    const m = new Map<string, string[]>();
    mappings.forEach(mp => {
      const lch = logicalChannels.find(c => c.id === mp.logicalChannelId);
      if (!m.has(mp.hardwareChannelId)) { m.set(mp.hardwareChannelId, []); }
      m.get(mp.hardwareChannelId)!.push(lch?.name ?? mp.logicalChannelId);
    });
    return m;
  }, [mappings, logicalChannels]);

  const openUrl = (url: string) => send('openUrl', { url });

  return (
    <div>
      <h2 style={T.pageTitle}>Diagrams</h2>

      {/* 1. Mapping topology */}
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

      {/* 2. Hardware gallery (per device in current config) */}
      {currentConfigId && hardwareChannels.length > 0 && (
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
      )}

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
    </div>
  );
}

// Shared styles

const hdrStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  opacity: 0.45,
  paddingBottom: 6,
};

const nodeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 10px',
  borderRadius: 6,
};

