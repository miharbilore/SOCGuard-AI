# SOCGuard AI: Risk Scoring Engine

## Overview
The Risk Scoring Engine aggregates findings from all detection layers and calculates a unified risk score (0-100) for each log entry. It is designed to be deterministic, explainable, and resistant to "score gaming" through caps and confidence-weighting.

## Scoring Formula

The score for each finding is calculated as:
`FindingScore = (SeverityBase + CategoryModifier) * Confidence`

### 1. Severity Base Scores
- **CRITICAL**: 45
- **HIGH**: 30
- **MEDIUM**: 15
- **LOW**: 5

### 2. Category Modifiers
- **DATA_EXFILTRATION**: +15
- **INSTRUCTION_OVERRIDE**: +12
- **PROMPT_LEAK_ATTEMPT**: +12
- **TOOL_ABUSE**: +12
- **FORMAT_CONTROL**: +8
- **ROLE_CONFUSION**: +8
- **OBFUSCATION**: +8
- **SUSPICIOUS_ENCODING**: +6
- **PROMPT_INJECTION**: +10

## Anti-Gaming Mechanisms

To prevent artificial score inflation from duplicate or low-confidence findings:

- **Rule Capping**: A single rule (Rule ID) can contribute a maximum of **50 points** to the total score.
- **Category Capping**: A single threat category can contribute a maximum of **60 points**.
- **Confidence Weighting**: Low-confidence detections (e.g., heuristic-based) have a reduced impact on the score compared to high-confidence matches.
- **De-duplication**: The engine tracks contributions per rule to ensure identical matches don't multiply the risk unfairly.

## Special Logic

- **Critical Single Finding Boost**: Any log entry containing at least one **CRITICAL** finding is automatically pushed to the **HIGH** risk range (minimum score of 50).
- **Category Diversity Bonus**: Multiple distinct threat categories (e.g., an instruction override combined with data exfiltration) add a diversity bonus of **5 points per additional category**.

## Risk Levels

| Score Range | Risk Level | Description |
| :--- | :--- | :--- |
| 0 - 19 | `LOW` | Benign or low-confidence anomalies. |
| 20 - 49 | `MEDIUM` | Suspicious behavior requiring investigation. |
| 50 - 79 | `HIGH` | Probable attack attempt; immediate review recommended. |
| 80 - 100 | `CRITICAL` | Confirmed high-impact threat; automated block/escalation likely. |

## Explainability
The `RiskScore` includes a list of `ScoringFactor` objects. Each factor links back to specific `relatedRuleIds` and `relatedFindingIds`, allowing analysts to see exactly which matches contributed to the final score and why.

## Why Deterministic?
SOCGuard uses a deterministic scoring model to ensure **reproducibility**. Given the same set of findings, the engine will always produce the same score, which is critical for auditability and consistent policy enforcement in SOC environments.

## Limitations
- **Statelessness**: Scoring is performed per-log-entry. It does not currently account for behavioral history of a specific user or source across multiple sessions.
- **Linear Aggregation**: While caps help, the engine primarily uses linear addition which might not capture complex non-linear threat relationships.
