import React from 'react';
interface Props {
    appPorts: any;
    portInputs: Record<string, string>;
    setPortInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    setEth: (key: string, val: any) => void;
    setDirty: (d: boolean) => void;
}
export declare function AppPortsSection({ appPorts, portInputs, setPortInputs, setEth, setDirty }: Props): React.JSX.Element;
export {};
