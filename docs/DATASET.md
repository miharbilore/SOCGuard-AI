# SOCGuard AI: Synthetic Dataset

## Overview
The SOCGuard AI research dataset is a curated collection of synthetic SIEM-style logs designed to evaluate the effectiveness of deterministic guardrails against indirect prompt injection. The dataset contains 30 samples (15 Benign, 15 Injected) covering a variety of formats, languages, and attack vectors.

## Dataset Construction
Logs were manually constructed to simulate real-world SIEM environments including:
- **Web Servers (Nginx, Apache)**: Access and error logs.
- **Cloud Audit (AWS CloudTrail, Azure Audit)**: API calls and identity events.
- **System Logs (Syslog, Windows Events)**: Kernel messages and logon events.
- **Application Logs**: JSON structured data, stack traces, and multi-line debug output.
- **Security Tools (WAF, Mail Gateway)**: Alerts and traffic metadata.

## Categories & Coverage

### Benign Logs (SAFE)
Includes standard operational data and "Hard Negatives"—logs that contain suspicious-looking keywords but are contextually safe.
- **Hard Negatives**: Documentation quoting injections, legitimate JSON formatting requests, and Turkish text using keywords like "talimat" (instruction) in a benign context.

### Injected Logs (MALICIOUS)
Includes indirect prompt injections hidden in various metadata fields (User-Agent, headers, log payloads).
- **Direct Instructions**: "Ignore all previous instructions."
- **Turkish Variants**: "Önceki talimatları yok say."
- **Obfuscation**: URL encoding, HTML entities, and Zero-Width characters.
- **Prompt Leakage**: Attempts to reveal system prompts or developer messages.
- **Tool Abuse**: Unauthorized attempts to trigger function calls or data exfiltration.
- **Format Control**: Coercing the analyzer to output specific formats (e.g., "JSON only").

## Dataset Fields
Each sample includes:
- `id`: Unique identifier (e.g., `b-001`, `i-001`).
- `source`: The simulated log source (e.g., `nginx-access`).
- `raw`: The raw log payload.
- `difficulty`: `EASY` (obvious), `MEDIUM` (encoded), or `HARD` (contextual/subtle).
- `attackVector`: The specific technique used for injected logs.

## Limitations
1. **Scale**: The dataset is small (30 samples) and intended for PoC validation.
2. **Synthetic Nature**: While realistic, these logs do not contain the noise and volume of a production enterprise environment.
3. **Statelessness**: The samples are isolated and do not simulate stateful multi-stage attacks.

## Future Work
- Expansion to 1000+ samples using automated generation (with human verification).
- Integration with real-world anonymized SIEM datasets.
- Addition of stateful attack sequences.
