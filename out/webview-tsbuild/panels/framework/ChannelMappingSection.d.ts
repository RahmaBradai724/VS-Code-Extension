import React from 'react';
interface Props {
    ctEcuEntries: [string, string[] | string][];
    setCtEcuEntries: (entries: [string, string[] | string][]) => void;
}
export declare function ChannelMappingSection({ ctEcuEntries, setCtEcuEntries }: Props): React.JSX.Element;
export {};
