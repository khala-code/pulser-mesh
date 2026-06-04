# 12+1D Substrate Interface

This document defines the 12+1D substrate as the underlying interface data format for Pulser Mesh.

It also sketches how zero-knowledge validation can later be implemented through boundary projection and interference-pattern commitments without overclaiming cryptographic finality.

## Purpose

The protocol now has:

- node tuples,
- scarcity schema,
- value-add transformation schema,
- validation and checkpoint logic,
- consent check,
- and the first food adapter.

What is still missing is the common substrate in which these objects can be embedded, reproduced, and validated.

The 12+1D substrate is that layer.

Its role is to provide:

- a common geometry for node state representation,
- a reproducible interface format,
- a boundary object for projection,
- and a path toward privacy-preserving proof generation.

## Design position

Every node that wishes to participate in checkpoint validation must be able to reproduce its geometry in a standard substrate form.

That substrate is not merely storage. It is the canonical representation that allows:

- comparison,
- projection,
- interference,
- checkpoint compression,
- and eventually proof generation.

## Why 12+1D

The 12+1D substrate should be understood as:

- 12 structured dimensions for protocol state,
- plus 1 boundary / phase / temporal dimension governing projection and standing-wave interaction.

The exact philosophical interpretation can evolve, but v1 needs a stable interface shape.

So for implementation purposes:

- the **12** are protocol coordinates,
- the **+1** is the projection / phase dimension that permits boundary interaction and proof behavior.

## Canonical substrate vector

Define the substrate state of a node or object as:

\[
\mathcal{U} = (u_1, u_2, \dots, u_{12}; \theta)
\]

Where:

- `u_1 ... u_12` are structured state coordinates,
- `theta` is the boundary-phase coordinate.

## Suggested first coordinate layout

A practical v1 layout is:

1. `u1` — identity continuity
2. `u2` — geographic grounding
3. `u3` — mission orientation
4. `u4` — embedding depth
5. `u5` — structural quality
6. `u6` — growth ratio
7. `u7` — coherence
8. `u8` — consent state
9. `u9` — scarcity class linkage
10. `u10` — rotor target linkage
11. `u11` — transformation state linkage
12. `u12` — checkpoint participation state
13. `theta` — boundary projection phase

This is not yet final metaphysics. It is an interface schema.

## Interpretation of the +1 boundary dimension

The `theta` coordinate should be treated as the phase-like dimension along which a substrate state is projected to a checkpoint boundary.

This matters because your ZKP idea is not simply “prove a scalar fact.” It is closer to:

- embed a state,
- project it to a boundary,
- observe interference with validation constraints,
- accept or reject based on the standing-wave pattern.

So the boundary dimension is what lets the substrate become testable without fully exposing the interior.

## Boundary projection

Each participant should be able to produce a projection of its substrate state onto a checkpoint boundary:

\[
\Pi_B(\mathcal{U}) \rightarrow \mathcal{B}
\]

Where:

- `Pi_B` is a boundary projection operator,
- `U` is the full substrate state,
- `B` is the resulting boundary representation used by validators.

The important architectural idea is:

- validators do not necessarily need the full interior state,
- they need a boundary projection sufficient to test admissibility and consistency.

## Standing-wave primitive

You proposed constructive and destructive standing waves as the primitive.

That can be specified at the design level as follows:

- **constructive interference** corresponds to alignment between projected node geometry and protocol-valid constraint surfaces,
- **destructive interference** corresponds to mismatch, contradiction, or invalid structure.

So the primitive validation question becomes:

> when the projected state meets the checkpoint constraint boundary, does it reinforce or cancel?

## Constraint surface intuition

Each checkpoint can be treated as defining a family of constraint surfaces:

- consent surface,
- scarcity-alignment surface,
- anti-extractive topology surface,
- coherence surface,
- transformation-validity surface.

A node or subgraph projects onto the boundary, and the resulting pattern is tested against these surfaces.

## Zero-knowledge interpretation

This is where caution matters.

Standard zero-knowledge proofs establish that a prover knows a witness for a statement without revealing the witness itself. Modern systems usually express the statement as arithmetic, polynomial, code-based, or lattice-based constraints rather than as physically interpreted wave interference.

So Pulser Mesh should not claim today that boundary projection interference patterns are already a standard cryptographic ZKP construction. That would overstate the current state of the art.

What *is* reasonable is to define a **proof architecture target**:

- the full substrate state is the private witness,
- the checkpoint-valid statement is the public claim,
- the boundary projection is the public or semi-public commitment surface,
- the interference test is the protocol's conceptual primitive for evaluating constraint satisfaction.

In later implementation, that conceptual model can be compiled into an actual ZKP system using established proof machinery such as arithmetic circuits, polynomial constraints, or lattice-based constructions.

## Recommended cryptographic stance

For now, the honest specification is:

1. define the 12+1D substrate as the canonical interface layer,
2. define boundary projection and interference as the protocol's validation metaphor and internal formalism,
3. defer the actual zero-knowledge backend to a later compilation layer,
4. likely compile into a standard proof system rather than inventing a totally new cryptographic primitive from scratch.

That keeps the conceptual geometry while remaining technically credible.

## Canonical object shape

```json
{
  "substrate_id": "sub_node_001",
  "entity_ref": "node_001",
  "coordinates": {
    "u1_identity_continuity": 0.93,
    "u2_geographic_grounding": 0.88,
    "u3_mission_orientation": 0.91,
    "u4_embedding_depth": 0.62,
    "u5_structural_quality": 0.71,
    "u6_growth_ratio": 0.54,
    "u7_coherence": 0.83,
    "u8_consent_state": 1.00,
    "u9_scarcity_class_linkage": 0.94,
    "u10_rotor_target_linkage": 0.79,
    "u11_transformation_state_linkage": 0.68,
    "u12_checkpoint_participation_state": 0.74,
    "theta_boundary_phase": 0.41
  },
  "projection_commitment": "0xabc123",
  "window": {
    "start": "2026-04-01",
    "end": "2026-06-30"
  }
}
```

## Reproducibility rule

Any node participating in validation must be able to regenerate its substrate representation deterministically for a given checkpoint window.

That means:

- same input state,
- same transform rules,
- same window,
- same substrate encoding,
- same boundary commitment.

Without reproducibility, the substrate cannot support meaningful checkpoint validation.

## Interface requirements

A v1 substrate implementation should support:

- deterministic encoding,
- coordinate normalization,
- boundary projection,
- commitment generation,
- replay-safe window binding,
- and versioned schema metadata.

## Minimal interface

```json
{
  "encode_substrate": {
    "input": ,
    "output": 
  },
  "project_boundary": {
    "input": ,
    "output": 
  },
  "verify_interference": {
    "input": ,
    "output": 
  }
}
```

## Constructive and destructive scores

A first-pass implementation can summarize boundary interaction with two bounded values:

- `constructive_score`
- `destructive_score`

Interpretation:

- high constructive score = stronger alignment with protocol-valid geometry,
- high destructive score = stronger cancellation against constraint surfaces.

This creates a useful bridge between your standing-wave formalism and ordinary checkpoint logic.

## Relationship to existing specs

### Node tuple

The node tuple is one input to substrate encoding. It is not the substrate itself.

### Scarcity schema

The scarcity record determines the rotor-linked constraint surfaces that the substrate projection must satisfy.

### Transformation schema

Transformation records feed the transformation-state coordinates and scarcity-distance claims.

### Consent check

Consent state is one coordinate family and also one boundary test surface.

### Validation and checkpoint

The checkpoint can treat substrate projection as a lower-level validation layer beneath the current heuristic rules.

## Recommended implementation path

A realistic path is:

1. define the 12+1D schema and deterministic encoding,
2. implement mock boundary projections and interference scores,
3. connect those scores to checkpoint reason codes,
4. only then explore a compiled ZKP backend,
5. likely using an established proof family rather than claiming a novel primitive too early.

## Open questions

- Are the 12 coordinates fixed or should some be basis-mapped from higher-dimensional raw state?
- Is `theta` purely phase, or phase-time jointly?
- Should subgraphs have their own substrate state distinct from individual nodes?
- What exact boundary operators should be canonical in v1?
- Which existing ZKP family is the best compilation target for the interference model: circuit-based, polynomial, or lattice-based?

## Recommended repo placement

```text
/NODE_TUPLE.md
/SCARCITY_SCHEMA.md
/VALUE_ADD_TRANSFORMATION_SCHEMA.md
/VALIDATION_AND_CHECKPOINT.md
/CONSENT_AND_DIVIDEND.md
/SUBSTRATE_12P1D.md
/FOOD_ADAPTER.md
```
