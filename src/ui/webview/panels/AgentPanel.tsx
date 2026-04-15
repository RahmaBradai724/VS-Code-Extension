/**
 * AgentPanel — Chat UI for the local MTF documentation RAG agent.
 *
 * Messages flow:
 *   User types question → `agentAsk` postMessage → backend MtfAgent.ask()
 *   Backend streams `agentChunk` tokens → reducer appends to agentStreamingText
 *   Backend sends `agentDone` with sources → reducer finalises assistant message
 *   Backend sends `agentError` on failure  → reducer shows error message
 */

import React, { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useApp } from '../hooks/useApp';
import { AgentMessage } from '../types';
import { tokens } from '../theme';
import { Icons } from '../components/icons';

// ── Sub-components ────────────────────────────────────────────────────────────

interface SourceBadgesProps {
  sources: NonNullable<AgentMessage['sources']>;
}

function SourceBadges({ sources }: SourceBadgesProps) {
  const [open, setOpen] = useState(false);
  if (!sources.length) { return null; }
  return (
    <div style={{ marginTop: 6 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none',
          border: `1px solid ${tokens.border}`,
          color: tokens.fgMuted,
          borderRadius: 4,
          padding: '2px 8px',
          fontSize: 11,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {open ? '▾' : '▸'} {sources.length} source{sources.length !== 1 ? 's' : ''}
      </button>
      {open && (
        <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, listStyle: 'disc' }}>
          {sources.map((s, i) => (
            <li key={i} style={{ fontSize: 11, color: tokens.fgMuted, marginBottom: 2 }}>
              <strong>{s.section}</strong>
              {s.subsection ? ` › ${s.subsection}` : ''}
              <span style={{ marginLeft: 6, opacity: 0.6 }}>
                ({Math.round(s.score * 100)}% match)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface BubbleProps {
  msg: AgentMessage;
  streamingText?: string;
}

function Bubble({ msg, streamingText }: BubbleProps) {
  const isUser = msg.role === 'user';
  const content = msg.streaming ? (streamingText ?? '') : msg.content;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          maxWidth: '78%',
          padding: '10px 14px',
          borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          background: isUser
            ? tokens.accent
            : tokens.bgAlt,
          color: isUser ? tokens.accentFg : tokens.fg,
          fontSize: 13,
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        }}
      >
        {content || <span style={{ opacity: 0.4 }}>…</span>}
        {!isUser && msg.sources && <SourceBadges sources={msg.sources} />}
      </div>
    </div>
  );
}

// ── AgentPanel ────────────────────────────────────────────────────────────────

export default function AgentPanel() {
  const { state, dispatch, send } = useApp();
  const [question, setQuestion] = useState('');
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);   // null = checking
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // Check Ollama availability on mount
  useEffect(() => {
    send('agentCheckOllama');
  }, [send]);

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.agentMessages, state.agentStreamingText]);

  // Focus input when idle
  useEffect(() => {
    if (!state.agentLoading) {
      inputRef.current?.focus();
    }
  }, [state.agentLoading]);

  function handleSend() {
    const q = question.trim();
    if (!q || state.agentLoading) { return; }
    dispatch({ type: 'AGENT_USER_MSG', content: q });
    send('agentAsk', { question: q });
    setQuestion('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Suggestion chips for common MTF questions
  const SUGGESTIONS = [
    'What is the Channel Id field?',
    'How do I configure a CAN channel?',
    'What PCAP tracer options are available?',
    'How are mappings defined for BTS-Revo?',
    'What publisher types exist in FrameworkConfig?',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>

      {/* ── Header ── */}
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
          <div style={{ fontWeight: 600, fontSize: 14 }}>MTF Documentation Agent</div>
          <div style={{ fontSize: 11, color: tokens.fgMuted }}>
            Ask anything about the MTF Configuration File (powered by Ollama — fully local)
          </div>
        </div>
        {ollamaOk === false && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: '#e06c75',
            padding: '3px 8px',
            border: '1px solid #e06c75',
            borderRadius: 4,
          }}>
            Ollama not running
          </span>
        )}
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

      {/* ── Message list ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 18px 8px',
        }}
      >
        {/* Welcome / suggestions when empty */}
        {state.agentMessages.length === 0 && !state.agentLoading && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🤖</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              MTF Documentation Agent
            </div>
            <div style={{ fontSize: 12, color: tokens.fgMuted, marginBottom: 24 }}>
              Ask me anything about the MTF Configuration File.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setQuestion(s); inputRef.current?.focus(); }}
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
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation bubbles */}
        {state.agentMessages.map((msg, i) => (
          <Bubble key={i} msg={msg} />
        ))}

        {/* Streaming indicator */}
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
              {state.agentStreamingText || (
                <StreamingDots />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Input area ── */}
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
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={state.agentLoading ? 'Thinking…' : 'Ask about the MTF Configuration File… (Enter to send)'}
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

// ── Streaming dots ────────────────────────────────────────────────────────────

function StreamingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: tokens.fgMuted,
            display: 'inline-block',
            animation: `agent-dot-pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes agent-dot-pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </span>
  );
}
