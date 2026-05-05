import { AgentRuntimeConfig } from './agent-types';

export const DEFAULT_AGENT_CONFIG: AgentRuntimeConfig = {
  enableLLMAgents: false,
  provider: 'MOCK',
  modelName: 'mock-llama-3-70b',
  maxCandidatesPerRun: 5,
  maxCyclesPerRun: 1,
  intervalMs: 1000,
  requireSanitization: true,
  requireHumanReview: true,
  allowProductionMutation: false,
  allowAutoApproval: false
};
