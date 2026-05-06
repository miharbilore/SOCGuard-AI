import { 
  RedTeamCandidate, 
  AdversarialAttackType, 
  DifficultyLevel, 
  SafetyStatus,
  LanguageCode 
} from './adversarial-types';
import { deterministicHash } from '../utils/crypto';

export const SAFETY_PLACEHOLDERS = {
  HARMFUL_REQUEST: '[REDACTED_HARMFUL_REQUEST]',
  SECRET: '[REDACTED_SECRET]',
  EXFIL_TARGET: '[REDACTED_EXFIL_TARGET]',
  MALWARE_ACTION: '[REDACTED_MALWARE_ACTION]',
  CREDENTIAL: '[REDACTED_CREDENTIAL]',
  EXPLOIT_DETAIL: '[REDACTED_EXPLOIT_DETAIL]'
};

export interface SanitizedPromptResult {
  originalLength: number;
  sanitizedPrompt: string;
  redactedTerms: string[];
  safetyStatus: SafetyStatus;
  reasons: string[];
}

/**
 * Deterministic sanitizer that replaces operational harmful content with safe placeholders.
 */
export function sanitizeAdversarialPrompt(raw: string): SanitizedPromptResult {
  let sanitized = raw;
  const redactedTerms: string[] = [];
  const reasons: string[] = [];
  let status: SafetyStatus = 'SANITIZED';

  // 1. Credentials and Secrets
  const secretPatterns = [
    { regex: /password\s*[:=]\s*[^\s,;]{4,}/gi, label: 'CREDENTIAL' },
    { regex: /api[_-]key\s*[:=]\s*[^\s,;]{8,}/gi, label: 'SECRET' },
    { regex: /token\s*[:=]\s*[^\s,;]{8,}/gi, label: 'SECRET' },
    { regex: /secret\s*[:=]\s*[^\s,;]{4,}/gi, label: 'SECRET' }
  ];

  secretPatterns.forEach(({ regex, label }) => {
    if (regex.test(sanitized)) {
      sanitized = sanitized.replace(regex, `${label.toLowerCase()}: ${SAFETY_PLACEHOLDERS[label as keyof typeof SAFETY_PLACEHOLDERS]}`);
      if (!redactedTerms.includes(label)) redactedTerms.push(label);
    }
  });

  // 2. Exfiltration Targets (Suspicious URLs and Emails)
  const exfilPatterns = [
    { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, label: 'EXFIL_TARGET' },
    { regex: /https?:\/\/(?!google\.com|openai\.com|github\.com)[a-zA-Z0-9./?=&_-]+/gi, label: 'EXFIL_TARGET' }
  ];

  exfilPatterns.forEach(({ regex, label }) => {
    if (regex.test(sanitized)) {
      sanitized = sanitized.replace(regex, SAFETY_PLACEHOLDERS[label as keyof typeof SAFETY_PLACEHOLDERS]);
      if (!redactedTerms.includes(label)) redactedTerms.push(label);
    }
  });

  // 3. Operational Harmful Instructions (Heuristic-based)
  const harmfulActionPatterns = [
    { regex: /(delete|rm|format|erase)\s+(all files|system|root|database|disk)/gi, label: 'MALWARE_ACTION' },
    { regex: /(install|download|execute|run)\s+(malware|backdoor|spyware|trojan|ransomware|virus|rootkit)/gi, label: 'MALWARE_ACTION' },
    { regex: /(phishing|social engineering|spoof|scam)\s+(template|email|page)/gi, label: 'HARMFUL_REQUEST' },
    { regex: /(exploit|vulnerability|payload|cve-[0-9]{4}-[0-9]{4,})\s+(for|against|target)/gi, label: 'EXPLOIT_DETAIL' },
    { regex: /(how to build|make|create|construct)\s+(bomb|weapon|explosive|biological agent)/gi, label: 'HARMFUL_REQUEST' }
  ];

  harmfulActionPatterns.forEach(({ regex, label }) => {
    if (regex.test(sanitized)) {
      sanitized = sanitized.replace(regex, (match) => {
        reasons.push(`Detected operational harmful pattern: ${match}`);
        return SAFETY_PLACEHOLDERS[label as keyof typeof SAFETY_PLACEHOLDERS];
      });
      if (!redactedTerms.includes(label)) redactedTerms.push(label);
    }
  });

  // 4. Global Validation
  if (reasons.length > 3 || sanitized.length < 10) {
    status = 'REJECTED';
    reasons.push('Prompt contains excessive operational harmful content or is too short after sanitization.');
  } else if (redactedTerms.length > 0) {
    status = 'SANITIZED';
  }

  return {
    originalLength: raw.length,
    sanitizedPrompt: sanitized,
    redactedTerms,
    safetyStatus: status,
    reasons
  };
}

import { DetectionCategory } from '../types';

interface CreateCandidateInput {
  sourceId: string;
  attackType: AdversarialAttackType;
  rawPrompt: string;
  targetWeakness: string;
  expectedDetectionCategory: DetectionCategory;
  difficulty: DifficultyLevel;
  language?: LanguageCode;
}

/**
 * Creates a RedTeamCandidate while ensuring NO raw harmful prompt is stored.
 */
export function createSafeRedTeamCandidate(input: CreateCandidateInput): RedTeamCandidate {
  const { sourceId, attackType, rawPrompt, targetWeakness, expectedDetectionCategory, difficulty, language } = input;
  
  const safetyResult = sanitizeAdversarialPrompt(rawPrompt);
  
  const idHash = deterministicHash(`${sourceId}:${safetyResult.sanitizedPrompt}:${attackType}`);
  const id = `RTC-${idHash.toUpperCase().substring(0, 8)}`;

  return {
    id,
    sourceId,
    attackType,
    sanitizedPrompt: safetyResult.sanitizedPrompt,
    redactedTerms: safetyResult.redactedTerms,
    targetWeakness,
    expectedDetectionCategory,
    difficulty,
    language,
    safetyStatus: safetyResult.safetyStatus,
    createdAt: new Date().toISOString()
  };
}
/**
 * Re-validates a RedTeamCandidate to ensure NO raw harmful prompt escaped.
 * Useful for auditing untrusted agent outputs.
 */
export function sanitizeRedTeamCandidate(candidate: RedTeamCandidate): RedTeamCandidate {
  const result = sanitizeAdversarialPrompt(candidate.sanitizedPrompt);
  return {
    ...candidate,
    sanitizedPrompt: result.sanitizedPrompt,
    redactedTerms: Array.from(new Set([...candidate.redactedTerms, ...result.redactedTerms])),
    safetyStatus: result.safetyStatus === 'REJECTED' ? 'REJECTED' : candidate.safetyStatus
  };
}
