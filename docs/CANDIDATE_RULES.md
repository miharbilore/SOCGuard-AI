# SOCGuard AI Candidate Rules

## 1. Overview
A **Candidate Rule** is a proposed detection signature that has been automatically generated from verified Threat Intelligence or Attack Variants. Candidate rules represent the "Drafting" phase of the SOCGuard AI Rule Pack evolution.

## 2. Inactive by Design
Candidate rules are **never active** in the production detection engine. They exist in a separate staging area and are assigned the status `NEEDS_REVIEW`. This design ensures that the production environment remains stable and predictable.

## 3. Human Review Required
No candidate rule can be promoted to an active Rule Pack without a manual review by a security analyst. The analyst must evaluate:
* **Regex Accuracy**: Is the suggested pattern too broad or too narrow?
* **False Positive Risk**: Does the pattern overlap with legitimate business logic or common log fragments?
* **Performance Impact**: Does the rule introduce excessive processing latency?

## 4. The Danger of Automatic Deployment
Automatically deploying rules generated from external intel or LLMs is dangerous for several reasons:
1. **Denial of Service (DoS)**: A poorly crafted rule can flag all legitimate traffic as malicious, effectively shutting down the system.
2. **Rule Poisoning**: An attacker who knows the system automatically learns from "threat intel" could inject a rule that intentionally masks their actual attack or flags benign traffic to cause confusion.
3. **Loss of Explainability**: Without human review, it becomes difficult for SOC analysts to explain *why* a specific log was flagged if the rule was created autonomously.

## 5. Promotion Workflow
1. **Generation**: `CandidateRule` created from `ThreatIntelRecord`.
2. **Regression Testing**: Candidate rule is run against historical datasets using the `regression-runner`.
3. **Approval**: Security analyst reviews findings and marks the rule as `APPROVED`.
4. **Integration**: Approved rules are bundled into the next versioned `Rule Pack`.
