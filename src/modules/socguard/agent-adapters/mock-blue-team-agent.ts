import { BlueTeamAgent } from './agent-types';
import { RedTeamCandidate, BlueTeamProposal } from '../adversarial-lab/adversarial-types';
import { generateBlueTeamProposal } from '../adversarial-lab/blue-team-defender';

export class MockBlueTeamAgent implements BlueTeamAgent {
  async propose(input: { candidate: RedTeamCandidate }): Promise<BlueTeamProposal> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return generateBlueTeamProposal(input.candidate);
  }
}
