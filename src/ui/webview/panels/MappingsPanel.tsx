import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { T, SectionHeader } from '../components/shared';
import { ConfirmModal } from '../components/ConfirmModal';
import { AddMappingForm } from './mappings/AddMappingForm';
import { MappingList } from './mappings/MappingList';

export default function MappingsPanel() {
  const { state, send, notify } = useApp();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const removingMapping = state.mappings.find(m => m.mappingId === removingId);
  const removingLc = removingMapping
    ? state.logicalChannels.find(c => c.id === removingMapping.logicalChannelId)
    : null;
  const removingHw = removingMapping
    ? state.hardwareChannels.find(h => h.id === removingMapping.hardwareChannelId)
    : null;

  const [form, setForm] = useState({
    logicalId: '',
    hardwareId: '',
    hwChannel: '',
    operationMode: '',
    keySlot: '',
    nodeType: '',
    wakeUpCluster: false,
    // BTS-REVO fields
    measurementAttribute: '',
    btsFunction: '',
    lineContactState: false,
    gndContactState: false,
    vbatContactState: false,
    staticChannel: false,
    initValue: '',
    channelType: '',
    pwmWindowTime: '',
    // BTS measurement/subscription config
    measurementConfigRaw: '',       // comma-separated IDs
    subId: '',
    subType: '',
    subIsPeriodic: false,
    subPolling: '',
    subUpperThreshold: '',
    subLowerThreshold: '',
  });
  const [showForm, setShowForm] = useState(false);

  function setF(key: string, val: any) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function getLogicalCategory(id: string) {
    const ch = state.logicalChannels.find(c => c.id === id);
    if (!ch) return '';
    return ch.category;
  }

  function getHardwareSubclass(id: string) {
    const hw = state.hardwareChannels.find(h => h.id === id);
    return hw?.subclass ?? '';
  }

  const isFlexRay = getLogicalCategory(form.logicalId) === 'FLEXRAY';
  const isBTS = getHardwareSubclass(form.hardwareId) === 'BTSRevo';

  function handleAdd() {
    if (!form.logicalId) { notify('error', 'Please select a logical channel.'); return; }
    if (!form.hardwareId) { notify('error', 'Please select a hardware channel.'); return; }
    send('addMapping', {
      logicalChannelId: form.logicalId,
      hardwareChannelId: form.hardwareId,
      configurationId: state.currentConfigId,
      params: {
        hwChannel: form.hwChannel ? Number(form.hwChannel) : undefined,
        operationMode: form.operationMode || undefined,
        keySlot: isFlexRay && form.keySlot ? Number(form.keySlot) : undefined,
        nodeType: isFlexRay ? (form.nodeType || undefined) : undefined,
        wakeUpCluster: isFlexRay ? form.wakeUpCluster : undefined,
        measurementAttribute: isBTS ? (form.measurementAttribute || undefined) : undefined,
        btsFunction: isBTS ? (form.btsFunction || undefined) : undefined,
        lineContactState: isBTS ? form.lineContactState : undefined,
        gndContactState: isBTS ? form.gndContactState : undefined,
        vbatContactState: isBTS ? form.vbatContactState : undefined,
        staticChannel: isBTS ? form.staticChannel : undefined,
        initValue: isBTS ? (form.initValue || undefined) : undefined,
        channelType: isBTS ? (form.channelType || undefined) : undefined,
        pwmWindowTime: isBTS && form.pwmWindowTime ? Number(form.pwmWindowTime) : undefined,
        measurementConfig: isBTS && form.measurementConfigRaw
          ? form.measurementConfigRaw.split(',').map(s => s.trim()).filter(Boolean)
          : undefined,
        subscriptionConfig: isBTS && (form.subId || form.subType) ? {
          ID: form.subId || undefined,
          Type: form.subType || undefined,
          IsPeriodic: form.subIsPeriodic,
          Polling: form.subPolling ? Number(form.subPolling) : undefined,
          UpperThreshold: form.subUpperThreshold ? Number(form.subUpperThreshold) : undefined,
          LowerThreshold: form.subLowerThreshold ? Number(form.subLowerThreshold) : undefined,
        } : undefined,
      },
    });
    setForm({ logicalId: '', hardwareId: '', hwChannel: '', operationMode: '', keySlot: '', nodeType: '', wakeUpCluster: false, measurementAttribute: '', btsFunction: '', lineContactState: false, gndContactState: false, vbatContactState: false, staticChannel: false, initValue: '', channelType: '', pwmWindowTime: '', measurementConfigRaw: '', subId: '', subType: '', subIsPeriodic: false, subPolling: '', subUpperThreshold: '', subLowerThreshold: '' });
    setShowForm(false);
  }

  function getLabel(ch: { subclass?: string; category?: string; name: string }) {
    return ch.subclass || ch.category || '';
  }

  return (
    <div>
      <ConfirmModal
        open={!!removingId}
        title="Remove this mapping?"
        message={
          removingLc && removingHw
            ? `The mapping between "${removingLc.name}" and "${removingHw.name}" will be removed.`
            : 'This mapping will be permanently removed.'
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (removingId) send('removeMapping', { mappingId: removingId });
          setRemovingId(null);
        }}
        onCancel={() => setRemovingId(null)}
      />

      <SectionHeader
        title="Mappings"
        count={state.mappings.length}
        action={
          <button style={T.btnPrimary} onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Cancel' : '+ Add Mapping'}
          </button>
        }
      />

      {showForm && (
        <AddMappingForm
          form={form}
          logicalChannels={state.logicalChannels}
          hardwareChannels={state.hardwareChannels}
          isFlexRay={isFlexRay}
          isBTS={isBTS}
          setF={setF}
          handleAdd={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      <MappingList
        mappings={state.mappings}
        logicalChannels={state.logicalChannels}
        hardwareChannels={state.hardwareChannels}
        onRemove={setRemovingId}
      />
    </div>
  );
}
