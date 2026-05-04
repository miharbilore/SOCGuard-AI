# SOCGuard AI Rule Review Queue

## 1. Overview
The **Rule Review Queue** is the centralized governance layer for SOCGuard AI. It provides a formal process for security analysts to inspect, validate, and approve candidate rules before they are promoted to a production Rule Pack.

## 2. Human-in-the-Loop Approval
A core tenet of SOCGuard AI is that no detection rule is ever deployed without explicit human oversight. The Review Queue facilitates this by presenting analysts with:
* **Proposed Rule Logic**: The suggested regex pattern and its rationale.
* **Regression Evidence**: Concrete results from the `regression-runner`, showing exactly which logs triggered the rule during offline testing.
* **Risk Assessment**: Potential false positive risks identified during the candidate generation phase.

## 3. Rule Poisoning Prevention
By requiring human approval, we create a circuit breaker against **Rule Poisoning** attacks. An attacker who tries to manipulate the threat intelligence intake or variant generation will be blocked at the review stage if their proposed rules are malicious or attempt to mask legitimate attacks.

## 4. Auditability
Every decision in the review queue is tracked:
* **Who**: The analyst who reviewed the rule (in future multi-user versions).
* **When**: Timestamp of the review.
* **Why**: Mandatory notes explaining the decision (Approval, Rejection, or Revision request).
* **What**: The exact state of the rule and the evidence (regression results) at the time of the decision.

## 5. No Live Mutation
Decisions made in the Review Queue do not immediately modify the active detection engine. Approval simply marks a rule as "ready for inclusion" in the next versioned **Rule Pack** release. This maintains the principle of immutable and versioned security logic.

## 6. Review Statuses
* **PENDING**: New items awaiting analysis.
* **APPROVED**: Rule is validated and ready for the next pack release.
* **REJECTED**: Rule is discarded due to high false positives or poor logic.
* **NEEDS_REVISION**: Rule has potential but requires manual refinement of the pattern or logic.
