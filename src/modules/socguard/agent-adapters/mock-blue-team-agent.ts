import { BlueTeamAgent } from './agent-types';
import { RedTeamCandidate, BlueTeamProposal } from '../adversarial-lab/adversarial-types';
import { generateBlueTeamProposal } from '../adversarial-lab/blue-team-defender';

export class MockBlueTeamAgent implements BlueTeamAgent {
  async propose(candidate: RedTeamCandidate): Promise<BlueTeamProposal> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Uses deterministic defense proposal logic
    return generateBlueTeamProposal(candidate);
  }
}
