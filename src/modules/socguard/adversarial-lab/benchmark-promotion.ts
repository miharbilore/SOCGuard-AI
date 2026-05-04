import { 
  AdversarialLabRecord, 
  DifficultyLevel 
} from './adversarial-types';
import { DetectionCategory } from '../types';
import { deterministicHash } from '../utils/crypto';

/**
 * Benchmark Promotion Workflow.
 * Converts human-approved adversarial records into formal benchmark test cases.
 */

export interface BenchmarkPromotionResult {
  id: string;
  raw: string; // This MUST be the sanitizedPrompt
  label: 'INJECTED';
  expectedCategory: DetectionCategory;
  difficulty: DifficultyLevel;
  attackVector: string;
  shortDescription: string;
  provenance: {
    sourceLabRecordId: string;
    redTeamCandidateId: string;
    reviewerId: string;
    reviewerNotes: string;
    judgeRecommendationId: string;
  };
  status: 'CANDIDATE' | 'APPROVED_FOR_DATASET';
  promotedAt: string;
}

/**
 * Promotes a single human-approved lab record to a benchmark candidate.
 */
export function promoteToBenchmarkCandidate(record: AdversarialLabRecord): BenchmarkPromotionResult {
  // 1. Validation: Must have a human review decision
  if (!record.humanReviewDecision) {
    throw new Error(`Promotion failed: Record ${record.id} has no human review decision.`);
  }

  // 2. Validation: Must be approved for benchmark
  const decision = record.humanReviewDecision.decision;
  const isEligible = decision === 'APPROVE_FOR_BENCHMARK' || decision === 'APPROVE_FOR_BOTH';
  
  if (!isEligible) {
    throw new Error(`Promotion failed: Record ${record.id} decision "${decision}" is not eligible for benchmark promotion.`);
  }

  // 3. Construct Benchmark Candidate
  const idHash = deterministicHash(`BENCH-PROM-${record.id}`);
  const id = `BC-${idHash.toUpperCase().substring(0, 8)}`;

  return {
    id,
    raw: record.redTeamCandidate.sanitizedPrompt,
    label: 'INJECTED',
    expectedCategory: record.redTeamCandidate.expectedDetectionCategory,
    difficulty: record.redTeamCandidate.difficulty,
    attackVector: record.redTeamCandidate.attackType,
    shortDescription: `Synthesized ${record.redTeamCandidate.attackType} attack targeting ${record.redTeamCandidate.targetWeakness}.`,
    provenance: {
      sourceLabRecordId: record.id,
      redTeamCandidateId: record.redTeamCandidate.id,
      reviewerId: record.humanReviewDecision.reviewerId,
      reviewerNotes: record.humanReviewDecision.reviewerNotes,
      judgeRecommendationId: record.judgeRecommendation?.id || 'UNKNOWN'
    },
    status: 'CANDIDATE',
    promotedAt: new Date().toISOString()
  };
}

/**
 * Batch promotes approved records to benchmark candidates.
 * Safely skips ineligible records.
 */
export function promoteApprovedRecordsToBenchmark(records: AdversarialLabRecord[]): BenchmarkPromotionResult[] {
  const candidates: BenchmarkPromotionResult[] = [];
  
  for (const record of records) {
    if (record.humanReviewDecision) {
      const decision = record.humanReviewDecision.decision;
      if (decision === 'APPROVE_FOR_BENCHMARK' || decision === 'APPROVE_FOR_BOTH') {
        try {
          candidates.push(promoteToBenchmarkCandidate(record));
        } catch (error) {
          // Skip silently or log in a real system
          console.error(`Skipping record ${record.id} during promotion:`, error);
        }
      }
    }
  }
  
  return candidates;
}
