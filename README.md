# SOCGuard AI

**Deterministic-first protection and adversarial evaluation platform for LLM-based SOC workflows.**

SOCGuard AI detects indirect prompt injection risks hidden inside SIEM-style logs before those logs are processed by LLM-based SOC assistants. It provides deterministic detection, explainability, evaluation metrics, controlled rule intelligence, adversarial lab workflows, human review, and auditability.

## Current Implementation Status: V4.1 (Research Build)

The current repository includes the complete research pipeline from V1 to V4.1:

- **V1-V3**: Core engine, benchmarking, and manual adversarial lab.
- **V4**: Agent Pipeline. Interface adapters, Rule Vault, and Integrated UI.
- **V4.1 (NEW)**: **Production-Ready Foundation**.
  - **Prisma + SQLite Persistence**: Lab results and Rule Vault entries are now persistent.
  - **LLM API Integration**: structurally ready for Groq/OpenAI via `.env.local`.
  - **CI/CD Readiness**: GitHub Actions workflow and Vitest suite configured.

## Generative AI / API Usage

- **Dual Mode Support**: The system supports both **MOCK** and **API-BACKED** research modes.
- **Single Cycle (API-BACKED)**: Can use real LLMs (Groq/OpenAI) for server-side synthesis when configured.
- **Limited Session (MOCK)**: Client-side sessions remain deterministic and local for stability.
- **Configuration**: API usage is opt-in via `.env.local`. If keys are missing, the system falls back to mock logic.
- **Governance**: All LLM outputs are **untrusted candidates** requiring human review. No auto-approval occurs.

## Installation & Setup

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   The project uses Prisma with SQLite. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Environment Config**:
   Copy the example environment file and add your API keys:
   ```bash
   cp .env.example .env.local
   ```
   *Edit `.env.local` to set `ENABLE_LLM_AGENTS=true` and add your `LLM_API_KEY` (Groq recommended).*

4. **Run Research Dashboard**:
   ```bash
   npm run dev
   ```

5. **Testing**:
   ```bash
   npm test
   ```

## License
Research use only. (C) 2024 SOCGuard AI Team.
