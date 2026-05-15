import React from 'react';
interface Props {
    form: {
        name: string;
        subclass: string;
        extras: Record<string, any>;
    };
    nameError: string;
    setField: (key: string, val: any) => void;
    setSubclass: (val: string) => void;
    setExtra: (key: string, val: any) => void;
    handleAdd: () => void;
    handleCancelForm: () => void;
    adapterFriendlyNames?: string[];
    discoveredCaptureModules?: Array<{
        id: number;
        name: string;
        ip: string;
        product_family: string;
    }>;
    discoveredEthernetAdapters?: Array<{
        friendly_name: string;
        description: string;
    }>;
}
export declare function AddChannelForm({ form, nameError, setField, setSubclass, setExtra, handleAdd, handleCancelForm, adapterFriendlyNames, discoveredCaptureModules, discoveredEthernetAdapters }: Props): React.JSX.Element;
export {};
