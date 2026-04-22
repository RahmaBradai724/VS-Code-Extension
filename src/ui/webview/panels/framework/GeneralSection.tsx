import React from 'react';
import { T } from '../../components/shared';
import { FrameworkData } from '../../types';
import { SUB_TITLE } from './shared';

interface Props {
  data: FrameworkData;
  ecuInput: string;
  setEcuInput: (v: string) => void;
  setD: (key: keyof FrameworkData, val: any) => void;
  tracerCount: number;
}

export function GeneralSection({ data, ecuInput, setEcuInput, setD, tracerCount }: Props) {
  return (
    <>
      {/* Tracers info */}
      <div id="fw-tracers" style={{ ...T.card, marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ ...SUB_TITLE, marginBottom: '2px' }}>Tracers</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--vscode-descriptionForeground)' }}>
            <strong>{tracerCount}</strong> tracer(s) configured — manage in the <strong>Tracers</strong> panel.
          </p>
        </div>
        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: 'var(--vscode-button-background)', color: 'var(--vscode-button-foreground)', fontWeight: 700 }}>
          {tracerCount}
        </span>
      </div>

      {/* General */}
      <div style={{ ...T.card, marginBottom: '10px' }}>
        <p style={SUB_TITLE}>General</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div id="fw-connectedEcus">
            <label style={T.label}>Connected ECUs (DUT's) — comma-separated</label>
            <input style={T.input} placeholder="ECU1, ECU2, ECU3"
              value={ecuInput}
              onChange={e => setEcuInput(e.target.value)}
              onBlur={e => setD('connectedEcus', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          </div>
          <div id="fw-servicePack">
            <label style={T.label}>Service Pack Name</label>
            <input style={T.input} placeholder="ServicePack_name" value={data.servicePack || ''} onChange={e => setD('servicePack', e.target.value)} />
          </div>
        </div>
      </div>
    </>
  );
}
