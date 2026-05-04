import { CandidateRule } from '../rule-candidates';
import { CandidateRuleTestResult } from '../regression-runner';
import { RuleReviewItem, ReviewerDecision } from './review-types';
import { deterministicHash } from '../utils/crypto';

/**
 * Creates a new review item for a candidate rule after regression testing.
 * Uses a deterministic ID based on the candidate rule and regression stats.
 */
export function createReviewItem(
  candidateRule: CandidateRule, 
  regressionResult: CandidateRuleTestResult
): RuleReviewItem {
  const identityContext = `${candidateRule.id}:${regressionResult.matchedInjected}:${regressionResult.matchedBenign}`;
  
  return {
    id: `REV-${deterministicHash(identityContext)}`,
    candidateRule,
    regressionResult,
    reviewerDecision: 'PENDING',
    reviewerNotes: '',
    createdAt: new Date().toISOString()
  };
}

/**
 * Updates a review item with a decision and notes.
 * Mandatory reviewer identity and notes for auditability.
 */
function updateReviewDecision(
  item: RuleReviewItem, 
  decision: ReviewerDecision, 
  reviewerId: string,
  notes: string
): RuleReviewItem {
  if (!reviewerId || reviewerId.trim().length < 3) {
    throw new Error(`Audit Failure: Valid reviewer identity is mandatory for decision: ${decision}`);
  }

  if (!notes || notes.trim().length < 5) {
    throw new Error(`Audit Failure: Meaningful reviewer notes are mandatory for decision: ${decision}`);
  }

  return {
    ...item,
    reviewerDecision: decision,
    reviewerNotes: notes,
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString()
  };
}

export function approveReviewItem(item: RuleReviewItem, reviewerId: string, reviewerNotes: string): RuleReviewItem {
  return updateReviewDecision(item, 'APPROVED', reviewerId, reviewerNotes);
}

export function rejectReviewItem(item: RuleReviewItem, reviewerId: string, reviewerNotes: string): RuleReviewItem {
  return updateReviewDecision(item, 'REJECTED', reviewerId, reviewerNotes);
}

export function requestRevision(item: RuleReviewItem, reviewerId: string, reviewerNotes: string): RuleReviewItem {
  return updateReviewDecision(item, 'NEEDS_REVISION', reviewerId, reviewerNotes);
}
