# V4 Plan: OpenAI-Compatible API Integration

## Architecture
Future V4.x updates will introduce real LLM-backed agents using an adapter pattern. This allows the system to switch between `MOCK` research mode and `LLM` synthesis mode.

### Planned Agents
- **Red Team (LLM)**: Prompted to generate diverse indirect injection variants based on the `sanitizer` safety profile.
- **Blue Team (LLM)**: Prompted to generate deterministic regex/keyword patterns for a given log.
- **Judge (LLM)**: Evaluates realism and coverage using multi-factor heuristics.
- **Curator (LLM)**: Summarizes findings into structured Rule Vault entries.

## Security Controls

### 1. Server-Side Key Handling
API keys (e.g., `GROQ_API_KEY`) will be handled **server-side only** using Next.js Environment Variables. No keys will be prefix with `NEXT_PUBLIC_`.

### 2. Schema Validation
All LLM responses will be validated against a strict JSON schema (e.g. using Zod) to ensure deterministic parsing and prevent "hallucination-induced" code errors.

### 3. Sanitizer Gate
The existing SOCGuard `safety-sanitizer` will act as a mandatory post-processing gate. Any LLM output containing raw harmful payloads will be blocked or redacted before reaching the research lab.

### 4. Cost and Rate Limits
- **Max Candidates**: Default 3 per run.
- **Max Cycles**: Default 5 per session.
- **Min Interval**: 10,000ms (10s) between API calls to prevent runaway costs.

## Configuration (Future .env)
```env
# Governance
ENABLE_LLM_AGENTS=false

# Provider
LLM_PROVIDER=GROQ
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=gsk_...
LLM_MODEL=llama3-70b-8192

# Safety & Cost
MAX_CANDIDATES_PER_RUN=3
MAX_CYCLES_PER_RUN=5
MIN_INTERVAL_MS=10000
```

## Governance Reminder
- LLM outputs are **untrusted**.
- No auto-approval is possible.
- Human review is the final authority.
- No direct production rule mutation.
