# Provider Safety & Governance Policy

This document outlines the mandatory safety rules and ethical guidelines for using Large Language Model (LLM) providers with the SOCGuard AI research pipeline.

## 1. Ethical Red Team Generation

The purpose of the Red Team Agent is to synthesize **prompt injection patterns for detection research**. It is strictly prohibited from generating operational harmful content.

### Mandatory Red Team Constraints:
- **No Exploits**: Do not request or generate real malware code, exploit payloads, or step-by-step vulnerability instructions.
- **No Phishing**: Do not request or generate phishing templates, social engineering lures, or credential theft instructions.
- **No Weapons**: Do not request or generate instructions for physical or digital weapons.
- **No Credentials**: Do not request or generate real passwords, API keys, or private tokens.
- **No Exfiltration**: Do not request or generate real exfiltration URLs or attacker-controlled endpoints.
- **Use Placeholders**: Always use placeholders like `[REDACTED_HARMFUL_REQUEST]` or `[REDACTED_SECRET]` to represent unsafe intent.

## 2. Respect for Provider Limits

SOCGuard AI adheres to the Terms of Service of all LLM providers (e.g., Groq, OpenAI).

- **Rate Limits**: Respect the rate limits of your specific tier.
- **No Evasion**: Do not rotate API keys, accounts, or IP addresses to bypass free-tier or paid-tier usage limits.
- **Failover Only**: The fallback provider is intended for **service reliability and failover**, not for doubling rate-limit capacity.
- **Backoff Logic**: The system implements exponential backoff and minimum intervals (10s+) to ensure responsible API usage.

## 3. Human-in-the-Loop Governance

- **Untrusted Outputs**: All outputs from Red, Blue, Judge, and Curator agents are treated as **untrusted research data**.
- **Mandatory Review**: No agent output can be promoted to a production rule or benchmark without explicit human audit and approval.
- **Sanitization Gate**: All generated adversarial logs must pass through the `safety-sanitizer` to be rendered non-operational before storage.
- **No Auto-Approval**: The system does not feature any mechanism for agents to "self-approve" or bypass human gates.

## 4. Security of Secrets

- **Server-Side Only**: API keys must be handled server-side to prevent exposure to the browser.
- **Environment Isolation**: Use `.env.local` for local development and never commit it.
- **No Global Secrets**: Avoid sharing API keys across multiple users or environments.

Violation of these policies may result in the suspension of research access or the disabling of the API adapter layer.
