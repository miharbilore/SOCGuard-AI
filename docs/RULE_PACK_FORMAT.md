# SOCGuard AI Rule Pack Format

## 1. Structure
A **Rule Pack** is a self-contained, versioned bundle of security logic and validation data. It is structured as a JSON-compatible object defined in `rule-pack-types.ts`.

### 1.1 Core Fields
* `id`: Unique identifier for the rule pack.
* `version`: Semantic versioning (e.g., `1.0.0`).
* `status`: Current lifecycle stage (`DRAFT`, `REVIEW`, `APPROVED`, `DEPRECATED`).
* `rules`: An array of `RulePackRule` objects.
* `testCases`: Integrated validation data to ensure the pack performs as expected.

## 2. Rule Lifecycle
Each rule within a pack has its own metadata:
* `enabled`: Boolean flag to toggle the rule without removing it.
* `reviewStatus`: Tracks the governance state (`DRAFT`, `APPROVED`, `REJECTED`).
* `pattern`: The detection logic (stored as a string, interpreted as a regular expression).

## 3. Versioning and Updates
Rule packs follow strict versioning:
* **Patch**: Minor rule refinements or false positive fixes.
* **Minor**: Addition of new rules for existing attack categories.
* **Major**: Introduction of new attack categories or breaking changes to the rule schema.

## 4. Why Rule Packs are Safer
Unlike "uncontrolled learning" or live model fine-tuning, Rule Packs offer several safety advantages:

1. **Determinism**: The same rule pack will always produce the same result for the same input.
2. **Auditability**: We can see exactly what changed between version `1.0.1` and `1.0.2`.
3. **Rollback Capability**: If a new version causes high false positives, we can instantly revert to the previous approved version.
4. **Offline Validation**: New rules are tested against the `testCases` array and historical datasets before they are marked as `APPROVED`.
5. **No Poisoning**: Since updates require human approval, an attacker cannot "teach" the system to ignore their attacks through adversarial inputs in production logs.

## 5. Approval Status
A Rule Pack must be in the `APPROVED` status to be used by the production Detection Engine. Any pack in `DRAFT` or `REVIEW` is restricted to the `regression-runner` environment.
