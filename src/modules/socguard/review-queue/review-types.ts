import { CandidateRule } from '../rule-candidates';
import { CandidateRuleTestResult } from '../regression-runner';

export type ReviewerDecision = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';

export interface RuleReviewItem {
  id: string;
  candidateRule: CandidateRule;
  regressionResult: CandidateRuleTestResult;
  reviewerDecision: ReviewerDecision;
  reviewerNotes: string;
  createdAt: string;
  reviewedAt?: string;
}
