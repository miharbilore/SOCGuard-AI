# SOCGuard AI: Risk Scoring Engine

## Overview
The Risk Scoring Engine aggregates findings from all detection engines and calculates a unified risk score (0-100) for each log entry. It translates raw technical anomalies into a prioritized risk level.

## Scoring Logic
The final score is a weighted sum based on two primary dimensions: **Severity** and **Category**.

### 1. Severity Weights (Base Points)
- **CRITICAL**: +40
- **HIGH**: +25
- **MEDIUM**: +12
- **LOW**: +5

### 2. Category Bonus Weights (Additional Points)
- **DATA_EXFILTRATION**: +15
- **INSTRUCTION_OVERRIDE**: +10
- **SUSPICIOUS_ENCODING**: +8

## Risk Levels
The numeric score is mapped to the following categorical levels:
- **0-20**: LOW
- **21-50**: MEDIUM
- **51-80**: HIGH
- **81-100**: CRITICAL

## Explainability
For every score calculated, the engine provides a list of `factors`. Each factor includes:
- **Factor**: The source of the points (e.g., Severity).
- **Points**: The numeric impact on the total score.
- **Reason**: A human-readable explanation of why this factor was applied.

## Constraints
- **Clamping**: The final score is always capped at **100**, even if multiple high-risk findings are present.
- **Confidence**: The total confidence score is an average of the confidence levels of each individual finding.
