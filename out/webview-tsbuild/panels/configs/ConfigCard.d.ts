import React from 'react';
interface Props {
    cfg: any;
    isActive: boolean;
    isOwner: boolean;
    onLoad: () => void;
    onDelete: () => void;
}
export declare function ConfigCard({ cfg, isActive, isOwner, onLoad, onDelete }: Props): React.JSX.Element;
export {};
