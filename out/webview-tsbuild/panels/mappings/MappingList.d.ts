import React from 'react';
interface Props {
    mappings: any[];
    logicalChannels: any[];
    hardwareChannels: any[];
    onRemove: (id: string) => void;
}
export declare function MappingList({ mappings, logicalChannels, hardwareChannels, onRemove }: Props): React.JSX.Element;
export {};
