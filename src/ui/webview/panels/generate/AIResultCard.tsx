import React from 'react';
import { T } from '../../components/shared';

interface AIResult {
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
}

interface Props {
  aiResult: AIResult;
}

export function AIResultCard({ aiResult }: Props) {
  return (
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
  );
}
