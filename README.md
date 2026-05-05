# SOCGuard AI

**Deterministic-first protection and adversarial evaluation platform for LLM-based SOC workflows.**

## Overview
SOCGuard AI detects indirect prompt injection risks hidden inside SIEM-style logs before those logs are processed by LLM-based SOC assistants. It provides deterministic detection, explainability, evaluation metrics, controlled rule intelligence, adversarial lab workflows, human review, and auditability. The platform acts as a critical security layer ensuring that untrusted data from external logs cannot manipulate or hijack the instructions of an AI security analyst.

## Current Status
The current repository represents the **V3.1** implementation of the SOCGuard AI research project:
- **V1 Detection PoC**: Core deterministic engine is fully functional.
- **V2 Rule Intelligence**: The governance pipeline for rule lifecycle management is implemented.
- **V3 Adversarial Lab**: The red/blue team research sandbox and human review queue are implemented.
- **V3.1 Modern UI**: A professional light-mode dashboard has been applied across all modules.

**Important Implementation Notes:**
- **No real LLM/API calls** are active in this version.
- All Red/Blue/Judge agents are **deterministic/mock** in the current implementation to demonstrate the workflow.
- **No production rule mutation** occurs; the system is designed for controlled governance.
- **Human review** is a mandatory gate for all promotion workflows (benchmarks, rules, rule packs).

## Version Roadmap

| Version | Status | Key Features & Accomplishments |
| :--- | :--- | :--- |
| **V1 — Detection PoC** | **Implemented** | Log analyzer, preprocessing/normalization, deterministic detection rules, confidence-aware risk scoring, policy engine, explainability engine, evaluation dashboard. |
| **V2 — Rule Intelligence** | **Implemented** | Threat intel intake, attack variant generation, candidate rule generation, offline regression testing, human review queue model, draft rule pack builder. |
| **V3 — Adversarial Agent Lab** | **Implemented** | Red Team mock generator, Blue Team mock defender, Judge advisory evaluator, safety sanitizer, lab records, human review workflow, benchmark promotion, rule candidate promotion. |
| **V3.1 — SOC/SIEM UI** | **Implemented** | Modern dashboard overhaul: Command Center, Analyzer, Evaluation, Rule Intelligence, Adversarial Lab, Human Review Queue, Rule Packs, Audit Trail. |
| **V4 — API-backed Agents** | **Planned Next** | Optional Groq/OpenAI adapters, server-side API key handling, real LLM-backed Red/Blue/Judge/Curator agents, controlled lab runner, cost/rate limits, rule vault persistence. |
| **V5 — ML-assisted Detection** | **Future** | Supervised classifier on approved benchmarks, semantic similarity detection, anomaly detection, active learning with human review, drift monitoring. |

## Architecture Overview

### Detection Pipeline
```text
Log Input
→ Preprocessing (Normalization & Decoding)
→ Detection Engine (Deterministic Signatures)
→ Risk Scoring (Multi-factor Aggregation)
→ Policy Engine (Action Mapping)
→ Explainability (Decision Rationale)
→ Human Analyst (Final Oversight)
```

### Governance Lifecycle (V2/V3/V4 Loop)
```text
Threat Intel / Red Team Output
→ Sanitizer (Safety Layer)
→ Offline Benchmark (Regression Testing)
→ Blue Team Proposal (Defense Generation)
→ Judge Advisory (Heuristic Evaluation)
→ Human Review (Final Authority)
→ Candidate Rule Vault
→ Draft Rule Pack (Versioned Assets)
```

## Pages / Routes
- `/` — Command Center (SOC Overview)
- `/analyzer` — Interactive Log Analyzer
- `/evaluation` — Benchmark Performance Metrics
- `/v2` — Rule Intelligence Pipeline
- `/adversarial-lab` — Red/Blue Team Research Sandbox
- `/review-queue` — Human Review Authority Queue
- `/rule-packs` — Versioned Detection Assets
- `/audit` — Governance Provenance & Audit Trail

**Planned Future Routes:**
- `/agent-lab` — Active LLM Agent Management (V4)
- `/rule-vault` — Production Signature Repository (V4)

## How to Run Locally

First, install dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Governance and Safety
SOCGuard AI is built on a "Human-in-the-loop" governance model:
- **Untrusted LLM Outputs**: All agent-generated suggestions (Red/Blue/Judge) are treated as untrusted data.
- **Advisory Judge**: The Judge Agent provides heuristic scores only; it cannot authorize changes.
- **Human Authority**: The Human Reviewer is the final authority for all approvals.
- **No Auto-Approval**: There is no path for a rule or benchmark to bypass human review.
- **No Auto-Deployment**: Draft rule packs are inactive by default and require manual activation.
- **Safety Sanitization**: Generated adversarial prompts are sanitized to be non-operational; raw harmful payloads are never stored in production paths.

## Generative AI / API Usage
- **Current Version**: Uses deterministic/mock agents only. No external API calls to LLM providers are made.
- **V4 API Adapters**: Placeholder architecture for Groq/OpenAI-compatible adapters is included but **disabled by default**. 
- **Security**: API keys are never stored in the frontend or version control. V4 implementation requires server-side environment variables.

## Limitations
- **Synthetic Dataset**: Current evaluation metrics use a curated research dataset.
- **Signature Bounded**: Deterministic signatures may miss highly creative paraphrases of attacks.
- **Stateless Analysis**: The current engine analyzes logs in isolation, not as multi-event chains.
- **Language Coverage**: Primarily optimized for English-based log content.
- **No Persistence**: Current implementation uses in-memory state for demonstration.
- **Not Production-Ready**: This is a research platform for academic validation and framework development.

## Future Work
- **V4 API Agent Integration**: Move from mocks to real LLM agents for lab simulation.
- **Persistence Layer**: Integrate database storage (PostgreSQL) for records and rules.
- **RBAC**: Implement Role-Based Access Control for governance gates.
- **V5 ML Detection**: Train specialized classifiers on the human-approved benchmark dataset generated in V3/V4.
