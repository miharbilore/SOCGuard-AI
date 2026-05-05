import { JudgeAgent } from './agent-types';
import { RedTeamCandidate, BlueTeamProposal, JudgeRecommendation } from '../adversarial-lab/adversarial-types';
import { evaluateRedBluePair } from '../adversarial-lab/judge-evaluator';

export class MockJudgeAgent implements JudgeAgent {
  async evaluate(input: { candidate: RedTeamCandidate; proposal: BlueTeamProposal }): Promise<JudgeRecommendation> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Uses deterministic heuristic judge logic
    return evaluateRedBluePair(input.candidate, input.proposal);
  }
}
