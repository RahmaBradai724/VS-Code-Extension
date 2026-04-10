import React from 'react';
import { TracerConfig } from '../types';
type TracerWithId = TracerConfig & {
    _id: string;
};
interface Props {
    tracers: TracerWithId[];
    onChange: (tracers: TracerWithId[]) => void;
    onNotify: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
    suggestedNames?: string[];
    preselectName?: string | null;
    onPreselectConsumed?: () => void;
}
export default function TracerManager({ tracers, onChange, onNotify, suggestedNames, preselectName, onPreselectConsumed }: Props): React.JSX.Element;
export {};
