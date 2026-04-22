import React from 'react';
interface Props {
    logicalChannels: any[];
    hardwareChannels: any[];
    mappings: any[];
    currentConfigId: any;
    currentConfigName: any;
    mappedLogicalIds: Set<string>;
    mappedHardwareIds: Set<string>;
    logicalYMap: Map<string, number>;
    hardwareYMap: Map<string, number>;
    svgHeight: number;
}
export declare function MappingTopology({ logicalChannels, hardwareChannels, mappings, currentConfigId, currentConfigName, mappedLogicalIds, mappedHardwareIds, logicalYMap, hardwareYMap, svgHeight, }: Props): React.JSX.Element;
export {};
