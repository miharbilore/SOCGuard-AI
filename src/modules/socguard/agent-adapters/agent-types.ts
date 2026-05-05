import { 
  RedTeamCandidate, 
  BlueTeamProposal, 
  JudgeRecommendation 
} from '../adversarial-lab/adversarial-types';
import { DetectionCategory } from '../types';

export type AgentProvider = 'MOCK' | 'GROQ' | 'OPENAI_COMPATIBLE';

export interface AgentRuntimeConfig {
  enableLLMAgents: boolean;
  provider: AgentProvider;
  modelName?: string;
  maxCandidatesPerRun: number;
  maxCyclesPerRun: number;
  intervalMs: number;
  requireSanitization: true;
  requireHumanReview: true;
  allowProductionMutation: false;
  allowAutoApproval: false;
}

export interface RedTeamAgent {
  generate(input: string): Promise<RedTeamCandidate[]>;
}

export interface BlueTeamAgent {
  propose(candidate: RedTeamCandidate): Promise<BlueTeamProposal>;
}

export interface JudgeAgent {
  evaluate(candidate: RedTeamCandidate, proposal: BlueTeamProposal): Promise<JudgeRecommendation>;
}

export type VaultEntryStatus = 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';

export interface CuratedRuleVaultEntry {
  id: string;
  sourceCandidateId: string;
  sourceProposalId: string;
  sourceJudgeRecommendationId: string;
  attackType: string;
  sanitizedLog: string;
  proposedCategory: DetectionCategory;
  suggestedPattern: string;
  severity: string;
  confidence: number;
  falsePositiveRisks: string[];
  status: VaultEntryStatus;
  provenance: string;
  createdAt: string;
}

export interface CuratorAgent {
  curate(
    candidate: RedTeamCandidate, 
    proposal: BlueTeamProposal, 
    judge: JudgeRecommendation
  ): Promise<CuratedRuleVaultEntry>;
}
