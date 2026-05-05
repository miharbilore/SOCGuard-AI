# Rule Vault: Candidate Signature Database

## Purpose
The Rule Vault is a centralized registry for curated adversarial research findings and their corresponding defense proposals. It acts as the "staging area" where potential security assets are stored and audited before being promoted to formal datasets or production-ready rule packs.

## Key Characteristics
- **Research-First**: Every entry in the vault represents a specific attack-defense pair identified during lab runs, threat intelligence intake, or manual forensic review.
- **Non-Active Logic**: Entries in the Rule Vault are **not** part of the active production detection engine. They do not block traffic until they are formally promoted and bundled into an approved Rule Pack (V2 workflow).
- **Mandatory Governance**: All entries require human review. The vault tracks provenance, reviewer identity, and audit notes.

## Relationship with Other Modules

### 1. V4 Agents -> Rule Vault
The **Curator Agent** in the V4 pipeline is the primary source of vault entries. It automatically packages the outputs of the Red, Blue, and Judge agents into a structured vault record.

### 2. Rule Vault -> V2 Rule Packs
Approved entries in the Rule Vault serve as the "catalog" for the **Rule Pack Builder**. When an analyst creates a new versioned rule pack, they select high-confidence, approved entries from the vault to be converted into active production rules.

### 3. Rule Vault -> Benchmarks
Entries marked as `APPROVED_FOR_BENCHMARK` are integrated into the offline regression testing suite, ensuring that future rule updates are tested against these newly identified patterns.

## Governance Workflow
1. **Curate**: Agent or Human proposes a vault entry (`NEEDS_REVIEW`).
2. **Audit**: Senior Analyst reviews the entry, testing it for false positive risks and realism.
3. **Decision**: Analyst marks the entry as `APPROVED` (for benchmark, rule, or both), `REJECTED`, or `NEEDS_REVISION`.
4. **Promotion**: Approved entries are flagged as available for the next Rule Pack build cycle.

## Future Persistence
In the current research build, the Rule Vault uses a transient in-memory model. Future versions will integrate with a persistence layer (e.g., PostgreSQL or SQLite) to maintain a permanent historical record of all research candidates.
