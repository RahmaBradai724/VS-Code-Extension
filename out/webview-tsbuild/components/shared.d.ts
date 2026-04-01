import React from 'react';
import { FieldDef } from '../types';
export declare const T: {
    card: React.CSSProperties;
    cardTitle: React.CSSProperties;
    pageTitle: React.CSSProperties;
    label: React.CSSProperties;
    input: React.CSSProperties;
    textarea: React.CSSProperties;
    select: React.CSSProperties;
    btnPrimary: React.CSSProperties;
    btnSecondary: React.CSSProperties;
    btnDanger: React.CSSProperties;
    btnSmall: React.CSSProperties;
    row: React.CSSProperties;
    grid2: React.CSSProperties;
    divider: React.CSSProperties;
    empty: React.CSSProperties;
};
interface DynamicFieldProps {
    def: FieldDef;
    value: any;
    onChange: (key: string, value: any) => void;
}
export declare function DynamicField({ def, value, onChange }: DynamicFieldProps): React.JSX.Element;
interface BadgeProps {
    label: string;
    color?: string;
}
export declare function Badge({ label, color }: BadgeProps): React.JSX.Element;
interface ChannelRowProps {
    name: string;
    badgeLabel: string;
    badgeColor?: string;
    meta?: string;
    onDelete: () => void;
}
export declare function ChannelRow({ name, badgeLabel, badgeColor, meta, onDelete }: ChannelRowProps): React.JSX.Element;
interface SectionHeaderProps {
    title: string;
    count?: number;
    action?: React.ReactNode;
}
export declare function SectionHeader({ title, count, action }: SectionHeaderProps): React.JSX.Element;
export {};
