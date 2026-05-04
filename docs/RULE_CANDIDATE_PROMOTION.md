# SOCGuard AI: Rule Candidate Promotion Workflow

## 1. Overview
**Rule Candidate Promotion** is the process of converting successful, human-audited defense proposals from the Adversarial Lab into formal `CandidateRule` objects compatible with the SOCGuard V2 update pipeline. This allows researchers to bridge the gap between theoretical research and operational detection capability.

## 2. Human Approval Requirement
A record can **only** be promoted if it has an explicit `humanReviewDecision` with one of the following decisions:
*   `APPROVE_FOR_RULE_CANDIDATE`
*   `APPROVE_FOR_BOTH`

Records marked as `REJECT`, `NEEDS_REVISION`, or `APPROVE_FOR_BENCHMARK` (only) are ineligible for rule promotion.

## 3. Pattern Source: Blue Team
Unlike the Benchmark Promotion which uses the Red Team's sanitized prompt, the Rule Candidate Promotion uses the **Blue Team's proposed pattern** (regex or keyword) as the primary detection logic. This ensures that only peer-reviewed, conservative patterns are proposed for the production pipeline.

## 4. No Active Rule Mutation
Promoted rules are assigned a status of `DRAFT` or `NEEDS_REVIEW`. They are **never** automatically activated or added to the `DETERMINISTIC_RULES` engine. Promotion is a submission to the V2 governance queue, not a deployment.

## 5. V2 Compatibility
The promotion output is a `RuleCandidatePromotionResult` which extends the standard V2 `CandidateRule` interface. This allows these research-derived rules to be processed by existing V2 tools such as the `RegressionRunner` and the `RulePackBuilder`.

## 6. Provenance Tracking
Every promoted candidate rule maintains a link to the original lab research:
*   **Lab Record ID**: The research context.
*   **Red/Blue IDs**: The specific attack/defense pair.
*   **Reviewer Metadata**: The analyst who authorized the promotion.

## 7. Mandatory Next Steps
Even after promotion, research-derived candidates must undergo:
1.  **Regression Testing**: To ensure the new pattern does not cause false positives on established datasets.
2.  **Rule Pack Review**: Final authorization before inclusion in an active rule pack release.
