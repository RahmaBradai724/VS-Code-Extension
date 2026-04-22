import React from 'react';
type LogicalSubclassOption = {
    value: string;
    label: string;
    category: string;
};
interface Props {
    form: {
        name: string;
        channelId: string;
        loggingName: string;
        tracerName: string;
        aliases: string;
        subclass: string;
        extras: Record<string, any>;
    };
    fieldErrors: Record<string, string>;
    extraFields: any[];
    selectedOpt: LogicalSubclassOption | undefined;
    isBridge: boolean;
    canSubmit: boolean;
    setField: (key: string, val: any) => void;
    setSubclass: (val: string) => void;
    setExtra: (key: string, val: any) => void;
    handleAdd: () => void;
    handleCancelForm: () => void;
}
export declare function AddLogicalChannelForm({ form, fieldErrors, extraFields, selectedOpt, isBridge, canSubmit, setField, setSubclass, setExtra, handleAdd, handleCancelForm, }: Props): React.JSX.Element;
export {};
