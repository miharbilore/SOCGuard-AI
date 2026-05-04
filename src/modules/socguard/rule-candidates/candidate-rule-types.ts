import { DetectionCategory, DetectionSeverity } from '../types';

export type CandidateRuleStatus = 'DRAFT' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED';

export interface CandidateRule {
  id: string;
  proposedRuleId: string;
  category: DetectionCategory;
  severity: DetectionSeverity;
  confidence: number;
  patternSource: string;
  suggestedPattern: string;
  exampleMatches: string[];
  falsePositiveRisks: string[];
  sourceThreatIntelId: string;
  status: CandidateRuleStatus;
  rationale: string;
  createdAt: string;
}
