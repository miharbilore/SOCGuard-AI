# SOCGuard AI Threat Intel Intake

## 1. Overview
The **Threat Intel Intake** module is responsible for capturing new attack patterns, vulnerabilities, and research findings from trusted sources. In V2, this process is structured but manually controlled to ensure data integrity and prevent "poisoning" of the detection engine.

## 2. Intake Philosophy
* **Manual/Trusted Intake**: Only notes from verified researchers or official bodies (OWASP, MITRE) are accepted.
* **No Automatic Updates**: Intake records do not automatically change the production Rule Pack. They serve as "Rule Candidates" that require human review.
* **Deterministic Parsing**: To maintain predictability, the intake module uses a deterministic parser (`threat-intel-parser.ts`) to extract example phrases and attack categories without the use of an LLM.

## 3. Supported Sources
The module is designed to accommodate a wide variety of security intelligence sources:
* **OWASP**: Top 10 for LLM Applications.
* **MITRE ATLAS**: Adversarial Threat Landscape for AI Systems.
* **Research Papers**: New academic findings on prompt injection and evasion.
* **Tool Outputs**: Findings from security scanners like `garak`, `promptfoo`, or `pyrit`.
* **Internal Tests**: Lessons learned from failed internal security evaluations or red teaming.

## 4. Parser Logic
The parser identifies:
* **Example Phrases**: Extracted from quoted strings in the raw notes.
* **Attack Categories**: Mapped based on keyword detection (e.g., "prompt injection", "data exfiltration").
* **Metadata**: Deterministically hashes the input to generate stable IDs for tracking and deduplication.

## 5. Security and Governance
By keeping the intake process separate from the active detection engine and requiring human review for rule creation, SOCGuard AI avoids the risks of uncontrolled online learning while still remaining adaptable to the rapidly changing threat landscape.
