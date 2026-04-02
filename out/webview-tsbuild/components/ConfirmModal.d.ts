import React from 'react';
interface ConfirmModalProps {
    open: boolean;
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}
export declare function ConfirmModal({ open, title, message, confirmLabel, cancelLabel, variant, onConfirm, onCancel, }: ConfirmModalProps): React.JSX.Element | null;
export {};
