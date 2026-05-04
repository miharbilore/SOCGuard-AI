# SOCGuard AI

SOCGuard AI is a research-focused project designed to detect and mitigate **indirect prompt injection attacks** embedded within SIEM-style log entries. Its purpose is to act as a safeguard for downstream automated systems and LLM-based analysis pipelines, preventing them from being manipulated by malicious inputs disguised as ordinary logs.

## Project Scope
- This project is **not** a chatbot.
- This project is **not** a full SIEM or EDR.
- The scope is strictly limited to detecting and evaluating indirect prompt injections.
- It operates using a **hybrid detection** architecture where deterministic rules are the primary authority, while LLM integration acts as a purely supplemental (and heavily distrusted) analysis layer.
- Final verdicts are strictly controlled by a deterministic Policy Engine.

For more details on the scope, please read [PROJECT_SCOPE.md](docs/PROJECT_SCOPE.md).

## Architecture
The application uses a modular, pipeline-driven structure. Log entries flow through sequential engines:
1. **Dataset**: Ingests and parses logs.
2. **Detection**: Applies deterministic rules (heuristics, regex).
3. **Scoring & LLM**: Evaluates context and assigns risk scores.
4. **Policy**: Evaluates scores and issues final blocks/alerts.
5. **Explainability & Demo**: Summarizes decisions and presents them via a Next.js dashboard.

For more technical details, refer to the [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Technology Stack
- **Language**: TypeScript
- **Framework**: Next.js (App Router)
- **Design**: Modular, standalone core functions decoupled from the UI

## Getting Started

First, install dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
