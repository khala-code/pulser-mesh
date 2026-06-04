# Validation and Checkpoint Specification

This document unifies validation rules and checkpoint logic into one protocol-facing spec.

## Why these belong together

Validation and checkpoint logic are not really separate layers yet. Validation determines whether a submitted graph state is admissible, and checkpoint logic determines what happens after admissibility is tested. In practice, the checkpoint is the execution environment of validation.

So for an early protocol, one combined spec is cleaner:

- validation says what must be true,
- checkpoint logic says when and how those truths are tested,
- and the outcome is acceptance, rejection, downweighting, or payout.

Later, if the protocol becomes more formal, this document can split into:

- normative validation rules,
- checkpoint execution spec,
- proof interface.

## Purpose

A checkpoint takes a submitted local graph state and decides whether it is eligible to generate validated common surplus and a downstream dividend pulse.

The combined spec therefore answers four questions:

1. What objects are being checked?
2. What makes them valid or invalid?
3. How is the checkpoint run?
4. What outputs does the checkpoint emit?

## Scope

This v1 spec covers:

- entity validation,
- edge validation,
- graph-shape validation,
- scarcity alignment validation,
- checkpoint execution order,
- downweighting,
- rejection rules,
- surplus estimation,
- and payout formation.

It does **not** yet fully specify:

- cryptographic proof format,
- appeals/dispute procedure,
- cross-checkpoint settlement finality,
- on-chain/off-chain division.

## Canonical checkpoint envelope

```json
{
  "checkpoint_id": "cp_2026_q2_fremantle_001",
  "window": {
    "start": "2026-04-01",
    "end": "2026-06-30"
  },
  "geography": "osm-relation:307847",
  "nodes": ,
  "edges": ,
  "scarcity_records": ,
  "prior_state_root": "0xprev",
  "proof_bundle": 
}
```

## Validation layers

Validation is performed in five layers.

A blocking failure in any layer may reject the submission.

### Layer 1 — envelope validation

The checkpoint envelope must be structurally valid.

Required checks:

- checkpoint ID exists,
- window is well-formed,
- geography is explicit,
- objects are parseable,
- timestamps are in range,
- no malformed or duplicate top-level objects.

Failure codes:

- `ERR_ENVELOPE_MALFORMED`
- `ERR_WINDOW_INVALID`
- `ERR_GEOGRAPHY_MISSING`
- `ERR_DUPLICATE_OBJECT`

### Layer 2 — entity validation

Each node must satisfy:

- node tuple exists,
- required tuple fields are present,
- `Xi >= Xi_min`,
- geography is defined,
- mission is defined,
- identity is not unresolved duplicate,
- node is not suspended.

Prototype predicate:

```text
entity_valid(n) =
  tuple_exists(n)
  AND Xi(n) >= Xi_min
  AND geography_defined(n)
  AND mission_defined(n)
  AND not_duplicate_identity(n)
  AND not_suspended(n)
```

Failure codes:

- `ERR_NODE_TUPLE_MISSING`
- `ERR_XI_TOO_LOW`
- `ERR_ID_DUPLICATE`
- `ERR_NODE_SUSPENDED`
- `ERR_MISSION_MISSING`

### Layer 3 — edge validation

Every counted edge must satisfy:

- both endpoints are valid or provisionally valid nodes,
- edge type is permitted,
- consent is present where required,
- timestamp lies inside the checkpoint window,
- units are typed,
- value is non-negative,
- replay or duplicate submission is absent.

Suggested edge types:

- `favor`
- `trade`
- `care`
- `supply`
- `transform`
- `distribution`

Failure codes:

- `ERR_EDGE_TYPE_INVALID`
- `ERR_CONSENT_MISSING`
- `ERR_EDGE_OUT_OF_WINDOW`
- `ERR_EDGE_REPLAY`
- `ERR_EDGE_VALUE_INVALID`

### Layer 4 — graph validation

The screened local graph must satisfy anti-extractive shape conditions.

Required graph properties:

- bounded concentration,
- bounded circularity,
- bounded self-dealing,
- sufficient counterparty diversity,
- sufficient locality,
- no dominant apex beyond threshold.

#### First-pass graph metrics

**A. Concentration ratio**

Let `CR1` be the weighted share of flow captured by the most central node.

- reject if `CR1 > 0.35`
- warn/downweight if `CR1 > 0.25`

**B. Diversity floor**

Each active claimant must have at least `k` distinct counterparties.

- `k = 2` for very small pilots
- `k = 4` for more mature meshes

**C. Wash-loop score**

Detect rapid reciprocal or circular flows with low external diversity.

- reject if above hard cap
- otherwise downweight suspicious subgraphs

**D. Locality ratio**

Minimum share of counted edges must occur within the declared geography or adjacency set.

- reject if below `L_min`

**E. Bottleneck score**

Estimate whether one node acts as a narrow capture point for a disproportionate share of otherwise distributed flow.

- reject if above hard cap
- warn if trending upward across windows

Failure codes:

- `ERR_GRAPH_CONCENTRATION`
- `ERR_WASH_LOOP`
- `ERR_LOCALITY_TOO_LOW`
- `ERR_BOTTLENECK_APEX`
- `WARN_GRAPH_DOWNSCALED`

### Layer 5 — scarcity alignment validation

A submission can be graph-clean and still fail mission validity.

A claiming subgraph passes scarcity alignment only if:

- the mission binds to a valid scarcity class,
- the mission binds to the checkpoint geography,
- a valid scarcity record exists for the class/geography/window,
- claimed actions plausibly affect one or more rotor channels,
- observed scarcity movement is directionally consistent with the claim,
- confidence is above minimum,
- attribution is bounded and non-fantastical.

Failure codes:

- `ERR_SCHEMA_MISSING`
- `ERR_MISSION_CLASS_INVALID`
- `ERR_MISSION_GEOGRAPHY_MISMATCH`
- `ERR_ROTOR_LINK_MISSING`
- `ERR_ATTRIBUTION_WEAK`
- `ERR_CONFIDENCE_TOO_LOW`

## Behavioral coherence

Behavioral coherence is partly encoded in `Xi`, but a window-specific contradiction check should still run.

Contradiction examples:

- mission claims food scarcity reduction while most counted activity routes elsewhere,
- repeated edge rewrites,
- frequent mission-class flipping,
- dispute rate above threshold,
- sudden growth spike without corresponding embedding.

Failure codes:

- `ERR_BEHAVIOR_CONTRADICTION`
- `WARN_GROWTH_SPIKE`

## Checkpoint execution order

The checkpoint should run in the following order.

### Stage 1 — intake

- verify envelope integrity,
- verify object parseability,
- verify timestamps and geography.

### Stage 2 — entity screening

- validate nodes,
- exclude ineligible entities,
- form provisional participant set.

### Stage 3 — edge screening

- validate edges against participant set,
- discard replayed, malformed, or non-consensual edges,
- build screened graph `G'`.

### Stage 4 — graph-shape analysis

- compute concentration,
- compute diversity,
- compute circularity,
- compute locality,
- compute bottleneck score,
- assign warnings or hard failures.

### Stage 5 — scarcity alignment

For each claiming node or subgraph:

1. bind mission to scarcity schema,
2. bind mission to rotor channel or channel bundle,
3. evaluate whether claimed actions plausibly affect that channel,
4. compare scarcity state to prior window,
5. estimate attributable improvement.

### Stage 6 — surplus estimation

Estimate validated common surplus, not raw volume.

Conceptually:

\[
\Sigma_v = f(G', R, q, \Xi, \omega, A)
\]

Where:

- `G'` = screened graph,
- `R` = rotor-based scarcity movement,
- `q` = structural quality,
- `Xi` = coherence,
- `omega` = confidence,
- `A` = attribution confidence.

Raw throughput alone must never produce validated surplus.

### Stage 7 — payout formation

Split validated surplus into:

\[
\Sigma_v = R_b + M + D + L
\]

Where:

- `R_b` = reserve buffer,
- `M` = maintenance,
- `D` = flat dividend pool,
- `L` = local reinvestment pool.

Suggested initial split:

- reserve buffer = 20%
- maintenance = 5%
- dividend pool = 60%
- local reinvestment = 15%

The defining rule is that the dividend pool is not distributed in proportion to capital input.

### Stage 8 — finalization

If accepted:

- emit state root,
- record accepted metrics,
- record payout obligations,
- publish reason codes and warnings.

If rejected:

- publish rejection reason codes,
- emit no dividend pulse.

## Downweighting

Not every anomaly should force rejection.

Downweighting is appropriate when:

- confidence is moderate but not terrible,
- graph concentration is elevated but below hard cap,
- attribution is plausible but weak,
- there are limited duplication uncertainties,
- scarcity movement is directionally right but noisily measured.

Suggested combined weight:

\[
W = W_q \cdot W_{\Xi} \cdot W_{\omega} \cdot W_A \cdot W_G
\]

Where:

- `W_q` = structural quality weight,
- `W_Xi` = coherence weight,
- `W_omega` = measurement-confidence weight,
- `W_A` = attribution weight,
- `W_G` = graph-integrity weight.

Then:

\[
\Sigma_v^{adj} = W \cdot \Sigma_v
\]

## Outcomes

Each checkpoint submission must resolve to one of four outcomes:

- `accepted`
- `accepted_with_downweighting`
- `flagged_for_review`
- `rejected`

## Dividend eligibility

A participant is dividend-eligible only if:

- it belongs to the accepted participant set,
- `Xi >= Xi_min`,
- it is not suspended or duplicate,
- its activity is not fully rejected or fully downweighted away,
- and minimum participation threshold is met.

## Minimal pseudocode

```text
function checkpoint(input):
  assert envelope_valid(input)

  N = validate_nodes(input.nodes)
  E = validate_edges(input.edges, N)
  Gp = build_graph(E)

  graph_state = analyze_graph(Gp)
  if graph_state.hard_fail:
    return reject(graph_state.reason_codes)

  scarcity_state = evaluate_scarcity_alignment(
    Gp,
    input.scarcity_records,
    input.window,
    input.geography
  )
  if scarcity_state.blocking_fail:
    return reject(scarcity_state.reason_codes)

  behavior_state = evaluate_behavioral_coherence(N, E, Gp)
  if behavior_state.blocking_fail:
    return reject(behavior_state.reason_codes)

  Sigma_v = estimate_validated_surplus(
    Gp,
    graph_state,
    scarcity_state,
    behavior_state
  )

  W = compute_downweight(graph_state, scarcity_state, behavior_state)
  Sigma_v_adj = W * Sigma_v
  payout = compute_payout_split(Sigma_v_adj)

  if requires_review(graph_state, scarcity_state, behavior_state):
    return flagged_for_review(...)

  if W < 1:
    return accepted_with_downweighting(...)

  return accepted(...)
```

## Interpretation

The checkpoint is not just a payout machine. It is the protocol boundary where local graph life is compressed into a judgment:

- was the activity real,
- was it consentful,
- was it non-extractive,
- did it reduce a real scarcity channel,
- and is any surplus valid enough to pulse back down?

## Next move

After this, the cleanest next document is probably `FOOD_ADAPTER.md`, because the unified scarcity schema and the unified validation/checkpoint spec now need one concrete domain implementation to test whether the whole framework actually holds together.
