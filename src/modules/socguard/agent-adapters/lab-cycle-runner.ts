import { 
  AgentRuntimeConfig, 
  CuratedRuleVaultEntry
} from './index';
import { createAgentSet } from './agent-factory';
import { analyzeLog } from '../demo/analyze-log';
import { 
  RedTeamCandidate, 
  BlueTeamProposal, 
  JudgeRecommendation,
  AdversarialLabRecord
} from '../adversarial-lab/adversarial-types';
import { sanitizeRedTeamCandidate } from '../adversarial-lab/safety-sanitizer';
import { AnalysisResult, LogEntry } from '../types';

export type NextStepRecommendation = 
  | 'ADD_TO_REVIEW_QUEUE' 
  | 'ADD_TO_BENCHMARK_ONLY' 
  | 'NEEDS_RULE_CANDIDATE' 
  | 'MONITOR';

export interface AgentLabCycleRecord {
  redTeamCandidate: RedTeamCandidate;
  analysisResult: AnalysisResult;
  wasDetected: boolean;
  wasMissed: boolean;
  policyDecision: string;
  riskScore: number;
  matchedCategories: string[];
  blueTeamProposal: BlueTeamProposal;
  judgeRecommendation: JudgeRecommendation;
  curatedRuleVaultEntry: CuratedRuleVaultEntry;
  recommendedNextStep: NextStepRecommendation;
}

export interface AgentLabCycleResult {
  id: string;
  createdAt: string;
  totalCandidates: number;
  detectedCount: number;
  missedCount: number;
  highRiskCount: number;
  curatedEntries: CuratedRuleVaultEntry[];
  records: AgentLabCycleRecord[];
  warnings: string[];
}

export interface AgentLabSessionResult {
  id: string;
  createdAt: string;
  cyclesRun: number;
  totalCandidates: number;
  detectedCount: number;
  missedCount: number;
  curatedEntries: CuratedRuleVaultEntry[];
  cycleResults: AgentLabCycleResult[];
  warnings: string[];
}

import { SourceIntelligenceNote } from '../source-intelligence/source-types';

/**
 * Runs a single research cycle using the agent pipeline.
 * Each cycle: Red -> Sanitize -> V1 Analyze -> Blue -> Judge -> Curator.
 */
export async function runSingleAgentLabCycle(
  config: AgentRuntimeConfig,
  sourceId: string,
  maxCandidates: number = 3,
  sourceContextNotes?: SourceIntelligenceNote[]
): Promise<AgentLabCycleResult> {
  const agents = createAgentSet(config);
  const redAgent = agents.redTeam;
  const blueAgent = agents.blueTeam;
  const judgeAgent = agents.judge;
  const curatorAgent = agents.curator;

  const candidates = await redAgent.generate({ sourceId, maxCandidates, sourceContextNotes });
  const limitedCandidates = candidates.slice(0, maxCandidates);
  
  const records: AgentLabCycleRecord[] = [];
  const curatedEntries: CuratedRuleVaultEntry[] = [];
  const warnings: string[] = [];

  let detectedCount = 0;
  let missedCount = 0;
  let highRiskCount = 0;

  for (const rawCandidate of limitedCandidates) {
    // 1. Sanitize (Mandatory Safety)
    const sanitizedCandidate = sanitizeRedTeamCandidate(rawCandidate);
    
    if (sanitizedCandidate.safetyStatus === 'REJECTED') {
      warnings.push("Rejected Red Team candidate skipped by sanitizer.");
      continue;
    }
    
    // 2. V1 Detection Benchmark
    const logEntry: LogEntry = {
      id: `lab-${sanitizedCandidate.id}`,
      timestamp: sanitizedCandidate.createdAt,
      source: 'adversarial-lab-runner',
      payload: sanitizedCandidate.sanitizedPrompt
    };
    const analysisResult = analyzeLog(logEntry);

    // 3. Blue Team Defense Proposal
    const proposal = await blueAgent.propose({ candidate: sanitizedCandidate });

    // 4. Judge Advisory Evaluation
    const judge = await judgeAgent.evaluate({ candidate: sanitizedCandidate, proposal });

    // 5. Curator Vault Entry Creation
    const vaultEntry = await curatorAgent.curate({ candidate: sanitizedCandidate, proposal, judge });
    curatedEntries.push(vaultEntry);

    // 6. Analytics
    const isDetected = ['BLOCK', 'HUMAN_REVIEW', 'ESCALATE'].includes(analysisResult.policyDecision);
    const isMissed = analysisResult.policyDecision === 'SAFE';
    
    if (isDetected) detectedCount++;
    if (isMissed) missedCount++;
    if (analysisResult.riskScore.score > 70) highRiskCount++;

    // 7. Decision Mapping
    let recommendedNextStep: NextStepRecommendation = 'MONITOR';
    if (isMissed) {
      recommendedNextStep = 'NEEDS_RULE_CANDIDATE';
    } else if (isDetected && judge.realismScore > 80) {
      recommendedNextStep = 'ADD_TO_BENCHMARK_ONLY';
    } else if (!isDetected && analysisResult.riskScore.score > 40) {
      recommendedNextStep = 'ADD_TO_REVIEW_QUEUE';
    }

    records.push({
      redTeamCandidate: sanitizedCandidate,
      analysisResult,
      wasDetected: isDetected,
      wasMissed: isMissed,
      policyDecision: analysisResult.policyDecision,
      riskScore: analysisResult.riskScore.score,
      matchedCategories: analysisResult.riskScore.factors.map(f => f.factor),
      blueTeamProposal: proposal,
      judgeRecommendation: judge,
      curatedRuleVaultEntry: vaultEntry,
      recommendedNextStep
    });
  }

  return {
    id: `CYCLE-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    totalCandidates: limitedCandidates.length,
    detectedCount,
    missedCount,
    highRiskCount,
    curatedEntries,
    records,
    warnings
  };
}

/**
 * Runs a limited research session consisting of multiple cycles.
 * Enforces strict safety limits to prevent runaway execution or cost.
 */
export async function runLimitedAgentLabSession(
  cycles: number,
  intervalMs: number,
  maxCandidatesPerCycle: number,
  config: AgentRuntimeConfig,
  sourceContextNotes?: SourceIntelligenceNote[]
): Promise<AgentLabSessionResult> {
  // Safety Limits
  const safeCycles = Math.min(Math.max(1, cycles), 10);
  const safeInterval = Math.max(intervalMs, 1000);
  const safeMaxCandidates = Math.min(Math.max(1, maxCandidatesPerCycle), 10);

  const cycleResults: AgentLabCycleResult[] = [];
  const warnings: string[] = [];

  if (cycles > 10) warnings.push(`Session limited to 10 cycles (requested ${cycles})`);
  if (intervalMs < 1000) warnings.push(`Interval increased to minimum 1000ms`);

  for (let i = 0; i < safeCycles; i++) {
    const cycle = await runSingleAgentLabCycle(config, `session-cycle-${i}`, safeMaxCandidates, sourceContextNotes);
    cycleResults.push(cycle);
    
    if (i < safeCycles - 1) {
      await new Promise(resolve => setTimeout(resolve, safeInterval));
    }
  }

  const totalCandidates = cycleResults.reduce((sum, c) => sum + c.totalCandidates, 0);
  const totalDetected = cycleResults.reduce((sum, c) => sum + c.detectedCount, 0);
  const totalMissed = cycleResults.reduce((sum, c) => sum + c.missedCount, 0);
  const totalCurated = cycleResults.reduce((sum, c) => sum + c.curatedEntries.length, 0);

  return {
    id: `SESS-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    cyclesRun: safeCycles,
    totalCandidates,
    detectedCount: totalDetected,
    missedCount: totalMissed,
    curatedEntries: cycleResults.flatMap(c => c.curatedEntries),
    cycleResults,
    warnings
  };
}

/**
 * Provides a high-level summary of a research session.
 */
export function summarizeAgentLabSession(result: AgentLabSessionResult) {
  const detectionRate = result.totalCandidates > 0 
    ? ((result.detectedCount / result.totalCandidates) * 100).toFixed(1) 
    : '0';

  return {
    id: result.id,
    summary: `Session ${result.id} completed ${result.cyclesRun} cycles.`,
    stats: {
      candidates: result.totalCandidates,
      detected: result.detectedCount,
      missed: result.missedCount,
      detectionRate: `${detectionRate}%`,
      curated: result.curatedEntries.length
    },
    performance: result.missedCount > 0 
      ? 'Action Required: Detection Gaps Identified' 
      : 'Stable: Current Rules Covering Lab Candidates',
    warnings: result.warnings
  };
}
