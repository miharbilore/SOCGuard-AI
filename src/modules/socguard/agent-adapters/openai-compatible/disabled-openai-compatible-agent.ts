import { 
  RedTeamAgent, 
  BlueTeamAgent, 
  JudgeAgent, 
  CuratorAgent,
  RedTeamCandidate,
  BlueTeamProposal,
  JudgeRecommendation,
  CuratedRuleVaultEntry
} from '../agent-types';

const DISABLED_ERROR = "OpenAI-compatible LLM agents are not enabled in this research build.";

/**
 * FUTURE IMPLEMENTATION REQUIREMENTS:
 * 1. Must run server-side only (Next.js server actions or API routes).
 * 2. Must read API keys from environment variables only.
 * 3. Must validate LLM response schema (e.g. using Zod).
 * 4. Must pass all outputs through the SOCGuard safety sanitizer.
 * 5. Must enforce strict rate and cost limits.
 * 6. Must require human review for all outputs.
 * 7. Must never mutate production rules directly.
 */

export class DisabledRedTeamAgent implements RedTeamAgent {
  async generate(_input: { sourceId: string; maxCandidates?: number }): Promise<RedTeamCandidate[]> {
    throw new Error(DISABLED_ERROR);
  }
}

export class DisabledBlueTeamAgent implements BlueTeamAgent {
  async propose(_input: { candidate: RedTeamCandidate }): Promise<BlueTeamProposal> {
    throw new Error(DISABLED_ERROR);
  }
}

export class DisabledJudgeAgent implements JudgeAgent {
  async evaluate(_input: { candidate: RedTeamCandidate; proposal: BlueTeamProposal }): Promise<JudgeRecommendation> {
    throw new Error(DISABLED_ERROR);
  }
}

export class DisabledCuratorAgent implements CuratorAgent {
  async curate(_input: {
    candidate: RedTeamCandidate, 
    proposal: BlueTeamProposal, 
    judge: JudgeRecommendation
  }): Promise<CuratedRuleVaultEntry> {
    throw new Error(DISABLED_ERROR);
  }
}
