# Local LLM Setup Guide

This guide explains how to safely configure local environment variables for Groq/OpenAI-compatible agents in SOCGuard AI V4.

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
Edit `.env.local` and paste your real API key into the corresponding field. **Never** paste your real key into `.env.example`.

```env
# Example .env.local (DO NOT COMMIT)
ENABLE_LLM_AGENTS=true
LLM_PROVIDER=GROQ
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.3-70b-versatile
LLM_API_KEY=<paste-your-server-side-api-key-here>
```

### 3. Restart Dev Server
After editing `.env.local`, you **must** restart the development server for the changes to take effect:

```bash
# Press Ctrl+C then
npm run dev
```

### 4. Verify Ignore Rules
Ensure your `.gitignore` correctly prevents these files from being tracked:
- `.env`
- `.env.local`
- `*.pem`
- `*.key`

## Troubleshooting

- **If UI still says MOCK**: Restart `npm run dev`.
- **If API key missing**: Double-check `.env.local` exists and contains `LLM_API_KEY`.
- **If provider returns 429 (Rate Limit)**: Wait for the cooldown. Do not rotate keys to bypass limits.
- **If model output validation fails**: Lower the temperature in `.env.local` (e.g., `LLM_TEMPERATURE=0.5`) and try again.
- **If provider refuses red-team generation**: This often happens with safety filters. Keep prompts sanitized and ensure they use placeholders only.

## Runtime Constraints
The system enforces the following safety limits when real agents are enabled:
- **Minimum Interval**: 10,000ms between research cycles.
- **Max Candidates**: 3 per cycle (default).
- **Max Cycles**: 5 per session (default).

If a rate limit is reached, the system will apply exponential backoff (capped at 120s) or halt execution. Do not attempt to bypass these controls. The factory logic (`agent-factory.ts`) ensures that if `ENABLE_LLM_AGENTS` is false or the key is missing, the system gracefully falls back to `MOCK` mode.
