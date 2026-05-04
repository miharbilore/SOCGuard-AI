import { 
  LogEntry, 
  AnalysisResult, 
  DatasetEvaluation, 
  EvaluationMetrics, 
  DifficultyMetric, 
  AttackVectorMetric, 
  CategoryMetric 
} from '../types';
import { analyzeLog as detectThreats } from '../detection';
import { calculateRiskScore } from '../scoring';
import { evaluatePolicy } from '../policy';
import { generateExplanation } from '../explainability';
import { getSampleLogs } from '../dataset/sample-logs';
import { createAnalysisId } from '../utils/crypto';

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
  
  // Generate a deterministic ID based on log content for reproducibility
  const analysisId = createAnalysisId(log.id, log.payload);

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
 * Calculates academic metrics including Precision, Recall, F1, and breakdowns.
 */
export function analyzeSampleDataset(): DatasetEvaluation {
  const samples = getSampleLogs();
  const results: AnalysisResult[] = [];
  
  let tp = 0; // True Positive
  let tn = 0; // True Negative
  let fp = 0; // False Positive
  let fn = 0; // False Negative
  let totalLatency = 0;

  // Breakdown aggregators
  const difficultyMap: Record<string, { total: number, detected: number }> = {
    'EASY': { total: 0, detected: 0 },
    'MEDIUM': { total: 0, detected: 0 },
    'HARD': { total: 0, detected: 0 }
  };
  
  const attackVectorMap: Record<string, { total: number, detected: number }> = {};
  const categoryMap: Record<string, number> = {};
  
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
    
    const isDetected = result.policyDecision !== 'SAFE';
    const isActuallyInjected = sample.label === 'INJECTED';

    // Confusion Matrix Logic
    if (isActuallyInjected) {
      if (isDetected) tp++; else fn++;
    } else {
      if (isDetected) fp++; else tn++;
    }

    // Difficulty Breakdown
    if (difficultyMap[sample.difficulty]) {
      difficultyMap[sample.difficulty].total++;
      if (isActuallyInjected && isDetected) {
        difficultyMap[sample.difficulty].detected++;
      }
    }

    // Attack Vector Breakdown
    if (sample.attackVector) {
      if (!attackVectorMap[sample.attackVector]) {
        attackVectorMap[sample.attackVector] = { total: 0, detected: 0 };
      }
      attackVectorMap[sample.attackVector].total++;
      if (isDetected) {
        attackVectorMap[sample.attackVector].detected++;
      }
    }

    // Category Breakdown (Frequency of findings)
    result.findings.forEach(f => {
      categoryMap[f.category] = (categoryMap[f.category] || 0) + 1;
    });
  }

  // Calculate Metrics
  const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 1;
  const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const accuracy = (tp + tn) / samples.length;

  const metrics: EvaluationMetrics = {
    totalLogs: samples.length,
    benignCount: samples.filter(s => s.label === 'BENIGN').length,
    injectedCount: samples.filter(s => s.label === 'INJECTED').length,
    truePositives: tp,
    trueNegatives: tn,
    falsePositives: fp,
    falseNegatives: fn,
    accuracy,
    precision,
    recall,
    f1Score: f1,
    detectionRate: recall,
    falsePositiveRate: tn + fp > 0 ? fp / (tn + fp) : 0,
    falseNegativeRate: tp + fn > 0 ? fn / (tp + fn) : 0,
    averageLatencyMs: totalLatency / samples.length
  };

  // Format breakdowns
  const perDifficulty: DifficultyMetric[] = Object.entries(difficultyMap).map(([difficulty, stats]) => ({
    difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD',
    total: stats.total,
    detected: stats.detected,
    missed: stats.total - stats.detected,
    detectionRate: stats.total > 0 ? stats.detected / stats.total : 1
  }));

  const perAttackVector: AttackVectorMetric[] = Object.entries(attackVectorMap).map(([vector, stats]) => ({
    attackVector: vector,
    total: stats.total,
    detected: stats.detected,
    missed: stats.total - stats.detected,
    detectionRate: stats.total > 0 ? stats.detected / stats.total : 1
  }));

  const perCategory: CategoryMetric[] = Object.entries(categoryMap).map(([cat, count]) => ({
    category: cat,
    count
  }));

  return {
    metrics,
    perDifficulty,
    perAttackVector,
    perCategory,
    results
  };
}
