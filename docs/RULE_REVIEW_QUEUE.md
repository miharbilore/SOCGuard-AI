# SOCGuard AI: Rule Review Queue

## 1. Overview
The **Rule Review Queue** is the primary governance gate in the SOCGuard AI V2 pipeline. It ensures that no candidate rule is activated in production without explicit human validation.

## 2. Mandatory Human-in-the-Loop
Every rule update follows a strict "Human-in-the-Loop" (HITL) workflow. While the system can suggest rules based on threat intelligence and validate them via regression testing, the final decision to approve a rule for inclusion in a **Rule Pack** must be made by a security analyst.

## 3. Review Process
1. **Intake**: Candidate rules are automatically added to the queue after regression testing.
2. **Analysis**: Analysts review the suggested pattern, the rationale, and the regression metrics (True Positives vs. False Positives).
3. **Decision**: Analysts choose to Approve, Reject, or Request Revision.

## 4. Auditability
Every decision in the review queue is tracked and strictly enforced:
* **Who**: The mandatory identity of the analyst who reviewed the rule (`reviewedBy`). **Mandatory for all decisions.**
* **When**: Deterministic timestamp of the review.
* **Why**: Mandatory, non-empty notes explaining the decision rationale (minimum 5 characters). Empty notes or missing identity results in an audit failure (Error).
* **What**: The exact state of the rule and the evidence (regression results) at the time of the decision, tied to a deterministic ID.

## 5. No Live Mutation
Decisions made in the Review Queue do not immediately modify the active detection engine. Approval simply marks a rule as "ready for inclusion" in the next versioned **Rule Pack** release. This maintains the principle of immutable and versioned security logic.

## 6. Review Statuses
* **PENDING**: New items awaiting analysis. **The V2 pipeline remains in this state by default.**
* **APPROVED**: Rule is validated and ready for inclusion in the next draft pack (initialized as disabled).
* **REJECTED**: Rule is discarded due to high false positives or poor logic.
* **NEEDS_REVISION**: Rule has potential but requires manual refinement of the pattern or logic.

## 7. Rule Poisoning Prevention
By requiring human review and mandatory audit notes, SOCGuard AI prevents "Rule Poisoning" where an attacker might try to feed malicious threat intelligence to the system to create DoS-inducing rules or bypasses.
