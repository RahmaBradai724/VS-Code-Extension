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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{
        padding: '12px 18px',
        borderBottom: `1px solid ${tokens.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <span style={{ color: tokens.accent, display: 'flex' }}><Icons.agent /></span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>MTF Support Agent</div>
          <div style={{ fontSize: 11, color: tokens.fgMuted }}>
            Documentation search, YAML analysis, and configuration guidance with local workspace context.
          </div>
        </div>
        {state.agentMessages.length > 0 && (
          <button
            onClick={() => dispatch({ type: 'AGENT_CLEAR' })}
            title="Clear conversation"
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: `1px solid ${tokens.border}`,
              borderRadius: 4,
              color: tokens.fgMuted,
              padding: '2px 8px',
              cursor: 'pointer',
              fontSize: 11,
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
          padding: '18px 18px 8px',
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
          <Bubble key={index} msg={message} />
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
        padding: '12px 18px',
        flexShrink: 0,
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
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
            border: `1px solid ${tokens.borderInput}`,
            borderRadius: 6,
            padding: '8px 10px',
            fontSize: 13,
            fontFamily: 'inherit',
            outline: 'none',
            opacity: state.agentLoading ? 0.6 : 1,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!question.trim() || state.agentLoading}
          style={{
            background: tokens.accent,
            color: tokens.accentFg,
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 13,
            cursor: question.trim() && !state.agentLoading ? 'pointer' : 'not-allowed',
            opacity: question.trim() && !state.agentLoading ? 1 : 0.5,
            flexShrink: 0,
            alignSelf: 'flex-end',
            height: 34,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
