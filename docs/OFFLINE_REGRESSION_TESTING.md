# SOCGuard AI Offline Regression Testing

## 1. Purpose
The **Offline Regression Runner** is a safety-critical module that validates new detection rules against historical and benchmark datasets before they are promoted to active service. It acts as the primary defense against "Rule Poisoning" and catastrophic false positive rates.

## 2. Core Metrics
The runner calculates several key metrics for each candidate rule:
* **True Positives (TP)**: Injected logs that the rule correctly identified.
* **False Positives (FP)**: Benign logs that the rule incorrectly flagged.
* **Precision Estimate**: The ratio of correct detections to total detections.
* **Recall Estimate**: The ratio of detections to the total number of known threats in the dataset.

## 3. False Positive Checks
A major focus of the regression runner is identifying "Hard Negatives"—legitimate logs that contain phrases similar to injection attacks (e.g., security documentation, technical support instructions). 

If a candidate rule triggers on these benign samples, it is marked for **REVISE** or **REJECT** regardless of how many true threats it catches.

## 4. Regression Before Approval
Every `CandidateRule` must pass through the regression runner as a prerequisite for human review. The results of the regression test (TP/FP counts and example logs) are presented to the security analyst in the `review-queue`, providing the data necessary to make an informed decision.

## 5. No Automatic Production Deployment
The regression runner **does not have the authority** to enable a rule in the production detection engine. Its role is strictly advisory, providing a `recommendation` (`APPROVE_FOR_REVIEW`, `REVISE`, or `REJECT`) to the human governance layer.

## 6. Implementation Safety
The regression runner operates on a copy of the rules and the dataset, isolated from the production pipeline. This ensures that even a catastrophic rule (e.g., one that crashes the regex engine) only affects the testing environment, not the live security monitoring.
