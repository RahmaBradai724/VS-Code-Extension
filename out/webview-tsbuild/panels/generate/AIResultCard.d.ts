import React from 'react';
interface AIResult {
    errors?: string[];
    warnings?: string[];
    suggestions?: string[];
    diagnostics?: Array<{
        code: string;
        severity: 'error' | 'warning' | 'suggestion';
        source: 'configuration' | 'mapping' | 'yaml' | 'generation';
        message: string;
        path?: string;
        fix?: string;
    }>;
}
interface Props {
    aiResult: AIResult;
}
export declare function AIResultCard({ aiResult }: Props): React.JSX.Element;
export {};
