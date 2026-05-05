import { NextRequest, NextResponse } from 'next/server';
import { getLLMAgentEnvConfig } from '@/modules/socguard/agent-adapters/server-env';
import { runSingleAgentLabCycle } from '@/modules/socguard/agent-adapters/lab-cycle-runner';
import { AgentRuntimeConfig } from '@/modules/socguard/agent-adapters/agent-types';

/**
 * Server-side API route to run a controlled agent lab cycle.
 * This route reads environment variables server-side and enforces safety limits.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const envConfig = getLLMAgentEnvConfig();

    // Map server-side env to runtime config
    const config: AgentRuntimeConfig = {
      provider: envConfig.provider,
      enableLLMAgents: envConfig.enabled,
      maxCandidatesPerRun: envConfig.limits.maxCandidates,
      maxCyclesPerRun: envConfig.limits.maxCycles,
      intervalMs: envConfig.limits.minIntervalMs,
      requireSanitization: true,
      requireHumanReview: true,
      allowProductionMutation: false,
      allowAutoApproval: false,
      openai: envConfig.enabled ? {
        enabled: envConfig.enabled,
        baseUrl: envConfig.baseUrl,
        model: envConfig.model,
        apiKey: envConfig.apiKey,
        timeoutMs: envConfig.limits.timeoutMs,
        maxTokens: envConfig.limits.maxTokens,
        temperature: envConfig.limits.temperature
      } : undefined
    };

    // Enforcement & Clamping
    const maxCandidates = Math.min(
      Math.max(1, body.maxCandidates || envConfig.limits.maxCandidates),
      10
    );

    // Execute Cycle
    const result = await runSingleAgentLabCycle(
      config,
      'api-route-run',
      maxCandidates
    );

    // Return safe result (secrets are already handled by factory/adapters)
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[API] Agent Lab Cycle Error:', error);
    return NextResponse.json(
      { error: 'Failed to execute research cycle.', details: error.message },
      { status: 500 }
    );
  }
}
