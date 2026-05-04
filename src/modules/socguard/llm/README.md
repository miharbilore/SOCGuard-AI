# SOCGuard AI: LLM Module (Stub)

## Purpose
This module is intended for future research into **Hybrid Semantic Analysis**. 

## Current Status
- **NOT USED**: This module is not currently utilized in the core SOCGuard AI analysis pipeline.
- **DETERMINISTIC PRIORITY**: The current PoC focuses on deterministic-first detection to ensure sub-millisecond performance and auditability.

## Future Integration
If implemented, this module would act as a semantic validator for ambiguous findings. Its output must always be modeled as a `DetectionFinding` and passed to the deterministic **Policy Engine** for final decision authority.
