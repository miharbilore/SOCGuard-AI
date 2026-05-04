import { LogEntry, AnalysisResult } from '../types';
import { analyzeLog as detectThreats } from '../detection';
import { calculateRiskScore } from '../scoring';
import { evaluatePolicy } from '../policy';
import { generateExplanation } from '../explainability';
import { getSampleLogs } from '../dataset/sample-logs';

/**
 * Main Analysis Orchestrator.
 * Connects preprocessing, detection, scoring, policy, and explainability into a single pipeline.
 * 
 * @param log The raw log entry to analyze.
 * @returns Complete end-to-end analysis result.
 */
export function analyzeLog(log: LogEntry): AnalysisResult {
  const startTime = Date.now();
  
  // 1. Detection Phase (Deterministic Regex-based)
  // Note: analyzeLog in the detection module handles preprocessing internally.
  const findings = detectThreats(log);
  
  // 2. Risk Scoring Phase (Confidence-aware & capped)
  const riskScore = calculateRiskScore(findings);
  
  // 3. Policy Evaluation Phase (Deterministic overrides)
  const policyEvaluation = evaluatePolicy({ log, findings, riskScore });
  
  // 4. Explainability Phase (Deterministic rationale)
  const explanation = generateExplanation({ log, findings, riskScore, policyEvaluation });
  
  const endTime = Date.now();
  const latencyMs = endTime - startTime;
  
  // Generate a deterministic-ish ID based on log ID and timestamp
  const analysisId = `analysis-${log.id}-${startTime.toString(36)}`;

  return {
    id: analysisId,
    inputLog: log,
    findings,
    riskScore,
    policyDecision: policyEvaluation.decision,
    policyEvaluation,
    explanation,
    latencyMs,
    createdAt: new Date(startTime).toISOString()
  };
}

/**
 * Runs the analysis pipeline against the entire sample dataset for evaluation.
 */
export function analyzeSampleDataset() {
  const samples = getSampleLogs();
  const results: AnalysisResult[] = [];
  
  let benignCount = 0;
  let injectedCount = 0;
  let detectedInjectedCount = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let totalLatency = 0;
  
  for (const sample of samples) {
    const log: LogEntry = {
      id: sample.id,
      timestamp: new Date().toISOString(),
      source: sample.source,
      payload: sample.raw
    };
    
    const result = analyzeLog(log);
    results.push(result);
    totalLatency += result.latencyMs;
    
    // Logic for evaluation:
    // Decision is "detected" if it's ESCALATE, HUMAN_REVIEW, or BLOCK.
    const isDetected = result.policyDecision !== 'SAFE';
    
    if (sample.label === 'BENIGN') {
      benignCount++;
      if (isDetected) {
        falsePositives++;
      }
    } else {
      injectedCount++;
      if (isDetected) {
        detectedInjectedCount++;
      } else {
        falseNegatives++;
      }
    }
  }
  
  return {
    totalLogs: samples.length,
    benignCount,
    injectedCount,
    detectedInjectedCount,
    falsePositives,
    falseNegatives,
    averageLatencyMs: totalLatency / samples.length,
    results
  };
}
