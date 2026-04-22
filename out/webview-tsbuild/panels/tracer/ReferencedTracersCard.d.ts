import React from 'react';
interface Props {
    referencedNames: string[];
    configuredNames: Set<string>;
    unconfiguredNames: string[];
    onConfigure: (name: string) => void;
}
export declare function ReferencedTracersCard({ referencedNames, configuredNames, unconfiguredNames, onConfigure }: Props): React.JSX.Element | null;
export {};
