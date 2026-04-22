import React from 'react';
import { LogicalChannel } from '../../types';
interface Props {
    logicalChannels: LogicalChannel[];
    send: (type: string, payload?: any) => void;
}
export declare function LogicalList({ logicalChannels, send }: Props): React.JSX.Element;
export {};
