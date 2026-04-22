import React from 'react';
import { LogicalChannel, CHANNEL_COLORS } from '../../types';
import { T, ChannelRow } from '../../components/shared';

interface Props {
  logicalChannels: LogicalChannel[];
  send: (type: string, payload?: any) => void;
}

export function LogicalList({ logicalChannels, send }: Props) {
  if (logicalChannels.length === 0) {
    return <div style={T.empty}>No logical channels yet. Add one above.</div>;
  }

  return (
    <div>
      {logicalChannels.map(ch => {
        const color = CHANNEL_COLORS[ch.category] ?? '#888';
        const meta = [ch.loggingName, ch.tracerName].filter(Boolean).join(' • ');
        return (
          <ChannelRow
            key={ch.id}
            name={ch.name}
            badgeLabel={ch.subclass || ch.category}
            badgeColor={color}
            meta={meta || undefined}
            onDelete={() => send('deleteLogicalChannel', { channelId: ch.id })}
          />
        );
      })}
    </div>
  );
}
