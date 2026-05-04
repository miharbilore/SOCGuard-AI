# SOCGuard AI Controlled Learning Model

## 1. Overview
A critical design constraint for SOCGuard AI V2 is the rejection of "uncontrolled online learning." While the system must adapt to new threats, it must do so in a way that is **transparent, reviewable, and reversible**.

## 2. The Controlled Update Pipeline
The lifecycle of a detection rule follows a strict pipeline:

1. **Threat Source Intake**: Identification of a new attack pattern from threat intelligence feeds or internal research.
2. **Candidate Attack Variants**: Generation of various permutations of the new attack (paraphrases, encodings, etc.).
3. **Candidate Rules**: Creation of a draft detection signature designed to catch the variants.
4. **Offline Regression Tests**: The candidate rule is run against a large historical dataset to ensure it doesn't break existing detection logic.
5. **False Positive Checks**: Verification that the rule does not flag legitimate user behavior.
6. **Human Approval**: A security analyst reviews the rule's performance, logic, and impact.
7. **Versioned Rule Pack Release**: The approved rule is bundled into a new version of the Rule Pack and deployed.

## 3. Human-in-the-Loop Governance
The **Review Queue** is the final authority.
* No LLM or automated script can push a rule to the active Rule Pack.
* Every rule change must have a "Reason for Change" and "Evaluation Report" attached.

## 4. What V2 Will NOT Do (Anti-Goals)
To maintain the integrity and security of the system, the following behaviors are strictly prohibited:

* **No Uncontrolled Online Learning**: The system will not automatically update its detection logic based on real-time production logs.
* **No Automatic Production Rule Mutation**: Logic cannot be self-modified by the system in a production environment.
* **No LLM Final Decisions**: While LLMs may be used to *suggest* rule candidates or *generate* attack variants for testing, they will never have the final authority to categorize a log as "malicious" in the production pipeline.
* **No Production-Ready Claim**: V2 remains a research-oriented platform. It is not intended for high-stakes production environments without extensive further validation.

## 5. Security of the Pipeline
The update pipeline itself is a security boundary. Access to the Review Queue and the ability to release Rule Packs must be strictly controlled to prevent "Rule Poisoning" (where an attacker injects a rule that masks their actual attack).
