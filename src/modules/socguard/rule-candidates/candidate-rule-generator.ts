import { DetectionCategory, DetectionSeverity } from '../types';
import { CandidateRule } from './candidate-rule-types';
import { ThreatIntelRecord } from '../threat-intel';

/**
 * Escapes special characters for use in a regular expression.
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Assigns severity based on the attack category.
 */
function getSeverityForCategory(category: DetectionCategory): DetectionSeverity {
  switch (category) {
    case 'DATA_EXFILTRATION':
    case 'TOOL_ABUSE':
    case 'PROMPT_LEAK_ATTEMPT':
      return 'HIGH';
    case 'PROMPT_INJECTION':
    case 'INSTRUCTION_OVERRIDE':
      return 'HIGH'; // User suggested MEDIUM/HIGH
    case 'FORMAT_CONTROL':
    case 'OBFUSCATION':
    case 'SUSPICIOUS_ENCODING':
      return 'MEDIUM';
    default:
      return 'LOW';
  }
}

/**
 * Identifies potential false positive risks based on the category.
 */
function getFalsePositiveRisks(category: DetectionCategory): string[] {
  switch (category) {
    case 'PROMPT_INJECTION':
      return ['Technical documentation about LLM security', 'Security research logs'];
    case 'DATA_EXFILTRATION':
    case 'TOOL_ABUSE':
      return ['Legitimate external URL sharing', 'API documentation', 'Webhooks configuration'];
    case 'PROMPT_LEAK_ATTEMPT':
      return ['Developer instructions examples', 'Debugging logs'];
    case 'SUSPICIOUS_ENCODING':
    case 'OBFUSCATION':
      return ['JWT tokens', 'Base64 images', 'Encrypted session IDs'];
    default:
      return ['General benign usage'];
  }
}

/**
 * Proposes new detection rules based on verified Threat Intel records.
 */
export function generateCandidateRulesFromThreatIntel(record: ThreatIntelRecord): CandidateRule[] {
  const candidates: CandidateRule[] = [];

  record.examplePhrases.forEach((phrase, index) => {
    const category = record.attackCategories[0] || 'BENIGN';
    const escaped = escapeRegExp(phrase);
    
    // Suggest a conservative case-insensitive regex
    const suggestedPattern = `/${escaped}/gi`;
    
    const id = `CAND-${record.id.substring(3)}-${index + 1}`;
    const proposedRuleId = `RULE-PROP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    candidates.push({
      id,
      proposedRuleId,
      category,
      severity: getSeverityForCategory(category),
      confidence: 0.7, // Candidates start with lower confidence until verified
      patternSource: phrase,
      suggestedPattern,
      exampleMatches: [phrase],
      falsePositiveRisks: getFalsePositiveRisks(category),
      sourceThreatIntelId: record.id,
      status: 'NEEDS_REVIEW',
      rationale: `Derived from Threat Intel: ${record.title} (${record.sourceName})`,
      createdAt: new Date().toISOString()
    });
  });

  return candidates;
}
