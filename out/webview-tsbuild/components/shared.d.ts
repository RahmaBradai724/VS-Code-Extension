import React from 'react';
import { FieldDef } from '../types';
import { T } from '../theme';
export { T };
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
