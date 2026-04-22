import React, { useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { T } from '../components/shared';
import { ROW_H, ROW_GAP } from './diagram/constants';
import { MappingTopology } from './diagram/MappingTopology';
import { HardwareGallery } from './diagram/HardwareGallery';
import { ProductCatalogue } from './diagram/ProductCatalogue';

export default function DiagramPanel() {
  const { state, send } = useApp();
  const { logicalChannels, hardwareChannels, mappings, currentConfigId, currentConfigName } = state;

  const mappedLogicalIds  = useMemo(() => new Set(mappings.map(m => m.logicalChannelId)),  [mappings]);
  const mappedHardwareIds = useMemo(() => new Set(mappings.map(m => m.hardwareChannelId)), [mappings]);

  // y-positions for SVG connectors
  const logicalYMap = useMemo(() => {
    const m = new Map<string, number>();
    logicalChannels.forEach((ch, i) => { m.set(ch.id, i * (ROW_H + ROW_GAP) + ROW_H / 2); });
    return m;
  }, [logicalChannels]);

  const hardwareYMap = useMemo(() => {
    const m = new Map<string, number>();
    hardwareChannels.forEach((hw, i) => { m.set(hw.id, i * (ROW_H + ROW_GAP) + ROW_H / 2); });
    return m;
  }, [hardwareChannels]);

  const svgHeight = Math.max(
    logicalChannels.length * (ROW_H + ROW_GAP),
    hardwareChannels.length * (ROW_H + ROW_GAP),
    60,
  );

  // logical channels mapped to each hardware channel (for the gallery cards)
  const hwToLogical = useMemo(() => {
    const m = new Map<string, string[]>();
    mappings.forEach(mp => {
      const lch = logicalChannels.find(c => c.id === mp.logicalChannelId);
      if (!m.has(mp.hardwareChannelId)) { m.set(mp.hardwareChannelId, []); }
      m.get(mp.hardwareChannelId)!.push(lch?.name ?? mp.logicalChannelId);
    });
    return m;
  }, [mappings, logicalChannels]);

  const openUrl = (url: string) => send('openUrl', { url });

  return (
    <div>
      <h2 style={T.pageTitle}>Diagrams</h2>

      <MappingTopology
        logicalChannels={logicalChannels}
        hardwareChannels={hardwareChannels}
        mappings={mappings}
        currentConfigId={currentConfigId}
        currentConfigName={currentConfigName}
        mappedLogicalIds={mappedLogicalIds}
        mappedHardwareIds={mappedHardwareIds}
        logicalYMap={logicalYMap}
        hardwareYMap={hardwareYMap}
        svgHeight={svgHeight}
      />

      {currentConfigId && hardwareChannels.length > 0 && (
        <HardwareGallery
          hardwareChannels={hardwareChannels}
          hwToLogical={hwToLogical}
          openUrl={openUrl}
        />
      )}

      <ProductCatalogue openUrl={openUrl} />
    </div>
  );
}

