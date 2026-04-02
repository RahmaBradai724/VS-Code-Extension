import React from 'react';
interface Notification {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
}
interface ToastProps {
    notification: Notification | null;
}
export declare function Toast({ notification }: ToastProps): React.JSX.Element | null;
export {};
