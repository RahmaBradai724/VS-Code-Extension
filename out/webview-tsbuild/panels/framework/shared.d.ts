import React from 'react';
export declare function CardRow({ children, style, onRemove }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
    onRemove?: () => void;
}): React.JSX.Element;
export declare function AddBtn({ onClick, label }: {
    onClick: () => void;
    label?: string;
}): React.JSX.Element;
export declare function portListToString(v: any): string;
export declare const SUB_CARD: React.CSSProperties;
export declare const SUB_TITLE: React.CSSProperties;
