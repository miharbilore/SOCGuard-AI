# SOCGuard AI V2 Roadmap

## 1. Vision
SOCGuard AI V2 marks the evolution of the project from a static, deterministic academic Proof of Concept (V1) into a **controlled, rule-pack based security platform**. 

While V1 successfully demonstrated the feasibility of detecting indirect prompt injection through deterministic pattern matching, V2 focuses on **operational scalability** and **resilience** against evolving threat landscapes without sacrificing the core principles of predictability and human oversight.

## 2. V2 Core Principles
* **Controlled Evolution**: The system will not "self-learn" from production data. All updates are vetted.
* **Human-in-the-Loop**: No rule is deployed without explicit human review and approval.
* **Predictability over Autonomy**: We prioritize reproducible detection over autonomous "black-box" adaptation.
* **Safety First**: Maintaining the V1 frozen state as a baseline to ensure no regression in core academic benchmarks.

## 3. Implemented Modules

### 3.1 Threat Intelligence (`threat-intel`) [COMPLETED]
*   Structured intake for research notes from OWASP, MITRE, and internal labs.
*   Deterministic parsing of raw intelligence into structured records with stable IDs.

### 3.2 Attack Variants (`attack-variants`) [COMPLETED]
*   Deterministic generation of 8+ transformation types (URL encoding, HTML entities, Zero-width obfuscation, etc.).
*   Offline test case expansion without LLM dependency.

### 3.3 Rule Candidates (`rule-candidates`) [COMPLETED]
*   Automated proposing of new detection signatures from threat intel.
*   Severity assignment and false positive risk assessment based on attack categories.

### 3.4 Regression Runner (`regression-runner`) [COMPLETED]
*   Offline validation of candidate rules against the core research dataset.
*   Advisory recommendations (`APPROVE`, `REVISE`, `REJECT`) based on TP/FP metrics.

### 3.5 Review Queue (`review-queue`) [COMPLETED]
*   Governance layer for human-in-the-loop validation.
*   Audit trail for security analyst decisions and notes.

### 3.6 Rule Pack (`rule-pack`) [COMPLETED]
*   Versioned, immutable rule pack builder.
*   Supports semantic versioning and safe rollback capability.

## 4. Current Progress: V2 Pipeline Demo
The complete controlled update pipeline is now viewable at the `/v2` route. This demo orchestrates all modules above to show how a new research note is safely transformed into a versioned rule pack draft.

## 5. Next Steps
1. **Integration**: Update the `DetectionEngine` to optionally consume versioned Rule Packs while maintaining V1 legacy support.
2. **Persistence**: Transition from in-memory/static records to a lightweight database for long-term tracking.
3. **Advanced Variants**: Introduce bounded LLM usage for semantic paraphrase generation in the `attack-variants` module (offline only).
