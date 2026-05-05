# Architecture: SOCGuard AI

> [!NOTE]
> All documentation examples are sanitized and non-operational. The project uses placeholders (e.g., `[REDACTED]`) to represent unsafe intent without providing actionable harmful content.

## Overview
SOCGuard AI employs a modular, pipeline-driven architecture optimized for sub-millisecond, deterministic log analysis. The core design philosophy centers on **Deterministic Authority**, ensuring that security decisions are based on verifiable code rather than probabilistic LLM outputs.

## Core Modules

- **dataset:** Responsible for loading, parsing, and providing mock SIEM-style logs for research and evaluation.
- **preprocessing:** Standardizes raw log strings, removes zero-width obfuscation, and performs multi-pass decoding (URL, HTML, Base64).
- **detection:** Houses the deterministic signature sets (regex, heuristics, keyword matching) to identify known prompt injection hallmarks.
- **scoring:** Aggregates findings from the detection engine into a 0-100 risk score, applying bonuses for category diversity.
- **policy:** The final gatekeeper. Maps numeric risk scores to actionable decisions (BLOCK, HUMAN_REVIEW, ESCALATE, SAFE) based on fixed thresholds.
- **explainability:** Transforms the raw detections and scores into structured evidence and rationales for analyst review.
- **demo:** A Next.js 14 dashboard providing an interactive playground and academic benchmark interface.

## Data Flow
1. **Raw Log Input**: String from SIEM source.
2. **Preprocessing**: Normalized + Decoded variants generated.
3. **Detection**: Each variant is scanned against the rule library.
4. **Scoring**: Findings are weighed and aggregated.
5. **Policy**: Risk score is evaluated against thresholds (e.g., 80+ = BLOCK).
6. **Explainability**: Summaries and evidence are compiled.
7. **Output**: `AnalysisResult` returned for UI or downstream API.

## Future Work: Hybrid Integration
While the current PoC is strictly deterministic, the architecture is designed to support an optional LLM-based semantic analysis layer. In such a configuration, LLM outputs would be treated as additional `DetectionFinding` objects with associated confidence scores, which are then passed to the deterministic Policy Engine for the final verdict.
