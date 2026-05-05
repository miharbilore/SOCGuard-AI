# OpenAI-Compatible Agent Adapters (Placeholder)

## Status: DISABLED

This folder contains placeholder types and disabled agent classes for future integration with Groq and OpenAI-compatible APIs.

### Safety and Security
- **No API Calls**: No real network requests are implemented in this research build.
- **No Secrets**: API keys must never be stored in code or exposed to the frontend.
- **Disabled by Default**: Any attempt to call these agents will result in a runtime error.
- **Environment Setup**: Local development requires `.env.local`. See `docs/LOCAL_LLM_SETUP.md`.
- **Safety Policy**: Provider usage must comply with `docs/PROVIDER_SAFETY_POLICY.md`.
- **Rate-Limiting**: Minimum 10s intervals and backoff are enforced via `src/modules/socguard/agent-adapters/rate-limit.ts`.
- **Future Work**: Real adapters will be implemented in V4.2+, requiring server-side environment variables and strict governance gates.
