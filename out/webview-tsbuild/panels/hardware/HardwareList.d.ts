import React from 'react';
import { HardwareChannel } from '../../types';
interface Props {
    hardwareChannels: HardwareChannel[];
    send: (type: string, payload?: any) => void;
}
export declare function HardwareList({ hardwareChannels, send }: Props): React.JSX.Element;
export {};
