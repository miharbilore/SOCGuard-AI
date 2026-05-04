# SOCGuard AI: Adversarial Lab Records

## 1. Purpose
The **Adversarial Lab Record** is the central data structure for the research pipeline in SOCGuard AI V3. It encapsulates the entire lifecycle of an adversarial experiment—from the initial "Red Team" attack synthesis to the "Blue Team" defense proposal and the "Judge" advisory evaluation.

## 2. Audit Trail Design
Every record includes a mandatory `auditTrail` array. This ensures that every action taken by an automated agent or a human reviewer is tracked with:
*   **Timestamp**: Precise UTC time of the action.
*   **Actor**: The agent (Red, Blue, Judge) or Human ID responsible.
*   **Action**: A standardized event code (e.g., `RED_TEAM_CANDIDATE_CREATED`).
*   **Notes**: Contextual details about the action.

## 3. Governance and Safety
*   **No Automatic Approval**: The Judge Agent only provides recommendations. It cannot approve a rule for production.
*   **Immutable Human Decision**: The `humanReviewDecision` field is the final authority. It is initially `undefined` and can only be set by an explicit human action.
*   **No Production Mutation**: Lab records are research artifacts. They do not automatically update active detection rules. Promotion to production is a separate workflow involving the versioned Rule Pack system.
*   **Sanitization**: Only sanitized prompt content is stored in lab records to prevent the leak of operational attack payloads.

## 4. Deterministic Workflow
To ensure reproducibility in research:
1.  **IDs**: Record IDs are generated using deterministic hashes of the constituent component IDs.
2.  **Mocks**: The V3 prototype uses deterministic generators instead of non-deterministic LLM calls to establish a stable benchmark.

## 5. Future Roadmap
This record-based architecture supports the future **Adversarial Dashboard**, where analysts can:
*   Filter records by `attackType` or `difficulty`.
*   Bulk-review Judge recommendations.
*   Export successful Red/Blue pairs into the V2 benchmarking suite.
*   Track the performance of different detection categories over time.
