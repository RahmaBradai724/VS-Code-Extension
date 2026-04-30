import React from 'react';
import { AgentMessage } from '../../types';
import { tokens } from '../../theme';
import { SourceBadges } from './SourceBadges';

interface BubbleProps {
  msg: AgentMessage;
  streamingText?: string;
  userAvatar?: string;
  agentAvatar?: string;
}

export function Bubble({ msg, streamingText, userAvatar, agentAvatar }: BubbleProps) {
  const isUser = msg.role === 'user';
  const content = msg.streaming ? (streamingText ?? '') : msg.content;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 18,
        alignItems: 'flex-end',
        animation: 'fadeInBubble 0.5s',
      }}
    >
      {!isUser && (
        <img src={agentAvatar} alt="Agent" style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} />
      )}
      <div
        style={{
          maxWidth: '78%',
          padding: isUser ? '12px 18px' : '14px 18px',
          borderRadius: isUser ? '18px 18px 8px 18px' : '18px 18px 18px 8px',
          background: isUser
            ? `linear-gradient(135deg, ${tokens.accent} 80%, ${tokens.accentHover} 100%)`
            : `linear-gradient(135deg, ${tokens.bgAlt} 80%, ${tokens.bg} 100%)`,
          color: isUser ? tokens.accentFg : tokens.fg,
          fontSize: 14,
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        {content || <span style={{ opacity: 0.4 }}>…</span>}
        {!isUser && msg.sources && <SourceBadges sources={msg.sources} />}
      </div>
      {isUser && (
        <img src={userAvatar} alt="You" style={{ width: 32, height: 32, borderRadius: '50%', marginLeft: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} />
      )}
      <style>{`
        @keyframes fadeInBubble {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
