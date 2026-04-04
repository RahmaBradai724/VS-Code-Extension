import React, { useEffect } from 'react';
import { tokens } from '../theme';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_COLORS = {
  danger:  { icon: '🗑', iconBg: 'rgba(248,113,113,0.12)', iconBorder: 'rgba(248,113,113,0.3)', btn: '#dc2626', btnHover: '#b91c1c', text: '#fca5a5' },
  warning: { icon: '⚠', iconBg: 'rgba(245,158,11,0.12)',  iconBorder: 'rgba(245,158,11,0.3)',  btn: '#d97706', btnHover: '#b45309', text: '#fde68a' },
  info:    { icon: 'ℹ', iconBg: 'rgba(96,165,250,0.12)',   iconBorder: 'rgba(96,165,250,0.3)',  btn: '#2563eb', btnHover: '#1d4ed8', text: '#bfdbfe' },
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cfg = VARIANT_COLORS[variant];

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <div
      className="ccm-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="ccm-modal"
        style={{
          background: tokens.bgAlt,
          border: `1px solid ${tokens.border}`,
          borderRadius: '18px',
          padding: '32px 28px 24px',
          maxWidth: '380px',
          width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
        }}
      >
        {/* Icon circle */}
        <div style={{
          width: '56px', height: '56px',
          borderRadius: '50%',
          background: cfg.iconBg,
          border: `1.5px solid ${cfg.iconBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0,
        }}>
          {cfg.icon}
        </div>

        {/* Text */}
        <div>
          <div style={{
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: message ? '8px' : 0,
            color: tokens.fg,
          }}>
            {title}
          </div>
          {message && (
            <div style={{
              fontSize: '13px',
              color: tokens.fgMuted,
              lineHeight: 1.6,
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          width: '100%',
          marginTop: '4px',
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '9px 0',
              background: 'transparent',
              color: tokens.fg,
              border: `1px solid ${tokens.border}`,
              borderRadius: '999px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '9px 0',
              background: cfg.btn,
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: `0 2px 12px ${cfg.btn}60`,
              letterSpacing: '0.01em',
            }}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
