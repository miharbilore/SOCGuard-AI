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
  const difficultyMap: Record<string, { 
    benign: number, 
    injected: number, 
    tp: number, 
    tn: number, 
    fp: number, 
    fn: number 
  }> = {
    'EASY': { benign: 0, injected: 0, tp: 0, tn: 0, fp: 0, fn: 0 },
    'MEDIUM': { benign: 0, injected: 0, tp: 0, tn: 0, fp: 0, fn: 0 },
    'HARD': { benign: 0, injected: 0, tp: 0, tn: 0, fp: 0, fn: 0 }
  };
  
  const attackVectorMap: Record<string, { total: number, detected: number }> = {};
  const categoryMap: Record<string, number> = {};
  const expectedCategoryMap: Record<string, number> = {};
  
  for (const sample of samples) {
    const log: LogEntry = {
      id: sample.id,
      timestamp: new Date().toISOString(),
      source: sample.source,
      payload: sample.raw
    };
    
    const result = analyzeLog(log);
    
    // Attach ground truth for evaluation table
    result.groundTruth = {
      label: sample.label,
      difficulty: sample.difficulty,
      attackVector: sample.attackVector || undefined,
      expectedCategory: sample.expectedCategory,
      shortDescription: sample.shortDescription
    };
    
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

    // Difficulty Breakdown Logic
    const diff = sample.difficulty;
    if (difficultyMap[diff]) {
      if (isActuallyInjected) {
        difficultyMap[diff].injected++;
        if (isDetected) difficultyMap[diff].tp++; else difficultyMap[diff].fn++;
      } else {
        difficultyMap[diff].benign++;
        if (isDetected) difficultyMap[diff].fp++; else difficultyMap[diff].tn++;
      }
    }

    // Attack Vector Breakdown
    if (sample.attackVector) {
      if (!attackVectorMap[sample.attackVector]) {
        attackVectorMap[sample.attackVector] = { total: 0, detected: 0 };
      }
      attackVectorMap[sample.attackVector].total++;
      if (isActuallyInjected && isDetected) {
        attackVectorMap[sample.attackVector].detected++;
      }
    }

    // Category Tracking
    if (sample.expectedCategory) {
      expectedCategoryMap[sample.expectedCategory] = (expectedCategoryMap[sample.expectedCategory] || 0) + 1;
    }
    
    result.findings.forEach(f => {
      categoryMap[f.category] = (categoryMap[f.category] || 0) + 1;
    });
  }

  // Calculate Global Metrics
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
    falsePositiveRate: (tn + fp > 0) ? fp / (tn + fp) : 0,
    falseNegativeRate: (tp + fn > 0) ? fn / (tp + fn) : 0,
    averageLatencyMs: totalLatency / samples.length
  };

  // Format perDifficulty breakdown
  const perDifficulty: DifficultyMetric[] = Object.entries(difficultyMap).map(([difficulty, stats]) => ({
    difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD',
    total: stats.benign + stats.injected,
    benignCount: stats.benign,
    injectedCount: stats.injected,
    truePositives: stats.tp,
    trueNegatives: stats.tn,
    falsePositives: stats.fp,
    falseNegatives: stats.fn,
    detectionRateOnInjected: stats.injected > 0 ? stats.tp / stats.injected : 1,
    falsePositiveRateOnBenign: stats.benign > 0 ? stats.fp / stats.benign : 0
  }));

  const perAttackVector: AttackVectorMetric[] = Object.entries(attackVectorMap).map(([vector, stats]) => ({
    attackVector: vector,
    total: stats.total,
    detected: stats.detected,
    missed: stats.total - stats.detected,
    detectionRate: stats.total > 0 ? stats.detected / stats.total : 1
  }));

  const perCategory: CategoryMetric[] = Object.entries(expectedCategoryMap).map(([cat, expectedCount]) => {
    const detectedCount = categoryMap[cat] || 0;
    return {
      category: cat,
      count: detectedCount,
      expectedCount,
      coveragePercentage: expectedCount > 0 ? Math.min(100, (detectedCount / expectedCount) * 100) : 100
    };
  });

  return {
    metrics,
    perDifficulty,
    perAttackVector,
    perCategory,
    results
  };
}
