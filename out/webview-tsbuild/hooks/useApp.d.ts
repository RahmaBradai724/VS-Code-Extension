import React from 'react';
import { AppState, AppAction } from '../types';
export interface AppContextValue {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
    send: (command: string, data?: Record<string, any>) => void;
    notify: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}
export declare const AppContext: React.Context<AppContextValue>;
export declare const useApp: () => AppContextValue;
