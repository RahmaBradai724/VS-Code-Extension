import React from 'react';
interface Props {
    logicalChannels: any[];
    hardwareChannels: any[];
    mappings: any[];
    mappedLogical: Set<string>;
    mappedHardware: Set<string>;
}
export declare function MappingDiagram({ logicalChannels, hardwareChannels, mappings, mappedLogical, mappedHardware }: Props): React.JSX.Element;
export {};
