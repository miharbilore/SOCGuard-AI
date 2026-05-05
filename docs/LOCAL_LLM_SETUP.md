# Local LLM Setup Guide

This guide explains how to safely configure local environment variables for future Groq/OpenAI-compatible agents in SOCGuard AI V4.

## Safety & Governance Rules

1.  **Server-Side Only**: API keys must never be exposed to the frontend. Do not use `NEXT_PUBLIC_` prefixes for secrets.
2.  **No Commits**: Never commit `.env.local` or any file containing real API keys.
3.  **Mock Default**: The system defaults to `MOCK` mode. `ENABLE_LLM_AGENTS` must be explicitly set to `true` to use external APIs.
4.  **No Evasion**: Do not use multiple keys or providers to evade free-tier rate limits. Respect provider terms of service.
5.  **Sanitization**: All Red Team outputs must pass through the SOCGuard safety sanitizer to ensure test cases remain non-operational.

## Setup Instructions

### 1. Initialize Local Environment
Copy the template file to your local configuration:

```bash
cp .env.example .env.local
```

### 2. Configure API Keys
Edit `.env.local` and paste your real API keys into the corresponding fields:

```env
# Example .env.local (DO NOT COMMIT)
ENABLE_LLM_AGENTS=true
LLM_PROVIDER=GROQ
LLM_API_KEY=gsk_your_real_key_here
LLM_MODEL=llama3-70b-8192
```

### 3. Verify Ignore Rules
Ensure your `.gitignore` correctly prevents these files from being tracked:
- `.env`
- `.env.local`
- `*.pem`
- `*.key`

## Runtime Constraints
The system enforces the following safety limits when real agents are enabled:
- **Minimum Interval**: 10,000ms between research cycles.
- **Max Candidates**: 3 per cycle (default).
- **Max Cycles**: 5 per session (default).

If a rate limit is reached, the system will apply exponential backoff (capped at 120s) or halt execution. Do not attempt to bypass these controls. The factory logic (`agent-factory.ts`) ensures that if `ENABLE_LLM_AGENTS` is false or the key is missing, the system gracefully falls back to `MOCK` mode.
