# SOCGuard AI: Dataset Documentation

## Overview
This project includes a built-in synthetic dataset designed to demonstrate and test the detection of indirect prompt injection attacks. The dataset consists of SIEM-style log entries derived from various common sources.

## Data Characteristics
- **Type**: Synthetic / Simulated.
- **Formats**: Includes standard web server logs (Nginx), cloud provider events (AWS CloudTrail), OS events (Windows/Linux), and application-specific logs.
- **Labels**:
  - `BENIGN`: Normal, non-malicious log entries.
  - `INJECTED`: Logs containing adversarial prompt injection attempts.

## Design for Safety
- **Educational Focus**: The injected samples are designed for testing the semantic analysis capabilities of security tools.
- **No Harmful Payloads**: The dataset does **not** contain executable malware, real exploit code, or sensitive credentials.
- **Sandboxed Content**: Injections use instructional phrases (e.g., "Ignore previous instructions") to test boundary detection without posing a risk to the host system.

## Limitations
- **Not Real Data**: These logs do not originate from a real production environment.
- **Complexity**: Real-world logs are significantly more verbose and noisy. This dataset focuses on clear, illustrative examples of injection hallmarks.
- **Static Nature**: The dataset is hardcoded for demo purposes and does not reflect real-time threat landscapes.

## Usage
The dataset is accessible via the `getSampleLogs()` helper function in `src/modules/socguard/dataset/sample-logs.ts`.
