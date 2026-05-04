# SOCGuard AI: Detection Engine

## Overview
The Detection Engine is the first line of defense in the SOCGuard AI pipeline. It uses a purely deterministic approach to identify hallmarks of indirect prompt injection attacks within SIEM logs.

## Architecture
- **Stateless**: The engine does not maintain state between log entries.
- **Regex-Driven**: Uses a library of curated regular expressions to match known adversarial patterns.
- **Deterministic**: No probabilistic models or LLMs are used at this stage, ensuring high performance and predictable results.

## Key Detection Patterns
The engine currently monitors for:
- **Instruction Overrides**: Phrases like "ignore previous instructions" or "disregard system instructions".
- **Status Manipulation**: Attempts to "mark this alert as safe" or "do not escalate".
- **Data Exfiltration**: Requests to "reveal secrets" or "send report to external URL".
- **Role Manipulation**: Commands like "you are now" or spoofed internal headers like `[SYSTEM]:`.
- **Suspicious Encoding**: Identification of long, unspaced alphanumeric strings typical of Base64 or obfuscated payloads.

## Decision Logic
1. A `LogEntry` is received.
2. The `payload` field is scanned against all active `DETERMINISTIC_RULES`.
3. Each match generates a `DetectionFinding`.
4. Findings include the matched text, character offset, and a confidence score based on the rule's specificity.

## Why Deterministic?
We use deterministic rules first to:
- **Reduce Latency**: Regex scanning is orders of magnitude faster than LLM inference.
- **Prevent Manipulation**: Rules cannot be "tricked" by prompt injection in the same way an LLM can.
- **Provide Ground Truth**: Rules provide clear, auditable evidence for why a log was flagged.
