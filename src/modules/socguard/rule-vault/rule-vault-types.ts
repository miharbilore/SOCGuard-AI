import { DetectionCategory } from '../types';

export type RuleVaultSource = 'AGENT_LAB' | 'HUMAN_REVIEW' | 'THREAT_INTEL' | 'MANUAL';

export type RuleVaultStatus = 
  | 'NEEDS_REVIEW' 
  | 'APPROVED_FOR_BENCHMARK' 
  | 'APPROVED_FOR_RULE_CANDIDATE' 
  | 'APPROVED_FOR_BOTH' 
  | 'REJECTED' 
  | 'NEEDS_REVISION';

export interface RuleVaultEntry {
  id: string;
  sourceType: RuleVaultSource;
  attackType: string;
  sanitizedLog: string;
  proposedCategory: DetectionCategory;
  suggestedPattern: string;
  severity: string;
  confidence: number;
  falsePositiveRisks: string[];
  status: RuleVaultStatus;
  provenance: string;
  createdAt: string;
  reviewedBy?: string;
  reviewerNotes?: string;
  reviewedAt?: string;
}

export interface RuleVaultSummary {
  total: number;
  needsReview: number;
  approved: number;
  rejected: number;
  needsRevision: number;
  byAttackType: Record<string, number>;
  byCategory: Record<string, number>;
  averageConfidence: number;
}
