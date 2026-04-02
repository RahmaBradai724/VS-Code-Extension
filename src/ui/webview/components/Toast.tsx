import React from 'react';
import { Icons } from './icons';
import { tokens } from '../theme';

interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface ToastProps {
  notification: Notification | null;
}

const TOAST_CONFIG: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  success: { bg: 'rgba(20,83,45,0.96)',   border: tokens.success, text: '#bbf7d0', iconBg: 'rgba(34,197,94,0.2)'  },
  error:   { bg: 'rgba(69,10,10,0.96)',   border: tokens.error,   text: '#fecaca', iconBg: 'rgba(248,113,113,0.2)'},
  warning: { bg: 'rgba(67,20,7,0.96)',    border: tokens.warning, text: '#fde68a', iconBg: 'rgba(245,158,11,0.2)' },
  info:    { bg: 'rgba(12,26,46,0.96)',   border: tokens.info,    text: '#bfdbfe', iconBg: 'rgba(96,165,250,0.2)' },
};

const TOAST_ICONS: Record<string, () => React.ReactElement> = {
  success: () => Icons.check(14),
  error:   () => Icons.error(14),
  warning: () => Icons.warning(14),
  info:    () => Icons.info(14),
};

export function Toast({ notification }: ToastProps) {
  if (!notification) return null;

  const cfg = TOAST_CONFIG[notification.type];
  const TypeIcon = TOAST_ICONS[notification.type];

  return (
    <div
      className="ccm-toast"
      style={{
        position: 'fixed',
        bottom: '22px',
        right: '22px',
        zIndex: 9999,
        maxWidth: '360px',
        minWidth: '240px',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${cfg.border}40`,
        background: cfg.bg,
        border: `1px solid ${cfg.border}60`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Main content row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        color: cfg.text,
      }}>
        {/* Icon circle */}
        <span style={{
          flexShrink: 0,
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: cfg.iconBg,
          border: `1.5px solid ${cfg.border}60`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: cfg.border,
        }}>
          <TypeIcon />
        </span>
        <span style={{ fontSize: '12.5px', fontWeight: 500, lineHeight: 1.4, flex: 1 }}>
          {notification.message}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '3px',
        background: `${cfg.border}30`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div
          className="ccm-toast-bar"
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, ${cfg.border}cc, ${cfg.border})`,
            borderRadius: '2px',
          }}
        />
      </div>
    </div>
  );
}
