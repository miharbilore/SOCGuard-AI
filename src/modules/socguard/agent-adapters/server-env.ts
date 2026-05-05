import { OpenAICompatibleProvider } from './openai-compatible/openai-compatible-types';

export interface LLMAgentEnvConfig {
  enabled: boolean;
  provider: OpenAICompatibleProvider;
  baseUrl: string;
  model: string;
  hasApiKey: boolean;
  apiKey?: string; // Only populated server-side, never exposed to client

  fallback?: {
    provider: OpenAICompatibleProvider;
    baseUrl: string;
    model: string;
    hasApiKey: boolean;
    apiKey?: string;
  };

  limits: {
    maxCandidates: number;
    maxCycles: number;
    minIntervalMs: number;
    timeoutMs: number;
    maxTokens: number;
    temperature: number;
  };

  governance: {
    allowAutoApproval: boolean;
    allowProductionMutation: boolean;
    requireHumanReview: boolean;
    requireSanitization: boolean;
  };
}

/**
 * Reads environment variables server-side.
 * This should NEVER be called from a client component.
 */
export function getLLMAgentEnvConfig(): LLMAgentEnvConfig {
  const enabled = process.env.ENABLE_LLM_AGENTS === 'true';
  const apiKey = process.env.LLM_API_KEY;
  const fallbackApiKey = process.env.FALLBACK_LLM_API_KEY;

  const config: LLMAgentEnvConfig = {
    enabled,
    provider: (process.env.LLM_PROVIDER as OpenAICompatibleProvider) || 'GROQ',
    baseUrl: process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1',
    model: process.env.LLM_MODEL || '',
    hasApiKey: !!apiKey && apiKey !== '<server-side-api-key-placeholder>',
    apiKey: enabled ? apiKey : undefined,

    fallback: process.env.FALLBACK_LLM_PROVIDER ? {
      provider: (process.env.FALLBACK_LLM_PROVIDER as OpenAICompatibleProvider),
      baseUrl: process.env.FALLBACK_LLM_BASE_URL || '',
      model: process.env.FALLBACK_LLM_MODEL || '',
      hasApiKey: !!fallbackApiKey && fallbackApiKey !== '<fallback-server-side-api-key-placeholder>',
      apiKey: enabled ? fallbackApiKey : undefined,
    } : undefined,

    limits: {
      maxCandidates: Math.min(10, parseInt(process.env.MAX_CANDIDATES_PER_RUN || '3')),
      maxCycles: Math.min(10, parseInt(process.env.MAX_CYCLES_PER_RUN || '5')),
      minIntervalMs: Math.max(10000, parseInt(process.env.MIN_INTERVAL_MS || '10000')),
      timeoutMs: parseInt(process.env.LLM_TIMEOUT_MS || '30000'),
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '1200'),
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.2'),
    },

    governance: {
      allowAutoApproval: process.env.ALLOW_AUTO_APPROVAL === 'true',
      allowProductionMutation: process.env.ALLOW_PRODUCTION_MUTATION === 'true',
      requireHumanReview: process.env.REQUIRE_HUMAN_REVIEW !== 'false',
      requireSanitization: process.env.REQUIRE_SANITIZATION !== 'false',
    }
  };

  return config;
}

/**
 * Returns a safe version of the config for logging or non-sensitive checks.
 * Strips actual API keys.
 */
export function getSafeLLMAgentConfigSummary(config: LLMAgentEnvConfig) {
  const { apiKey, fallback, ...safe } = config;
  return {
    ...safe,
    fallback: fallback ? {
      provider: fallback.provider,
      baseUrl: fallback.baseUrl,
      model: fallback.model,
      hasApiKey: fallback.hasApiKey
    } : undefined
  };
}
