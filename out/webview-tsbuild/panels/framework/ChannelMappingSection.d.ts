import React from 'react';
interface Props {
    ctEcuEntries: [string, string[] | string][];
    setCtEcuEntries: (entries: [string, string[] | string][]) => void;
    logicalChannelNames: string[];
}
export declare function ChannelMappingSection({ ctEcuEntries, setCtEcuEntries, logicalChannelNames }: Props): React.JSX.Element;
export {};
