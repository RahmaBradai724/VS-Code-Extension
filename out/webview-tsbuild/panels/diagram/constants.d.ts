import React from 'react';
export declare const CDN = "https://cdn.prod.website-files.com/696a0fa6916b6d0324673bba/";
export declare const HW_IMAGES: Record<string, string>;
export declare const HW_COLORS: Record<string, string>;
export interface ProductCard {
    label: string;
    subtitle: string;
    description: string;
    protocols: string[];
    url: string;
    color: string;
    image?: string;
    icon: string;
}
export declare const PRODUCT_CATALOGUE: ProductCard[];
export declare const ROW_H = 88;
export declare const ROW_GAP = 10;
export declare const hdrStyle: React.CSSProperties;
export declare const nodeStyle: React.CSSProperties;
