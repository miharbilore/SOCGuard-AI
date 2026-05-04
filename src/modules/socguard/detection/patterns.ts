import { DetectionCategory, DetectionSeverity } from '../types';

export interface DetectionRule {
  id: string;
  pattern: RegExp;
  category: DetectionCategory;
  severity: DetectionSeverity;
  reason: string;
  confidence: number;
}

export const DETERMINISTIC_RULES: DetectionRule[] = [
  {
    id: 'RULE-001',
    pattern: /ignore (?:any |all )?previous instructions/gi,
    category: 'PROMPT_INJECTION',
    severity: 'HIGH',
    reason: 'Classic instruction override attempt detected.',
    confidence: 0.95
  },
  {
    id: 'RULE-002',
    pattern: /disregard (?:the )?system instructions/gi,
    category: 'PROMPT_INJECTION',
    severity: 'HIGH',
    reason: 'System-level instruction manipulation attempt.',
    confidence: 0.95
  },
  {
    id: 'RULE-003',
    pattern: /mark (?:this |the )?alert as safe/gi,
    category: 'INSTRUCTION_OVERRIDE',
    severity: 'MEDIUM',
    reason: 'Attempt to manipulate detection output/status.',
    confidence: 0.85
  },
  {
    id: 'RULE-004',
    pattern: /do not escalate/gi,
    category: 'INSTRUCTION_OVERRIDE',
    severity: 'MEDIUM',
    reason: 'Direct instruction to suppress incident reporting.',
    confidence: 0.8
  },
  {
    id: 'RULE-005',
    pattern: /reveal (?:the |all )?secrets/gi,
    category: 'DATA_EXFILTRATION',
    severity: 'CRITICAL',
    reason: 'Explicit request for sensitive information disclosure.',
    confidence: 0.9
  },
  {
    id: 'RULE-006',
    pattern: /send (?:the |a )?report to (?:an )?external url/gi,
    category: 'DATA_EXFILTRATION',
    severity: 'CRITICAL',
    reason: 'External data exfiltration request detected.',
    confidence: 0.9
  },
  {
    id: 'RULE-007',
    pattern: /you are now/gi,
    category: 'ROLE_CONFUSION',
    severity: 'MEDIUM',
    reason: 'Persona adoption or role manipulation attempt.',
    confidence: 0.75
  },
  {
    id: 'RULE-008',
    pattern: /developer mode/gi,
    category: 'INSTRUCTION_OVERRIDE',
    severity: 'HIGH',
    reason: 'Attempt to access restricted operational mode.',
    confidence: 0.8
  },
  {
    id: 'RULE-009',
    pattern: /[A-Za-z0-9+/]{40,}/g, // Long alphanumeric strings without spaces
    category: 'SUSPICIOUS_ENCODING',
    severity: 'LOW',
    reason: 'Large unspaced string detected, possible base64 or encoded payload.',
    confidence: 0.5
  },
  {
    id: 'RULE-010',
    pattern: /\[(?:SYSTEM|ADMIN|INTERNAL|NOTICE)\]:/gi,
    category: 'ROLE_CONFUSION',
    severity: 'MEDIUM',
    reason: 'Attempt to spoof internal system messages.',
    confidence: 0.7
  }
];
