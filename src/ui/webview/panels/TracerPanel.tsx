import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { TracerConfig } from '../types';
import { T } from '../components/shared';
import TracerManager from '../components/TracerManager';
import { TracerHeader } from './tracer/TracerHeader';
import { ReferencedTracersCard } from './tracer/ReferencedTracersCard';

type TracerWithId = TracerConfig & { _id: string };

export default function TracerPanel() {
  const { state, dispatch, send, notify } = useApp();
  const fw = state.frameworkData;

  const [tracers, setTracers] = useState<TracerWithId[]>(() =>
    (fw.tracers || []).map(t => ({ ...t, _id: `t_${Date.now()}_${Math.random()}` }))
  );
  const [dirty, setDirty] = useState(false);
  const [preselectName, setPreselectName] = useState<string | null>(null);

  useEffect(() => {
    setTracers((fw.tracers || []).map(t => ({ ...t, _id: `t_${Date.now()}_${Math.random()}` })));
    setDirty(false);
  }, [state.currentConfigId]);

  // Collect all unique non-empty tracer names referenced by logical channels
  const referencedNames: string[] = Array.from(new Set(
    state.logicalChannels
      .map((ch: any) => ch.tracerName as string | undefined)
      .filter((n): n is string => !!n && n.trim() !== '')
  ));

  const configuredNames = new Set(tracers.map(t => t.name));
  const unconfiguredNames = referencedNames.filter(n => !configuredNames.has(n));
  const suggestedNames = unconfiguredNames;

  function handleSave() {
    const saved = {
      ...fw,
      tracers: tracers.map(({ _id, ...rest }) => rest as TracerConfig),
    };
    dispatch({ type: 'UPDATE_FRAMEWORK', data: saved });
    send('saveFramework', { frameworkData: saved });
    setDirty(false);
    notify('success', 'Tracers saved.');
  }

  return (
    <div>
      <TracerHeader dirty={dirty} onSave={handleSave} />

      <ReferencedTracersCard
        referencedNames={referencedNames}
        configuredNames={configuredNames}
        unconfiguredNames={unconfiguredNames}
        onConfigure={setPreselectName}
      />

      <TracerManager
        tracers={tracers}
        onChange={(updated) => { setTracers(updated); setDirty(true); }}
        onNotify={notify}
        suggestedNames={suggestedNames}
        preselectName={preselectName}
        onPreselectConsumed={() => setPreselectName(null)}
      />
    </div>
  );
}

