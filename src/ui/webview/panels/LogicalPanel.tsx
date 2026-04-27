import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import {
  LOGICAL_SUBCLASS_OPTIONS, LOGICAL_EXTRA_FIELDS,
  CHANNEL_COLORS, LogicalChannel,
} from '../types';
import { T, SectionHeader } from '../components/shared';
import { AddLogicalChannelForm } from './logical/AddLogicalChannelForm';
import { LogicalList } from './logical/LogicalList';

const CATEGORY_OF: Record<string, string> = {};
LOGICAL_SUBCLASS_OPTIONS.forEach(o => { CATEGORY_OF[o.value] = o.category; });

function initExtras(subclass: string): Record<string, any> {
  const fields = LOGICAL_EXTRA_FIELDS[subclass] ?? [];
  const obj: Record<string, any> = {};
  fields.forEach(f => {
    obj[f.key] = f.defaultValue !== undefined ? f.defaultValue
      : f.type === 'checkbox' ? false : '';
  });
  return obj;
}

const NAME_RE = /^[A-Za-z_][A-Za-z0-9_\-]*$/;

function validateLogicalForm(
  form: { name: string; channelId: string; aliases: string },
  existingChannels: { channelId?: number | string }[],
  editingId?: string,
): Record<string, string> {
  const errs: Record<string, string> = {};
  // Name
  if (!form.name.trim()) {
    errs.name = 'Name is required.';
  } else if (!NAME_RE.test(form.name.trim())) {
    errs.name = 'Invalid name — must start with a letter or underscore; no spaces. Allowed: A–Z, a–z, 0–9, _, -';
  }
  // ChannelId
  if (!form.channelId.trim()) {
    errs.channelId = 'Channel ID is required.';
  } else {
    const id = Number(form.channelId.trim());
    if (!Number.isInteger(id) || id <= 0) {
      errs.channelId = 'ID must be a positive integer (e.g. 1, 2, 3…).';
    } else {
      const conflict = existingChannels.find(
        ch => Number((ch as any).channelId) === id
      );
      if (conflict) {
        errs.channelId = `ID ${id} is already used by another channel.`;
      }
    }
  }
  // Aliases
  if (form.aliases.trim()) {
    const badAliases = form.aliases.split(',').map(s => s.trim()).filter(a => a && !NAME_RE.test(a));
    if (badAliases.length > 0) {
      errs.aliases = `Invalid alias(es): ${badAliases.join(', ')} — same naming rules as channel name.`;
    }
  }
  return errs;
}

export default function LogicalPanel() {
  const { state, dispatch, send, notify } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: '', channelId: '', loggingName: '', tracerName: '', aliases: '',
    subclass: LOGICAL_SUBCLASS_OPTIONS[0].value,
    extras: initExtras(LOGICAL_SUBCLASS_OPTIONS[0].value),
  });

  function pushDraft(nextForm: typeof form) {
    if (!nextForm.name.trim()) {
      dispatch({ type: 'SET_DRAFT_LOGICAL', draft: null });
      return;
    }
    const opt = LOGICAL_SUBCLASS_OPTIONS.find(o => o.value === nextForm.subclass)!;
    dispatch({
      type: 'SET_DRAFT_LOGICAL',
      draft: {
        id: '__draft__',
        name: nextForm.name.trim(),
        channelId: nextForm.channelId ? Number(nextForm.channelId) : undefined,
        loggingName: nextForm.loggingName.trim(),
        tracerName: nextForm.tracerName.trim(),
        alias: nextForm.aliases.split(',').map(s => s.trim()).filter(Boolean),
        type: 'LOGICAL',
        category: opt.category,
        subclass: nextForm.subclass,
        ...nextForm.extras,
      },
    });
  }

  function setField(key: string, val: any) {
    setForm(f => {
      const next = { ...f, [key]: val };
      pushDraft(next);
      if (key === 'name' || key === 'channelId' || key === 'aliases') {
        setFieldErrors(validateLogicalForm(
          { name: next.name, channelId: next.channelId, aliases: next.aliases },
          state.logicalChannels,
        ));
      }
      return next;
    });
  }

  function setSubclass(val: string) {
    setForm(f => {
      const next = { ...f, subclass: val, extras: initExtras(val) };
      pushDraft(next);
      return next;
    });
  }

  function setExtra(key: string, val: any) {
    setForm(f => {
      const next = { ...f, extras: { ...f.extras, [key]: val } };
      pushDraft(next);
      return next;
    });
  }

  function handleAdd() {
    if (!form.name.trim()) { notify('error', 'Channel name is required.'); return; }

    // Run full validation before submitting
    const errs = validateLogicalForm(
      { name: form.name, channelId: form.channelId, aliases: form.aliases },
      state.logicalChannels,
    );
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      notify('error', 'Please fix the highlighted errors before adding.');
      return;
    }

    const selectedOpt = LOGICAL_SUBCLASS_OPTIONS.find(o => o.value === form.subclass)!;
    const channel: LogicalChannel = {
      id: `lc_${Date.now()}`,
      name: form.name.trim(),
      channelId: form.channelId ? Number(form.channelId) : undefined,
      loggingName: form.loggingName.trim(),
      tracerName: form.tracerName.trim(),
      alias: form.aliases.split(',').map(s => s.trim()).filter(Boolean),
      type: 'LOGICAL',
      category: selectedOpt.category,
      subclass: form.subclass,
      ...form.extras,
    };
    send('addLogicalChannel', { channel });
    setFieldErrors({});
    setForm({ name: '', channelId: '', loggingName: '', tracerName: '', aliases: '', subclass: LOGICAL_SUBCLASS_OPTIONS[0].value, extras: initExtras(LOGICAL_SUBCLASS_OPTIONS[0].value) });
    setShowForm(false);
  }

  function handleCancelForm() {
    dispatch({ type: 'SET_DRAFT_LOGICAL', draft: null });
    setFieldErrors({});
    setForm({ name: '', channelId: '', loggingName: '', tracerName: '', aliases: '', subclass: LOGICAL_SUBCLASS_OPTIONS[0].value, extras: initExtras(LOGICAL_SUBCLASS_OPTIONS[0].value) });
    setShowForm(false);
  }

  const extraFields = LOGICAL_EXTRA_FIELDS[form.subclass] ?? [];
  const selectedOpt = LOGICAL_SUBCLASS_OPTIONS.find(o => o.value === form.subclass);
  const needsProtocol = form.subclass === 'CANChannel' || form.subclass === 'LINChannel';
  const isBridge = form.subclass === 'BridgeChannel';
  const canSubmit = form.name.trim() !== '' &&
    form.channelId.trim() !== '' &&
    Object.keys(fieldErrors).length === 0 &&
    (!needsProtocol || String(form.extras.protocol ?? '').trim() !== '');

  return (
    <div>
      <SectionHeader
        title="Logical Channels"
        count={state.logicalChannels.length}
        action={
          <button style={T.btnPrimary} onClick={() => showForm ? handleCancelForm() : setShowForm(true)}>
            {showForm ? 'Cancel' : '+ Add Channel'}
          </button>
        }
      />

      {showForm && (
        <AddLogicalChannelForm
          form={form}
          fieldErrors={fieldErrors}
          extraFields={extraFields}
          selectedOpt={selectedOpt}
          isBridge={isBridge}
          canSubmit={canSubmit}
          setField={setField}
          setSubclass={setSubclass}
          setExtra={setExtra}
          handleAdd={handleAdd}
          handleCancelForm={handleCancelForm}
        />
      )}

      <LogicalList logicalChannels={state.logicalChannels} send={send} />
    </div>
  );
}

