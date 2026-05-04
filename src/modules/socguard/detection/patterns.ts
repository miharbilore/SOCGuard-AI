import { DetectionCategory, DetectionSeverity } from '../types';

export interface DetectionRule {
  id: string;
  pattern: RegExp;
  category: DetectionCategory;
  severity: DetectionSeverity;
  reason: string;
  confidence: number;
  falsePositiveNotes?: string;
}

export const DETERMINISTIC_RULES: DetectionRule[] = [
  // --- INSTRUCTION OVERRIDE & PROMPT INJECTION ---
  {
    id: 'RULE-001',
    pattern: /ignore (?:any |all |the )?previous instructions/gi,
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
    id: 'RULE-TR-001',
    pattern: /önceki (?:talimatlar[ıi]|komutlar[ıi])(?:n[ıi])? yok say/gi,
    category: 'PROMPT_INJECTION',
    severity: 'HIGH',
    reason: 'Instruction override attempt (Turkish).',
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
    id: 'RULE-TR-003',
    pattern: /bu (?:alarm[ıi]|uyar[ıi]y[ıi]) güvenli (?:olarak )?işaretle/gi,
    category: 'INSTRUCTION_OVERRIDE',
    severity: 'MEDIUM',
    reason: 'Attempt to manipulate detection output (Turkish).',
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
    id: 'RULE-TR-004',
    pattern: /eskale etme/gi,
    category: 'INSTRUCTION_OVERRIDE',
    severity: 'MEDIUM',
    reason: 'Suppression of incident reporting (Turkish).',
    confidence: 0.85
  },

  // --- PROMPT LEAK ATTEMPT ---
  {
    id: 'RULE-LEAK-001',
    pattern: /reveal (?:the |your |full |system )?prompt/gi,
    category: 'PROMPT_LEAK_ATTEMPT',
    severity: 'HIGH',
    reason: 'Attempt to extract the system prompt/instructions.',
    confidence: 0.9
  },
  {
    id: 'RULE-LEAK-002',
    pattern: /print (?:the |all |hidden )?instructions/gi,
    category: 'PROMPT_LEAK_ATTEMPT',
    severity: 'HIGH',
    reason: 'Attempt to print internal instructions.',
    confidence: 0.9
  },
  {
    id: 'RULE-LEAK-003',
    pattern: /show developer message/gi,
    category: 'PROMPT_LEAK_ATTEMPT',
    severity: 'MEDIUM',
    reason: 'Attempt to access developer-level metadata/instructions.',
    confidence: 0.8
  },
  {
    id: 'RULE-LEAK-TR-001',
    pattern: /sistem (?:komutunu|talimat[ıi]n[ıi]) göster/gi,
    category: 'PROMPT_LEAK_ATTEMPT',
    severity: 'HIGH',
    reason: 'Attempt to extract system prompt (Turkish).',
    confidence: 0.9
  },

  // --- TOOL & FUNCTION ABUSE ---
  {
    id: 'RULE-TOOL-001',
    pattern: /call (?:the )?tool/gi,
    category: 'TOOL_ABUSE',
    severity: 'MEDIUM',
    reason: 'Potential unauthorized tool execution request.',
    confidence: 0.7,
    falsePositiveNotes: 'May occur in documentation or technical discussions.'
  },
  {
    id: 'RULE-TOOL-002',
    pattern: /execute (?:the |this )?function/gi,
    category: 'TOOL_ABUSE',
    severity: 'MEDIUM',
    reason: 'Potential unauthorized function execution request.',
    confidence: 0.7
  },
  {
    id: 'RULE-TOOL-003',
    pattern: /send (?:the )?(?:output|report|data) to (?:https?:\/\/)?[\w.-]+\.[a-z]{2,}/gi,
    category: 'TOOL_ABUSE',
    severity: 'CRITICAL',
    reason: 'Unauthorized data exfiltration to external URL.',
    confidence: 0.9
  },

  // --- FORMAT CONTROL ---
  {
    id: 'RULE-FMT-001',
    pattern: /respond only with/gi,
    category: 'FORMAT_CONTROL',
    severity: 'LOW',
    reason: 'Strict format enforcement attempt, often used to hide injection.',
    confidence: 0.6
  },
  {
    id: 'RULE-FMT-002',
    pattern: /output JSON only/gi,
    category: 'FORMAT_CONTROL',
    severity: 'LOW',
    reason: 'Request for pure JSON output to bypass standard text filters.',
    confidence: 0.6
  },
  {
    id: 'RULE-FMT-003',
    pattern: /ignore all text (?:above|below)/gi,
    category: 'FORMAT_CONTROL',
    severity: 'HIGH',
    reason: 'Attempt to isolate the injection from surrounding context.',
    confidence: 0.9
  },

  // --- JAILBREAK & ROLE CONFUSION ---
  {
    id: 'RULE-JB-001',
    pattern: /act as (?:a |an |the )?(?:hacker|linux terminal|unfiltered|jailbroken)/gi,
    category: 'ROLE_CONFUSION',
    severity: 'HIGH',
    reason: 'Dangerous persona adoption or role manipulation.',
    confidence: 0.85
  },
  {
    id: 'RULE-JB-002',
    pattern: /developer mode (?:v\d+|enabled|on|active)/gi,
    category: 'INSTRUCTION_OVERRIDE',
    severity: 'HIGH',
    reason: 'Attempt to access restricted operational mode (e.g., GPT Developer Mode).',
    confidence: 0.9
  },
  {
    id: 'RULE-JB-003',
    pattern: /DAN (?:mode|style|instructions)/gi,
    category: 'PROMPT_INJECTION',
    severity: 'CRITICAL',
    reason: 'Known jailbreak phrasing (DAN - Do Anything Now).',
    confidence: 0.95
  },
  {
    id: 'RULE-010',
    pattern: /\[(?:SYSTEM|ADMIN|INTERNAL|NOTICE)\]:/gi,
    category: 'ROLE_CONFUSION',
    severity: 'MEDIUM',
    reason: 'Attempt to spoof internal system messages.',
    confidence: 0.7
  },

  // --- OBFUSCATION & ENCODING ---
  {
    id: 'RULE-ENC-001',
    pattern: /[A-Za-z0-9+/]{60,}/g, // Increased threshold for base64/hashes
    category: 'SUSPICIOUS_ENCODING',
    severity: 'LOW',
    reason: 'Very large unspaced string, potential encoded payload.',
    confidence: 0.5,
    falsePositiveNotes: 'Normal JWTs or session tokens may trigger this.'
  }
];
