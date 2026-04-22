import React from 'react';

// All icons are crisp 16x16 SVGs using VS Code's own color variables

const icon = (paths: React.ReactNode, size = 16) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    {paths}
  </svg>
);

export const Icons = {
  configs: () => icon(
    <path d="M2 3h12v1.5H2V3zm0 4h12v1.5H2V7zm0 4h8v1.5H2V11z" />
  ),
  logical: () => icon(
    <path d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8zm7-5.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM8 6a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5A.75.75 0 0 1 8 6z" />
  ),
  hardware: () => icon(
    <path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm0 1v10h10V3H3zm2 2h6v1H5V5zm0 3h6v1H5V8zm0 3h4v1H5v-1z" />
  ),
  mappings: () => icon(
    <path d="M3.5 4A1.5 1.5 0 1 0 5 5.5H7v1H5a1.5 1.5 0 1 0 0 1.5h2V10a1.5 1.5 0 1 0 1.5-1.5V7H11A1.5 1.5 0 1 0 9.5 5.5H9v-1h.5A1.5 1.5 0 1 0 8 3t.5 1.5H9V5H6.5A1.5 1.5 0 0 0 3.5 4z" />
  ),
  framework: () => icon(
    <path d="M8 1L1 5v2l7 4 7-4V5L8 1zM2.5 5.5L8 2.7l5.5 2.8L8 8.3 2.5 5.5zm-1.5 4l7 4 7-4V11l-7 4-7-4v-1.5z" />
  ),
  generate: () => icon(
    <path d="M13.5 2H9L4 7 1 10l5 5 3-3 5-5V2h-0.5zm-8 11L2 9.5 4.5 7 8 10.5 5.5 13zM12 3v3.5L9 9.5 6.5 7 9.5 4H12V3zm-1 1.5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0z" />
  ),
  dashboard: () => icon(
    <path d="M1 2h5v5H1V2zm0 7h5v5H1V9zm7-7h5v5H8V2zm0 7h5v5H8V9zm1-6v3h3V3H9zm-7 0v3h3V3H2zm0 7v3h3v-3H2zm7 0v3h3v-3H9z" />,
  ),
  diagrams: () => icon(
    <path d="M1 3h4v3H1V3zm5 1.5h4M10 3h5v3h-5V3zm-4.5 5H8m2 .5h4m-4 2h4M1 9h4v5H1V9zm9 0h5v5h-5V9z" />,
  ),
  chevronRight: () => icon(<path d="M6 3l5 5-5 5V3z" />),
  plus: (size?: number) => icon(<path d="M8 1.5a.75.75 0 0 1 .75.75V7h4.75a.75.75 0 0 1 0 1.5H8.75v4.75a.75.75 0 0 1-1.5 0V8.5H2.5a.75.75 0 0 1 0-1.5h4.75V2.25A.75.75 0 0 1 8 1.5z" />, size),
  trash: (size?: number) => icon(<path d="M6.5 1h3a.5.5 0 0 1 .5.5V3H6V1.5a.5.5 0 0 1 .5-.5zM5 3V1.5A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5V3h2.5a.5.5 0 0 1 0 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4H2.5a.5.5 0 0 1 0-1H5zm2 3a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm3 0a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />, size),
  check: (size?: number) => icon(<path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />, size),
  warning: (size?: number) => icon(<path d="M8.22 1.754a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368L8.22 1.754zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575L6.457 1.047zM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-.25-5.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5z" />, size),
  error: (size?: number) => icon(<path d="M2.343 13.657A8 8 0 1 1 13.657 2.343 8 8 0 0 1 2.343 13.657zM6.03 4.97a.75.75 0 0 0-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 1 0 1.06 1.06L8 9.06l1.97 1.97a.75.75 0 1 0 1.06-1.06L9.06 8l1.97-1.97a.75.75 0 0 0-1.06-1.06L8 6.94 6.03 4.97z" />, size),
  info: (size?: number) => icon(<path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75zM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />, size),
  upload: () => icon(<path d="M8 2a.75.75 0 0 1 .75.75v6.69l1.97-1.97a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 8.53a.75.75 0 0 1 1.06-1.06l1.97 1.97V2.75A.75.75 0 0 1 8 2zM2.75 14.5a.75.75 0 0 1 0-1.5h10.5a.75.75 0 0 1 0 1.5H2.75z" />),
  expand: () => icon(<path d="M1.5 1h4v1.5h-2.5v2.5H1.5V1zM10.5 1h4v4h-1.5V2.5H10.5V1zM1.5 10.5h1.5V13H5.5V14.5H1.5V10.5zM13 10.5h1.5v4H10.5V13H13V10.5z" />),
  sparkle: () => icon(<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694z" />),
  tracers: () => icon(<path d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8zm1.5 0a5.5 5.5 0 1 0 11 0 5.5 5.5 0 0 0-11 0zM8 5a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-2.25A.75.75 0 0 1 7.25 8V5.75A.75.75 0 0 1 8 5zm-4 6.5h.5v1H4v-1zm8 0h.5v1H12v-1zM4 4h.5v1H4V4zm7.5 0h.5v1h-.5V4z" />),
  gear: () => icon(<path d="M8 0a8.2 8.2 0 0 1 .475.01l.007.047.2 1.282a1 1 0 0 0 .668.75l.198.07a1 1 0 0 0 .997-.188l.965-.822a8.143 8.143 0 0 1 1.892 1.892l-.822.965a1 1 0 0 0-.188.997l.07.198a1 1 0 0 0 .75.668l1.282.2.01.007A8.2 8.2 0 0 1 16 8a8.2 8.2 0 0 1-.01.475l-.007.007-1.282.2a1 1 0 0 0-.75.668l-.07.198a1 1 0 0 0 .188.997l.822.965a8.143 8.143 0 0 1-1.892 1.892l-.965-.822a1 1 0 0 0-.997-.188l-.198.07a1 1 0 0 0-.668.75l-.2 1.282-.007.01A8.2 8.2 0 0 1 8 16a8.2 8.2 0 0 1-.475-.01l-.007-.007-1.282-.2a1 1 0 0 0-.668-.75l-.198-.07a1 1 0 0 0-.997.188l-.965.822A8.143 8.143 0 0 1 1.516 14.1l.822-.965a1 1 0 0 0 .188-.997l-.07-.198a1 1 0 0 0-.75-.668L.424 11.062l-.01-.007A8.2 8.2 0 0 1 0 8a8.2 8.2 0 0 1 .01-.475l.007-.007 1.282-.2a1 1 0 0 0 .75-.668l.07-.198a1 1 0 0 0-.188-.997L1.109 4.49A8.143 8.143 0 0 1 3 2.598l.965.822a1 1 0 0 0 .997.188l.198-.07a1 1 0 0 0 .668-.75L6.028.507 6.035.5A8.2 8.2 0 0 1 8 0zm0 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />),
  agent: () => icon(
    <>
      <circle cx="8" cy="5.5" r="3.5" />
      <path d="M8 10.5c-3.3 0-6 1.6-6 3.5h12c0-1.9-2.7-3.5-6-3.5z" />
      <circle cx="5.5" cy="5" r=".75" fill="var(--vscode-editor-background, #1e1e1e)" />
      <circle cx="10.5" cy="5" r=".75" fill="var(--vscode-editor-background, #1e1e1e)" />
      <path d="M6.5 7.5q1.5 1 3 0" stroke="var(--vscode-editor-background, #1e1e1e)" strokeWidth=".8" fill="none" strokeLinecap="round" />
      <path d="M8 2V0.5M8 0.5h1.5M8 0.5H6.5" stroke="currentColor" strokeWidth=".8" strokeLinecap="round" />
    </>
  ),
  // ── Framework sub-tree icons ─────────────────────────────────────────────
  /** Tracers → waveform / signal */
  fwTracers: () => icon(
    <path d="M1 8h2l2-5 2 10 2-7 2 4 2-2h2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  /** ConnectedEcus → monitor/device */
  fwEcus: () => icon(
    <path d="M2 2h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9v1.5h1.5v1h-5v-1H7V12H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm0 1v7h12V3H2z" />
  ),
  /** ServicePack → package/box */
  fwServicePack: () => icon(
    <path d="M8 1L1.5 4.5v7L8 15l6.5-3.5v-7L8 1zm0 1.3l5 2.7-5 2.7-5-2.7 5-2.7zM2.5 5.8l5 2.7v5.1l-5-2.7V5.8zm6 7.8V8.5l5-2.7v5.1l-5 2.7z" />
  ),
  /** Publisher → broadcast hub */
  fwPublisher: () => icon(
    <>
      <circle cx="8" cy="8" r="1.5" />
      <path d="M5.2 5.2a4 4 0 0 0 0 5.6M10.8 5.2a4 4 0 0 1 0 5.6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M3.4 3.4a7 7 0 0 0 0 9.2M12.6 3.4a7 7 0 0 1 0 9.2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </>
  ),
  /** Ethernet → network plug */
  fwEthernet: () => icon(
    <path d="M1 4h3v2H3v4h2v2H1V4zm11 0h3v8h-4v-2h2V6h-1V4zM5 1h6v2H5V1zm0 12h6v2H5v-2zm1-9h4v8H6V4zm1 1v6h2V5H7z" />
  ),
  /** NPdu → layers / stack */
  fwNpdu: () => icon(
    <path d="M8 1.5L1 5l7 3.5L15 5 8 1.5zM1 8.5l7 3.5 7-3.5M1 11.5l7 3.5 7-3.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  /** SomeIP → service/API node */
  fwSomeIP: () => icon(
    <>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="8" cy="8" r="1.5" />
    </>
  ),
  /** AppLayerPorts → port/plug */
  fwPorts: () => icon(
    <path d="M5 2v3H3v2h2v3H3v2h2v2h2v-2h2v2h2v-2h2v-2h-2V7h2V5h-2V2H9v3H7V2H5zm2 5h2v3H7V7z" />
  ),
  /** EthernetTopology → sitemap / tree */
  fwTopology: () => icon(
    <>
      <rect x="6" y="1" width="4" height="3" rx=".5" />
      <rect x="1" y="10" width="4" height="3" rx=".5" />
      <rect x="6" y="10" width="4" height="3" rx=".5" />
      <rect x="11" y="10" width="4" height="3" rx=".5" />
      <path d="M8 4v2.5M8 6.5H3m0 0V10m5-3.5V10m5-3.5V10m0-3.5H8" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </>
  ),
  /** ChannelToEcusMapping → arrows link */
  fwMapping: () => icon(
    <>
      <rect x="1" y="3" width="5" height="3" rx=".5" />
      <rect x="10" y="10" width="5" height="3" rx=".5" />
      <path d="M6 4.5h2l5 5h-2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 9.5l.5 2-1.5-.5" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  /** Chevron down for expanded tree */
  chevronDown: () => icon(<path d="M3 6l5 5 5-5H3z" />),
};
