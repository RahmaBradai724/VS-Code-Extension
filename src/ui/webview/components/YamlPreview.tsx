import React, { useState, useEffect, useRef } from 'react';
import { postMessage } from '../vscodeApi';

interface Props {
  yaml: string;
}

export default function YamlPreview({ yaml }: Props) {
  const [localYaml, setLocalYaml] = useState(yaml);
  const [isDirty, setIsDirty]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [applying, setApplying]   = useState(false);
  const prevYamlRef               = useRef(yaml);

  // Sync from live preview only when user has no unsaved edits
  useEffect(() => {
    if (!isDirty && yaml !== prevYamlRef.current) {
      setLocalYaml(yaml);
    }
    prevYamlRef.current = yaml;
  }, [yaml, isDirty]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setLocalYaml(e.target.value);
    setIsDirty(e.target.value !== yaml);
  }

  function handleApply() {
    setApplying(true);
    postMessage('applyYamlEdit', { yaml: localYaml });
  }

  function handleReset() {
    setLocalYaml(yaml);
    setIsDirty(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(localYaml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  // Called by parent when applyYamlEdit succeeds or fails
  // We expose a way to reset applying state via a custom event
  useEffect(() => {
    function onApplyDone() { setApplying(false); setIsDirty(false); }
    function onApplyError() { setApplying(false); }
    window.addEventListener('ccm-yaml-apply-done', onApplyDone);
    window.addEventListener('ccm-yaml-apply-error', onApplyError);
    return () => {
      window.removeEventListener('ccm-yaml-apply-done', onApplyDone);
      window.removeEventListener('ccm-yaml-apply-error', onApplyError);
    };
  }, []);

  return (
    <div style={S.wrapper}>
      {/* Header */}
      <div style={S.header}>
        <span style={S.title}>
          <span style={{ ...S.dot, background: isDirty ? '#fbbf24' : '#4ade80' }} />
          config.mtf.yaml
          {isDirty && <span style={S.dirtyBadge}>edited</span>}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {isDirty && (
            <button style={S.resetBtn} onClick={handleReset} title="Discard changes">
              Reset
            </button>
          )}
          {isDirty && (
            <button
              style={{ ...S.applyBtn, opacity: applying ? 0.6 : 1 }}
              onClick={handleApply}
              disabled={applying}
              title="Apply YAML changes to config"
            >
              {applying ? '⏳' : '✓ Apply'}
            </button>
          )}
          {!isDirty && (
            <button
              style={{ ...S.copyBtn, ...(copied ? S.copyBtnDone : {}) }}
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Editable textarea */}
      <textarea
        style={S.textarea}
        value={localYaml || ''}
        onChange={handleChange}
        spellCheck={false}
        placeholder="No data yet — fill in the panels to see the preview."
      />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--vscode-editor-background)',
    borderLeft: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.2))',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 14px',
    borderBottom: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.2))',
    flexShrink: 0,
    background: 'var(--vscode-editorGroupHeader-tabsBackground, rgba(30,30,30,0.6))',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    fontSize: '11.5px',
    fontWeight: 600,
    color: 'var(--vscode-descriptionForeground, rgba(204,204,204,0.7))',
    letterSpacing: '0.02em',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    animation: 'ccm-pulse 2s infinite',
    flexShrink: 0,
  },
  dirtyBadge: {
    fontSize: '10px',
    padding: '1px 7px',
    borderRadius: '999px',
    background: 'rgba(251,191,36,0.15)',
    color: '#fbbf24',
    border: '1px solid rgba(251,191,36,0.3)',
    fontWeight: 600,
  },
  copyBtn: {
    padding: '3px 10px',
    borderRadius: '999px',
    border: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.25))',
    background: 'transparent',
    color: 'var(--vscode-descriptionForeground, rgba(204,204,204,0.65))',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  copyBtnDone: {
    color: '#4ade80',
    borderColor: 'rgba(74,222,128,0.4)',
  },
  resetBtn: {
    padding: '3px 10px',
    borderRadius: '999px',
    border: '1px solid rgba(128,128,128,0.25)',
    background: 'transparent',
    color: 'rgba(204,204,204,0.55)',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  applyBtn: {
    padding: '3px 12px',
    borderRadius: '999px',
    border: 'none',
    background: 'var(--vscode-button-background)',
    color: 'var(--vscode-button-foreground)',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    border: 'none',
    outline: 'none',
    margin: 0,
    padding: '14px 16px',
    fontSize: '11.5px',
    lineHeight: 1.65,
    fontFamily: 'var(--vscode-editor-font-family, "Cascadia Code", "Fira Code", Consolas, monospace)',
    color: 'var(--vscode-editor-foreground, #d4d4d4)',
    background: 'transparent',
    whiteSpace: 'pre',
    overflowWrap: 'normal',
    overflow: 'auto',
  },
};
