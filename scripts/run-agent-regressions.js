const { guardAgentResponse } = require('../out/ai/RoutedMtfAgent.js');

function docResult(title, content) {
  return {
    chunk: {
      chunk_id: title,
      section: 'Test',
      subsection: 'Regression',
      title,
      content,
      summary: content,
      importance: 'high',
      keywords: [],
      source_url: '',
      relatedIds: [],
      embedding: [],
    },
    score: 1,
    vectorScore: 1,
    keywordScore: 1,
    fromGraph: false,
  };
}

const baseWorkspace = {
  activeYamlText: [
    'Channels:',
    '  can:',
    '    Id: 1',
    'Mappings:',
    '  CM:',
    '    Devices:',
    '      1:',
    '        Id: 64',
    '        Type: CAN_Combo',
    '        Buses:',
    '          can:',
    '            HWChannel: 600',
  ].join('\n'),
  activeYamlTopLevelKeys: ['Channels', 'Mappings'],
  activeYamlNestedKeys: ['Id', 'Type', 'Devices', 'Buses', 'HWChannel'],
  activeYamlDiagnostics: [],
  validationDiagnostics: [],
};

const cases = [
  {
    id: 'blocks-unsupported-parse-claim',
    input: {
      answer: 'Diagnosis:\nThe YAML parse error occurs at line 185, column 2.\n\nRecommended YAML:\n```yaml\nChannels:\n  can:\n    Id: 1\n```',
      intent: 'error_analysis',
      question: 'this is the yaml file',
      workspace: baseWorkspace,
      questionYaml: { topLevelKeys: [], nestedKeys: [] },
      docResults: [],
      exactFieldNames: [],
      sources: [],
    },
    mustContain: ["I can't verify a safe YAML patch", 'Blocked an unsupported YAML parse-error claim'],
  },
  {
    id: 'blocks-numeric-hwchannel-rewrite',
    input: {
      answer: 'Diagnosis:\nThe issue is in HWChannel.\n\nRecommended YAML:\n```yaml\nMappings:\n  CM:\n    Devices:\n      1:\n        Buses:\n          can:\n            HWChannel: can\n```',
      intent: 'error_analysis',
      question: 'what about my current yaml file?',
      workspace: baseWorkspace,
      questionYaml: { topLevelKeys: [], nestedKeys: [] },
      docResults: [docResult('CM Mapping', 'HWChannel(mandatory): Specifies the channel ID defined in the CM web interface.')],
      exactFieldNames: ['HWChannel'],
      sources: [],
    },
    mustContain: ["I can't verify a safe YAML patch", 'Blocked a rewrite that changed a numeric HWChannel identifier into a name'],
  },
  {
    id: 'blocks-unsupported-cm-expansion-without-docs',
    input: {
      answer: 'CM stands for Capture Module.',
      intent: 'support',
      question: 'what is cm?',
      workspace: undefined,
      questionYaml: { topLevelKeys: [], nestedKeys: [] },
      docResults: [],
      exactFieldNames: ['CM'],
      sources: [],
    },
    mustContain: ["I cannot verify a concrete YAML error", 'Blocked an acronym expansion'],
  },
  {
    id: 'allows-cm-expansion-when-documented',
    input: {
      answer: 'CM stands for Capture Module.',
      intent: 'support',
      question: 'what is cm?',
      workspace: undefined,
      questionYaml: { topLevelKeys: [], nestedKeys: [] },
      docResults: [docResult('Capture Module', 'One example of the devices that can be mapped to logical channels is the Capture Module.')],
      exactFieldNames: ['CM'],
      sources: [],
    },
    mustContain: ['CM stands for Capture Module.'],
  },
];

let failures = 0;
for (const testCase of cases) {
  const result = guardAgentResponse(testCase.input);
  for (const expected of testCase.mustContain) {
    if (!result.answer.includes(expected) && !result.meta.notes.some(note => note.includes(expected))) {
      failures += 1;
      console.error(`[FAIL] ${testCase.id} missing expected text: ${expected}`);
      console.error(result.answer);
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} regression assertion(s) failed.`);
  process.exit(1);
}

console.log('Agent regression checks passed.');