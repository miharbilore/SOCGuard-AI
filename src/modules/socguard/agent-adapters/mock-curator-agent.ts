import { CuratorAgent, CuratedRuleVaultEntry } from './agent-types';
import { 
  RedTeamCandidate, 
  BlueTeamProposal, 
  JudgeRecommendation 
} from '../adversarial-lab/adversarial-types';

export class MockCuratorAgent implements CuratorAgent {
  async curate(input: {
    candidate: RedTeamCandidate, 
    proposal: BlueTeamProposal, 
    judge: JudgeRecommendation
  }): Promise<CuratedRuleVaultEntry> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: `RV-MOCK-${Date.now().toString(36).toUpperCase()}`,
      sourceType: 'AGENT_LAB',
      attackType: input.candidate.attackType,
      sanitizedLog: input.candidate.sanitizedPrompt,
      proposedCategory: input.proposal.proposedCategory,
      suggestedPattern: input.proposal.proposedRulePattern,
      severity: input.proposal.severity,
      confidence: input.proposal.confidence,
      falsePositiveRisks: input.proposal.falsePositiveRisks,
      status: 'NEEDS_REVIEW',
      provenance: `Mock curated from ${input.candidate.id}`,
      createdAt: new Date().toISOString()
    };
  }
}
