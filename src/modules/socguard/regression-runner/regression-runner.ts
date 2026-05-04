import { CandidateRule } from '../rule-candidates';
import { CandidateRuleTestResult, RegressionRecommendation } from './regression-types';
import { getSampleLogs, SampleLog } from '../dataset/sample-logs';

/**
 * Parses a string representation of a regex (e.g., "/pattern/gi") into a RegExp object.
 */
function parseRegex(regexStr: string): RegExp {
  const match = regexStr.match(/\/(.*)\/([gimuy]*)/);
  if (match) {
    try {
      return new RegExp(match[1], match[2]);
    } catch (e) {
      return new RegExp(regexStr); // Fallback
    }
  }
  return new RegExp(regexStr);
}

/**
 * Evaluates a single candidate rule against the known dataset to identify performance metrics.
 */
export function testCandidateRuleAgainstDataset(
  candidateRule: CandidateRule, 
  sampleLogs: SampleLog[]
): CandidateRuleTestResult {
  const regex = parseRegex(candidateRule.suggestedPattern);
  
  let matchedBenign = 0;
  let matchedInjected = 0;
  const truePositiveMatches: string[] = [];
  const falsePositiveMatches: string[] = [];
  const exampleTruePositives: string[] = [];
  const exampleFalsePositives: string[] = [];

  sampleLogs.forEach(log => {
    const isMatch = regex.test(log.raw);
    regex.lastIndex = 0; // Reset lastIndex for global regex

    if (isMatch) {
      if (log.label === 'INJECTED') {
        matchedInjected++;
        truePositiveMatches.push(log.id);
        if (exampleTruePositives.length < 3) exampleTruePositives.push(log.raw);
      } else {
        matchedBenign++;
        falsePositiveMatches.push(log.id);
        if (exampleFalsePositives.length < 3) exampleFalsePositives.push(log.raw);
      }
    }
  });

  const precisionEstimate = matchedInjected + matchedBenign > 0 
    ? matchedInjected / (matchedInjected + matchedBenign) 
    : 0;
  
  // Recall is harder to estimate without knowing all possible matches, 
  // but we use the total injected logs in the dataset as a baseline.
  const totalInjected = sampleLogs.filter(l => l.label === 'INJECTED').length;
  const recallEstimate = totalInjected > 0 ? matchedInjected / totalInjected : 0;

  // Recommendation Logic
  let recommendation: RegressionRecommendation = 'REVISE';
  const reasons: string[] = [];

  if (matchedBenign > 0) {
    reasons.push(`Rule triggered ${matchedBenign} false positives.`);
    recommendation = matchedBenign > 2 ? 'REJECT' : 'REVISE';
  }

  if (matchedInjected > 0) {
    reasons.push(`Rule successfully caught ${matchedInjected} known injection(s).`);
    if (matchedBenign === 0) {
      recommendation = 'APPROVE_FOR_REVIEW';
    }
  } else {
    reasons.push('Rule did not catch any existing samples in the dataset.');
    if (matchedBenign === 0) {
      recommendation = 'REVISE'; // Low value rule
    }
  }

  return {
    candidateRuleId: candidateRule.id,
    totalSamples: sampleLogs.length,
    matchedBenign,
    matchedInjected,
    truePositiveMatches,
    falsePositiveMatches,
    falseNegativeRelated: 0,
    precisionEstimate,
    recallEstimate,
    exampleFalsePositives,
    exampleTruePositives,
    recommendation,
    reasons
  };
}

/**
 * Runs regression testing for a batch of candidate rules.
 */
export function runRegressionForCandidateRules(candidateRules: CandidateRule[]): CandidateRuleTestResult[] {
  const logs = getSampleLogs();
  return candidateRules.map(rule => testCandidateRuleAgainstDataset(rule, logs));
}
