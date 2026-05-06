# V4.2 Source Intelligence & Corpus Builder

## Overview

Source Intelligence is a secure, controlled framework for collecting security insights from public and internal sources. It serves as a knowledge feed for the SOCGuard Benchmark Corpus and Rule Vault.

## Core Pillars

### 1. Allowed Source Registry

- No uncontrolled web crawling.
- Only allowlisted sources (OWASP, MITRE ATLAS, etc.) are used.
- Every source has a defined trust level and allowed use (e.g., TAXONOMY_ONLY).

### 2. Sanitized Taxonomy Extraction

- We do **not** store raw harmful content or operational exploits.
- Intelligence is stored as "Notes" containing sanitized patterns, defensive insights, and placeholders.
- Placeholders used: `[REDACTED_HARMFUL_REQUEST]`, `[REDACTED_SECRET]`, etc.

### 3. Human Approval Requirement

- Data flows from `AllowedSource` -> `SourceIntelligenceNote` -> `BenchmarkCorpusCandidate`.
- Transitions require explicit human approval.
- No automated mutation of production detection rules or datasets occurs.

## Relationship to Other Modules

- **Benchmark Corpus**: Approved candidates from source notes are promoted to the research benchmark.
- **Rule Vault**: Defensive insights from source intelligence inform the synthesis of new candidate signatures by V4 Agents.
- **V4 Agents**: Red Team agents use **APPROVED** source notes as context/inspiration. This ensures that synthesized attack logs are aligned with current industry frameworks (like MITRE ATLAS or OWASP) while remaining strictly sanitized and non-operational.

## Future Considerations

- Future automated collectors (web crawlers) must strictly respect `robots.txt`, licensing terms, and site-specific terms of service.
- Integration with external security feeds will remain behind a human-in-the-loop review gate.
