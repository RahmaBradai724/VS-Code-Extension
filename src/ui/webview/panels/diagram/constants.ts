import React from 'react';

// Real product images from Technica CDN
export const CDN = 'https://cdn.prod.website-files.com/696a0fa6916b6d0324673bba/';
export const HW_IMAGES: Record<string, string> = {
  CANInterface:        CDN + '699c3a76b8031b1ce951b424_TE-1171_CM-CAN-COMBO_2.0_WEB_FRONT.png',
  CIBInterface:        CDN + '699c3a76b8031b1ce951b424_TE-1171_CM-CAN-COMBO_2.0_WEB_FRONT.png',
  CMInterface:         CDN + '699c3a76b8031b1ce951b424_TE-1171_CM-CAN-COMBO_2.0_WEB_FRONT.png',
  LINCard:             CDN + '699c3a5d092a1a0d3adca266_TE-1170_CM-LIN-COMBO_2.0_WEB_FRONT.png',
  EthernetAdapter:     CDN + '699c3a8adc743999bba27c4d_TE-1175_CM-ETH-COMBO-88Q2112-A2_2.0_WEB_FRONT.png',
  BTSRevo:             CDN + '69985affaf0a081b104bd619_bts-side-768x768.png',
  TEAnalog:            CDN + '699c3d6cda3e061978968d78_TE-1165_CM-SENSE_1.0_Web_FRONT.png',
};

export const HW_COLORS: Record<string, string> = {
  CANInterface: '#569cd6', CIBInterface: '#569cd6', CMInterface: '#9cdcfe',
  LINCard: '#dcb67a', EthernetAdapter: '#4ec9b0', RelayBoard: '#c678dd',
  HIDRelay: '#c678dd', SerialPort: '#d4d4d4', AnalogDevice: '#f0c040',
  TEAnalog: '#e5c07b', HHLoad: '#f87171', BTSRevo: '#c678dd',
  GenesysPowerSupply: '#80cbc4', MansonPowerSupply: '#80cbc4',
};

// Product catalogue with real Technica images
export interface ProductCard {
  label: string;
  subtitle: string;
  description: string;
  protocols: string[];
  url: string;
  color: string;
  image?: string;    // real CDN image URL (Technica hardware only)
  icon: string;      // SVG path fallback
}

export const PRODUCT_CATALOGUE: ProductCard[] = [
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
export const ROW_H   = 88;   // tall enough for product image thumbnail
export const ROW_GAP = 10;

// Shared styles
export const hdrStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  opacity: 0.45,
  paddingBottom: 6,
};

export const nodeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 10px',
  borderRadius: 6,
};
