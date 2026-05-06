import { DetectionCategory, DetectionSeverity as Severity } from '../../types';
import { AdversarialAttackType, JudgeRecommendationType as JudgeRecommendation, LanguageCode } from '../../adversarial-lab/adversarial-types';

export function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isStringArray(value: unknown, minLength = 1): boolean {
  return Array.isArray(value) && value.length >= minLength && value.every(isNonEmptyString);
}

export function isNumberInRange(value: unknown, min: number, max: number): boolean {
  return typeof value === 'number' && value >= min && value <= max;
}

export function isValidDetectionCategory(value: unknown): value is DetectionCategory {
  const categories: DetectionCategory[] = [
    'PROMPT_INJECTION', 'INSTRUCTION_OVERRIDE', 'DATA_EXFILTRATION',
    'ROLE_CONFUSION', 'SUSPICIOUS_ENCODING', 'PROMPT_LEAK_ATTEMPT',
    'TOOL_ABUSE', 'FORMAT_CONTROL', 'OBFUSCATION', 'BENIGN'
  ];
  return categories.includes(value as DetectionCategory);
}

export function isValidAdversarialAttackType(value: unknown): value is AdversarialAttackType {
  const types: AdversarialAttackType[] = [
    'DIRECT_INSTRUCTION_OVERRIDE', 'JAILBREAK_ROLEPLAY', 'FRAGMENTED_PAYLOAD',
    'PREFIX_INJECTION', 'FEW_SHOT_MISLEADING', 'TRANSLATION_BYPASS',
    'INDIRECT_RAG_INJECTION', 'CONTEXT_OVERFLOW_ATTACK', 'SYNTAX_ESCAPE'
  ];
  return types.includes(value as AdversarialAttackType);
}

export function isValidSeverity(value: unknown): value is Severity {
  const severities: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  return severities.includes(value as Severity);
}

export function isValidJudgeRecommendation(value: unknown): value is JudgeRecommendation {
  const recommendations: JudgeRecommendation[] = [
    'RECOMMEND_APPROVE_FOR_REVIEW', 'RECOMMEND_REVISE', 'RECOMMEND_REJECT'
  ];
  return recommendations.includes(value as JudgeRecommendation);
}
 
export function isValidLanguageCode(value: unknown): value is LanguageCode {
  const codes: LanguageCode[] = ['tr', 'en', 'ar', 'de', 'fr', 'pl', 'mixed', 'unknown'];
  return codes.includes(value as LanguageCode);
}

export function validateRedTeamOutput(data: unknown): boolean {
  if (!data || typeof data !== 'object' || !Array.isArray((data as Record<string, unknown>).candidates) || (data as Record<string, unknown[]>).candidates.length === 0) return false;
  return (data as Record<string, unknown[]>).candidates.every((c: unknown) => {
    if (!c || typeof c !== 'object') return false;
    const candidate = c as Record<string, unknown>;
    return isValidAdversarialAttackType(candidate.attackType) &&
    isNonEmptyString(candidate.sanitizedPrompt) &&
    isNonEmptyString(candidate.targetWeakness) &&
    isValidDetectionCategory(candidate.expectedDetectionCategory) &&
    ['EASY', 'MEDIUM', 'HARD'].includes(candidate.difficulty as string) &&
    (!candidate.language || isValidLanguageCode(candidate.language));
  });
}

export function validateBlueTeamOutput(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return isValidDetectionCategory(d.proposedCategory) &&
    isNonEmptyString(d.proposedRulePattern) &&
    isValidSeverity(d.severity) &&
    isNumberInRange(d.confidence, 0, 1) &&
    isStringArray(d.falsePositiveRisks) &&
    isStringArray(d.hardNegativeSuggestions) &&
    isNonEmptyString(d.rationale);
}

export function validateJudgeOutput(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return isValidJudgeRecommendation(d.recommendation) &&
    isNumberInRange(d.realismScore, 0, 100) &&
    isNumberInRange(d.coverageScore, 0, 100) &&
    isNumberInRange(d.falsePositiveRiskScore, 0, 100) &&
    isNumberInRange(d.safetyScore, 0, 100) &&
    isStringArray(d.reasons) &&
    isStringArray(d.limitations);
}

export function validateCuratorOutput(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return isValidAdversarialAttackType(d.attackType) &&
    isNonEmptyString(d.sanitizedLog) &&
    isValidDetectionCategory(d.proposedCategory) &&
    isNonEmptyString(d.suggestedPattern) &&
    isValidSeverity(d.severity) &&
    isNumberInRange(d.confidence, 0, 1) &&
    isStringArray(d.falsePositiveRisks);
}

export function safeParseLLMJSON(content: string): unknown | null {
  try {
    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[SCHEMA] Failed to parse LLM JSON:', e);
    return null;
  }
}
