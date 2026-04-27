import React from 'react';
import { HardwareChannel, HARDWARE_SUBCLASS_OPTIONS } from '../../types';
import { T, ChannelRow } from '../../components/shared';

const SUBCLASS_COLOR: Record<string, string> = {
  // Capture Module variants (legacy CIBInterface/CMInterface kept for existing data)
  CANInterface: '#569cd6', CIBInterface: '#569cd6', CMInterface: '#9cdcfe',
  LINCard: '#dcb67a',
  EthernetAdapter: '#4ec9b0', RelayBoard: '#c678dd',
  HIDRelay: '#c678dd', SerialPort: '#d4d4d4', AnalogDevice: '#f0c040',
  TEAnalog: '#f0c040', HHLoad: '#f87171',
  TunTapBridge: '#38bdf8',
};

interface Props {
  hardwareChannels: HardwareChannel[];
  send: (type: string, payload?: any) => void;
}

export function HardwareList({ hardwareChannels, send }: Props) {
  if (hardwareChannels.length === 0) {
    return <div style={T.empty}>No hardware channels yet. Add one above.</div>;
  }

  return (
    <div>
      {hardwareChannels.map(hw => {
        const color = SUBCLASS_COLOR[hw.subclass] ?? '#888';
        const label = HARDWARE_SUBCLASS_OPTIONS.find(o => o.value === hw.subclass)?.label ?? hw.subclass;
        return (
          <ChannelRow
            key={hw.id}
            name={hw.name}
            badgeLabel={label}
            badgeColor={color}
            onDelete={() => send('deleteHardwareChannel', { channelId: hw.id })}
          />
        );
      })}
    </div>
  );
}
