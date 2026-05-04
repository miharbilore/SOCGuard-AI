# SOCGuard AI: Benchmark Promotion Workflow

## 1. Overview
**Benchmark Promotion** is the process of converting successful, human-audited adversarial research artifacts into formal test cases for the SOCGuard academic benchmark suite. This ensures that the detection engine is continuously tested against the most recent and relevant attack vectors identified in the lab.

## 2. Human Approval Requirement
A record can **only** be promoted if it has an explicit `humanReviewDecision` with one of the following decisions:
*   `APPROVE_FOR_BENCHMARK`
*   `APPROVE_FOR_BOTH`

Records marked as `REJECT`, `NEEDS_REVISION`, or `APPROVE_FOR_RULE_CANDIDATE` (only) are ineligible for benchmark promotion.

## 3. Sanitized Data Only
In accordance with our safety protocols:
*   The `raw` payload of the benchmark test case is derived **exclusively** from the `sanitizedPrompt`.
*   Raw operational payloads from the Red Team synthesis are never stored in the benchmark dataset.

## 4. Provenance Tracking
Every promoted benchmark candidate maintains a strong link to its research origins via the `provenance` metadata:
*   **Source Lab Record ID**: The unique ID of the original research experiment.
*   **Red Team Candidate ID**: The specific attack synthesis that triggered the research.
*   **Reviewer ID & Notes**: The analyst who authorized the promotion and their rationale.
*   **Judge ID**: The automated evaluator that provided initial advisory scores.

## 5. Candidate vs. Dataset Status
Promoted records initially receive a `CANDIDATE` status. They are **not** automatically integrated into the production benchmark dataset used for final academic reporting. This separation allows for a second stage of dataset balancing and quality control before a new version of the benchmark suite is frozen and released.

## 6. No Production Mutation
The promotion workflow is a data transformation process. It does not modify active detection rules, policy thresholds, or V1/V2 production behavior. It only enriches the pool of potential test cases for future evaluation runs.
