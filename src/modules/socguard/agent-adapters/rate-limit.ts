import { LLMAgentEnvConfig } from './server-env';

/**
 * Enforces a minimum time interval between agent lab cycles.
 */
export function enforceMinimumInterval(lastRunAt: number, intervalMs: number): boolean {
  const now = Date.now();
  const timeSinceLastRun = now - lastRunAt;
  return timeSinceLastRun >= intervalMs;
}

/**
 * Calculates exponential backoff delay based on retry attempt.
 * Capped at 120,000ms (2 minutes).
 */
export function calculateBackoffDelay(attempt: number, baseMs: number = 2000): number {
  const delay = baseMs * Math.pow(2, attempt);
  return Math.min(120000, delay);
}

/**
 * Ensures runtime limits are within governance boundaries.
 */
export function clampAgentRuntimeLimits(config: LLMAgentEnvConfig): LLMAgentEnvConfig {
  return {
    ...config,
    limits: {
      ...config.limits,
      maxCandidates: Math.min(10, Math.max(1, config.limits.maxCandidates)),
      maxCycles: Math.min(10, Math.max(1, config.limits.maxCycles)),
      minIntervalMs: Math.max(10000, config.limits.minIntervalMs) // Enforced 10s min for real LLMs
    }
  };
}

/**
 * Governance check for rate limit evasion.
 * This function is a placeholder for audit logic.
 */
export function auditProviderUsage(provider: string) {
  // Logic to ensure we are not rotating keys or accounts to evade limits.
  console.log(`[AUDIT] Using provider: ${provider}. Respecting ToS limits.`);
}
