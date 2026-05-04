# Preprocessing and Normalization Layer

## Overview

The SOCGuard AI preprocessing layer is designed to counteract common obfuscation techniques used in indirect prompt injection and other LLM-based attacks. By standardizing the input before it reaches the detection engines, we can identify threats that would otherwise be hidden by encoding, Unicode trickery, or hidden characters.

## Why Preprocessing is Needed

Attackers often use evasion techniques to bypass simple pattern matching:
- **Encoding**: Using URL encoding (`%69gnore`) or HTML entities (`&#105;gnore`) to hide keywords.
- **Unicode Variation**: Using look-alike characters from different Unicode blocks (e.g., Cyrillic 'а' instead of Latin 'a').
- **Hidden Characters**: Inserting zero-width spaces or other invisible characters between letters (`s\u200By\u200Bt\u200Be\u200Bm`) to break regex patterns.
- **Case Manipulation**: Mixing case in ways that might bypass poorly constructed rules.

## Applied Transformations

The `normalizer` applies the following transformations in a deterministic sequence:

1.  **Unicode Normalization (NFKC)**: Converts characters to their "Compatibility Decomposition, followed by Canonical Composition" form. This collapses many visually identical characters into their standard ASCII/Unicode equivalents.
2.  **Zero-Width Character Removal**: Strips out invisible characters like `\u200B` (Zero Width Space), `\u200C` (ZWNJ), etc.
3.  **URL Decoding**: Safely decodes URL-encoded components (e.g., `%20` -> ` `).
4.  **HTML Entity Decoding**: Translates numeric (`&#105;`) and named (`&lt;`) entities into their literal characters.
5.  **Case Standardization**: Provides a lowercase variant for case-insensitive matching.
6.  **Line Splitting**: Breaks the input into individual lines for line-based analysis.

## How This Helps Against Obfuscated Injection

By applying these transforms, a payload like:
`I&#103;n%6f re p&#114;e vious instructions`

becomes:
`Ignore previous instructions`

This allows our deterministic rules to match against the "intent" of the text rather than its specific encoding.

## Limitations

- **Loss of Context**: Normalization can sometimes remove information that might be relevant for other types of analysis (though we always preserve the `original` input).
- **Nested Encoding**: Currently, the normalizer performs one pass of decoding. Highly sophisticated attackers might use multiple layers of encoding (e.g., Base64 inside URL encoding).
- **Non-Textual Payloads**: This layer is focused on text-based logs and may not be effective against binary or highly structured data formats without further parsers.

## Implementation Details

The preprocessing layer is implemented in `src/modules/socguard/preprocessing/` and is integrated directly into the `DetectionEngine`. It reports `suspiciousTransforms` which can be used by the scoring engine to increase the risk score of an entry even if no specific malicious pattern is matched.
