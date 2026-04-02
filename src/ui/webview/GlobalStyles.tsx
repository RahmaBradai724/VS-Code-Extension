import React from 'react';

const CSS = `
/* ── Modal backdrop ─────────────────────────────────────────────────── */
@keyframes backdropIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes modalIn {
  from { transform: scale(0.88) translateY(20px); opacity: 0; }
  to   { transform: scale(1)    translateY(0);    opacity: 1; }
}
.ccm-modal-backdrop {
  animation: backdropIn 0.18s ease forwards;
}
.ccm-modal {
  animation: modalIn 0.28s cubic-bezier(0.34,1.36,0.64,1) forwards;
}

/* ── Keyframe animations ──────────────────────────────────────────────── */
@keyframes slideInRight {
  from { transform: translateX(80px) scale(0.95); opacity: 0; }
  to   { transform: translateX(0)    scale(1);    opacity: 1; }
}
@keyframes fadeInUp {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes scaleIn {
  from { transform: scale(0.96) translateY(6px); opacity: 0; }
  to   { transform: scale(1)    translateY(0);   opacity: 1; }
}
@keyframes toastProgress {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}
@keyframes pulseDot {
  0%, 100% { transform: scale(1);    opacity: 1; }
  50%       { transform: scale(1.4); opacity: 0.6; }
}
@keyframes iconBounce {
  0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
  60%  { transform: scale(1.15) rotate(4deg); }
  80%  { transform: scale(0.95); }
  100% { transform: scale(1) rotate(0deg);   opacity: 1; }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes badgePop {
  0%   { transform: scale(0); }
  70%  { transform: scale(1.18); }
  100% { transform: scale(1); }
}

/* ── Smooth scrollbars ───────────────────────────────────────────────── */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(128,128,128,0.28);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.52); }

/* ── Base button transitions ─────────────────────────────────────────── */
button {
  transition: transform 0.13s ease, box-shadow 0.13s ease, filter 0.13s ease !important;
  cursor: pointer;
}
button:not([disabled]):hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 14px rgba(0,0,0,0.24) !important;
  filter: brightness(1.1) !important;
}
button:not([disabled]):active {
  transform: translateY(0) scale(0.98) !important;
  filter: brightness(0.94) !important;
  box-shadow: none !important;
}
button[disabled] {
  cursor: not-allowed !important;
  filter: opacity(0.5) !important;
}
button[disabled]:hover {
  transform: none !important;
  box-shadow: none !important;
}

/* ── Input / Select / Textarea ───────────────────────────────────────── */
input, select, textarea {
  transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--vscode-focusBorder, #007fd4) !important;
  box-shadow: 0 0 0 2.5px rgba(0,127,212,0.2) !important;
  outline: none !important;
}

/* ── Channel rows ───────────────────────────────────────────────────── */
.ccm-row {
  transition: transform 0.12s ease, border-color 0.12s ease,
              background 0.12s ease, box-shadow 0.12s ease !important;
}
.ccm-row:hover {
  transform: translateX(4px) !important;
  border-color: var(--vscode-focusBorder, #007fd4) !important;
  box-shadow: -3px 0 0 var(--vscode-focusBorder, #007fd4),
              0 2px 12px rgba(0,0,0,0.18) !important;
  background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.04)) !important;
}

/* ── Config list cards ───────────────────────────────────────────────── */
.ccm-config-card {
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease !important;
}
.ccm-config-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 28px rgba(0,0,0,0.28) !important;
}

/* ── Animated form / modal cards ─────────────────────────────────────── */
.ccm-form-card {
  animation: scaleIn 0.22s cubic-bezier(0.34,1.4,0.64,1) forwards;
}

/* ── Panel fade in ───────────────────────────────────────────────────── */
.ccm-panel {
  animation: fadeInUp 0.24s ease forwards;
}

/* ── Toast notification ─────────────────────────────────────────────── */
.ccm-toast {
  animation: slideInRight 0.38s cubic-bezier(0.34,1.3,0.64,1) forwards;
}
.ccm-toast-bar {
  animation: toastProgress 4.5s linear forwards;
  transform-origin: left center;
}

/* ── Nav item (override global button rules) ─────────────────────────── */
.ccm-nav-item {
  transition: background 0.13s ease, color 0.13s ease,
              transform 0.1s ease !important;
  box-shadow: none !important;
}
.ccm-nav-item:hover:not([data-active='true']) {
  transform: translateX(3px) !important;
  filter: none !important;
  box-shadow: none !important;
}
.ccm-nav-item[data-active='true']:hover {
  transform: none !important;
  filter: none !important;
  box-shadow: none !important;
}
.ccm-nav-item:active {
  transform: translateX(1px) scale(1) !important;
  filter: none !important;
  box-shadow: none !important;
}

/* ── Stat / count badge pop ─────────────────────────────────────────── */
.ccm-badge {
  animation: badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
}

/* ── Logo icon shimmer effect ───────────────────────────────────────── */
.ccm-logo {
  position: relative;
  overflow: hidden;
}
.ccm-logo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%);
  background-size: 200% 100%;
  animation: shimmer 3s ease infinite;
}

/* ── Stat cards ─────────────────────────────────────────────────────── */
.ccm-stat-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease !important;
}
.ccm-stat-card:hover {
  transform: translateY(-3px) scale(1.02) !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important;
}

/* ── Login card entrance ─────────────────────────────────────────────── */
.ccm-login-card {
  animation: scaleIn 0.3s cubic-bezier(0.34,1.3,0.64,1) forwards;
}

/* ── Spin for loading spinner ───────────────────────────────────────── */
@keyframes ccm-spin {
  to { transform: rotate(360deg); }
}
`;

export function GlobalStyles() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}
