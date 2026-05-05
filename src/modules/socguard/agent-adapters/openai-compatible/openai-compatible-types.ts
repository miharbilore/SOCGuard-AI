export type OpenAICompatibleProvider = 'GROQ' | 'OPENAI_COMPATIBLE';

/**
 * Configuration for OpenAI-compatible LLM agents.
 * IMPORTANT: No API keys are stored here. Only references to environment variables.
 */
export interface OpenAICompatibleAgentConfig {
  provider: OpenAICompatibleProvider;
  baseUrl: string;
  model: string;
  apiKeyEnvName: string; // e.g. "LLM_API_KEY"
  timeoutMs: number;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
}
