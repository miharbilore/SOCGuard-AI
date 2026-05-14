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

    // PERSISTENCE: Save session and records to Prisma
    try {
      const prisma = (await import('@/lib/prisma')).default;
      
      await prisma.$transaction(async (tx) => {
        // Create the session and cycle records
        const session = await tx.agentLabSession.create({
          data: {
            cyclesRun: 1,
            totalCandidates: result.totalCandidates,
            detectedCount: result.detectedCount,
            missedCount: result.missedCount,
            warnings: JSON.stringify(result.warnings),
            cycleResults: {
              create: result.records.map(record => ({
                redTeamCandidateId: record.redTeamCandidate.id,
                attackType: record.redTeamCandidate.attackType,
                sanitizedPrompt: record.redTeamCandidate.sanitizedPrompt,
                wasDetected: record.wasDetected,
                wasMissed: !record.wasDetected,
                policyDecision: record.analysisResult.decision,
                riskScore: record.riskScore,
                matchedCategories: JSON.stringify(record.analysisResult.matchedCategories),
                blueTeamProposal: JSON.stringify(record.blueTeamProposal),
                judgeRecommendation: JSON.stringify(record.judgeRecommendation),
                curatedRuleVaultId: record.curatedRuleVaultEntry?.id,
                recommendedNextStep: record.recommendedNextStep
              }))
            }
          }
        });

        // Create the RuleVaultEntry records for each record that has one
        for (const record of result.records) {
          if (record.curatedRuleVaultEntry) {
            await tx.ruleVaultEntry.create({
              data: {
                id: record.curatedRuleVaultEntry.id,
                sourceType: record.curatedRuleVaultEntry.sourceType,
                attackType: record.curatedRuleVaultEntry.attackType,
                sanitizedLog: record.curatedRuleVaultEntry.sanitizedLog,
                proposedCategory: record.curatedRuleVaultEntry.proposedCategory,
                suggestedPattern: record.curatedRuleVaultEntry.suggestedPattern,
                severity: record.curatedRuleVaultEntry.severity,
                confidence: record.curatedRuleVaultEntry.confidence,
                falsePositiveRisks: JSON.stringify(record.curatedRuleVaultEntry.falsePositiveRisks),
                status: record.curatedRuleVaultEntry.status,
                provenance: record.curatedRuleVaultEntry.provenance,
                createdAt: new Date(record.curatedRuleVaultEntry.createdAt)
              }
            });
          }
        }

        // Create an audit entry for the cycle
        await tx.auditTrailEntry.create({
          data: {
            actor: 'AgentLabRunner',
            action: 'RUN_CYCLE',
            notes: `Executed 1 research cycle with ${result.totalCandidates} candidates. Detected: ${result.detectedCount}, Missed: ${result.missedCount}.`
          }
        });
      });
    } catch (dbError) {
      console.error('[API] DB Save Error (Session/Vault):', dbError);
    }

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
