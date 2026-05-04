import { 
  AdversarialLabRecord 
} from './adversarial-types';
import { CandidateRule } from '../rule-candidates/candidate-rule-types';
import { deterministicHash } from '../utils/crypto';

/**
 * Rule Candidate Promotion Workflow.
 * Converts human-approved defense proposals into V2-compatible candidate rules.
 */

export interface RuleCandidatePromotionResult extends CandidateRule {
  // Provenance is already optional in CandidateRule, but we make it mandatory here for promotion results
  provenance: {
    sourceLabRecordId: string;
    redTeamCandidateId: string;
    blueTeamProposalId: string;
    judgeRecommendationId: string;
    reviewerId: string;
    reviewerNotes: string;
  };
}

/**
 * Promotes a single human-approved lab record to a V2 candidate rule.
 */
export function promoteToRuleCandidate(record: AdversarialLabRecord): RuleCandidatePromotionResult {
  // 1. Validation: Must have a human review decision
  if (!record.humanReviewDecision) {
    throw new Error(`Promotion failed: Record ${record.id} has no human review decision.`);
  }

  // 2. Validation: Must be approved for rule candidate
  const decision = record.humanReviewDecision.decision;
  const isEligible = decision === 'APPROVE_FOR_RULE_CANDIDATE' || decision === 'APPROVE_FOR_BOTH';
  
  if (!isEligible) {
    throw new Error(`Promotion failed: Record ${record.id} decision "${decision}" is not eligible for rule promotion.`);
  }

  // 3. Validation: Must have a blue team proposal
  if (!record.blueTeamProposal) {
    throw new Error(`Promotion failed: Record ${record.id} is missing a Blue Team proposal.`);
  }

  const proposal = record.blueTeamProposal;
  const candidate = record.redTeamCandidate;
  
  // 4. Construct V2 Candidate Rule
  const idHash = deterministicHash(`RULE-PROM-${record.id}`);
  const id = `RC-${idHash.toUpperCase().substring(0, 8)}`;

  return {
    id,
    proposedRuleId: `PROPOSED-${id}`,
    category: proposal.proposedCategory,
    severity: proposal.severity,
    confidence: proposal.confidence,
    patternSource: 'ADVERSARIAL_LAB',
    suggestedPattern: proposal.proposedRulePattern,
    exampleMatches: [candidate.sanitizedPrompt],
    falsePositiveRisks: proposal.falsePositiveRisks,
    sourceThreatIntelId: record.id,
    status: 'DRAFT',
    rationale: `Promoted from Adversarial Lab research. Vector: ${candidate.attackType}. Rationale: ${proposal.rationale}`,
    provenance: {
      sourceLabRecordId: record.id,
      redTeamCandidateId: candidate.id,
      blueTeamProposalId: proposal.id,
      judgeRecommendationId: record.judgeRecommendation?.id || 'UNKNOWN',
      reviewerId: record.humanReviewDecision.reviewerId,
      reviewerNotes: record.humanReviewDecision.reviewerNotes
    },
    createdAt: new Date().toISOString()
  };
}

/**
 * Batch promotes approved records to V2 candidate rules.
 * Safely skips ineligible records.
 */
export function promoteApprovedRecordsToRuleCandidates(records: AdversarialLabRecord[]): RuleCandidatePromotionResult[] {
  const candidates: RuleCandidatePromotionResult[] = [];
  
  for (const record of records) {
    if (record.humanReviewDecision) {
      const decision = record.humanReviewDecision.decision;
      if (decision === 'APPROVE_FOR_RULE_CANDIDATE' || decision === 'APPROVE_FOR_BOTH') {
        try {
          candidates.push(promoteToRuleCandidate(record));
        } catch (error) {
          // Skip silently or log in a real system
          console.error(`Skipping record ${record.id} during rule promotion:`, error);
        }
      }
    }
  }
  
  return candidates;
}
