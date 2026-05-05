# Controlled Agent Lab Runner: Safety and Governance

## Overview
The Controlled Agent Lab Runner is the execution engine for SOCGuard AI V4 research cycles. It orchestrates the flow of data between Red, Blue, Judge, and Curator agents while enforcing strict safety boundaries and detection benchmarks.

## Execution Flow (The Research Cycle)
Each research cycle follows a linear, non-branching path:

1. **Generation (Red Agent)**: Synthesizes new adversarial log candidates.
2. **Sanitization (Mandatory)**: Filters out any operational or harmful payloads.
3. **Benchmarking (V1 Analyze)**: Runs the current production-ready deterministic engine against the candidate.
4. **Defense Proposal (Blue Agent)**: Proposes a new deterministic signature to catch the candidate.
5. **Evaluation (Judge Agent)**: Advisory scoring of the attack-defense pair.
6. **Curation (Curator Agent)**: Bundles results into a `CuratedRuleVaultEntry`.

## Safety and Cost Controls

### 1. Hard Limits
- **Max Cycles**: A single session cannot exceed **10 cycles**.
- **Max Candidates**: A single cycle cannot exceed **10 candidates**.
- **Minimum Interval**: A minimum delay of **1000ms** is enforced between cycles to prevent API spam and rate-limiting issues.
- **No Infinite Loops**: The runner is designed as a finite batch process.

### 2. Governance Constraints
- **No Auto-Approval**: Curator outputs are marked `NEEDS_REVIEW` by default.
- **No Production Mutation**: The runner only generates research candidates; it cannot modify the active detection rule set.
- **Stateless Operation**: Each session is independent and does not persist to a database in this prototype.

### 3. Detection Analytics
The runner automatically classifies the results of the V1 Benchmark:
- **Detected**: If the current engine blocks or escalates the log.
- **Missed**: If the current engine marks the log as `SAFE`.
- **Recommendation**:
    - `NEEDS_RULE_CANDIDATE`: Generated when a high-quality attack is missed.
    - `ADD_TO_BENCHMARK_ONLY`: Generated when an attack is caught but is useful for regression testing.

## Future: Scheduled Lab Runs
This runner architecture is designed to support future "Scheduled Research Runs" (e.g., every 24 hours). In V4, these runs will transition from mock agents to API-backed agents (Groq/OpenAI), providing continuous, human-governed threat intelligence synthesis.
