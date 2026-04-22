import React from 'react';
import { AgentMessage } from '../../types';
interface BubbleProps {
    msg: AgentMessage;
    streamingText?: string;
}
export declare function Bubble({ msg, streamingText }: BubbleProps): React.JSX.Element;
export {};
