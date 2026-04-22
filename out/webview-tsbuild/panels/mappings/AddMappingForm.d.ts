import React from 'react';
type MappingForm = {
    logicalId: string;
    hardwareId: string;
    hwChannel: string;
    operationMode: string;
    keySlot: string;
    nodeType: string;
    wakeUpCluster: boolean;
    measurementAttribute: string;
    btsFunction: string;
    lineContactState: boolean;
    gndContactState: boolean;
    vbatContactState: boolean;
    staticChannel: boolean;
    initValue: string;
    channelType: string;
    pwmWindowTime: string;
    measurementConfigRaw: string;
    subId: string;
    subType: string;
    subIsPeriodic: boolean;
    subPolling: string;
    subUpperThreshold: string;
    subLowerThreshold: string;
};
interface Props {
    form: MappingForm;
    logicalChannels: any[];
    hardwareChannels: any[];
    isFlexRay: boolean;
    isBTS: boolean;
    setF: (key: string, val: any) => void;
    handleAdd: () => void;
    onCancel: () => void;
}
export declare function AddMappingForm({ form, logicalChannels, hardwareChannels, isFlexRay, isBTS, setF, handleAdd, onCancel }: Props): React.JSX.Element;
export {};
