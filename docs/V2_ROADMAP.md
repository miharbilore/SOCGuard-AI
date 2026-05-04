# SOCGuard AI V2 Roadmap

## 1. Vision
SOCGuard AI V2 marks the evolution of the project from a static, deterministic academic Proof of Concept (V1) into a **controlled, rule-pack based security platform**. 

While V1 successfully demonstrated the feasibility of detecting indirect prompt injection through deterministic pattern matching, V2 focuses on **operational scalability** and **resilience** against evolving threat landscapes without sacrificing the core principles of predictability and human oversight.

## 2. V2 Core Principles
* **Controlled Evolution**: The system will not "self-learn" from production data. All updates are vetted.
* **Human-in-the-Loop**: No rule is deployed without explicit human review and approval.
* **Predictability over Autonomy**: We prioritize reproducible detection over autonomous "black-box" adaptation.
* **Safety First**: Maintaining the V1 frozen state as a baseline to ensure no regression in core academic benchmarks.

## 3. Planned Modules

### 3.1 Threat Intelligence (`threat-intel`)
* Repository for external threat feeds and identified prompt injection trends.
* Centralized intake for new attack signatures found in the wild.

### 3.2 Attack Variants (`attack-variants`)
* Logic to generate paraphrased, encoded, and multi-lingual variants of known attacks for testing purposes.
* Focuses on polyglot injections and tool-abuse scenarios.

### 3.3 Rule Candidates (`rule-candidates`)
* A staging area for proposed detection signatures (regex, keyword clusters, logic-based rules) before they are promoted to the active rule pack.

### 3.4 Regression Runner (`regression-runner`)
* Offline testing framework that validates rule candidates against historical logs and "known-good" datasets to prevent false positives.

### 3.5 Review Queue (`review-queue`)
* Administrative interface for security analysts to inspect, modify, and approve/reject candidate rules.

### 3.6 Rule Pack (`rule-pack`)
* The finalized, versioned, and immutable collection of rules ready for deployment to the detection engine.

## 4. Development Phases
1. **Phase 1: Pipeline Infrastructure** - Setting up the `threat-intel` and `rule-pack` schemas.
2. **Phase 2: Offline Learning Model** - Implementing the `attack-variants` and `regression-runner`.
3. **Phase 3: Governance Layer** - Building the `review-queue` and versioning logic.
4. **Phase 4: Integration** - Connecting the rule pack to the V1 detection engine without breaking legacy functionality.
