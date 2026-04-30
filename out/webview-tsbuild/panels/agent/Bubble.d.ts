import React from 'react';
import { AgentMessage } from '../../types';
interface BubbleProps {
    msg: AgentMessage;
    streamingText?: string;
    userAvatar?: string;
    agentAvatar?: string;
}
export declare function Bubble({ msg, streamingText, userAvatar, agentAvatar }: BubbleProps): React.JSX.Element;
export {};
