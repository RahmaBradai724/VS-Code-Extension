import React from 'react';
import { FrameworkData } from '../../types';
interface Props {
    data: FrameworkData;
    ecuInput: string;
    setEcuInput: (v: string) => void;
    setD: (key: keyof FrameworkData, val: any) => void;
    tracerCount: number;
}
export declare function GeneralSection({ data, ecuInput, setEcuInput, setD, tracerCount }: Props): React.JSX.Element;
export {};
