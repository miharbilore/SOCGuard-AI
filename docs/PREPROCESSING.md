# SOCGuard AI: Preprocessing Layer

## Overview
The Preprocessing layer is responsible for normalizing log input and uncovering obfuscated payloads before they are passed to the detection engine. It acts as a "de-obfuscator" that reveals hidden instructions while preserving the original context for auditability.

## Transformation Pipeline

### 1. Unicode Normalization (NFKC)
Standardizes characters that may look identical to standard ASCII but use different Unicode points (e.g., look-alike characters from other alphabets).

### 2. Zero-Width Character Removal
Detects and strips invisible characters (e.g., `\u200B`, `\u200C`) often used to break up keywords like `s\u200By\u200Bs\u200Bt\u200Be\u200Bm` to evade simple regex filters.

### 3. Multi-Pass Decoding (URL & HTML)
Attackers sometimes use nested encoding (e.g., URL-encoding an HTML-encoded string).
- **Strategy**: SOCGuard performs up to **2 passes** of URL and HTML entity decoding.
- **Safeguard**: Limited to 2 passes to prevent infinite loops and excessive resource consumption.

### 4. Cautious Base64 & Hex Decoding
Decoding every alphanumeric string would lead to massive noise and false positives.
- **Strategy**: The engine identifies potential encoded tokens (20-500 characters) and attempts to decode them.
- **Safeguard**: A decoded variant is **only** accepted if it contains known suspicious keywords (e.g., `instruction`, `ignore`, `system`, `talimat`). This ensures that normal session tokens, hashes, and non-textual binary data do not trigger false detections.

## Transform Tracking
Every transformation applied is tracked in the `suspiciousTransforms` field. The presence of multiple transformations (e.g., `UNICODE_NORMALIZATION` + `URL_DECODE_P1` + `BASE64_OBFUSCATION`) is itself an indicator of malicious intent and is flagged by the detection engine.

## Output Variants
The preprocessor produces multiple "variants" of the input:
- **Original**: The untouched raw log.
- **Normalized**: The fully cleaned and multi-pass decoded version.
- **Decoded Variants**: Individual intermediate versions discovered during decoding passes.

The Detection Engine analyzes **all** variants to ensure that an attack hidden in any layer is identified.
