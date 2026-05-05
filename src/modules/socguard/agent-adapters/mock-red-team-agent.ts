import { RedTeamAgent } from './agent-types';
import { RedTeamCandidate } from '../adversarial-lab/adversarial-types';
import { generateDefaultRedTeamSet } from '../adversarial-lab/red-team-generator';

export class MockRedTeamAgent implements RedTeamAgent {
  async generate(input: { sourceId: string; maxCandidates?: number }): Promise<RedTeamCandidate[]> {
    // Artificial delay to simulate network/LLM latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In mock mode, we return the pre-defined deterministic research set
    return generateDefaultRedTeamSet();
  }
}
