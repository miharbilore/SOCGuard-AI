# SOCGuard AI: Project Scope

## Purpose
SOCGuard AI is an advanced research project designed to identify and analyze indirect prompt injections embedded within SIEM-style logs. The project exists to protect downstream automated analysis systems from adversarial manipulation.

## What This Is Not
- **This is not a chatbot.** The system operates on automated ingestion pipelines and rule engines, without interactive conversational components.
- **This is not a full SIEM or EDR.** It does not handle widespread network monitoring, asset discovery, or generic threat hunting. 

## In-Scope Capabilities
- Ingestion of structured (JSON) and unstructured log entries.
- Hybrid detection of potential prompt injections, combining deterministic checks with scoped LLM analysis.
- Risk scoring for log entries based on specific injection hallmarks.
- Explainability layer to provide actionable summaries of why an entry was flagged.

## Security Constraints
- **Deterministic Supremacy:** Final decisions on risk scoring and actions are determined exclusively by the policy engine using deterministic rules.
- **Untrusted LLM Output:** While LLMs may be used for semantic analysis, their output is never trusted as the absolute truth and must conform to the policy engine's strict parameters.
