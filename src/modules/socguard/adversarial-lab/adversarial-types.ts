import { DetectionCategory, DetectionSeverity } from '../types';

export type AdversarialAttackType =
  | 'DIRECT_INSTRUCTION_OVERRIDE'
  | 'JAILBREAK_ROLEPLAY'
  | 'FRAGMENTED_PAYLOAD'
  | 'PREFIX_INJECTION'
  | 'FEW_SHOT_MISLEADING'
  | 'TRANSLATION_BYPASS'
  | 'INDIRECT_RAG_INJECTION'
  | 'CONTEXT_OVERFLOW_ATTACK'
  | 'SYNTAX_ESCAPE';

export type SafetyStatus = 'SANITIZED' | 'NEEDS_SANITIZATION' | 'REJECTED';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type LanguageCode = 'tr' | 'en' | 'ar' | 'de' | 'fr' | 'pl' | 'mixed' | 'unknown';

/**
 * Red Team Candidate: A synthesized attack pattern.
 * MUST only store sanitized content (no operational payloads).
 */
export interface RedTeamCandidate {
  id: string;
  sourceId: string; // ID of the threat intel or missed case that triggered this
  attackType: AdversarialAttackType;
  sanitizedPrompt: string; // Sanitized version with placeholders like [REDACTED]
  redactedTerms: string[]; // List of categories that were redacted
  targetWeakness: string; // e.g., "Lack of multi-lingual regex"
  expectedDetectionCategory: DetectionCategory;
  difficulty: DifficultyLevel;
  language?: LanguageCode;
  safetyStatus: SafetyStatus;
  createdAt: string;
}

export type BlueProposalStatus = 'DRAFT' | 'NEEDS_REVIEW' | 'REJECTED';

/**
 * Blue Team Proposal: A suggested defense for a specific Red Team candidate.
 * This is an offline proposal and does NOT mutate production rules.
 */
export interface BlueTeamProposal {
  id: string;
  redTeamCandidateId: string;
  proposedCategory: DetectionCategory;
  proposedRulePattern: string; // The suggested regex or keyword
  severity: DetectionSeverity;
  confidence: number;
  falsePositiveRisks: string[];
  hardNegativeSuggestions: string[]; // Examples that should NOT trigger the rule
  rationale: string;
  status: BlueProposalStatus;
}

export type JudgeRecommendationType =
  | 'RECOMMEND_APPROVE_FOR_REVIEW'
  | 'RECOMMEND_REVISE'
  | 'RECOMMEND_REJECT';

/**
 * Judge Recommendation: Automated advisory evaluation of Red and Blue outputs.
 * Provides a quality gate before human review.
 */
export interface JudgeRecommendation {
  id: string;
  redTeamCandidateId: string;
  blueTeamProposalId: string;
  recommendation: JudgeRecommendationType;
  realismScore: number; // 0 to 100
  coverageScore: number; // 0 to 100
  falsePositiveRiskScore: number; // 0 to 100
  safetyScore: number; // 0 to 100
  reasons: string[];
  limitations: string[];
  createdAt: string;
}

export type HumanDecisionType =
  | 'APPROVE_FOR_BENCHMARK'
  | 'APPROVE_FOR_RULE_CANDIDATE'
  | 'APPROVE_FOR_BOTH'
  | 'REJECT'
  | 'NEEDS_REVISION';

/**
 * Human Review Decision: The final authority.
 * Mandatory fields: reviewerId and reviewerNotes.
 */
export interface HumanReviewDecision {
  id: string;
  reviewerId: string; // MANDATORY
  decision: HumanDecisionType;
  reviewerNotes: string; // MANDATORY (min 5 chars)
  reviewedAt: string;
}

export interface AuditTrailEntry {
  timestamp: string;
  actor: string; // "RedTeamAgent" | "BlueTeamAgent" | "JudgeAgent" | "HumanReviewer"
  action: string;
  notes: string;
}

/**
 * Adversarial Lab Record: The complete lifecycle of an adversarial research attempt.
 * This record is for research and benchmarking purposes only.
 */
export interface AdversarialLabRecord {
  id: string;
  redTeamCandidate: RedTeamCandidate;
  blueTeamProposal?: BlueTeamProposal;
  judgeRecommendation?: JudgeRecommendation;
  humanReviewDecision?: HumanReviewDecision;
  auditTrail: AuditTrailEntry[];
}
