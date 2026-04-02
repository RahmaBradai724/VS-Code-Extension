import React from 'react';

// ─── Design Tokens ────────────────────────────────────────────────────────
// All values reference VS Code CSS variables so they adapt to any theme.

export const tokens = {
  // Surfaces
  bg:          'var(--vscode-editor-background)',
  bgAlt:       'var(--vscode-editorWidget-background)',
  bgInput:     'var(--vscode-input-background)',
  bgDropdown:  'var(--vscode-dropdown-background, var(--vscode-input-background))',
  bgSidebar:   'var(--vscode-sideBar-background, var(--vscode-editor-background))',
  bgHover:     'var(--vscode-list-hoverBackground, rgba(255,255,255,0.05))',
  bgActive:    'var(--vscode-list-activeSelectionBackground, rgba(255,255,255,0.08))',

  // Text
  fg:          'var(--vscode-editor-foreground)',
  fgMuted:     'var(--vscode-descriptionForeground, rgba(204,204,204,0.7))',
  fgInput:     'var(--vscode-input-foreground)',

  // Borders
  border:      'var(--vscode-panel-border, rgba(128,128,128,0.25))',
  borderInput: 'var(--vscode-input-border, var(--vscode-panel-border, rgba(128,128,128,0.25)))',
  borderFocus: 'var(--vscode-focusBorder, #007fd4)',

  // Accent / Brand
  accent:      'var(--vscode-button-background)',
  accentFg:    'var(--vscode-button-foreground)',
  accentHover: 'var(--vscode-button-hoverBackground, var(--vscode-button-background))',

  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error:   '#f87171',
  info:    '#60a5fa',

  // Channel category palette
  channelColors: {
    CAN:      '#569cd6',
    LIN:      '#dcb67a',
    ETHERNET: '#4ec9b0',
    FLEXRAY:  '#c678dd',
    SERIAL:   '#d4d4d4',
    IO:       '#f0c040',
    ANALOG:   '#e5a5ff',
    PS:       '#79c0ff',
  } as Record<string, string>,

  // Radius
  radius: {
    sm: '5px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    pill: '999px',
  },

  // Spacing
  space: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
};

// ─── Shared style objects ─────────────────────────────────────────────────

export const T: Record<string, React.CSSProperties> = {
  // Layout
  row:  { display: 'flex', alignItems: 'center', gap: tokens.space.sm },
  col:  { display: 'flex', flexDirection: 'column', gap: tokens.space.sm },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.space.md },

  // Cards
  card: {
    background: tokens.bgAlt,
    border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.lg,
    marginBottom: tokens.space.md,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  cardAccent: {
    background: tokens.bgAlt,
    border: `1px solid ${tokens.accent}`,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.lg,
    marginBottom: tokens.space.md,
    boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
  },

  // Typography
  pageTitle: {
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    marginBottom: '4px',
    lineHeight: 1.2,
  },
  pageSub: {
    fontSize: '12px',
    color: tokens.fgMuted,
    marginBottom: tokens.space.xl,
    lineHeight: 1.5,
  },
  cardTitle: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    opacity: 0.5,
    marginBottom: tokens.space.md,
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.fgMuted,
    marginBottom: '5px',
    display: 'block',
    letterSpacing: '0.03em',
  },

  // Form controls
  input: {
    width: '100%',
    padding: '8px 11px',
    background: tokens.bgInput,
    color: tokens.fgInput,
    border: `1px solid ${tokens.borderInput}`,
    borderRadius: tokens.radius.md,
    fontSize: '12.5px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  },
  textarea: {
    width: '100%',
    padding: '8px 11px',
    background: tokens.bgInput,
    color: tokens.fgInput,
    border: `1px solid ${tokens.borderInput}`,
    borderRadius: tokens.radius.md,
    fontSize: '12.5px',
    outline: 'none',
    resize: 'vertical' as const,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '8px 11px',
    background: tokens.bgDropdown,
    color: tokens.fgInput,
    border: `1px solid ${tokens.borderInput}`,
    borderRadius: tokens.radius.md,
    fontSize: '12.5px',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    appearance: 'auto' as any,
  },

  // Buttons
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    background: tokens.accent,
    color: tokens.accentFg,
    border: 'none',
    borderRadius: tokens.radius.pill,
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    letterSpacing: '0.01em',
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 16px',
    background: 'transparent',
    color: tokens.fg,
    border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radius.pill,
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    background: 'transparent',
    color: tokens.fgMuted,
    border: 'none',
    borderRadius: tokens.radius.md,
    cursor: 'pointer',
    fontSize: '11.5px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  btnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 13px',
    background: 'transparent',
    color: tokens.error,
    border: `1px solid rgba(248,113,113,0.3)`,
    borderRadius: tokens.radius.pill,
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  btnSmall: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 12px',
    background: tokens.accent,
    color: tokens.accentFg,
    border: 'none',
    borderRadius: tokens.radius.pill,
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },

  // Misc
  divider: {
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${tokens.border} 20%, ${tokens.border} 80%, transparent)`,
    margin: `${tokens.space.md} 0`,
  },
  empty: {
    padding: '48px 24px',
    textAlign: 'center',
    color: tokens.fgMuted,
    fontSize: '13px',
    border: `1.5px dashed ${tokens.border}`,
    borderRadius: tokens.radius.xl,
    lineHeight: 1.7,
  },
  code: {
    fontFamily: 'var(--vscode-editor-font-family, "Cascadia Code", "Fira Code", monospace)',
    fontSize: '12px',
    background: tokens.bgInput,
    padding: '2px 6px',
    borderRadius: tokens.radius.sm,
  },
};
