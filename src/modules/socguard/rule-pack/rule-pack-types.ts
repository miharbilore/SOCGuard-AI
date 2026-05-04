import { DetectionCategory, DetectionSeverity } from '../types';

export type RulePackStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'DEPRECATED';
export type RuleReviewStatus = 'DRAFT' | 'APPROVED' | 'REJECTED';
export type TestCaseLabel = 'BENIGN' | 'INJECTED';

export interface RulePackRule {
  id: string;
  category: DetectionCategory;
  severity: DetectionSeverity;
  confidence: number;
  pattern: string; // Stored as string for JSON compatibility, converted to RegExp when used
  reason: string;
  falsePositiveNotes?: string;
  source: string;
  enabled: boolean;
  createdBy: string;
  reviewStatus: RuleReviewStatus;
}

export interface RulePackTestCase {
  id: string;
  raw: string;
  label: TestCaseLabel;
  expectedCategory?: DetectionCategory;
  expectedDecision: 'MALICIOUS' | 'BENIGN';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  notes?: string;
}

export interface RulePack {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  status: RulePackStatus;
  sourceReferences: string[];
  rules: RulePackRule[];
  testCases: RulePackTestCase[];
  changelog: string;
}
