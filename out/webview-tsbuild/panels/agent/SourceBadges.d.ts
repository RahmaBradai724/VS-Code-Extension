import React from 'react';
import { AgentResponseMeta, AgentSource } from '../../types';
interface SourceBadgesProps {
    sources: AgentSource[];
    meta?: AgentResponseMeta;
}
export declare function SourceBadges({ sources, meta }: SourceBadgesProps): React.JSX.Element | null;
export {};
