import { 
  RedTeamCandidate, 
  BlueTeamProposal, 
  JudgeRecommendation, 
  AdversarialLabRecord, 
  AuditTrailEntry,
  AdversarialAttackType,
  DifficultyLevel
} from './adversarial-types';
import { createSafeRedTeamCandidate } from './safety-sanitizer';
import { generateBlueTeamProposal } from './blue-team-defender';
import { evaluateRedBluePair } from './judge-evaluator';
import { generateDefaultRedTeamSet } from './red-team-generator';
import { deterministicHash } from '../utils/crypto';
import { DetectionCategory } from '../types';

/**
 * Adversarial Lab Record Builder.
 * Orchestrates the creation of end-to-end research records with full audit trails.
 */

interface CreateRecordInput {
  sourceId: string;
  attackType: AdversarialAttackType;
  rawPrompt: string;
  targetWeakness: string;
  expectedDetectionCategory: string;
  difficulty: DifficultyLevel;
}

/**
 * Creates a complete Adversarial Lab Record.
 */
export function createAdversarialLabRecord(input: CreateRecordInput): AdversarialLabRecord {
  const auditTrail: AuditTrailEntry[] = [];

  // 1. Red Team Candidate
  const redTeamCandidate = createSafeRedTeamCandidate({
    sourceId: input.sourceId,
    attackType: input.attackType,
    rawPrompt: input.rawPrompt,
    targetWeakness: input.targetWeakness,
    expectedDetectionCategory: input.expectedDetectionCategory as DetectionCategory,
    difficulty: input.difficulty
  });
  
  auditTrail.push({
    timestamp: new Date().toISOString(),
    actor: 'RedTeamAgent',
    action: 'RED_TEAM_CANDIDATE_CREATED',
    notes: `Generated sanitized candidate for ${input.attackType} (Difficulty: ${input.difficulty}).`
  });

  // 2. Blue Team Proposal
  const blueTeamProposal = generateBlueTeamProposal(redTeamCandidate);
  
  auditTrail.push({
    timestamp: new Date().toISOString(),
    actor: 'BlueTeamAgent',
    action: 'BLUE_TEAM_PROPOSAL_CREATED',
    notes: `Proposed deterministic pattern: ${blueTeamProposal.proposedRulePattern.substring(0, 50)}...`
  });

  // 3. Judge Recommendation
  const judgeRecommendation = evaluateRedBluePair(redTeamCandidate, blueTeamProposal);
  
  auditTrail.push({
    timestamp: new Date().toISOString(),
    actor: 'JudgeAgent',
    action: 'JUDGE_RECOMMENDATION_CREATED',
    notes: `Evaluation complete: ${judgeRecommendation.recommendation} (Safety: ${judgeRecommendation.safetyScore}).`
  });

  // 4. Record ID
  const idHash = deterministicHash(`${redTeamCandidate.id}:${blueTeamProposal.id}:${judgeRecommendation.id}`);
  const id = `LAB-REC-${idHash.toUpperCase().substring(0, 10)}`;

  return {
    id,
    redTeamCandidate,
    blueTeamProposal,
    judgeRecommendation,
    auditTrail
  };
}

/**
 * Appends an entry to the audit trail without mutating the original record.
 */
export function appendAuditTrail(
  record: AdversarialLabRecord, 
  entry: Omit<AuditTrailEntry, 'timestamp'>
): AdversarialLabRecord {
  return {
    ...record,
    auditTrail: [
      ...record.auditTrail,
      {
        ...entry,
        timestamp: new Date().toISOString()
      }
    ]
  };
}

/**
 * Creates a set of default adversarial lab records based on the mock template library.
 */
export function createDefaultAdversarialLabRecords(): AdversarialLabRecord[] {
  const defaultCandidates = generateDefaultRedTeamSet();
  
  // Note: generateDefaultRedTeamSet already calls createSafeRedTeamCandidate.
  // To avoid redundant logic, we map them here manually or refactor.
  // The prompt says "use generateDefaultRedTeamSet()", so we will.
  
  return defaultCandidates.map(candidate => {
    // We recreate the flow but start from the existing candidate
    const blueTeamProposal = generateBlueTeamProposal(candidate);
    const judgeRecommendation = evaluateRedBluePair(candidate, blueTeamProposal);
    
    const auditTrail: AuditTrailEntry[] = [
      {
        timestamp: candidate.createdAt,
        actor: 'RedTeamAgent',
        action: 'RED_TEAM_CANDIDATE_CREATED',
        notes: `Initial candidate creation from default set.`
      },
      {
        timestamp: new Date().toISOString(),
        actor: 'BlueTeamAgent',
        action: 'BLUE_TEAM_PROPOSAL_CREATED',
        notes: `Automated proposal generation.`
      },
      {
        timestamp: new Date().toISOString(),
        actor: 'JudgeAgent',
        action: 'JUDGE_RECOMMENDATION_CREATED',
        notes: `Automated judge evaluation.`
      }
    ];

    const idHash = deterministicHash(`${candidate.id}:${blueTeamProposal.id}:${judgeRecommendation.id}`);
    
    return {
      id: `LAB-REC-${idHash.toUpperCase().substring(0, 10)}`,
      redTeamCandidate: candidate,
      blueTeamProposal,
      judgeRecommendation,
      auditTrail
    };
  });
}
