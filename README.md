# Pulser Mesh

Pulser Mesh is an open protocol for validating local meshes of reciprocity, trade, and value-add transformation, then converting verified common surplus into downstream dividend pulses.

It is designed as the opposite of an apex-extractive system. Instead of routing value upward into a bottleneck, Pulser Mesh tries to detect when local activity has genuinely reduced a real scarcity in a real place, validate that reduction through a checkpoint boundary, and pulse a share of the resulting surplus back down to participants.

## Core idea

Pulser Mesh starts from four claims:

1. local economic life is graph-shaped rather than purely transactional,
2. scarcity should be measured directly rather than replaced by vague “impact” language,
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

The repo is evolving, but the intended core structure now looks roughly like this:

```text
README.md
GLOSSARY.md
CONTRIBUTIONS.md
schemas/
  NODE_TUPLE.md
  SCARCITY_SCHEMA.md
  VALUE_ADD_TRANSFORMATION.md
  VALIDATION_AND_CHECKPOINT.md
  CONSENT_AND_DIVIDEND.md
adapters/
  FOOD_ADAPTER.md
SUBSTRATE_INTERFACE.md
whitepaper/
  pulser_mesh_whitepaper_v1.0.md
DIAGRAM_RECOMMENDATIONS.md
diagrams/
```

## What makes Pulser Mesh different

Pulser Mesh is not trying to be:

- a generic local-currency project,
- a reputation graph for its own sake,
- an “impact” layer detached from real deprivation,
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

## Current status

This repository is still in the open specification stage.

The current priority is not fast shipping. It is conceptual compression: getting the ontology, schemas, validation logic, and substrate interface coherent enough that prototype code can later be built without the whole system collapsing into metaphor.

## Good next contributions

Strong contributions right now include:

- tightening definitions,
- challenging hidden assumptions,
- simplifying the protocol language without flattening it,
- formalizing schemas into machine-readable formats,
- building tiny graph or checkpoint prototypes,
- and pressure-testing the food adapter against real local data.

## Read next

A sensible reading path is:

1. `GLOSSARY.md`
2. `SCARCITY_SCHEMA.md`
3. `VALUE_ADD_TRANSFORMATION_SCHEMA.md`
4. `VALIDATION_AND_CHECKPOINT.md`
5. `CONSENT_AND_DIVIDEND.md`
6. `SUBSTRATE_12P1D.md`
7. `FOOD_ADAPTER.md`

## License

The repository license is still being finalized. The current direction under discussion is a strong copyleft core so that protocol implementations remain part of a commons rather than being easily enclosed as proprietary infrastructure.