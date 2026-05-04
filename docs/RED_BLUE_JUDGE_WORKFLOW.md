# V3: Red Team vs. Blue Team Workflow

## 1. Agent Roles & Responsibilities

### 1.1 Red Team Agent (Adversarial Generator)
The Red Team Agent synthesizes new prompt injection variants.
*   **Attack Categories**:
    *   Instruction Override & Hijacking
    *   Jailbreak & Behavioral Bypass
    *   Fragmented Payload & Concatenation
    *   Prefix/Suffix Injection
    *   Few-shot Misleading Contexts
    *   Translation/Multi-lingual Bypass
    *   Indirect RAG (Retrieval Augmented Generation) Injection
    *   Syntax/Markdown Escape
*   **Safety Restriction**: Must redact all potentially harmful operational content using standard placeholders:
    *   `[REDACTED_HARMFUL_REQUEST]`
    *   `[REDACTED_SECRET]`
    *   `[REDACTED_EXFIL_TARGET]`
    *   `[REDACTED_MALWARE_ACTION]`

### 1.2 Blue Team Agent (Defense Proposer)
The Blue Team Agent analyzes the Red Team variants and proposes detection strategies.
*   **Outputs**:
    *   Detection Category and Severity.
    *   Candidate Deterministic Rule (Regex/Keyword).
    *   Confidence Score.
    *   Analysis of False Positive risks.
    *   "Hard Negative" test case suggestions to ensure precision.
    *   Explanation of the defense rationale.

### 1.3 Judge Agent (Advisory Evaluator)
The Judge Agent acts as an automated quality gate between the Agents and the Human Reviewer.
*   **Evaluation Criteria**: Realism of attack, coverage of the rule, and regression test results.
*   **Decision Power**: **ADVISORY ONLY**. The Judge cannot approve rules for production.
*   **Recommendations**:
    *   `RECOMMEND_APPROVE_FOR_REVIEW`
    *   `RECOMMEND_REVISE`
    *   `RECOMMEND_REJECT`

## 2. End-to-End Workflow

1.  **Trigger**: Intake of a trusted research source, a missed detection case, or an internal research note.
2.  **Red Team Generation**: Red Team Agent synthesizes N variants of the attack.
3.  **Sanitization**: An automated layer verifies all variants use redacted placeholders.
4.  **Blue Team Defense**: Blue Team Agent proposes candidate rules for the synthesized variants.
5.  **Regression Testing**: Candidate rules are automatically tested against the historical "Known Good" dataset.
6.  **Judge Evaluation**: Judge Agent reviews the full context (Attack + Defense + Metrics) and provides an advisory recommendation.
7.  **Human Review Dashboard**: All outputs are presented to a human analyst.
8.  **Final Action**: Human approves for **Benchmark Inclusion** and/or inclusion in the next **Draft Rule Pack**.

## 3. Mandatory Human Review
The Human Reviewer is the **Final Authority**. 
*   No Agent, including the Judge, can bypass the Human Review stage.
*   Every human decision requires a verified identity and justification notes.
*   The Human Reviewer can manually override any Agent recommendation.
