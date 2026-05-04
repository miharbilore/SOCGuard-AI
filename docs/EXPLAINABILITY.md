# SOCGuard AI: Explainability Engine

## Overview
The Explainability Engine provides SOC analysts with clear, deterministic, and audit-ready justifications for every security classification. Unlike LLM-generated explanations which can be prone to hallucination, the SOCGuard explainability layer uses direct mappings from detection findings and policy logic to ensure 100% accuracy in its reporting.

## Output Fields

| Field | Description |
| :--- | :--- |
| `summary` | A high-level overview of the number of findings and the aggregate risk score. |
| `decisionRationale` | A step-by-step breakdown of why the Policy Engine selected a specific action (SAFE, BLOCK, etc.). |
| `suspiciousEvidence` | A list of concrete triggers found in the log, including line numbers and matched text. |
| `scoringBreakdown` | A transparent view of how points were added to the risk score, including caps and modifiers. |
| `recommendedAction` | Specific, actionable guidance for the SOC analyst based on the final decision. |
| `limitations` | Explicit statements about what the analysis *cannot* guarantee (e.g., zero-day coverage). |

## Example Explanation

**Summary**: Analysis identified 2 security findings with an aggregated risk score of 60/100 (HIGH).

**Decision Rationale**: The deterministic Policy Engine selected the 'BLOCK' action based on the following: Risk score 60 reached HIGH threshold (>=51). Security Policy: High-risk DATA_EXFILTRATION attempt detected. Final action upgraded to BLOCK based on Security Policy overrides.

**Suspicious Evidence**:
- Line 1: `reveal system prompt` (Category: PROMPT_LEAK_ATTEMPT, Severity: HIGH)
- Line 3: `send data to http://evil.com` (Category: DATA_EXFILTRATION, Severity: CRITICAL)

**Recommended Action**: Block or quarantine this input from the LLM workflow immediately. Initiate incident response to investigate the source for potential compromise.

## Why Deterministic Explainability Matters
1.  **Trust**: Analysts can verify the explanation by looking at the raw logs and the deterministic rule library.
2.  **Speed**: Deterministic explanations are generated instantly, without waiting for LLM inference.
3.  **Consistency**: Identical attacks will always produce identical explanations.
4.  **No Hallucination**: The engine only reports what was actually matched; it never "guesses" intent beyond the defined rules.

## Limitations
- **No Semantic Reasoning**: The engine cannot explain the "why" behind an attacker's strategy, only the "what" that was detected.
- **Rule Dependency**: The quality of explanation is directly tied to the metadata provided in the `DETERMINISTIC_RULES` library.
- **Statelessness**: It cannot explain patterns that emerge over a long period of time across multiple sessions.
