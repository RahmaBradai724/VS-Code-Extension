import React from 'react';
interface Props {
    someip: any;
    serverPorts: any[];
    clientPorts: any[];
    setEthNested: (section: string, key: string, val: any) => void;
    setSomeIPMapping: (sp: any[], cp: any[]) => void;
}
export declare function SomeIPSection({ someip, serverPorts, clientPorts, setEthNested, setSomeIPMapping }: Props): React.JSX.Element;
export {};
