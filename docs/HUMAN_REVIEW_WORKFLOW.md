# SOCGuard AI: Human Review Workflow

## 1. Overview
The **Human Review Workflow** is the final stage of the **Adversarial Agent Lab** pipeline. It transitions an automated research record into an audited artifact. While agents (Red, Blue, Judge) perform the initial heavy lifting of synthesis and evaluation, a human analyst remains the final authority on the quality and validity of the research.

## 2. Explicit Review Process
Approval or rejection is never automatic. A human analyst must explicitly:
1.  **Review the Sanitized Prompt**: Verify it represents a realistic threat.
2.  **Evaluate the Blue Proposal**: Determine if the proposed pattern is effective and safe.
3.  **Consider Judge Feedback**: Use the automated scores and reasons as a guide.
4.  **Issue a Decision**: Choose a `HumanDecisionType` and provide mandatory notes.

## 3. Decision Types
| Decision | Description |
| :--- | :--- |
| **APPROVE_FOR_BENCHMARK** | The record is high quality and should be used to test detection engines (V2). |
| **APPROVE_FOR_RULE_CANDIDATE** | The Blue Team's proposal is strong enough to be considered as a draft production rule. |
| **APPROVE_FOR_BOTH** | Suitable for both benchmarking and rule drafting. |
| **NEEDS_REVISION** | The attack or defense requires refinement by the automated agents. |
| **REJECT** | The record is invalid, unrealistic, or unsafe. |

## 4. Auditability and Integrity
*   **Reviewer Identity**: The `reviewerId` is logged with every decision.
*   **Mandatory Notes**: Analysts must provide a rationale (min 5 chars) for their decision.
*   **No Mutation**: Review decisions are attached to a new copy of the record, preserving the original state.
*   **No Production Side-Effects**: This workflow only updates the `AdversarialLabRecord`. It does not modify production detection rules or rule packs.

## 5. Promotion Logic
Decisions made here feed into the next stages of the SOCGuard lifecycle:
*   `APPROVE_FOR_BENCHMARK` records are exported to the **Benchmark Suite** for regression testing.
*   `APPROVE_FOR_RULE_CANDIDATE` records are promoted to the **Policy Engine** backlog for integration into the next versioned Rule Pack release.
