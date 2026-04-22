import React from 'react';
import { useApp } from '../hooks/useApp';
import { T } from '../components/shared';
import { ActionsCard } from './generate/ActionsCard';
import { AIResultCard } from './generate/AIResultCard';
import { YamlPreview } from './generate/YamlPreview';

export default function GeneratePanel() {
  const { state, send } = useApp();
  const { generating, aiValidating, yamlContent, aiResult, frameworkData } = state;

  return (
    <div>
      <h2 style={T.pageTitle}>Generate & Validate</h2>

      <ActionsCard generating={generating} aiValidating={aiValidating} yamlContent={yamlContent} frameworkData={frameworkData} send={send} />

      {aiResult && <AIResultCard aiResult={aiResult} />}

      {yamlContent && <YamlPreview yamlContent={yamlContent} />}
    </div>
  );
}
