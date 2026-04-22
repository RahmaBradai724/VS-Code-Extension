import React from 'react';
import { FrameworkData } from '../../types';
interface Props {
    data: FrameworkData;
    setD: (key: keyof FrameworkData, val: any) => void;
    logicalChannelNames: string[];
}
export declare function PublisherSection({ data, setD, logicalChannelNames }: Props): React.JSX.Element;
export {};
