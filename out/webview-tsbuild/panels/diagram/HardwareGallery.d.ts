import React from 'react';
interface Props {
    hardwareChannels: any[];
    hwToLogical: Map<string, string[]>;
    openUrl: (url: string) => void;
}
export declare function HardwareGallery({ hardwareChannels, hwToLogical, openUrl }: Props): React.JSX.Element;
export {};
