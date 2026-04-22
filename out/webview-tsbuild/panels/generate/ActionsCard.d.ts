import React from 'react';
interface Props {
    generating: boolean;
    aiValidating: boolean;
    yamlContent: string | null | undefined;
    frameworkData: any;
    send: (type: string, payload?: any) => void;
}
export declare function ActionsCard({ generating, aiValidating, yamlContent, frameworkData, send }: Props): React.JSX.Element;
export {};
