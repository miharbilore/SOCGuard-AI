import { RulePack, RulePackRule } from './rule-pack-types';
import { RuleReviewItem } from '../review-queue';
import { deterministicHash } from '../utils/crypto';

export interface BuildInput {
  baseRulePack: RulePack;
  approvedReviewItems: RuleReviewItem[];
  newVersion: string;
  changelog: string;
}

/**
 * Builds a new versioned Rule Pack (in DRAFT status) by incorporating approved candidate rules.
 * Rules inside a draft pack are NOT active production rules (enabled: false).
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
    // SAFETY: Rules in draft packs are disabled by default
    enabled: false,
    createdBy: `review-${item.reviewedBy || 'unknown'}`,
    // SAFETY: Status in draft pack remains DRAFT until full pack approval
    reviewStatus: 'DRAFT'
  }));

  // Combine with existing rules (avoiding duplicates by proposedRuleId)
  const combinedRules = [...baseRulePack.rules];
  newRules.forEach(newRule => {
    if (!combinedRules.find(r => r.id === newRule.id)) {
      combinedRules.push(newRule);
    }
  });

  const newReferences = Array.from(new Set([
    ...baseRulePack.sourceReferences,
    ...validItems.map(item => item.candidateRule.sourceThreatIntelId)
  ]));

  // Deterministic ID for the Rule Pack based on version and changelog
  const packHash = deterministicHash(`${newVersion}:${changelog}:${newRules.length}`);

  return {
    id: `RP-${newVersion.replace(/\./g, '-')}-${packHash.toUpperCase().substring(0, 8)}`,
    name: baseRulePack.name,
    version: newVersion,
    createdAt: new Date().toISOString(),
    status: 'DRAFT',
    sourceReferences: newReferences,
    rules: combinedRules,
    testCases: [...baseRulePack.testCases],
    changelog: `${changelog}\n\nAdded ${newRules.length} new rules (Initial Status: DRAFT, Disabled).`
  };
}
