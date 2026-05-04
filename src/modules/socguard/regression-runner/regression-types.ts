export type RegressionRecommendation = 'APPROVE_FOR_REVIEW' | 'REVISE' | 'REJECT';

export interface CandidateRuleTestResult {
  candidateRuleId: string;
  totalSamples: number;
  matchedBenign: number;
  matchedInjected: number;
  truePositiveMatches: string[];
  falsePositiveMatches: string[];
  falseNegativeRelated: number; // For future use
  precisionEstimate: number;
  recallEstimate: number;
  exampleFalsePositives: string[];
  exampleTruePositives: string[];
  recommendation: RegressionRecommendation;
  reasons: string[];
}
