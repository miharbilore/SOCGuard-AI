import { NextResponse } from 'next/server';
import { getLLMAgentEnvConfig } from '@/modules/socguard/agent-adapters/server-env';

export async function GET() {
  const envConfig = getLLMAgentEnvConfig();

  return NextResponse.json({
    providerMode: envConfig.enabled ? 'API_BACKED' : 'MOCK',
    enableLLMAgents: envConfig.enabled,
    hasPrimaryApiKey: !!envConfig.apiKey,
    maxCandidatesPerRun: envConfig.limits.maxCandidates,
    maxCyclesPerRun: envConfig.limits.maxCycles,
    intervalMs: envConfig.limits.minIntervalMs
  });
}
