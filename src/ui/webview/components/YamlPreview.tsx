import React, { useState, useEffect, useRef, useMemo } from 'react';
import { postMessage } from '../vscodeApi';
import * as jsYaml from 'js-yaml';

interface Props {
  yaml: string;
}

// ── MTF YAML Validator ──────────────────────────────────────────────────────
const VALID_MTF_TYPES = [
  'CAN', 'CANFD', 'LIN', 'FR', 'FLEXRAY', 'ETHERNET',
  'SERIAL', 'BRIDGE', 'PS', 'IOINPUT', 'IOOUTPUT', 'IOSERIAL', 'TE_ANALOG',
];
const KNOWN_CHANNEL_FIELDS = [
  'Id', 'Type', 'Protocol', 'LoggingName', 'TracerName',
  'Alias', 'LoggingBusIndex', 'ApplicationProtocol',
];
const KNOWN_TOPLEVEL_KEYS = ['Channels', 'Mappings', 'FrameworkConfig'];

function validateMtfYaml(yamlText: string): string[] {
  const errors: string[] = [];
  let parsed: any;
  try { parsed = jsYaml.load(yamlText); } catch { return []; }
  if (!parsed || typeof parsed !== 'object') { return []; }

  // 1. Top-level key casing check
  for (const key of Object.keys(parsed)) {
    if (!KNOWN_TOPLEVEL_KEYS.includes(key)) {
      const match = KNOWN_TOPLEVEL_KEYS.find(k => k.toLowerCase() === key.toLowerCase());
      if (match) { errors.push(`Unknown key '${key}'. Did you mean '${match}'?`); }
    }
  }

  const channels = parsed.Channels;
  if (!channels || typeof channels !== 'object') { return errors; }

  // 2. Per-channel validation
  const seenIds = new Map<number, string>();
  for (const [name, entry] of Object.entries(channels) as [string, any][]) {
    if (!entry || typeof entry !== 'object') {
      errors.push(`Channel '${name}': entry must be an object.`);
      continue;
    }

    // Unknown / wrong-case field names
    for (const field of Object.keys(entry)) {
      if (!KNOWN_CHANNEL_FIELDS.includes(field)) {
        const match = KNOWN_CHANNEL_FIELDS.find(f => f.toLowerCase() === field.toLowerCase());
        errors.push(match
          ? `Channel '${name}': unknown field '${field}'. Did you mean '${match}'?`
          : `Channel '${name}': unknown field '${field}'.`);
      }
    }

    // Id: required, positive integer, unique
    const idVal = entry.Id;
    if (idVal === undefined || idVal === null) {
      errors.push(`Channel '${name}': 'Id' is required.`);
    } else {
      const idNum = Number(idVal);
      if (!Number.isInteger(idNum) || idNum <= 0) {
        errors.push(`Channel '${name}': 'Id' must be a positive integer, got '${idVal}'.`);
      } else if (seenIds.has(idNum)) {
        errors.push(`Channel '${name}': Id ${idNum} is already used by '${seenIds.get(idNum)}'.`);
      } else {
        seenIds.set(idNum, name);
      }
    }

    // Type: required, valid value
    const typeVal = entry.Type;
    if (!typeVal) {
      errors.push(`Channel '${name}': 'Type' is required.`);
    } else if (!VALID_MTF_TYPES.includes(String(typeVal))) {
      errors.push(`Channel '${name}': unknown Type '${typeVal}'. Valid: ${VALID_MTF_TYPES.join(', ')}.`);
    }
  }

  return errors;
}

export default function YamlPreview({ yaml }: Props) {
  const [localYaml, setLocalYaml] = useState(yaml);
  const [isDirty, setIsDirty]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [applying, setApplying]   = useState(false);
  const prevYamlRef               = useRef(yaml);

  // Detect YAML syntax errors in the current textarea content
  const yamlSyntaxError = useMemo<string | null>(() => {
    if (!localYaml.trim()) { return null; }
    try {
      jsYaml.load(localYaml); 
      return null;
    } catch (e: any) {
      return e?.message ?? 'Invalid YAML syntax.';
    }
  }, [localYaml]);

  // MTF semantic validation (id uniqueness, type validity, field casing)
  const mtfErrors = useMemo<string[]>(() => {
    if (!localYaml.trim() || !!yamlSyntaxError) { return []; }
    return validateMtfYaml(localYaml);
  }, [localYaml, yamlSyntaxError]);

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
              style={{ ...S.applyBtn, opacity: (applying || !!yamlSyntaxError || mtfErrors.length > 0) ? 0.6 : 1 }}
              onClick={handleApply}
              disabled={applying || !!yamlSyntaxError || mtfErrors.length > 0}
              title={yamlSyntaxError ? 'Fix YAML syntax errors before applying' : mtfErrors.length > 0 ? 'Fix validation errors before applying' : 'Apply YAML changes to config'}
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

      {/* YAML syntax error bar */}
      {yamlSyntaxError && (
        <div style={S.syntaxError}>
          <span style={{ fontWeight: 700, marginRight: '6px' }}>✗ YAML syntax error:</span>
          {yamlSyntaxError}
        </div>
      )}

      {/* MTF semantic validation errors */}
      {isDirty && !yamlSyntaxError && mtfErrors.length > 0 && (
        <div style={S.mtfErrors}>
          {mtfErrors.map((msg, i) => (
            <div key={i} style={S.mtfErrorItem}>
              <span style={{ color: '#fca5a5', fontWeight: 700, marginRight: '5px', flexShrink: 0 }}>✗</span>
              {msg}
            </div>
          ))}
        </div>
      )}

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
  syntaxError: {
    padding: '7px 14px',
    fontSize: '11px',
    lineHeight: 1.5,
    color: '#fca5a5',
    background: 'rgba(248,113,113,0.10)',
    borderBottom: '1px solid rgba(248,113,113,0.25)',
    flexShrink: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
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
  mtfErrors: {
    padding: '5px 14px 8px',
    fontSize: '11px',
    lineHeight: 1.5,
    color: '#fca5a5',
    background: 'rgba(248,113,113,0.08)',
    borderBottom: '1px solid rgba(248,113,113,0.2)',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    gap: '3px',
    maxHeight: '120px',
    overflowY: 'auto' as React.CSSProperties['overflowY'],
  },
  mtfErrorItem: {
    display: 'flex',
    alignItems: 'flex-start',
  },
};
