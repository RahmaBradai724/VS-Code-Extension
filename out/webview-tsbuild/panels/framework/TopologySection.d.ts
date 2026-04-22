import React from 'react';
interface Props {
    ethProtoCfg: any[];
    topoCfg: any[];
    setTopoProtoCfg: (list: any[]) => void;
    setTopoTopoCfg: (list: any[]) => void;
}
export declare function TopologySection({ ethProtoCfg, topoCfg, setTopoProtoCfg, setTopoTopoCfg }: Props): React.JSX.Element;
export {};
