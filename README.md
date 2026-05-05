# SOCGuard AI

**Deterministic-first protection and adversarial evaluation platform for LLM-based SOC workflows.**

SOCGuard AI detects indirect prompt injection risks hidden inside SIEM-style logs before those logs are processed by LLM-based SOC assistants. It provides deterministic detection, explainability, evaluation metrics, controlled rule intelligence, adversarial lab workflows, human review, and auditability.

## Current Implementation Status: V4.1 (Research Build)

The current repository includes the complete research pipeline from V1 to V4:

- **V1: Detection PoC**: Deterministic engine using keyword and regex-based threat identification.
- **V2: Rule Intelligence**: Workflow for managing candidate rules, categories, and severity scoring.
- **V3: Adversarial Lab**: Red/Blue/Judge framework for generating and evaluating synthetic threats.
- **V3.1: Modern Dashboard**: High-fidelity SIEM-style UI for security operations and research.
- **V4: Agent Pipeline**: 
  - **Agent Adapters**: Interface-driven architecture for Red/Blue/Judge/Curator agents.
  - **Mock Agents**: Deterministic mock implementations of the agent pipeline.
  - **Lab Cycle Runner**: Automated research orchestrator with safety limits.
  - **Rule Vault**: Candidate signature registry for human-reviewed defenses.
  - **Integrated UI**: Specialized dashboards for /agent-lab and /rule-vault.

## Key Features

- **Multi-Layer Preprocessing**: NFKC normalization, URL/HTML decoding, and zero-width character detection.
- **Deterministic Engine**: High-performance, low-latency detection without non-deterministic LLM overhead.
- **Adversarial Research Lab**: Automated synthesis of new attack variants and defense proposals.
- **Governance First**: Mandatory human-in-the-loop audit for all research promotions.
- **Explainability**: Detailed rationale and evidence mapping for every detection.
- **Performance Metrics**: Academic-grade evaluation (Accuracy, Precision, Recall, F1) across difficulty tiers.

## Core Pages / Routes
- `/`: **Command Center** - Global performance and governance overview.
- `/analyzer`: **Log Analyzer** - Real-time testing of logs against active rules.
- `/evaluation`: **Benchmark Evaluation** - Full dataset performance metrics.
- `/v2`: **Rule Intelligence** - Management of candidate rules and intel.
- `/adversarial-lab`: **Research Sandbox** - Manual Red/Blue Team synthesis.
- `/agent-lab`: **Agent Runner** - Automated research orchestration (V4).
- `/rule-vault`: **Candidate Registry** - Human review of agent findings (V4).
- `/review-queue`: **Promotion Queue** - Approval workflow for datasets and rules.
- `/rule-packs`: **Rule Bundles** - Inspection of versioned detection logic.
- `/audit`: **Audit Trail** - Historical record of all governance actions.

## Roadmap

| Version | Status | Focus |
| :--- | :--- | :--- |
| **V1 - V3** | **Active** | Core engine, benchmarking, and manual adversarial lab. |
| **V4** | **Active** | **Agent Pipeline (Mock Mode)**. Interface adapters and Rule Vault. |
| **V4.x** | **Planned** | **API Integration**. Server-side Groq/OpenAI adapters (Disabled by default). |
| **V5** | **Future** | **ML-Assisted Detection**. Training classifiers on V4 benchmark data. |

## Generative AI / API Usage
- **V4 Research Build**: Uses **MOCK agents only**. No real external API calls are made to Groq, OpenAI, or other providers.
- **Mock-Default Policy**: All agent synthesis is currently performed using deterministic mock logic to ensure stability and safety.
- **Future API Implementation**: Groq/OpenAI-compatible adapters are present as **disabled placeholders**. Real implementation will require:
  - Server-side environment variables for API keys.
  - Strict JSON schema validation for LLM responses.
  - Mandatory post-processing via the SOCGuard safety sanitizer.
- **Governance**: Agent outputs are explicitly **untrusted and advisory**. The system does not feature "uncontrolled learning" and never mutates production rules automatically.

## Governance and Safety
SOCGuard AI is built on a "Human-in-the-loop" governance model:
- **Untrusted LLM Outputs**: All agent-generated suggestions are treated as untrusted candidates.
- **Advisory Judge**: The Judge Agent provides heuristic scores only; it cannot authorize changes.
- **Human Authority**: The Human Reviewer is the final authority for all approvals.
- **No Auto-Approval**: There is no path for a rule or benchmark to bypass human review.
- **No Auto-Deployment**: Rule Vault entries are candidates only and require manual bundling into Rule Packs.
- **No Production Mutation**: Ajanlar üretim kurallarını doğrudan değiştiremez.
- **Safety Sanitization**: Generated adversarial prompts are sanitized to be non-operational; raw harmful payloads are never stored in production paths.

## Installation & Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the research dashboard:
   ```bash
   npm run dev
   ```

## Limitations
- **Not Production-Ready**: This is a research platform for academic validation.
- **Signature Bounded**: Deterministic signatures may miss creative paraphrases.
- **Stateless**: Analyzes logs in isolation, not as multi-event chains.
- **English Focus**: Primarily optimized for English-based log content.

## License
Research use only. (C) 2024 SOCGuard AI Team.
