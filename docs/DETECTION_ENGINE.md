# SOCGuard AI: Detection Engine

## Overview
The Detection Engine is the primary security layer of SOCGuard AI. It uses a combination of deterministic regex signatures and context-aware logic to identify indirect prompt injection attempts in SIEM logs.

## Analysis Process
1. **Normalization**: Preprocessing the input to handle encoding and obfuscation.
2. **Signature Matching**: Running the input through a library of `DETERMINISTIC_RULES`.
3. **Context-Aware Refinement**: Adjusting the confidence and severity of matches based on surrounding text to reduce false positives.

## False Positive Reduction Strategy
A common challenge with rule-based detection is distinguishing between malicious instructions and legitimate technical data. SOCGuard implements the following context-aware controls:

### 1. Quoted Documentation Context
If a suspicious phrase (e.g., "ignore all previous instructions") appears inside quotes or near keywords like "help", "guide", or "documentation", the engine assumes it is a reference rather than a command.
- **Action**: Confidence reduced by 50%, Severity lowered.

### 2. Feature Flags & Configuration
Keywords like "developer mode" are often used as jailbreak attempts, but they also appear in benign configuration logs (e.g., `"developer_mode": true`).
- **Action**: If found in a key-value pair context, Severity is set to `LOW` and Confidence reduced by 60%.

### 3. Session Tokens & JWTs
Large alphanumeric strings can trigger entropy or encoding rules.
- **Action**: If a string matches the standard JWT format (`header.payload.signature`), it is treated as a benign token with `LOW` severity.

### 4. Technical Parameters
Requests for specific output formats (e.g., "output JSON only") are suspicious in a conversational context but normal in API parameters or callbacks.
- **Action**: Confidence reduced by 40% if found near technical parameter keywords like `callback`, `fmt`, or `json_only`.

## Hard Negative Examples
The dataset includes several "Hard Negatives" to test these controls:
- **`b-007`**: Documentation quoting an injection phrase.
- **`b-008`**: A legitimate JWT session token.
- **`b-009`**: Turkish text with the word "talimat" in a DB query context.
- **`b-010`**: A legitimate JSON formatting request in API parameters.

## Limitations
- **Heuristic Nature**: Context detection relies on regex-based heuristics which may not catch all edge cases.
- **Static Rules**: The engine cannot detect novel semantic attacks that do not match existing signatures or contexts.
