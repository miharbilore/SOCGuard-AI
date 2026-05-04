# SOCGuard AI

SOCGuard AI is a deterministic-first research Proof of Concept (PoC) designed to detect and mitigate **indirect prompt injection attacks** embedded within SIEM-style log entries. 

The system acts as a pre-processing safeguard for downstream LLM-based SOC assistants, ensuring that malicious instructions hidden in logs (e.g., User-Agent headers, process command lines) are identified and blocked before they can manipulate the assistant.

## Key Principles
- **Deterministic Authority**: Security decisions are based on verifiable regex patterns, context heuristics, and fixed policy thresholds—not probabilistic LLM outputs.
- **Reproducibility**: Analysis IDs and finding results are derived deterministically from log content, ensuring identical results across forensic re-runs.
- **Explainability**: Every decision is accompanied by a transparent breakdown of triggered rules, matched evidence, and scoring factors.

## Project Scope
SOCGuard is a specialized research tool with a strictly defined scope:
- **What it is**: A modular pipeline for identifying malicious instruction overrides in log data.
- **What it is NOT**: 
    - It is **not** a chatbot or general-purpose AI.
    - It is **not** a replacement for full SIEM (e.g., Splunk) or EDR (e.g., CrowdStrike).
    - It does **not** use an LLM for its core security decisions in this prototype.

## Pipeline Architecture
Log entries flow through a sequential deterministic pipeline:
1. **Preprocessing**: Normalizes input, resolves Unicode anomalies, and performs multi-pass decoding (URL, HTML, Base64).
2. **Detection**: Applies deterministic signatures and context-aware heuristics.
3. **Risk Scoring**: Aggregates findings into a 0-100 score based on severity and category diversity.
4. **Policy Engine**: maps scores to definitive actions (SAFE, ESCALATE, HUMAN_REVIEW, BLOCK).
5. **Explainability**: Generates a human-readable summary and decision rationale.

## SOCGuard AI V2: Controlled Rule Pack Pipeline
SOCGuard AI V2 evolves the project from a static PoC into a product-oriented, versioned rule pack system. It introduces a human-governed update pipeline that allows the system to adapt to new prompt injection techniques without the risks of uncontrolled online learning.

### V2 Key Features:
* **Threat Intel Intake**: Converts trusted research notes (OWASP, MITRE) into structured records.
* **Attack Variant Generation**: Automatically generates deterministic variants (encoding, obfuscation) for offline testing.
* **Candidate Rule Proposing**: Suggests new detection signatures based on new threat intelligence.
* **Offline Regression Testing**: Validates candidate rules against historical datasets to prevent false positives before they reach production.
* **Human-in-the-Loop Governance**: Mandatory review queue for all rule updates to prevent rule poisoning and DoS.
* **Versioned Rule Packs**: Immutable, versioned bundles of security logic that support safe rollbacks and productization.

### V2 Design Constraints (Safety First):
* **No Uncontrolled Learning**: The system does not automatically learn or update from production logs.
* **No Automatic Deployment**: Rule updates must be manually built and promoted to APPROVED status.
* **Deterministic Only**: Like V1, the V2 pipeline remains non-LLM centered to ensure performance and auditability.

## Research Limitations
As an academic PoC, SOCGuard AI has several known limitations:
- **Synthetic Dataset**: Benchmark results are based on a small curated set of 30 samples.
- **Stateless Analysis**: Logs are analyzed in isolation; it does not yet correlate multi-event attack chains.
- **Signature Bounded**: Like all signature-based systems, it may miss novel semantic attacks that don't trigger existing patterns.
- **V2 Automation**: The V2 pipeline is currently a demonstration of the workflow; it does not yet automatically scrape threat feeds or use LLMs for semantic variant generation.
- **Not Production-Ready**: Designed for academic validation and benchmarking, not for real-world enterprise traffic.

## Technology Stack
- **Language**: TypeScript
- **Framework**: Next.js 14 (App Router)
- **Validation**: Strict Type Safety with no `any` usage in core modules.

## Getting Started

First, install dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

### Available Pages:
* [Interactive Demo (V1)](http://localhost:3000): Test the deterministic detection engine.
* [Evaluation Dashboard](http://localhost:3000/evaluation): View academic benchmark metrics and confusion matrix.
* [V2 Pipeline Demo](http://localhost:3000/v2): Explore the controlled rule update and regression testing workflow.
