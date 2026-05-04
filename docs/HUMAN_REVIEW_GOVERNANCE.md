# V3: Human Review & Governance Policy

## 1. Governance Principles
SOCGuard AI V3 follows a strict governance model to prevent AI-driven "hallucinations" or "rule poisoning" from affecting security integrity.

*   **No Auto-Approval**: No rule or benchmark case is ever automatically promoted to an active state.
*   **No AI Authority**: Agents are research assistants, not decision-makers.
*   **Deterministic Final Logic**: While Agents use LLMs for synthesis, the final output must be a **deterministic, auditable rule** (Regex/Keyword).
*   **Full Audit Logging**: Every interaction, from Red Team generation to Human approval, is logged with timestamps and identities.

## 2. Safety Policy (Adversarial Generation)
The Adversarial Agent Lab is restricted to generating **abstract security patterns**. The generation of operational exploit material is strictly prohibited.

### 2.1 Disallowed Content
Agents are forbidden from generating:
*   Real malware code or script blocks.
*   Phishing email templates or social engineering lures.
*   Instructions for credential theft or session hijacking.
*   Step-by-step exploit guides for known vulnerabilities.
*   Persistence techniques or C2 communication protocols.
*   Real exfiltration targets (IPs, URLs, Domains).

### 2.2 Allowed Content
Agents are permitted to generate:
*   Abstract prompt injection patterns (e.g., "ignore previous instructions").
*   Syntactical escape sequences (e.g., markdown or JSON breaking).
*   Multi-lingual override attempts.
*   Sanitized test cases using `[REDACTED]` placeholders.

## 3. "Training" vs. "Evolution"
It is critical to distinguish V3 from autonomous training systems:
*   **V3 does NOT train a live model**: The core detection engine remains a deterministic TypeScript module.
*   **Benchmark Expansion**: V3 supports the controlled growth of the academic dataset used for evaluation.
*   **Rule Pack Evolution**: V3 facilitates the human-led development of new, versioned Rule Packs.

## 4. Identity & Responsibility
Every Human Reviewer must provide:
1.  **Reviewer ID**: Verified identity for the audit log.
2.  **Justification Notes**: Mandatory explanation for Why a rule is being approved or rejected.
3.  **Review Category**: Explicitly stating if the rule is for **Detection** (active) or **Benchmark Only** (research).

## 5. Future Work: Signed Packs
To further enhance governance, future iterations of V3 will implement **Cryptographically Signed Rule Packs**. This ensures that the detection engine only loads packs that have been digitally signed by an authorized human reviewer after passing the V3 lab workflow.
