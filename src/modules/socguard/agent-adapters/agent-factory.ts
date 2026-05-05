import { 
  RedTeamAgent, 
  BlueTeamAgent, 
  JudgeAgent, 
  CuratorAgent, 
  AgentRuntimeConfig 
} from './agent-types';
import { 
  MockRedTeamAgent, 
  MockBlueTeamAgent, 
  MockJudgeAgent, 
  MockCuratorAgent 
} from './index';
import { 
  OpenAICompatibleRedTeamAgent, 
  OpenAICompatibleBlueTeamAgent, 
  OpenAICompatibleJudgeAgent, 
  OpenAICompatibleCuratorAgent 
} from './openai-compatible/openai-compatible-agents';

export interface AgentSet {
  redTeam: RedTeamAgent;
  blueTeam: BlueTeamAgent;
  judge: JudgeAgent;
  curator: CuratorAgent;
  isMock: boolean;
}

/**
 * Factory to create a set of agents based on runtime configuration.
 */
export function createAgentSet(config: AgentRuntimeConfig): AgentSet {
  // Check if LLM agents are enabled and have a valid provider/key
  const useLLM = 
    config.openai?.enabled && 
    config.openai.apiKey && 
    config.openai.apiKey !== '<server-side-api-key-placeholder>' &&
    (config.provider === 'GROQ' || config.provider === 'OPENAI_COMPATIBLE');

  if (useLLM) {
    return {
      redTeam: new OpenAICompatibleRedTeamAgent(config),
      blueTeam: new OpenAICompatibleBlueTeamAgent(config),
      judge: new OpenAICompatibleJudgeAgent(config),
      curator: new OpenAICompatibleCuratorAgent(config),
      isMock: false
    };
  }

  // Default to Mock
  return {
    redTeam: new MockRedTeamAgent(),
    blueTeam: new MockBlueTeamAgent(),
    judge: new MockJudgeAgent(),
    curator: new MockCuratorAgent(),
    isMock: true
  };
}
