import React from 'react';
import { useApp } from '../App';
import { T } from '../components/shared';

export default function GeneratePanel() {
  const { state, send } = useApp();
  const { generating, aiValidating, yamlContent, aiResult, frameworkData } = state;

  return (
    <div>
      <h2 style={T.pageTitle}>Generate & Validate</h2>

      {/* Action buttons */}
      <div style={T.card}>
        <p style={T.cardTitle}>Actions</p>
        <div style={{ ...T.row, gap: '12px' }}>
          <button
            style={{ ...T.btnPrimary, minWidth: '180px', opacity: generating ? 0.6 : 1 }}
            disabled={generating}
            onClick={() => send('generateConfig', { frameworkData })}
          >
            {generating ? '⏳ Generating…' : '⚡ Generate config.yaml'}
          </button>
          <button
            style={{ ...T.btnSecondary, minWidth: '180px', opacity: aiValidating ? 0.6 : 1 }}
            disabled={aiValidating || !yamlContent}
            onClick={() => send('runAIValidation')}
            title={!yamlContent ? 'Generate a config first' : ''}
          >
            {aiValidating ? '⏳ Validating…' : '🤖 Run AI Validation'}
          </button>
        </div>
        {!yamlContent && (
          <p style={{ ...T.label, marginTop: '10px', marginBottom: 0, fontStyle: 'italic' }}>
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
                <div key={i} style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '5px', background: '#f8717122', marginBottom: '4px', color: '#fca5a5', borderLeft: '3px solid #f87171' }}>
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
                <div key={i} style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '5px', background: '#fbbf2422', marginBottom: '4px', color: '#fde68a', borderLeft: '3px solid #fbbf24' }}>
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
                <div key={i} style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '5px', background: '#34d39922', marginBottom: '4px', color: '#6ee7b7', borderLeft: '3px solid #34d399' }}>
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
            fontSize: '12px', lineHeight: '1.55', overflowX: 'auto',
            background: 'var(--vscode-input-background)',
            padding: '14px', borderRadius: '6px',
            border: '1px solid var(--vscode-panel-border, #3a3a3a)',
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
