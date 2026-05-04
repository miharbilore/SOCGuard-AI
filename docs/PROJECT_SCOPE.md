# SOCGuard AI: Project Scope

## Purpose
SOCGuard AI is a specialized research Proof of Concept (PoC) designed to identify and analyze indirect prompt injections embedded within SIEM-style logs. The project serves as a deterministic security layer to protect downstream automated analysis systems (like LLM-based SOC assistants) from adversarial manipulation.

## What This Is Not
- **This is not a chatbot.** The system operates as a data processing pipeline, not an interactive conversational agent.
- **This is not a full SIEM or EDR.** It is not a replacement for enterprise platforms like Splunk, ELK, or CrowdStrike. It does not handle network monitoring or endpoint forensic data collection.
- **This is not an LLM-driven decision engine.** The core security logic is strictly deterministic.

## In-Scope Capabilities
- Ingestion of structured (JSON) and unstructured log entries.
- Deterministic detection of potential prompt injections using multi-pass decoding and signature matching.
- Context-aware risk scoring (0-100) based on threat severity and category diversity.
- Policy-driven decision making (BLOCK, HUMAN_REVIEW, ESCALATE, SAFE).
- Transparent explainability layer providing evidence and scoring rationales.

## Constraints & Limitations
- **Deterministic-First Authority:** All final security decisions are based on verifiable code and fixed thresholds.
- **Academic Context:** The prototype is optimized for research and benchmarking on a synthetic dataset.
- **No Core LLM Usage:** In its current PoC state, the system does not call an LLM for its primary detection or scoring pipeline to ensure maximum performance, determinism, and resistance to semantic persuasion.
- **Statelessness:** The system currently analyzes each log entry in isolation.
