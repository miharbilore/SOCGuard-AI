import { RedTeamAgent } from './agent-types';
import { RedTeamCandidate, AdversarialAttackType } from '../adversarial-lab/adversarial-types';
import { generateRedTeamCandidates } from '../adversarial-lab/red-team-generator';
import { SourceIntelligenceNote } from '../source-intelligence/source-types';

export class MockRedTeamAgent implements RedTeamAgent {
  async generate(input: { 
    sourceId: string; 
    maxCandidates?: number;
    sourceContextNotes?: SourceIntelligenceNote[];
  }): Promise<RedTeamCandidate[]> {
    // Artificial delay to simulate network/LLM latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { sourceId, maxCandidates = 3, sourceContextNotes } = input;
    
    // If source context notes are provided, we align mock candidates with their attack types
    const contextAttackTypes = sourceContextNotes 
      ? Array.from(new Set(sourceContextNotes.flatMap(n => n.attackTypes))) as AdversarialAttackType[]
      : undefined;

    return generateRedTeamCandidates({
      sourceId: sourceId,
      attackTypes: contextAttackTypes,
      maxPerType: 1
    }).slice(0, maxCandidates);
  }
}
