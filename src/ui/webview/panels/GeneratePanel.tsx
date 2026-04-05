import React from 'react';
import { useApp } from '../hooks/useApp';
import { T } from '../components/shared';

export default function GeneratePanel() {
  const { state, send } = useApp();
  const { generating, aiValidating, yamlContent, aiResult, frameworkData } = state;

  return (
    <div>
      <h2 style={T.pageTitle}>Generate & Validate</h2>

      {/* Action buttons */}
      <div style={{ ...T.card, padding: '20px 22px' }}>
        <p style={{ ...T.cardTitle, marginBottom: '16px' }}>Actions</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            style={{
              ...T.btnPrimary,
              padding: '10px 22px',
              fontSize: '13px',
              gap: '8px',
              opacity: generating ? 0.6 : 1,
              boxShadow: generating ? 'none' : '0 2px 12px var(--vscode-button-background, rgba(0,120,212,0.4))',
            }}
            disabled={generating}
            onClick={() => send('generateConfig', { frameworkData })}
          >
            {generating ? 'Generating…' : 'Generate config.yaml'}
          </button>
          <button
            style={{
              ...T.btnSecondary,
              padding: '10px 22px',
              fontSize: '13px',
              gap: '8px',
              opacity: (aiValidating || !yamlContent) ? 0.5 : 1,
            }}
            disabled={aiValidating || !yamlContent}
            onClick={() => send('runAIValidation')}
            title={!yamlContent ? 'Generate a config first' : ''}
          >
            {aiValidating ? 'Validating…' : 'Run AI Validation'}
          </button>
        </div>
        {!yamlContent && (
          <p style={{ ...T.label, marginTop: '12px', marginBottom: 0, fontStyle: 'italic', opacity: 0.6 }}>
            Generate a configuration first to enable AI validation.
          </p>
        )}
      </div>

      {/* AI Result */}
      {aiResult && (
        <div style={T.card}>
          <p style={T.cardTitle}>AI Validation Results</p>

          {aiResult.errors && aiResult.errors.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#f87171', marginBottom: '6px' }}>
                ✗ Errors ({aiResult.errors.length})
              </p>
              {aiResult.errors.map((err, i) => (
                <div key={i} style={{ fontSize: '12px', padding: '9px 14px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', marginBottom: '5px', color: '#fca5a5', borderLeft: '3px solid #f87171', lineHeight: 1.5 }}>
                  {err}
                </div>
              ))}
            </div>
          )}

          {aiResult.warnings && aiResult.warnings.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#fbbf24', marginBottom: '6px' }}>
                ⚠ Warnings ({aiResult.warnings.length})
              </p>
              {aiResult.warnings.map((w, i) => (
                <div key={i} style={{ fontSize: '12px', padding: '9px 14px', borderRadius: '8px', background: 'rgba(251,191,36,0.1)', marginBottom: '5px', color: '#fde68a', borderLeft: '3px solid #fbbf24', lineHeight: 1.5 }}>
                  {w}
                </div>
              ))}
            </div>
          )}

          {aiResult.suggestions && aiResult.suggestions.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#34d399', marginBottom: '6px' }}>
                💡 Suggestions ({aiResult.suggestions.length})
              </p>
              {aiResult.suggestions.map((s, i) => (
                <div key={i} style={{ fontSize: '12px', padding: '9px 14px', borderRadius: '8px', background: 'rgba(52,211,153,0.1)', marginBottom: '5px', color: '#6ee7b7', borderLeft: '3px solid #34d399', lineHeight: 1.5 }}>
                  {s}
                </div>
              ))}
            </div>
          )}

          {(!aiResult.errors?.length && !aiResult.warnings?.length && !aiResult.suggestions?.length) && (
            <div style={{ fontSize: '12px', color: '#34d399', padding: '8px', textAlign: 'center' }}>
              ✓ All checks passed — no issues found.
            </div>
          )}
        </div>
      )}

      {/* YAML preview */}
      {yamlContent && (
        <div style={T.card}>
          <p style={T.cardTitle}>Generated YAML</p>
          <pre style={{
            fontSize: '12px', lineHeight: '1.6', overflowX: 'auto',
            background: 'var(--vscode-input-background)',
            padding: '16px', borderRadius: '10px',
            border: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.2))',
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.12)',
            letterSpacing: '0.01em',
            maxHeight: '460px', overflowY: 'auto',
            whiteSpace: 'pre', fontFamily: 'var(--vscode-editor-font-family, monospace)',
          }}>
            {yamlContent}
          </pre>
        </div>
      )}
    </div>
  );
}
