import { 
  LogEntry, 
  DetectionFinding, 
  RiskScore, 
  PolicyEvaluation, 
  ExplanationResult,
  SuspiciousEvidence
} from '../types';

/**
 * Generates a deterministic, analyst-friendly explanation for a log analysis.
 * @param input Object containing all analysis components.
 * @returns Structured explanation result.
 */
export function generateExplanation(input: {
  log: LogEntry;
  findings: DetectionFinding[];
  riskScore: RiskScore;
  policyEvaluation: PolicyEvaluation;
}): ExplanationResult {
  const { findings, riskScore, policyEvaluation } = input;

  // 1. Generate High-Level Summary
  const summary = findings.length > 0 
    ? `Analysis identified ${findings.length} security findings with an aggregated risk score of ${riskScore.score}/100 (${riskScore.level}).`
    : `No security anomalies were detected in this log entry.`;

  // 2. Decision Rationale
  // Combines the policy decision with the specific reasons triggered by the engine.
  const decisionRationale = `The deterministic Policy Engine selected the '${policyEvaluation.decision}' action based on the following: ${policyEvaluation.reasons.join(' ')}`;

  // 3. Map Findings to Suspicious Evidence
  const suspiciousEvidence: SuspiciousEvidence[] = findings.map(f => {
    // Extract line number from the detection reason if present (formatted as "at line X")
    const lineMatch = f.reason?.match(/at line (\d+)/);
    const lineNumber = lineMatch ? parseInt(lineMatch[1], 10) : undefined;

    return {
      lineNumber,
      matchedText: f.matchedText,
      category: f.category,
      severity: f.severity,
      confidence: f.confidence,
      reason: f.reason,
      ruleId: f.ruleId
    };
  });

  // 4. Map Policy to Recommended Actions
  let recommendedAction = '';
  switch (policyEvaluation.decision) {
    case 'SAFE':
      recommendedAction = 'Continue normal monitoring. No immediate security action is required.';
      break;
    case 'ESCALATE':
      recommendedAction = 'Escalate to Tier 2 security analysts or review related SIEM/EDR context for the source system.';
      break;
    case 'HUMAN_REVIEW':
      recommendedAction = 'Require manual analyst validation before allowing this payload to interact with LLM assistants. Deterministic rules identified high-risk patterns.';
      break;
    case 'BLOCK':
      recommendedAction = 'Block or quarantine this input from the LLM workflow immediately. Initiate incident response to investigate the source for potential compromise.';
      break;
    default:
      recommendedAction = 'Follow standard operating procedures for unclassified logs.';
  }

  // 5. Analysis Limitations
  const limitations = [
    'The analysis is purely deterministic; it may miss novel or highly sophisticated semantic attacks not matching current signatures.',
    'Analysis is stateless and does not account for behavioral patterns spread across multiple log entries.',
    'The final decision is governed by fixed security policies and does not use probabilistic LLM reasoning.'
  ];

  return {
    summary,
    decisionRationale,
    suspiciousEvidence,
    scoringBreakdown: riskScore.factors,
    recommendedAction,
    limitations
  };
}
