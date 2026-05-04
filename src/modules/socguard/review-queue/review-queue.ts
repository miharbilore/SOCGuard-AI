import { CandidateRule } from '../rule-candidates';
import { CandidateRuleTestResult } from '../regression-runner';
import { RuleReviewItem, ReviewerDecision } from './review-types';

/**
 * Creates a new review item for a candidate rule after regression testing.
 */
export function createReviewItem(
  candidateRule: CandidateRule, 
  regressionResult: CandidateRuleTestResult
): RuleReviewItem {
  return {
    id: `REV-${candidateRule.id.substring(5)}`,
    candidateRule,
    regressionResult,
    reviewerDecision: 'PENDING',
    reviewerNotes: '',
    createdAt: new Date().toISOString()
  };
}

/**
 * Updates a review item with a decision and notes.
 */
function updateReviewDecision(
  item: RuleReviewItem, 
  decision: ReviewerDecision, 
  notes: string
): RuleReviewItem {
  return {
    ...item,
    reviewerDecision: decision,
    reviewerNotes: notes,
    reviewedAt: new Date().toISOString()
  };
}

export function approveReviewItem(item: RuleReviewItem, reviewerNotes: string): RuleReviewItem {
  return updateReviewDecision(item, 'APPROVED', reviewerNotes);
}

export function rejectReviewItem(item: RuleReviewItem, reviewerNotes: string): RuleReviewItem {
  return updateReviewDecision(item, 'REJECTED', reviewerNotes);
}

export function requestRevision(item: RuleReviewItem, reviewerNotes: string): RuleReviewItem {
  return updateReviewDecision(item, 'NEEDS_REVISION', reviewerNotes);
}
