# Architecture: SOCGuard AI

## Overview
SOCGuard AI employs a modular, pipeline-driven architecture. The core design philosophy centers around **Hybrid Detection**, ensuring deterministic rules act as the primary gatekeeper, with LLMs providing supplementary semantic context that is strictly governed by a deterministic Policy Engine.

## Modules

- **dataset:** Responsible for loading, parsing, and normalizing mock SIEM-style logs.
- **detection:** Houses the initial deterministic rule sets (regex, heuristics, keyword matching, length analysis) to flag suspicious anomalies.
- **llm:** An optional adapter for deeper semantic analysis of the log content. Its outputs are treated as auxiliary signals, never definitive verdicts.
- **scoring:** Aggregates findings from both the detection engine and the LLM adapter to calculate an overall risk score for each log entry.
- **policy:** The final decision-maker. Evaluates the risk score against predefined deterministic thresholds and rules to either block, alert, or allow the entry.
- **explainability:** Transforms the raw scores and rule triggers into human-readable rationale to assist analysts.
- **demo:** A Next.js App Router-based UI dashboard to visualize the pipeline in action.
- **types:** Shared TypeScript interfaces and types enforcing strong typing across the entire pipeline.

## Flow
1. Raw Log -> `dataset` -> Normalized LogEntry
2. LogEntry -> `detection` -> Preliminary Findings
3. LogEntry (optional) -> `llm` -> Semantic Findings
4. Preliminary + Semantic Findings -> `scoring` -> RiskScore
5. RiskScore -> `policy` -> Final Decision
6. Final Decision + Rules Triggered -> `explainability` -> Analyst Summary
7. Full Output -> `demo` -> User Interface
