import { RulePack, RulePackRule } from './rule-pack-types';
import { RuleReviewItem } from '../review-queue';
import { DetectionCategory, DetectionSeverity } from '../types';

export interface BuildInput {
  baseRulePack: RulePack;
  approvedReviewItems: RuleReviewItem[];
  newVersion: string;
  changelog: string;
}

/**
 * Builds a new versioned Rule Pack (in DRAFT status) by incorporating approved candidate rules.
 */
export function buildDraftRulePackFromApprovedItems(input: BuildInput): RulePack {
  const { baseRulePack, approvedReviewItems, newVersion, changelog } = input;

  // Filter for only APPROVED items
  const validItems = approvedReviewItems.filter(item => item.reviewerDecision === 'APPROVED');

  // Convert approved candidate rules to RulePackRule objects
  const newRules: RulePackRule[] = validItems.map(item => ({
    id: item.candidateRule.proposedRuleId,
    category: item.candidateRule.category,
    severity: item.candidateRule.severity,
    confidence: item.candidateRule.confidence,
    pattern: item.candidateRule.suggestedPattern,
    reason: item.candidateRule.rationale,
    falsePositiveNotes: item.candidateRule.falsePositiveRisks.join(', '),
    source: item.candidateRule.sourceThreatIntelId,
    enabled: true,
    createdBy: 'system-builder',
    reviewStatus: 'APPROVED'
  }));

  // Combine with existing rules (avoiding duplicates by proposedRuleId)
  const combinedRules = [...baseRulePack.rules];
  newRules.forEach(newRule => {
    if (!combinedRules.find(r => r.id === newRule.id)) {
      combinedRules.push(newRule);
    }
  });

  // Extract new source references
  const newReferences = Array.from(new Set([
    ...baseRulePack.sourceReferences,
    ...validItems.map(item => item.candidateRule.sourceThreatIntelId)
  ]));

  return {
    id: `RP-${newVersion.replace(/\./g, '-')}-${Date.now()}`,
    name: baseRulePack.name,
    version: newVersion,
    createdAt: new Date().toISOString(),
    status: 'DRAFT',
    sourceReferences: newReferences,
    rules: combinedRules,
    testCases: [...baseRulePack.testCases], // In future, we could add new test cases from the items
    changelog: `${changelog}\n\nAdded ${newRules.length} new approved rules.`
  };
}
