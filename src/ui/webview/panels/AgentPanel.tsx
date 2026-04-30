/**
 * AgentPanel - Chat UI for the local MTF support and error-analysis agent.
 *
 * Message flow:
 *   User types question -> `agentAsk` postMessage -> backend RoutedMtfAgent.ask()
 *   Backend streams `agentChunk` tokens -> reducer appends to agentStreamingText
 *   Backend sends `agentDone` with sources -> reducer finalizes assistant message
 *   Backend sends `agentError` on failure -> reducer shows error message
 */

import React, { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useApp } from '../hooks/useApp';
import { tokens } from '../theme';
import { Icons } from '../components/icons';
import { Bubble } from './agent/Bubble';

// Fallback avatars as emoji data URLs (for VS Code webview compatibility)
const agentAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="100%25" height="100%25" rx="20" fill="%23e0e7ef"/><text x="50%25" y="56%25" font-size="22" text-anchor="middle" fill="%23596d8b" font-family="Segoe UI,Arial,sans-serif">🤖</text></svg>';
const userAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="100%25" height="100%25" rx="20" fill="%23f3e8ff"/><text x="50%25" y="56%25" font-size="22" text-anchor="middle" fill="%238b5cf6" font-family="Segoe UI,Arial,sans-serif">🧑</text></svg>';
import { StreamingDots } from './agent/StreamingDots';

export default function AgentPanel() {
  const { state, dispatch, send } = useApp();
  const [question, setQuestion] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    send('agentCheckOllama');
  }, [send]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.agentMessages, state.agentStreamingText]);

  useEffect(() => {
    if (!state.agentLoading) {
      inputRef.current?.focus();
    }
  }, [state.agentLoading]);

  function handleSend() {
    const trimmed = question.trim();
    if (!trimmed || state.agentLoading) { return; }
    dispatch({ type: 'AGENT_USER_MSG', content: trimmed });
    send('agentAsk', { question: trimmed });
    setQuestion('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  const suggestions = [
    'What does the Id field mean in Channels?',
    'How do I configure a PCAP tracer in FrameworkConfig?',
    'Why can my current configuration not generate YAML?',
    'Explain this YAML error and tell me how to fix it.',
    'What fields are required for a CM mapping?',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: `linear-gradient(135deg, ${tokens.bg} 80%, ${tokens.bgAlt} 100%)` }}>
      <div style={{
        padding: '18px 24px 14px 24px',
        borderBottom: `1px solid ${tokens.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
        background: tokens.bgAlt,
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
      }}>
        <img src={agentAvatar} alt="Agent" style={{ width: 38, height: 38, borderRadius: '50%', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.2 }}>MTF Support Agent</div>
          <div style={{ fontSize: 12, color: tokens.fgMuted, marginTop: 2 }}>
            Documentation search, YAML analysis, and configuration guidance with local workspace context.
          </div>
        </div>
        {state.agentMessages.length > 0 && (
          <button
            onClick={() => dispatch({ type: 'AGENT_CLEAR' })}
            title="Clear conversation"
            style={{
              marginLeft: 'auto',
              background: tokens.bg,
              border: `1px solid ${tokens.border}`,
              borderRadius: 6,
              color: tokens.fgMuted,
              padding: '4px 14px',
              cursor: 'pointer',
              fontSize: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'background 0.2s',
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 18px 12px',
          background: 'transparent',
          transition: 'background 0.3s',
        }}
      >
        {state.agentMessages.length === 0 && !state.agentLoading && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              MTF Support Agent
            </div>
            <div style={{ fontSize: 12, color: tokens.fgMuted, marginBottom: 24 }}>
              Ask about fields, sections, validation errors, or the YAML generated from the current configuration.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuestion(suggestion);
                    inputRef.current?.focus();
                  }}
                  style={{
                    background: tokens.bgAlt,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: 8,
                    color: tokens.fg,
                    padding: '6px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.agentMessages.map((message, index) => (
          <Bubble key={index} msg={message} userAvatar={userAvatar} agentAvatar={agentAvatar} />
        ))}

        {state.agentLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
            <div style={{
              maxWidth: '78%',
              padding: '10px 14px',
              borderRadius: '14px 14px 14px 4px',
              background: tokens.bgAlt,
              color: tokens.fg,
              fontSize: 13,
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
              minHeight: 42,
            }}>
              {state.agentStreamingText || <StreamingDots />}
            </div>
          </div>
        )}
      </div>

      <div style={{
        borderTop: `1px solid ${tokens.border}`,
        padding: '16px 24px',
        flexShrink: 0,
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
        background: tokens.bgAlt,
        boxShadow: '0 -2px 8px 0 rgba(0,0,0,0.03)',
      }}>
        <textarea
          ref={inputRef}
          rows={2}
          value={question}
          onChange={event => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={state.agentLoading
            ? 'Thinking...'
            : 'Ask about a field, a section, or a YAML/configuration error...'}
          disabled={state.agentLoading}
          style={{
            flex: 1,
            resize: 'none',
            background: tokens.bgInput,
            color: tokens.fgInput,
            border: `1.5px solid ${tokens.borderInput}`,
            borderRadius: 10,
            padding: '12px 14px',
            fontSize: 14,
            fontFamily: 'inherit',
            outline: 'none',
            opacity: state.agentLoading ? 0.6 : 1,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
            transition: 'border 0.2s',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!question.trim() || state.agentLoading}
          style={{
            background: question.trim() && !state.agentLoading ? tokens.accent : tokens.bg,
            color: question.trim() && !state.agentLoading ? tokens.accentFg : tokens.fgMuted,
            border: 'none',
            borderRadius: 10,
            padding: '10px 22px',
            fontSize: 15,
            cursor: question.trim() && !state.agentLoading ? 'pointer' : 'not-allowed',
            opacity: question.trim() && !state.agentLoading ? 1 : 0.5,
            flexShrink: 0,
            alignSelf: 'flex-end',
            height: 40,
            fontWeight: 600,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'background 0.2s',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
