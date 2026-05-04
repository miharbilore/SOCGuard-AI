import { LogEntry, DetectionFinding, RiskScore, PolicyEvaluation, PolicyDecision } from '../types';

/**
 * Priority mapping for policy decisions. Higher number means more restrictive action.
 */
const DECISION_PRIORITY: Record<PolicyDecision, number> = {
  'SAFE': 0,
  'ESCALATE': 1,
  'HUMAN_REVIEW': 2,
  'BLOCK': 3
};

/**
 * Evaluates the final policy decision based on risk score and specific finding overrides.
 * @param input Object containing log, findings, and riskScore.
 * @returns Detailed policy evaluation result.
 */
export function evaluatePolicy(input: {
  log: LogEntry;
  findings: DetectionFinding[];
  riskScore: RiskScore;
}): PolicyEvaluation {
  const { findings, riskScore } = input;
  const reasons: string[] = [];
  const triggeredRules: string[] = [];
  
  // 1. Base decision by risk score thresholds
  let decision: PolicyDecision = 'SAFE';
  
  if (riskScore.score >= 81) {
    decision = 'BLOCK';
    reasons.push(`Risk score ${riskScore.score} reached CRITICAL threshold (>=81).`);
  } else if (riskScore.score >= 51) {
    decision = 'HUMAN_REVIEW';
    reasons.push(`Risk score ${riskScore.score} reached HIGH threshold (>=51).`);
  } else if (riskScore.score >= 21) {
    decision = 'ESCALATE';
    reasons.push(`Risk score ${riskScore.score} reached MEDIUM threshold (>=21).`);
  } else {
    reasons.push(`Risk score ${riskScore.score} is in the LOW/SAFE range (<=20).`);
  }

  // 2. Security Policy Override Rules
  // These rules ensure that specific high-risk patterns trigger appropriate actions
  // regardless of the aggregate numeric score.
  let minimumRequiredAction: PolicyDecision = 'SAFE';

  findings.forEach(finding => {
    // Override: Any CRITICAL severity finding triggers at least HUMAN_REVIEW
    if (finding.severity === 'CRITICAL') {
      updateMinAction('HUMAN_REVIEW', `Security Policy: CRITICAL severity finding detected (${finding.ruleId}).`, finding.ruleId);
    }

    // Override: High-risk categories with high severity trigger BLOCK
    if ((finding.category === 'DATA_EXFILTRATION' || finding.category === 'TOOL_ABUSE') && 
        (finding.severity === 'HIGH' || finding.severity === 'CRITICAL')) {
      updateMinAction('BLOCK', `Security Policy: High-risk ${finding.category} attempt detected.`, finding.ruleId);
    }

    // Override: Prompt leakage attempts trigger at least HUMAN_REVIEW
    if (finding.category === 'PROMPT_LEAK_ATTEMPT' && 
        (finding.severity === 'HIGH' || finding.severity === 'CRITICAL')) {
      updateMinAction('HUMAN_REVIEW', `Security Policy: High-risk Prompt Leak attempt detected.`, finding.ruleId);
    }

    // Override: High-confidence instruction overrides trigger at least HUMAN_REVIEW
    if (finding.category === 'INSTRUCTION_OVERRIDE' && finding.confidence >= 0.8) {
      updateMinAction('HUMAN_REVIEW', `Security Policy: High-confidence Instruction Override detected.`, finding.ruleId);
    }
  });

  /**
   * Helper to update the minimum required action if the new action is higher priority.
   */
  function updateMinAction(action: PolicyDecision, reason: string, ruleId: string) {
    if (DECISION_PRIORITY[action] > DECISION_PRIORITY[minimumRequiredAction]) {
      minimumRequiredAction = action;
    }
    reasons.push(reason);
    triggeredRules.push(ruleId);
  }

  // Apply the most restrictive decision
  if (DECISION_PRIORITY[minimumRequiredAction] > DECISION_PRIORITY[decision]) {
    decision = minimumRequiredAction;
    reasons.push(`Final action upgraded to ${decision} based on Security Policy overrides.`);
  }

  // Edge case: Default to SAFE if no findings exist
  if (findings.length === 0) {
    decision = 'SAFE';
    reasons.push('No detection findings identified.');
  }

  // Generate Analyst Guidance
  let analystGuidance = '';
  switch (decision) {
    case 'BLOCK':
      analystGuidance = 'Immediate threat detected. Payload should be blocked and the source system investigated for potential compromise.';
      break;
    case 'HUMAN_REVIEW':
      analystGuidance = 'Potentially malicious activity detected. A security analyst should manually review the log for indirect prompt injection.';
      break;
    case 'ESCALATE':
      analystGuidance = 'Suspicious activity detected. Activity should be monitored and escalated if additional alerts occur.';
      break;
    default:
      analystGuidance = 'No immediate security action required based on current deterministic rules.';
  }

  return {
    decision,
    reasons: Array.from(new Set(reasons)),
    triggeredRules: Array.from(new Set(triggeredRules)),
    minimumRequiredAction,
    analystGuidance
  };
}
