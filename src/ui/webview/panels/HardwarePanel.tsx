import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import {
  HARDWARE_SUBCLASS_OPTIONS, HARDWARE_EXTRA_FIELDS, HardwareChannel,
} from '../types';
import { T, SectionHeader } from '../components/shared';
import { AddChannelForm } from './hardware/AddChannelForm';
import { HardwareList } from './hardware/HardwareList';

function initExtras(subclass: string): Record<string, any> {
  const fields = HARDWARE_EXTRA_FIELDS[subclass] ?? [];
  const obj: Record<string, any> = {};
  fields.forEach(f => { obj[f.key] = f.type === 'checkbox' ? false : ''; });
  if (subclass === 'TunTapBridge') {
    obj.tunTapAdapters = [];
  }
  return obj;
}

const HW_NAME_RE = /^[A-Za-z_][A-Za-z0-9_\-]*$/;

export default function HardwarePanel() {
  const { state, send, notify } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [nameError, setNameError] = useState('');

  const [form, setForm] = useState({
    name: '',
    subclass: HARDWARE_SUBCLASS_OPTIONS[0].value,
    extras: initExtras(HARDWARE_SUBCLASS_OPTIONS[0].value),
  });

  function setField(key: string, val: any) {
    setForm(f => ({ ...f, [key]: val }));
    if (key === 'name') {
      const v = String(val).trim();
      if (!v) {
        setNameError('Name is required.');
      } else if (!HW_NAME_RE.test(v)) {
        setNameError('Invalid name, It must start with a letter or underscore, no spaces are allowed. Allowed: [A-Z]');
      } else {
        setNameError('');
      }
    }
  }

  function setSubclass(val: string) {
    setForm(f => ({ ...f, subclass: val, extras: initExtras(val) }));
  }

  function setExtra(key: string, val: any) {
    setForm(f => ({ ...f, extras: { ...f.extras, [key]: val } }));
  }

  function handleAdd() {
    if (!form.name.trim()) { notify('error', 'Channel name is required.'); return; }
    if (!HW_NAME_RE.test(form.name.trim())) {
      setNameError('Invalid name â€” must start with a letter or underscore; no spaces.');
      notify('error', 'Please fix the highlighted errors before adding.');
      return;
    }
    const channel: HardwareChannel = {
      id: `hw_${Date.now()}`,
      name: form.name.trim(),
      type: 'HARDWARE',
      subclass: form.subclass,
      ...form.extras,
    };
    send('addHardwareChannel', { channel });
    setNameError('');
    setForm({ name: '', subclass: HARDWARE_SUBCLASS_OPTIONS[0].value, extras: initExtras(HARDWARE_SUBCLASS_OPTIONS[0].value) });
    setShowForm(false);
  }

  function handleCancelForm() {
    setNameError('');
    setForm({ name: '', subclass: HARDWARE_SUBCLASS_OPTIONS[0].value, extras: initExtras(HARDWARE_SUBCLASS_OPTIONS[0].value) });
    setShowForm(false);
  }

  return (
    <div>
      <SectionHeader
        title="Hardware Channels"
        count={state.hardwareChannels.length}
        action={
          <button style={T.btnPrimary} onClick={() => showForm ? handleCancelForm() : setShowForm(true)}>
            {showForm ? 'Cancel' : '+ Add Channel'}
          </button>
        }
      />

      {showForm && (
        <AddChannelForm
          form={form}
          nameError={nameError}
          setField={setField}
          setSubclass={setSubclass}
          setExtra={setExtra}
          handleAdd={handleAdd}
          handleCancelForm={handleCancelForm}
          adapterFriendlyNames={(
            state.hardwareChannels as any[]
          ).filter(h => h.subclass === 'EthernetAdapter' && h.friendlyName).map((h: any) => h.friendlyName as string)}
        />
      )}

      <HardwareList hardwareChannels={state.hardwareChannels} send={send} />
    </div>
  );
}
