# SOCGuard AI: Analysis Methodology

## Deterministic-First Philosophy
SOCGuard AI operates on a "Deterministic-First" security model. The core analysis pipeline is composed of four strictly deterministic stages executed in sequence:

1.  **Preprocessing**: Normalizing input, stripping invisible characters, and multi-pass decoding (URL, HTML, Base64).
2.  **Detection**: Signature-based pattern matching against a curated library of prompt injection hallmaks (e.g., "ignore instructions", "act as", "reveal prompt").
3.  **Risk Scoring**: Weighing and aggregating detections into a 0-100 score, applying diversity bonuses for multi-category threats.
4.  **Policy Enforcement**: Mapping the aggregate score to a final decision (SAFE, ESCALATE, HUMAN_REVIEW, BLOCK) based on fixed thresholds.

## Exclusion of LLMs from the Core Pipeline
We intentionally exclude LLMs from the primary security decision path to ensure:
- **Integrity**: Deterministic engines are immune to the semantic persuasion and "jailbreaking" that target probabilistic models.
- **Performance**: Sub-millisecond execution times suitable for high-volume SIEM log ingestion.
- **Reproducibility**: Identical inputs always yield identical outputs, a critical requirement for forensic auditing.
- **Auditability**: Transparent "if-then" logic that can be explicitly verified by security compliance teams.

## Reproducibility & Forensic Tracking
To ensure SOCGuard AI is reliable for automated security workflows:
- **Deterministic IDs**: Every `AnalysisResult` and `DetectionFinding` has an ID derived from the log content using a DJB2-based hash. The same log analyzed twice will always yield the same identifiers.
- **Aligned Thresholds**: Risk levels (e.g., CRITICAL starting at 80) are perfectly synced with Policy Decisions (e.g., BLOCK starting at 80), eliminating ambiguous "dead zones" in security logic.

## Academic Evaluation Metrics
The system is benchmarked using standard binary classification and security metrics:
- **Accuracy**: Overall correctness of classification (Safe vs Suspect).
- **Precision**: Ratio of correctly identified injections to total suspicious flags.
- **Recall (Recall on Injected)**: The system's ability to identify all malicious injections.
- **F1 Score**: The harmonic mean of Precision and Recall.
- **False Positive Rate (on Benign)**: Ratio of benign logs incorrectly flagged as suspicious.
- **Average Latency**: End-to-end processing time per log entry.

## Research Limitations
- **Signature Dependency**: Detection is bounded by the current rule library.
- **Statelessness**: Logs are analyzed in isolation without session correlation.
- **Bounded Decoding**: Multi-pass decoding is limited to 2 layers to ensure deterministic performance.
- **Small Synthetic Dataset**: The current benchmark is performed on 30 curated samples for PoC validation.
