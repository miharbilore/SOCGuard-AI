# V4 Agent Pipeline: API-Ready Architecture

## Overview
SOCGuard AI V4 transitions the project from static deterministic generators to an agent-based pipeline capable of interfacing with external Large Language Models (LLMs) via Groq or OpenAI-compatible APIs.

The pipeline consists of four specialized agents working in a coordinated loop to identify, defend, evaluate, and curate new detection assets.

## Agent Roles

### 1. Red Team Agent
- **Function**: Generates sanitized attack candidates.
- **Multilingual Support**: Supports Turkish, English, Arabic, German, French, Polish, and mixed-language logs to test translation-bypass resilience.
- **Output**: `RedTeamCandidate[]`
- **Security**: Must produce non-operational logs (sanitized). Outputs are treated as **untrusted data**.

### 2. Blue Team Agent
- **Function**: Proposes deterministic defense signatures (regex/heuristics) for a given attack candidate.
- **Output**: `BlueTeamProposal`
- **Security**: Focuses on high-precision, low-latency deterministic rules.

### 3. Judge Agent
- **Function**: Performs an advisory evaluation of the Red-Blue pair.
- **Output**: `JudgeRecommendation` (Realism, Coverage, FP Risk, Safety).
- **Governance**: Decisions are **advisory only** and do not authorize changes.

### 4. Curator Agent
- **Function**: Formats the collective output of the lab run into a structured Vault Entry.
- **Output**: `CuratedRuleVaultEntry`
- **Status**: All entries default to `NEEDS_REVIEW`.

## Governance and Safety Protocol
V4 maintains the strict security posture established in V1-V3:

1. **No Auto-Approval**: No agent or combination of agents can approve a rule for production.
2. **Mandatory Human Review**: Every `CuratedRuleVaultEntry` must be audited by a human analyst before promotion to a Rule Candidate.
3. **No Production Mutation**: Agents cannot modify the active production rule set. They only write to the research Vault.
4. **API Security**: API keys must be stored and handled **server-side only**. Never expose keys in the frontend.
5. **Untrusted Outputs**: All LLM-generated content is treated as untrusted and must pass through safety sanitizers.

## Technical Implementation
- **Adapter Pattern**: Agents are implemented via an interface, allowing seamless switching between `MOCK` and `LLM` providers.
- **Default State**: `enableLLMAgents` defaults to `false`. The `MOCK` provider is the default system state.
- **Validation**: All data models are strictly typed and validated against the SOCGuard schema.
