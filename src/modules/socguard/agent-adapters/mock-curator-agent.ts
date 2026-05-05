import { CuratorAgent, CuratedRuleVaultEntry } from './agent-types';
import { 
  RedTeamCandidate, 
  BlueTeamProposal, 
  JudgeRecommendation 
} from '../adversarial-lab/adversarial-types';

export class MockCuratorAgent implements CuratorAgent {
  async curate(
    candidate: RedTeamCandidate, 
    proposal: BlueTeamProposal, 
    judge: JudgeRecommendation
  ): Promise<CuratedRuleVaultEntry> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      id: `VAULT-${candidate.id}-${Date.now().toString(36).toUpperCase()}`,
      sourceCandidateId: candidate.id,
      sourceProposalId: proposal.id,
      sourceJudgeRecommendationId: judge.id,
      attackType: candidate.attackType,
      sanitizedLog: candidate.sanitizedPrompt,
      proposedCategory: candidate.expectedDetectionCategory,
      suggestedPattern: proposal.proposedRulePattern,
      severity: proposal.severity,
      confidence: proposal.confidence,
      falsePositiveRisks: judge.limitations,
      status: 'NEEDS_REVIEW', // Mandatory default for governance
      provenance: `Mock Curator derived from Red[${candidate.id}] + Blue[${proposal.id}] + Judge[${judge.id}]`,
      createdAt: new Date().toISOString()
    };
  }
}
