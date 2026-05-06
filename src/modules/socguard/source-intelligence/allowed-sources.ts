import { AllowedSource } from './source-types';

export const ALLOWED_SOURCES: AllowedSource[] = [
  {
    id: 'SRC-OWASP-LLM',
    name: 'OWASP Top 10 for LLM Applications',
    type: 'FRAMEWORK',
    url: 'https://llmtop10.org/',
    licenseNotes: 'Creative Commons Attribution-ShareAlike 4.0',
    trustLevel: 'HIGH',
    allowedUse: ['TAXONOMY_ONLY', 'SANITIZED_EXAMPLES'],
    enabled: true,
    notes: 'Primary industry standard for LLM vulnerability taxonomy.'
  },
  {
    id: 'SRC-MITRE-ATLAS',
    name: 'MITRE ATLAS',
    type: 'FRAMEWORK',
    url: 'https://atlas.mitre.org/',
    licenseNotes: 'MITRE ATLAS Terms of Use',
    trustLevel: 'HIGH',
    allowedUse: ['TAXONOMY_ONLY', 'BENCHMARK_SEED'],
    enabled: true,
    notes: 'Adversarial Threat Landscape for Artificial-Intelligence Systems.'
  },
  {
    id: 'SRC-NVIDIA-GARAK',
    name: 'NVIDIA garak',
    type: 'TOOL',
    url: 'https://github.com/leondz/garak',
    licenseNotes: 'Apache License 2.0',
    trustLevel: 'HIGH',
    allowedUse: ['SANITIZED_EXAMPLES', 'BENCHMARK_SEED'],
    enabled: true,
    notes: 'LLM vulnerability scanner. Use for pattern extraction.'
  },
  {
    id: 'SRC-PROMPTFOO',
    name: 'promptfoo Red Team Docs',
    type: 'TOOL',
    url: 'https://www.promptfoo.dev/docs/red-team/overview',
    licenseNotes: 'MIT License',
    trustLevel: 'HIGH',
    allowedUse: ['TAXONOMY_ONLY', 'SANITIZED_EXAMPLES'],
    enabled: true,
    notes: 'Valuable documentation on adversarial prompt categories.'
  },
  {
    id: 'SRC-INTERNAL-MISSED',
    name: 'Internal Missed Cases',
    type: 'INTERNAL_NOTE',
    licenseNotes: 'Proprietary Research',
    trustLevel: 'HIGH',
    allowedUse: ['TAXONOMY_ONLY', 'SANITIZED_EXAMPLES', 'BENCHMARK_SEED'],
    enabled: true,
    notes: 'Internally identified gaps in V1 detection.'
  },
  {
    id: 'SRC-MANUAL-ANALYST',
    name: 'Manual Analyst Notes',
    type: 'MANUAL',
    licenseNotes: 'Research Contribution',
    trustLevel: 'HIGH',
    allowedUse: ['TAXONOMY_ONLY', 'SANITIZED_EXAMPLES', 'BENCHMARK_SEED'],
    enabled: true,
    notes: 'Human-curated insights from security research.'
  }
];
