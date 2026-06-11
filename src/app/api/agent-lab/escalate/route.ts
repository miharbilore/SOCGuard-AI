import { NextRequest, NextResponse } from 'next/server';
import { runEscalatedAgentLabCycle } from '@/modules/socguard/agent-adapters/lab-cycle-runner';
import { getLLMAgentEnvConfig } from '@/modules/socguard/agent-adapters/server-env';

export async function POST(req: NextRequest) {
  try {
    const envConfig = getLLMAgentEnvConfig();

    if (!envConfig.enabled || !envConfig.hasApiKey) {
      return NextResponse.json({ 
        error: "Server configuration error", 
        details: "LLM Agents are disabled or missing API key on the server."
      }, { status: 503 });
    }

    const body = await req.json();
    const { escalatedLog } = body;

    if (!escalatedLog) {
      return NextResponse.json({ error: "Missing escalatedLog" }, { status: 400 });
    }

    // Run the specialized cycle
    const result = await runEscalatedAgentLabCycle(envConfig, escalatedLog);

    // Save to Database
    const prisma = (await import('@/lib/prisma')).default;

    await prisma.$transaction(async (tx: any) => {
      // 1. Session
      await tx.agentLabSession.create({
        data: {
          id: result.id,
          cyclesRun: 1,
          totalCandidates: result.totalCandidates,
          detectedCount: result.detectedCount,
          missedCount: result.missedCount,
          createdAt: new Date(result.createdAt),
          warnings: JSON.stringify(result.warnings)
        }
      });

      // 2. Records and Rule Vault Entries
      for (const record of result.records) {
        await tx.agentLabCycleRecord.create({
          data: {
            sessionId: result.id,
            attackType: record.redTeamCandidate.attackType,
            redTeamCandidate: JSON.stringify(record.redTeamCandidate),
            analysisResult: JSON.stringify(record.analysisResult),
            wasDetected: record.wasDetected,
            riskScore: record.riskScore,
            matchedCategories: JSON.stringify(record.analysisResult.riskScore.factors?.map((f: any) => f.factor) || []),
            blueTeamProposal: JSON.stringify(record.blueTeamProposal),
            judgeRecommendation: JSON.stringify(record.judgeRecommendation),
            recommendedNextStep: record.recommendedNextStep
          }
        });

        const vaultEntry = record.curatedRuleVaultEntry;
        await tx.ruleVaultEntry.create({
          data: {
            id: vaultEntry.id,
            sourceType: vaultEntry.sourceType,
            attackType: vaultEntry.attackType,
            sanitizedLog: vaultEntry.sanitizedLog,
            suggestedPattern: vaultEntry.suggestedPattern.replace(/^\/|\/[gimsuy]*$/g, ''),
            proposedCategory: vaultEntry.proposedCategory,
            severity: vaultEntry.severity,
            confidence: vaultEntry.confidence,
            falsePositiveRisks: JSON.stringify(vaultEntry.falsePositiveRisks),
            status: vaultEntry.status,
            provenance: vaultEntry.provenance,
            createdAt: new Date(vaultEntry.createdAt)
          }
        });
      }

      await tx.auditTrailEntry.create({
        data: {
          actor: 'SOCAnalyst',
          action: 'ESCALATE_THREAT',
          notes: `Escalated zero-day threat directly to Blue Team.`
        }
      });
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] Agent Lab Escalation Error:', error);
    return NextResponse.json({ 
      error: "Failed to run escalated cycle", 
      details: error.message 
    }, { status: 500 });
  }
}
