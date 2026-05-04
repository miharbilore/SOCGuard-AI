# SOCGuard AI Rule Pack Strategy

## 1. The Limitation of Static Signatures
V1 relied on a deterministic set of signatures that were highly effective for the academic Proof of Concept. However, in a real-world scenario, static signatures are insufficient because **prompt injection attacks are dynamic and rapidly evolving**:

* **Paraphrasing**: Subtle changes in wording that bypass simple keyword matching.
* **Encoding/Obfuscation**: Attacks using Base64, Unicode, or other encoding schemes.
* **Multilingual Attacks**: Injection attempts in non-English languages to bypass English-centric filters.
* **Tool Abuse**: Attacks specifically designed to trigger and exploit LLM tool-calling capabilities.
* **Prompt Leak Attempts**: Evolving strategies to extract system instructions.

## 2. Rule Pack Concept
In V2, SOCGuard AI transitions to a **Rule Pack** model. A Rule Pack is a versioned bundle of detection signatures that can be updated independently of the core detection engine logic.

### 2.1 Key Characteristics
* **Versioned**: Every update is tracked (e.g., v2.0.1, v2.1.0).
* **Rollback-ready**: Previous rule packs are archived, allowing for immediate rollbacks if an update causes issues.
* **Structured**: Rules are categorized by attack type (e.g., `OOD` - Out of Domain, `PI` - Prompt Injection, `LKP` - Leakage).

## 3. Candidate Attack Variants
To keep signatures ahead of attackers, V2 will use a system to generate and test **Candidate Attack Variants**.
* These are hypothetical versions of known attacks (paraphrased, translated, or encoded).
* These variants are used to test the robustness of **Rule Candidates** before they are finalized.

## 4. Offline Evaluation
Rules are never deployed directly to production. They must undergo:
1. **Detection Validation**: Does the rule catch the intended attack variants?
2. **False Positive Check**: Does the rule incorrectly flag benign, legitimate logs from historical production-like datasets?
3. **Performance Impact**: Does the new rule significantly slow down the detection pipeline?
