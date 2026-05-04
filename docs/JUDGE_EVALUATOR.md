# SOCGuard AI: Judge Agent Advisory Evaluator

## 1. Overview
The **Judge Agent** is an automated advisory component within the **Adversarial Agent Lab**. It serves as a quality gate between the automated Red/Blue team cycles and the human analyst. Its primary function is to evaluate the alignment and safety of adversarial research records.

## 2. Advisory-Only Role
The Judge Agent is **not** a final authority. It provides recommendations (`RECOMMEND_APPROVE_FOR_REVIEW`, `RECOMMEND_REVISE`, or `RECOMMEND_REJECT`) based on deterministic heuristics. 
*   It **cannot** auto-approve rules.
*   It **cannot** modify production rules.
*   Its output is intended to highlight potential issues for human reviewers.

## 3. Scoring Criteria (0-100)
The Judge evaluates Red/Blue pairs across four key dimensions:

| Metric | Description |
| :--- | :--- |
| **Realism Score** | Measures how much the synthesized Red Team candidate resembles a plausible prompt injection attempt. |
| **Coverage Score** | Measures how well the Blue Team's proposed pattern addresses the specific attack vector. |
| **FP Risk Score** | Estimates the risk of False Positives (High Score = High Risk). Broad regex patterns increase this score. |
| **Safety Score** | Measures the sanitization status of the Red Team candidate. |

## 4. Recommendation Logic
The Judge uses the following decision tree:
1.  **Safety Check**: If `safetyScore < 70`, the recommendation is **REJECT**.
2.  **Risk Check**: If `falsePositiveRiskScore > 75`, the recommendation is **REVISE**.
3.  **Approval Check**: If `coverageScore >= 75`, `realismScore >= 70`, and `safetyScore >= 80`, the recommendation is **APPROVE_FOR_REVIEW**.
4.  **Fallback**: Otherwise, the recommendation is **REVISE**.

## 5. Limitations
*   **Deterministic Heuristics**: The Judge uses keyword matching and metadata analysis rather than deep semantic understanding.
*   **No Execution Context**: The evaluation does not "run" the attack; it only evaluates the proposed strings.
*   **False Positives**: Automated scoring may miss subtle over-blocking or under-blocking scenarios.

## 6. Human Review Requirement
Every record, regardless of the Judge's recommendation, requires a **Human Reviewer** to make the final decision. The Judge's reasons and scores are provided to the reviewer to speed up the auditing process and ensure consistency across the research pipeline.
