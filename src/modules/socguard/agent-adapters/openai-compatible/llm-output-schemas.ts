/**
 * Lightweight JSON schema validation for LLM outputs.
 */

export function validateRedTeamOutput(data: any): boolean {
  if (!data || !Array.isArray(data.candidates)) return false;
  return data.candidates.every((c: any) => 
    typeof c.attackType === 'string' &&
    typeof c.sanitizedPrompt === 'string' &&
    typeof c.targetWeakness === 'string' &&
    typeof c.expectedDetectionCategory === 'string' &&
    ['EASY', 'MEDIUM', 'HARD', 'EXPERT'].includes(c.difficulty)
  );
}

export function validateBlueTeamOutput(data: any): boolean {
  return data &&
    typeof data.proposedCategory === 'string' &&
    typeof data.proposedRulePattern === 'string' &&
    ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.severity) &&
    typeof data.confidence === 'number' &&
    Array.isArray(data.falsePositiveRisks) &&
    Array.isArray(data.hardNegativeSuggestions) &&
    typeof data.rationale === 'string';
}

export function validateJudgeOutput(data: any): boolean {
  return data &&
    ['APPROVE', 'REJECT', 'NEEDS_REVISION'].includes(data.recommendation) &&
    typeof data.realismScore === 'number' &&
    typeof data.coverageScore === 'number' &&
    typeof data.falsePositiveRiskScore === 'number' &&
    typeof data.safetyScore === 'number' &&
    Array.isArray(data.reasons);
}

export function validateCuratorOutput(data: any): boolean {
  return data &&
    typeof data.attackType === 'string' &&
    typeof data.sanitizedLog === 'string' &&
    typeof data.proposedCategory === 'string' &&
    typeof data.suggestedPattern === 'string' &&
    ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.severity) &&
    typeof data.confidence === 'number' &&
    Array.isArray(data.falsePositiveRisks);
}

export function safeParseLLMJSON(content: string): any | null {
  try {
    // LLMs sometimes wrap JSON in markdown blocks
    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[SCHEMA] Failed to parse LLM JSON:', e);
    return null;
  }
}
