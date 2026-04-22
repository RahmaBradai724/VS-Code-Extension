import React, { useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { T } from '../components/shared';
import { StatCards } from './dashboard/StatCards';
import { MappingDiagram } from './dashboard/MappingDiagram';
import { MappingTable } from './dashboard/MappingTable';
import { CategoryLegend } from './dashboard/CategoryLegend';

export default function DashboardPanel() {
  const { state } = useApp();
  const { logicalChannels, hardwareChannels, mappings } = state;

  const mappedLogical = useMemo(() => new Set(mappings.map(m => m.logicalChannelId)), [mappings]);
  const mappedHardware = useMemo(() => new Set(mappings.map(m => m.hardwareChannelId)), [mappings]);

  const total = logicalChannels.length + hardwareChannels.length;

  return (
    <div>
      <h2 style={T.pageTitle}>Dashboard</h2>

      <StatCards
        logicalCount={logicalChannels.length}
        hardwareCount={hardwareChannels.length}
        mappingsCount={mappings.length}
      />

      {total === 0 ? (
        <div style={T.empty}>
          No channels defined yet. Add logical and hardware channels then create mappings to see the diagram.
        </div>
      ) : (
        <div style={T.card}>
          <MappingDiagram
            logicalChannels={logicalChannels}
            hardwareChannels={hardwareChannels}
            mappings={mappings}
            mappedLogical={mappedLogical}
            mappedHardware={mappedHardware}
          />
          <MappingTable
            mappings={mappings}
            logicalChannels={logicalChannels}
            hardwareChannels={hardwareChannels}
          />
        </div>
      )}

      <CategoryLegend />
    </div>
  );
}
