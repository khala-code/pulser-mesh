# Node Tuple Definitions

This document defines the first working version of the Pulser Mesh node tuple.

## Purpose

A node tuple is the minimum structured description required for a participant to enter the mesh as a protocol-valid actor rather than as a loose profile. The tuple must be rich enough to support validation, scarcity alignment, and checkpoint accounting, while still being simple enough for a first prototype.

## Canonical tuple

\[
\mathcal{N} = (p, q, \phi, \vec{m}_s, \vec{g}, \Xi)
\]

Each node is evaluated as a stateful participant with:

- structural embedding,
- growth behavior,
- scarcity mission,
- geographic grounding,
- and coherence.

## Field definitions

### 1. `p` — embedding depth

`p` is a scalar or bounded integer describing how deeply the node is embedded in the local mesh.

Interpretation:
- low `p`: shallow, thinly connected, transactional only,
- high `p`: socially or operationally embedded through repeated, place-linked interaction.

Prototype meaning:
- count of distinct counterparties with repeated valid edges,
- weighted by recency and diversity,
- discounted for circular self-reinforcing loops.

Constraints:
- `p >= 0`
- should increase with authentic mesh participation,
- must not be cheaply inflated by self-dealing.

### 2. `q` — structural quality

`q` measures the quality of the node's local topology, not just its amount of activity.

Interpretation:
- high `q`: edges connect across a useful local structure and show non-parasitic participation,
- low `q`: activity is concentrated, extractive, bottlenecked, or obviously synthetic.

Prototype meaning:
- diversity of counterparties,
- bidirectionality where appropriate,
- low apex concentration,
- low wash-loop incidence.

Constraints:
- normalized to ``,
- used in anti-extractive checks,
- should fall when a node acts as a capture bottleneck.

### 3. `phi` — local growth ratio

`phi` is the node's recent growth behavior.

Interpretation:
- not all growth is good,
- the protocol distinguishes healthy mesh growth from extractive hyper-scaling.

Prototype meaning:
- ratio of current valid activity to prior valid activity over a checkpoint window,
- optionally smoothed over multiple windows.

Constraints:
- `phi > 0`,
- extreme `phi` without matching embedding or scarcity reduction is suspicious,
- high `phi` may trigger deeper review instead of outright rejection.

### 4. `m_s` — mission vector in scarcity space

`m_s` is the node's declared direction of action in one or more scarcity dimensions.

Prototype meaning:
- a structured vector over scarcity classes,
- for example food, housing, energy, care, mobility, waste, water.

Example:

```json
{
  "food": 0.8,
  "care": 0.2,
  "mobility": 0.0
}
```

Constraints:
- vector must be sparse and interpretable,
- declarations must map to measurable scarcity schemas,
- cannot be purely aspirational marketing text.

### 5. `g` — geographic grounding

`g` defines the geography in which the node claims relevance.

Prototype meaning:
- a named locality plus explicit spatial boundary,
- such as neighborhood, suburb, municipality, watershed, or region.

Example:

```json
{
  "name": "Fremantle",
  "type": "local_government_area",
  "country": "AU",
  "boundary_ref": "osm-relation:307847"
}
```

Constraints:
- every mission claim must bind to a geography,
- geographies must be nestable for later aggregation,
- global or undefined geographies are invalid for local scarcity claims.

### 6. `Xi` — coherence floor

`Xi` measures whether the node is stable enough to be treated as a continuing participant.

Interpretation:
- stable identity,
- continuity of mission,
- low contradiction between claims and observed behavior,
- durable enough to enter checkpoint accounting.

Prototype meaning:
- weighted score derived from identity continuity, successful commitments, dispute rate, and mission consistency.

Constraints:
- normalized to ``,
- nodes below a minimum `Xi_min` cannot emit dividend-bearing claims,
- `Xi` can recover over time.

## Minimal data model

A first machine-readable representation:

```json
{
  "node_id": "node_001",
  "tuple": {
    "p": 4,
    "q": 0.71,
    "phi": 1.18,
    "m_s": {"food": 0.8, "care": 0.2},
    "g": {
      "name": "Fremantle",
      "type": "local_government_area",
      "country": "AU",
      "boundary_ref": "osm-relation:307847"
    },
    "Xi": 0.83
  },
  "entity_type": "cooperative",
  "created_at": "2026-06-04T00:00:00Z"
}
```

## Derived interpretation

A node is not validated because it says good words. It is validated when:

1. its structure shows real local embedding,
2. its mission binds to a measurable scarcity field,
3. its geography is explicit,
4. its behavior remains coherent over time,
5. and its growth is not out of proportion to the mesh that supports it.

## Prototype thresholds

Suggested first-pass thresholds:

- `p >= 2`
- `q >= 0.55`
- `Xi >= 0.60`
- `phi <= 2.5` for automatic pass, else manual or secondary review
- at least one positive mission component in `m_s`
- exactly one primary geography in `g`

These are starting heuristics, not final economic law.

## Open questions

- Should `p` and `q` remain separate or collapse into one embedding tensor?
- Should `phi` be scalar or a short time-series fingerprint?
- Should `Xi` be partly social and partly cryptographic?
- How many scarcity axes can a node credibly claim in v1?
