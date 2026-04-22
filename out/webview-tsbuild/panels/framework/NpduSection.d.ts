import React from 'react';
interface Props {
    npdu: any;
    vlans: any;
    innerTags: any[];
    outerTags: any[];
    setNpdu: (key: string, val: any) => void;
    setEth: (key: string, val: any) => void;
    setDirty: (d: boolean) => void;
}
export declare function NpduSection({ npdu, vlans, innerTags, outerTags, setNpdu, setEth, setDirty }: Props): React.JSX.Element;
export {};
