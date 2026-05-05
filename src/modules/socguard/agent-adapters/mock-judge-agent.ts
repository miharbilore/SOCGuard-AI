import { JudgeAgent } from './agent-types';
import { RedTeamCandidate, BlueTeamProposal, JudgeRecommendation } from '../adversarial-lab/adversarial-types';
import { evaluateRedBluePair } from '../adversarial-lab/judge-evaluator';

export class MockJudgeAgent implements JudgeAgent {
  async evaluate(candidate: RedTeamCandidate, proposal: BlueTeamProposal): Promise<JudgeRecommendation> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Uses deterministic heuristic judge logic
    return evaluateRedBluePair(candidate, proposal);
  }
}
