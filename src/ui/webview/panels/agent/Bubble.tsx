import React from 'react';
import { AgentMessage } from '../../types';
import { tokens } from '../../theme';
import { SourceBadges } from './SourceBadges';

interface BubbleProps {
  msg: AgentMessage;
  streamingText?: string;
}

export function Bubble({ msg, streamingText }: BubbleProps) {
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
          background: isUser ? tokens.accent : tokens.bgAlt,
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
