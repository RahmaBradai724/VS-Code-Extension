import { useMemo } from 'react';
import { AppState } from '../types';

const NAME_RE = /^[A-Za-z_][A-Za-z0-9_\-]*$/;

export interface ValidationIssues {
  errors: string[];
  warnings: string[];
}

/**
 * Runs fast client-side validation on the current app state and returns
 * a list of errors and warnings to display in the YAML preview panel.
 */
export function useValidationIssues(state: AppState): ValidationIssues {
  return useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!state.currentConfigId) {
      return { errors, warnings };
    }

    const lcs = state.logicalChannels;
    const hws = state.hardwareChannels;
    const maps = state.mappings;

    // ── Logical channel checks ────────────────────────────────────────
    const seenIds = new Map<number, string[]>();
    const seenNames = new Map<string, number>();

    for (const ch of lcs) {
      // Name format
      if (ch.name && !NAME_RE.test(ch.name)) {
        errors.push(`Channel "${ch.name}": invalid name — must start with a letter or underscore, no spaces.`);
      }

      // Duplicate name
      seenNames.set(ch.name, (seenNames.get(ch.name) ?? 0) + 1);

      // ChannelId required + valid
      const rawId = (ch as any).channelId;
      if (rawId === undefined || rawId === null || rawId === '') {
        errors.push(`Channel "${ch.name}": missing Id — every logical channel must have a unique positive integer Id.`);
      } else {
        const id = Number(rawId);
        if (!Number.isInteger(id) || id <= 0) {
          errors.push(`Channel "${ch.name}": Id "${rawId}" is invalid — must be a positive integer.`);
        } else {
          const names = seenIds.get(id) ?? [];
          names.push(ch.name);
          seenIds.set(id, names);
        }
      }

      // Alias format
      for (const alias of ((ch as any).alias ?? [])) {
        if (!NAME_RE.test(alias)) {
          errors.push(`Channel "${ch.name}": alias "${alias}" is invalid — same naming rules as channel name.`);
        }
      }

      // TracerName referenced must exist if framework tracers are configured
      const tracers: any[] = state.frameworkData?.tracers ?? [];
      if (ch.tracerName && tracers.length > 0) {
        const exists = tracers.some((t: any) => t.name === ch.tracerName);
        if (!exists) {
          errors.push(`Channel "${ch.name}": tracer "${ch.tracerName}" is not defined in Framework > Tracers.`);
        }
      }
    }

    // Duplicate name errors
    for (const [name, count] of seenNames) {
      if (count > 1) {
        errors.push(`Duplicate logical channel name "${name}" — names must be unique.`);
      }
    }

    // Duplicate Id errors
    for (const [id, names] of seenIds) {
      if (names.length > 1) {
        errors.push(`Duplicate Id ${id} used by: ${names.join(', ')} — Ids must be unique.`);
      }
    }

    // ── Hardware channel checks ───────────────────────────────────────
    const seenHwNames = new Map<string, number>();
    for (const hw of hws) {
      seenHwNames.set(hw.name, (seenHwNames.get(hw.name) ?? 0) + 1);
    }
    for (const [name, count] of seenHwNames) {
      if (count > 1) {
        errors.push(`Duplicate hardware channel name "${name}" — names must be unique.`);
      }
    }

    // ── Mapping checks ────────────────────────────────────────────────
    const usedLogicalIds = new Set(maps.map(m => m.logicalChannelId));
    const usedHwIds = new Set(maps.map(m => m.hardwareChannelId));

    for (const ch of lcs) {
      if (!usedLogicalIds.has(ch.id)) {
        warnings.push(`Logical channel "${ch.name}" has no mapping.`);
      }
    }
    for (const hw of hws) {
      if (!usedHwIds.has(hw.id)) {
        warnings.push(`Hardware channel "${hw.name}" is not mapped to any logical channel.`);
      }
    }

    return { errors, warnings };
  }, [state.logicalChannels, state.hardwareChannels, state.mappings, state.frameworkData, state.currentConfigId]);
}
