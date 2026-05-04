import { 
  AdversarialLabRecord, 
  HumanReviewDecision, 
  HumanDecisionType 
} from './adversarial-types';
import { deterministicHash } from '../utils/crypto';

/**
 * Human Review Workflow.
 * Manages the transition of lab records from "Automated" to "Human-Audited" status.
 */

interface HumanReviewInput {
  reviewerId: string;
  decision: HumanDecisionType;
  reviewerNotes: string;
}

/**
 * Attaches a human review decision to an Adversarial Lab Record.
 * Ensures the record is not already reviewed and validates required fields.
 */
export function applyHumanReviewDecision(
  record: AdversarialLabRecord,
  input: HumanReviewInput
): AdversarialLabRecord {
  // 1. Validation
  if (!input.reviewerId || input.reviewerId.trim() === '') {
    throw new Error('reviewerId is required and cannot be empty.');
  }
  if (!input.reviewerNotes || input.reviewerNotes.trim() === '') {
    throw new Error('reviewerNotes is required and cannot be empty.');
  }
  if (record.humanReviewDecision) {
    throw new Error(`Record ${record.id} already has a human review decision.`);
  }

  // 2. Create Decision Object
  const decisionId = `REV-${deterministicHash(`${record.id}:${input.reviewerId}:${input.decision}`).toUpperCase().substring(0, 8)}`;
  
  const humanReviewDecision: HumanReviewDecision = {
    id: decisionId,
    reviewerId: input.reviewerId,
    decision: input.decision,
    reviewerNotes: input.reviewerNotes,
    reviewedAt: new Date().toISOString()
  };

  // 3. Create Audit Trail Entry
  const auditEntry = {
    timestamp: humanReviewDecision.reviewedAt,
    actor: 'HumanReviewer',
    action: 'HUMAN_REVIEW_DECISION_APPLIED',
    notes: `Decision: ${input.decision} | Reviewer: ${input.reviewerId}`
  };

  // 4. Return new record object (no mutation)
  return {
    ...record,
    humanReviewDecision,
    auditTrail: [...record.auditTrail, auditEntry]
  };
}

/**
 * Predicate: Is the record approved for inclusion in the benchmark suite?
 */
export function isApprovedForBenchmark(record: AdversarialLabRecord): boolean {
  const decision = record.humanReviewDecision?.decision;
  return decision === 'APPROVE_FOR_BENCHMARK' || decision === 'APPROVE_FOR_BOTH';
}

/**
 * Predicate: Is the record approved for promotion to a rule candidate?
 */
export function isApprovedForRuleCandidate(record: AdversarialLabRecord): boolean {
  const decision = record.humanReviewDecision?.decision;
  return decision === 'APPROVE_FOR_RULE_CANDIDATE' || decision === 'APPROVE_FOR_BOTH';
}

/**
 * Predicate: Does the record require revision by the Red/Blue agents?
 */
export function requiresRevision(record: AdversarialLabRecord): boolean {
  return record.humanReviewDecision?.decision === 'NEEDS_REVISION';
}

/**
 * Predicate: Was the record rejected as invalid or low quality?
 */
export function isRejected(record: AdversarialLabRecord): boolean {
  return record.humanReviewDecision?.decision === 'REJECT';
}
