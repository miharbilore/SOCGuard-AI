import { DetectionFinding, RiskScore, ScoringFactor, DetectionCategory } from '../types';

const SEVERITY_BASE_SCORES = {
  CRITICAL: 45,
  HIGH: 30,
  MEDIUM: 15,
  LOW: 5
};

const CATEGORY_MODIFIERS: Record<DetectionCategory, number> = {
  DATA_EXFILTRATION: 15,
  INSTRUCTION_OVERRIDE: 12,
  PROMPT_LEAK_ATTEMPT: 12,
  TOOL_ABUSE: 12,
  FORMAT_CONTROL: 8,
  OBFUSCATION: 8,
  SUSPICIOUS_ENCODING: 6,
  ROLE_CONFUSION: 8,
  PROMPT_INJECTION: 10,
  BENIGN: 0
};

const MAX_POINTS_PER_RULE = 50;
const MAX_POINTS_PER_CATEGORY = 60;

/**
 * Calculates the overall RiskScore based on a set of detection findings.
 * @param findings Array of findings detected in a log entry.
 * @returns An aggregated RiskScore object.
 */
export function calculateRiskScore(findings: DetectionFinding[]): RiskScore {
  if (findings.length === 0) {
    return { score: 0, confidence: 1, level: 'LOW', factors: [] };
  }

  const factors: ScoringFactor[] = [];
  const ruleContributions: Record<string, number> = {};
  const categoryContributions: Record<string, number> = {};
  const uniqueCategories = new Set<DetectionCategory>();
  
  let weightedConfidenceSum = 0;
  let weightSum = 0;
  let rawTotalScore = 0;
  let hasCriticalFinding = false;

  // Process each finding
  findings.forEach(finding => {
    const baseScore = SEVERITY_BASE_SCORES[finding.severity] || 0;
    const categoryModifier = CATEGORY_MODIFIERS[finding.category] || 0;
    
    // Confidence-weighted individual finding score
    const findingScore = (baseScore + categoryModifier) * finding.confidence;
    
    // Check caps for Rule ID
    const currentRuleScore = ruleContributions[finding.ruleId] || 0;
    const remainingRuleCap = Math.max(0, MAX_POINTS_PER_RULE - currentRuleScore);
    const ruleContribution = Math.min(findingScore, remainingRuleCap);
    
    if (ruleContribution > 0) {
      // Check caps for Category
      const currentCategoryScore = categoryContributions[finding.category] || 0;
      const remainingCategoryCap = Math.max(0, MAX_POINTS_PER_CATEGORY - currentCategoryScore);
      const finalFindingContribution = Math.min(ruleContribution, remainingCategoryCap);

      if (finalFindingContribution > 0) {
        rawTotalScore += finalFindingContribution;
        ruleContributions[finding.ruleId] = currentRuleScore + finalFindingContribution;
        categoryContributions[finding.category] = currentCategoryScore + finalFindingContribution;
        uniqueCategories.add(finding.category);
        
        if (finding.severity === 'CRITICAL') hasCriticalFinding = true;

        factors.push({
          factor: `Finding: ${finding.ruleId}`,
          points: Math.round(finalFindingContribution),
          reason: `${finding.severity} severity ${finding.category} finding with ${Math.round(finding.confidence * 100)}% confidence.`,
          relatedRuleIds: [finding.ruleId],
          relatedFindingIds: [finding.id]
        });
      }
    }

    // Accumulate confidence for weighted average
    weightedConfidenceSum += finding.confidence * findingScore;
    weightSum += findingScore;
  });

  // Diversity Bonus: More distinct high-risk categories increase the score
  if (uniqueCategories.size > 1) {
    const diversityBonus = (uniqueCategories.size - 1) * 5;
    rawTotalScore += diversityBonus;
    factors.push({
      factor: 'Category Diversity Bonus',
      points: diversityBonus,
      reason: `Increased risk due to multiple distinct threat categories: ${Array.from(uniqueCategories).join(', ')}.`
    });
  }

  // Critical Finding Floor: Ensure a single CRITICAL finding pushes score to HIGH range (51+)
  if (hasCriticalFinding && rawTotalScore < 51) {
    const boost = 51 - rawTotalScore;
    rawTotalScore = 51;
    factors.push({
      factor: 'Critical Finding Boost',
      points: boost,
      reason: 'Score adjusted to HIGH range due to presence of at least one CRITICAL finding.'
    });
  }

  const finalScore = Math.min(100, Math.round(rawTotalScore));
  const avgConfidence = weightSum > 0 ? weightedConfidenceSum / weightSum : 1;

  // Determine risk level
  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (finalScore >= 80) level = 'CRITICAL';
  else if (finalScore >= 51) level = 'HIGH';
  else if (finalScore >= 21) level = 'MEDIUM';

  return {
    score: finalScore,
    confidence: Number(avgConfidence.toFixed(2)),
    level,
    factors
  };
}
