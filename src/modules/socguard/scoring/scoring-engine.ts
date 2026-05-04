import { DetectionFinding, RiskScore, ScoringFactor } from '../types';

/**
 * Calculates the overall RiskScore based on a set of detection findings.
 * @param findings Array of findings detected in a log entry.
 * @returns An aggregated RiskScore object.
 */
export function calculateRiskScore(findings: DetectionFinding[]): RiskScore {
  let totalScore = 0;
  const factors: ScoringFactor[] = [];
  let totalConfidence = 0;

  if (findings.length === 0) {
    return {
      score: 0,
      confidence: 1,
      level: 'LOW',
      factors: []
    };
  }

  // Weighting rules
  findings.forEach(finding => {
    // 1. Severity Weights
    let severityPoints = 0;
    switch (finding.severity) {
      case 'CRITICAL': severityPoints = 40; break;
      case 'HIGH': severityPoints = 25; break;
      case 'MEDIUM': severityPoints = 12; break;
      case 'LOW': severityPoints = 5; break;
    }
    
    if (severityPoints > 0) {
      totalScore += severityPoints;
      factors.push({
        factor: 'Severity',
        points: severityPoints,
        reason: `Base points for ${finding.severity} severity finding (${finding.ruleId}).`
      });
    }

    // 2. Category Bonus Weights
    let categoryBonus = 0;
    switch (finding.category) {
      case 'DATA_EXFILTRATION': categoryBonus = 15; break;
      case 'INSTRUCTION_OVERRIDE': categoryBonus = 10; break;
      case 'SUSPICIOUS_ENCODING': categoryBonus = 8; break;
    }

    if (categoryBonus > 0) {
      totalScore += categoryBonus;
      factors.push({
        factor: 'Category Bonus',
        points: categoryBonus,
        reason: `Bonus points for high-risk category ${finding.category}.`
      });
    }

    totalConfidence += finding.confidence;
  });

  // Clamp final score to 100
  const finalScore = Math.min(100, totalScore);
  const avgConfidence = totalConfidence / findings.length;

  // Determine risk level
  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (finalScore > 80) level = 'CRITICAL';
  else if (finalScore > 50) level = 'HIGH';
  else if (finalScore > 20) level = 'MEDIUM';

  return {
    score: finalScore,
    confidence: avgConfidence,
    level,
    factors
  };
}
