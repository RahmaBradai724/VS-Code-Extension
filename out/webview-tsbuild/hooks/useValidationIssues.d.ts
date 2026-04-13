import { AppState } from '../types';
export interface ValidationIssues {
    errors: string[];
    warnings: string[];
}
export declare function useValidationIssues(state: AppState): ValidationIssues;
