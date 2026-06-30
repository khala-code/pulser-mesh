# Pulser Mesh

Pulser Mesh is an open protocol for validating local meshes of reciprocity, trade, and value-add transformation, then converting verified common surplus into downstream dividend pulses.

It is designed as the opposite of an apex-extractive system. Instead of routing value upward into a bottleneck, Pulser Mesh tries to detect when local activity has genuinely reduced a real scarcity in a real place, validate that reduction through a checkpoint boundary, and pulse a share of the resulting surplus back down to participants.

## Core idea

Pulser Mesh starts from four claims:

1. local economic life is graph-shaped rather than purely transactional,
2. scarcity should be measured directly rather than replaced by vague "impact" language,
3. value-add means moving an input closer to real scarcity resolution,
4. validated surplus should not automatically concentrate at the top.

The protocol therefore tries to connect:

- local meshes of favors, care, trade, and transformation,
- a unified scarcity grammar,
- anti-extractive validation rules,
- checkpoint logic,
- and downstream dividend settlement.

## Current architecture

The current protocol draft is organized around the following layers.

### 1. Node tuple

The node tuple is the working state fingerprint of a participant:

$$
\mathcal{N} = (p, q, \phi, \vec{m}_s, \vec{g}, \Xi)
$$

It captures embedding, structural quality, growth behavior, mission orientation, geography, and coherence.

### 2. Scarcity schema

Pulser Mesh uses a unified scarcity schema based on a triadic rotor:

$$
R = (s, k, \tau)
$$

Where:

- `s` = sine, lived penetration,
- `k` = cosine, structural alignment,
- `tau` = tangent, instability gradient.

This gives the protocol one common measurement grammar across food, housing, care, mobility, and other scarcity classes.

### 3. Value-add transformation schema

Value-add transformation is treated as a protocol-level schema rather than a domain-specific adapter.

A transformation counts when it moves an input into an output that is meaningfully closer to satisfying a real scarcity channel in a real geography.

### 4. Consent check

Counted relations must be consensual.

At the current conceptual layer, the protocol treats consent as a synchronized tangent-path event between relevant observers. Operational implementations can later represent this through shared edge-intent objects, signatures, or equivalent machine-verifiable consent artifacts.

### 5. Validation and checkpoint

Validation and checkpoint logic are currently specified together.

A checkpoint evaluates whether submitted graph state is:

- structurally valid,
- consensual,
- non-extractive,
- scarcity-aligned,
- coherent,
- and sufficient to justify validated surplus.

### 6. Dividend pulse

Checkpoint-validated surplus can be split into reserve, maintenance, local reinvestment, and a flat participant dividend pool.

The dividend unit is intentionally only loosely specified at this stage. The protocol priority is legitimacy of emission before monetary design sophistication.

### 7. 12+1D substrate

Beneath all of the above sits the 12+1D substrate interface.

This is the canonical geometry and data format in which node state, scarcity linkage, consent state, transformation state, and checkpoint participation can be encoded, projected to a boundary, and eventually compiled into privacy-preserving proof systems.

## Repository structure

```text
README.md
GLOSSARY.md
CONTRIBUTIONS.md
DIAGRAM_RECOMMENDATIONS.md
SUBSTRATE_INTERFACE.md
schemas/
  NODE_TUPLE.md
  SCARCITY_SCHEMA.md
  VALUE_ADD_TRANSFORMATION.md
  VALIDATION_AND_CHECKPOINT.md
  CONSENT_AND_DIVIDEND.md
adapters/
  chain/
    ChainAdapter.ts          ← abstract adapter interface
    EthereumAdapter.ts       ← viem-based ETH/EVM implementation
    BitcoinAdapter.ts        ← Lightning + on-chain PSBT implementation
    T3ValidatorNode.ts       ← T3 layer validator: runs full checkpoint pipeline
    T3SubgraphRegistry.ts    ← publish/discover validator results
    T3CrossReference.ts      ← pairwise interference + quorum consensus
    types.ts                 ← shared domain types
    example_validator.ts     ← three-validator cross-reference smoke test
whitepaper/
  pulser_mesh_whitepaper_v1.0.md
diagrams/
docs/
  architecture.md
  asymptotic-auth.md
  seed-structure.md
  federation.md
  gossip.md
  transport.md
```

## Chain adapter and T3 validator nodes

The `adapters/chain/` directory contains the settlement and validation layer that connects the mesh protocol to external chains.

**Chain adapters** (`ChainAdapter.ts`, `EthereumAdapter.ts`, `BitcoinAdapter.ts`) translate mesh surplus pulses into on-chain settlement transactions and anchor checkpoint commitments. Vortex metadata is encoded into ETH calldata or Bitcoin `OP_RETURN` outputs so the on-chain record is traceable back to a specific checkpoint window and geography.

**T3 validator nodes** (`T3ValidatorNode.ts`) operate at the impersonal market/firm layer (T3). Each validator loads a local subgraph, runs the full 8-stage checkpoint pipeline — envelope validation, entity screening, edge screening, graph shape analysis, scarcity alignment, surplus estimation, downweighting, and finalisation — and produces a `CheckpointResult` with constructive and destructive interference scores.

**Cross-referencing** (`T3SubgraphRegistry.ts`, `T3CrossReference.ts`) enables multiple T3 validators covering the same window to compare results. After each validator publishes its checkpoint result to the shared registry, the cross-reference engine computes pairwise interference scores, detects divergent validators, and derives a quorum-weighted consensus surplus using a constructive-score-weighted median.

## What makes Pulser Mesh different

Pulser Mesh is not trying to be:

- a generic local-currency project,
- a reputation graph for its own sake,
- an "impact" layer detached from real deprivation,
- or a governance token wrapped around ordinary extraction.

It is trying to define a protocol in which:

- local activity is represented as graph structure,
- scarcity is measured through a unified schema,
- value-add is tied to real transformation,
- admissibility depends on consent,
- checkpoint logic rejects extractive topology,
- and dividend flow is downstream by design.

## First domain implementation

The first concrete scarcity adapter is food.

Food is a strong starting point because it makes the protocol's logic relatively legible:

- lived burden can be observed,
- access structure can be mapped,
- instability can be measured,
- and transformations such as storage, routing, and preparation are easy to understand as movement toward scarcity resolution.

## Theory

Several design choices in the protocol have non-obvious reasons. If you find yourself asking *why* the protocol works the way it does — why distance in the mesh is void density rather than coordinate separation, why trust has upward pressure as its ground state, why cross-bifurcation authentication is structurally harder than local authentication, why consent and coercion leave different residues — the derivation chain lives in two places:

- **[`docs/seed-structure.md`](./docs/seed-structure.md)** — the hidden witness model. Covers the snark hierarchy, keyhole geodesic, Heegner complexity of scale transitions (§5), cross-bifurcation authentication as an H163 event (§7a), and consent as the minimal H163 event (§7b).
- **[`docs/asymptotic-auth.md`](./docs/asymptotic-auth.md)** — the observable wavefunction model. Covers ΩaZaTa dynamics, uncertainty band decay, and the formal connection between the hidden and observable descriptions.

These two documents are the derivation chain. Everything else in `docs/` is implementation detail on top of them.

## Current status

This repository is still in the open specification stage.

The current priority is not fast shipping. It is conceptual compression: getting the ontology, schemas, validation logic, and substrate interface coherent enough that prototype code can later be built without the whole system collapsing into metaphor.

The chain adapter and T3 validator implementation (`adapters/chain/`) is the first executable layer. It is deliberately thin — enough to run checkpoints, anchor results on-chain, and cross-reference between validators — without pre-committing to a specific consensus or gossip mechanism.

## Good next contributions

Strong contributions right now include:

- tightening definitions,
- challenging hidden assumptions,
- simplifying the protocol language without flattening it,
- formalizing schemas into machine-readable formats,
- building tiny graph or checkpoint prototypes,
- pressure-testing the food adapter against real local data,
- implementing a persistent `RegistryBackend` (libp2p, Redis, or SQLite) for T3 cross-referencing,
- and extending `T3CrossReference` with a live gossip layer for proactive interference detection.

## Read next

A sensible reading path is:

1. [`GLOSSARY.md`](./GLOSSARY.md)
2. [`schemas/SCARCITY_SCHEMA.md`](./schemas/SCARCITY_SCHEMA.md)
3. [`schemas/VALUE_ADD_TRANSFORMATION.md`](./schemas/VALUE_ADD_TRANSFORMATION.md)
4. [`schemas/VALIDATION_AND_CHECKPOINT.md`](./schemas/VALIDATION_AND_CHECKPOINT.md)
5. [`schemas/CONSENT_AND_DIVIDEND.md`](./schemas/CONSENT_AND_DIVIDEND.md)
6. [`SUBSTRATE_INTERFACE.md`](./SUBSTRATE_INTERFACE.md)
7. [`docs/asymptotic-auth.md`](./docs/asymptotic-auth.md)
8. [`docs/seed-structure.md`](./docs/seed-structure.md)
9. [`adapters/chain/T3ValidatorNode.ts`](./adapters/chain/T3ValidatorNode.ts)
10. [`adapters/chain/T3CrossReference.ts`](./adapters/chain/T3CrossReference.ts)

## License

GPLv3. See [`LICENSE`](./LICENSE).
