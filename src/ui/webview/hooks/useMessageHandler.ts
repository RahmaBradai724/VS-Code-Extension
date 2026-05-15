import { useEffect } from 'react';
import { AppContextValue } from './useApp';

export function useMessageHandler({ dispatch, notify, send }: AppContextValue) {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      switch (msg.command) {

        // ── Auth ──────────────────────────────────────────────────────
        case 'authSuccess':
          dispatch({ type: 'AUTH_SUCCESS', token: msg.token, user: msg.user });
          send('getConfigurations');
          break;

        case 'authRequired':
          dispatch({ type: 'AUTH_LOGOUT' });
          break;

        case 'authError':
          dispatch({ type: 'AUTH_ERROR', error: msg.message });
          break;

        // ── Configurations ────────────────────────────────────────────
        case 'configurationsLoaded':
          dispatch({ type: 'SET_CONFIGS', configs: msg.data || [] });
          break;

        case 'configurationCreated':
          dispatch({ type: 'CONFIG_CREATED', config: msg.data });
          notify('success', 'Configuration created!');
          break;

        case 'configurationDeleted':
          dispatch({ type: 'CONFIG_DELETED', configId: msg.configId });
          break;

        case 'configurationLoaded':
          if (msg.data) {
            dispatch({ type: 'CONFIG_LOADED', data: msg.data });
            notify('success', `"${msg.data.name}" loaded.`);
          }
          break;

        // ── Channel / Mapping ─────────────────────────────────────────
        case 'success':
          if (msg.action === 'addLogicalChannel') {
            dispatch({ type: 'LOGICAL_ADDED', channel: msg.data });
            notify('success', 'Logical channel added.');
          } else if (msg.action === 'deleteLogicalChannel') {
            dispatch({ type: 'LOGICAL_DELETED', id: msg.id });
          } else if (msg.action === 'addHardwareChannel') {
            dispatch({ type: 'HARDWARE_ADDED', channel: msg.data });
            notify('success', 'Hardware channel added.');
          } else if (msg.action === 'deleteHardwareChannel') {
            dispatch({ type: 'HARDWARE_DELETED', id: msg.id });
          } else if (msg.action === 'addMapping') {
            dispatch({ type: 'MAPPING_ADDED', mapping: msg.data });
            notify('success', 'Mapping created.');
          } else if (msg.action === 'removeMapping') {
            dispatch({ type: 'MAPPING_DELETED', id: msg.id });
          }
          break;

        case 'error':
          notify('error', msg.message);
          dispatch({ type: 'SET_GENERATING', generating: false });
          dispatch({ type: 'SET_AI_VALIDATING', validating: false });
          break;

        case 'configGenerated':
          dispatch({ type: 'SET_YAML', yaml: msg.yaml });
          notify('success', 'config.yaml generated!');
          dispatch({ type: 'SET_PAGE', page: 'generate' });
          break;

        case 'aiValidationResult':
          dispatch({ type: 'SET_AI_RESULT', result: msg.data });
          break;

        case 'importedConfig': {
          const v = msg.validation;
          dispatch({ type: 'SET_AI_RESULT', result: v });
          dispatch({ type: 'SET_PAGE', page: 'generate' });
          if (v.isValid) {
            notify('success', `"${msg.fileName}" is valid — no errors found.`);
          } else {
            notify('error', `"${msg.fileName}" has ${v.errors.length} error(s).`);
          }
          break;
        }

        case 'yamlApplied':
          dispatch({ type: 'CONFIG_LOADED', data: msg.data });
          notify('success', 'YAML changes applied.');
          window.dispatchEvent(new Event('ccm-yaml-apply-done'));
          break;

        case 'yamlApplyError':
          notify('error', `YAML error: ${msg.message}`);
          window.dispatchEvent(new Event('ccm-yaml-apply-error'));
          break;

        // ── MTF Agent ─────────────────────────────────────────────────────
        case 'agentOllamaStatus':
          // Handled directly in AgentPanel via a separate send; dispatch to keep state consistent
          if (!msg.available) {
            dispatch({ type: 'AGENT_ERROR', error: 'Ollama is not running. Start Ollama and try again.' });
          }
          break;

        case 'agentChunk':
          dispatch({ type: 'AGENT_CHUNK', token: msg.token ?? '' });
          break;

        case 'agentDone':
          dispatch({ type: 'AGENT_DONE', sources: msg.sources ?? [], meta: msg.meta ?? undefined });
          break;

        case 'agentError':
          dispatch({ type: 'AGENT_ERROR', error: msg.message ?? 'Unknown agent error' });
          break;

        // ── Hardware discovery ─────────────────────────────────────────────
        case 'hardwareDiscoveryResult':
          dispatch({ type: 'HARDWARE_DISCOVERY_RESULT', data: msg.data });
          if (msg.error) {
            notify('warning', `Hardware discovery: ${msg.error}`);
          }
          break;
      }
    };

    window.addEventListener('message', handler);
    // Check auth on mount — the extension will reply with authSuccess or authRequired
    send('checkAuth');
    // Safety net: if the extension never replies within 5s, stop the spinner
    const timeout = setTimeout(() => {
      dispatch({ type: 'AUTH_LOADING', loading: false });
    }, 5000);
    return () => { window.removeEventListener('message', handler); clearTimeout(timeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
