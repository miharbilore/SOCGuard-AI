import { 
  RedTeamCandidate, 
  BlueTeamProposal, 
  JudgeRecommendation 
} from '../adversarial-lab/adversarial-types';

export type { 
  RedTeamCandidate, 
  BlueTeamProposal, 
  JudgeRecommendation 
};
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
  openai?: {
    enabled: boolean;
    baseUrl: string;
    model: string;
    apiKey?: string;
    timeoutMs: number;
    maxTokens: number;
    temperature: number;
  };
}

import { SourceIntelligenceNote } from '../source-intelligence/source-types';

export interface RedTeamAgent {
  generate(input: { 
    sourceId: string; 
    maxCandidates?: number;
    sourceContextNotes?: SourceIntelligenceNote[];
  }): Promise<RedTeamCandidate[]>;
}

export interface BlueTeamAgent {
  propose(input: { candidate: RedTeamCandidate }): Promise<BlueTeamProposal>;
}

export interface JudgeAgent {
  evaluate(input: { candidate: RedTeamCandidate; proposal: BlueTeamProposal }): Promise<JudgeRecommendation>;
}

export type VaultEntryStatus = 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';

export interface CuratedRuleVaultEntry {
  id: string;
  sourceType: 'AGENT_LAB';
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
  curate(input: {
    candidate: RedTeamCandidate, 
    proposal: BlueTeamProposal, 
    judge: JudgeRecommendation
  }): Promise<CuratedRuleVaultEntry>;
}
