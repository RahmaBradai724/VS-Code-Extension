import React from 'react';
interface Props {
    ethProtoCfg: any[];
    topoCfg: any[];
    setTopoProtoCfg: (list: any[]) => void;
    setTopoTopoCfg: (list: any[]) => void;
    tunTapVirtualAdapterNames?: string[];
}
export declare function TopologySection({ ethProtoCfg, topoCfg, setTopoProtoCfg, setTopoTopoCfg, tunTapVirtualAdapterNames }: Props): React.JSX.Element;
export {};
