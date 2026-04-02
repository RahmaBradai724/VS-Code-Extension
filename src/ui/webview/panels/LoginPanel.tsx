import React, { useState, useRef, useEffect } from 'react';
import { postMessage } from '../vscodeApi';
import { tokens as T } from '../theme';

type Tab = 'login' | 'register';

interface Props {
  loading: boolean;
  authError: string | null;
}

export default function LoginPanel({ loading, authError }: Props) {
  const [tab, setTab]           = useState<Tab>('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const emailRef                = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, [tab]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === 'login') {
      postMessage('login', { email: email.trim(), password });
    } else {
      postMessage('register', { name: name.trim(), email: email.trim(), password });
    }
  }

  return (
    <div style={S.backdrop}>
      <div className="ccm-login-card" style={S.card}>

        {/* Logo / Icon */}
        <div style={S.iconWrap}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="var(--vscode-button-background, #0e7df0)" opacity="0.15" />
            <path d="M16 8a5 5 0 1 1 0 10A5 5 0 0 1 16 8zm0 12c4.418 0 8 1.79 8 4v1H8v-1c0-2.21 3.582-4 8-4z"
              fill="var(--vscode-button-background, #0e7df0)" />
          </svg>
        </div>

        <h2 style={S.title}>Channel Config Manager</h2>
        <p style={S.subtitle}>Sign in to continue</p>

        {/* Tabs */}
        <div style={S.tabs}>
          {(['login', 'register'] as Tab[]).map(t => (
            <button
              key={t}
              style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }}
              onClick={() => { setTab(t); setName(''); setEmail(''); setPassword(''); }}
              type="button"
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={S.form} autoComplete="off">

          {tab === 'register' && (
            <label style={S.fieldWrap}>
              <span style={S.label}>Full Name</span>
              <input
                style={S.input}
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>
          )}

          <label style={S.fieldWrap}>
            <span style={S.label}>Email</span>
            <input
              ref={emailRef}
              style={S.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label style={S.fieldWrap}>
            <span style={S.label}>Password</span>
            <div style={S.pwdWrap}>
              <input
                style={{ ...S.input, paddingRight: '42px' }}
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                style={S.eyeBtn}
                onClick={() => setShowPwd(v => !v)}
                title={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? EyeOffIcon : EyeIcon}
              </button>
            </div>
          </label>

          {authError && (
            <div style={S.errorBox}>
              <span style={S.errorIcon}>⚠</span> {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ ...S.submitBtn, ...(loading ? S.submitBtnDisabled : {}) }}
          >
            {loading
              ? <><span className="ccm-spinner" style={S.spinner} /> Processing…</>
              : tab === 'login' ? 'Sign In' : 'Create Account'
            }
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Eye icons (inline SVG) ───────────────────────────────────────────────

const EyeIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
  </svg>
);

// ─── Styles ───────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: T.bg,
    zIndex: 100,
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '360px',
    background: T.bgAlt,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius.xl,
    padding: '32px 28px 28px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  iconWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  title: {
    textAlign: 'center',
    fontSize: '17px',
    fontWeight: 700,
    color: T.fg,
    margin: 0,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: '12px',
    color: T.fgMuted,
    margin: '0 0 12px',
  },
  tabs: {
    display: 'flex',
    background: T.bg,
    borderRadius: T.radius.pill,
    padding: '3px',
    gap: '2px',
    marginBottom: '16px',
  },
  tab: {
    flex: 1,
    border: 'none',
    borderRadius: T.radius.pill,
    padding: '6px 0',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    background: 'transparent',
    color: T.fgMuted,
    transition: 'all 0.18s ease',
  },
  tabActive: {
    background: T.accent,
    color: T.accentFg,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    color: T.fgMuted,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '13px',
    background: T.bgInput,
    border: `1px solid ${T.borderInput}`,
    borderRadius: T.radius.md,
    color: T.fgInput,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  pwdWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: T.fgMuted,
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  errorBox: {
    background: 'rgba(220,50,50,0.12)',
    border: '1px solid rgba(220,50,50,0.3)',
    borderRadius: T.radius.md,
    padding: '9px 12px',
    fontSize: '12px',
    color: 'var(--vscode-errorForeground, #f48771)',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  errorIcon: { fontSize: '13px' },
  submitBtn: {
    marginTop: '4px',
    padding: '11px 20px',
    borderRadius: T.radius.pill,
    border: 'none',
    background: T.accent,
    color: T.accentFg,
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
    transition: 'opacity 0.15s, transform 0.1s',
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  spinner: {
    width: '14px',
    height: '14px',
    border: '2px solid currentColor',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'ccm-spin 0.7s linear infinite',
  },
};
