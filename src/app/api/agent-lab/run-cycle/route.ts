import { NextRequest, NextResponse } from 'next/server';
import { getLLMAgentEnvConfig } from '@/modules/socguard/agent-adapters/server-env';
import { runSingleAgentLabCycle } from '@/modules/socguard/agent-adapters/lab-cycle-runner';
import { AgentRuntimeConfig } from '@/modules/socguard/agent-adapters/agent-types';

let lastApiBackedRunAt: number | null = null;

/**
 * Server-side API route to run a controlled agent lab cycle.
 * This route reads environment variables server-side and enforces safety limits.
 */
export async function POST(req: NextRequest) {
  try {
    const envConfig = getLLMAgentEnvConfig();

    if (envConfig.enabled) {
      const now = Date.now();
      const minInterval = Math.max(envConfig.limits.minIntervalMs || 10000, 10000);
      if (lastApiBackedRunAt && now - lastApiBackedRunAt < minInterval) {
        return NextResponse.json(
          { error: "Rate limit active. Please wait before running another API-backed cycle." },
          { status: 429 }
        );
      }
      lastApiBackedRunAt = now;
    }

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch (e) {
      // ignore
    }

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
    const requestedMaxCandidates = typeof body.maxCandidates === 'number' ? body.maxCandidates : envConfig.limits.maxCandidates || 3;
    const maxCandidates = Math.min(
      requestedMaxCandidates,
      envConfig.limits.maxCandidates || 3,
      10
    );

    // Execute Cycle
    const result = await runSingleAgentLabCycle(
      config,
      'api-route-run',
      maxCandidates,
      body.sourceContextNotes as any[]
    );

    // Return safe result (secrets are already handled by factory/adapters)
    return NextResponse.json(result);

  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    console.error('[API] Agent Lab Cycle Error:', {
      name: err.name,
      status: err.status || 500,
      message: 'Sanitized error log'
    });
    return NextResponse.json(
      { error: 'Agent lab cycle failed safely. Check server logs.' },
      { status: 500 }
    );
  }
}
