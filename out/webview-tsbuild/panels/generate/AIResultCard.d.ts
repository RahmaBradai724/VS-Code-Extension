import React from 'react';
interface AIResult {
    errors?: string[];
    warnings?: string[];
    suggestions?: string[];
}
interface Props {
    aiResult: AIResult;
}
export declare function AIResultCard({ aiResult }: Props): React.JSX.Element;
export {};
