import React from 'react';
interface Props {
    newName: string;
    setNewName: (v: string) => void;
    onCreate: () => void;
    onCancel: () => void;
}
export declare function CreateConfigForm({ newName, setNewName, onCreate, onCancel }: Props): React.JSX.Element;
export {};
