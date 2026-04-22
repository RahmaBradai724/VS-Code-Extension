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
}
export declare function AddChannelForm({ form, nameError, setField, setSubclass, setExtra, handleAdd, handleCancelForm }: Props): React.JSX.Element;
export {};
