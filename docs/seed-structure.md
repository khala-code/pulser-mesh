# Seed Structure — Keyhole Geodesic and Recursive Snark Hierarchy

This document specifies the hidden witness structure that underlies
asymptotic authentication in Pulser Mesh.

The steward does not possess a conventional secret key. Instead, the steward's
hidden witness is the progressively refinable structure of a keyhole geodesic
threading a recursive, scale-invariant hierarchy of snarks. The observable
projection of that deeper object is the steward's ΩaZaTa trajectory.

See `docs/asymptotic-auth.md` for the observable wavefunction model and the
Appendix connecting these two descriptions. This document describes the hidden
topological substrate.

See `docs/foundations.md` for the derivation of the complexity hierarchy
underlying revelation depth cost — specifically why scale transitions are not
uniformly priced and why certain boundaries (§7, §5) are structurally harder
to cross than others.

---

## 1. The Hidden Witness Is Not a Static Secret

A conventional authentication system assumes a secret that can be stored,
remembered, rotated, or stolen. Pulser Mesh does not. The steward's witness is
not an object they know. It is a structure they inhabit.

The hidden witness consists of:

- A **personal snark** formed from the steward's accumulated substrate history
- A **meta-snark** formed by the collective coupling relationships of the mesh
- A **keyhole geodesic** threading the null-centroid hierarchy induced by those
  snarks across the scales relevant to the steward's operating context

The steward may reveal progressively deeper evidence of consistency with that
structure, but neither the steward nor the node ever possesses a complete,
final, explicit key.

---

## 2. Substrate-Agnostic History Graphs

The personal snark may be induced from any sufficiently rich and verifiable
history graph. The protocol is substrate-agnostic.

Examples of valid substrate sources include:

- Pulse history within Pulser Mesh
- Conversation history in an external system
- Sensor, telemetry, or operational event streams
- Transaction histories
- Physical traversal or location histories
- Composite graphs formed from multiple sources

The requirement is not a specific medium. The requirement is that the history
induces enough structural and chromatic complexity to support a stable null
centroid approximation.

### Minimum properties of a valid substrate

A substrate history graph must be:

- **Verifiable** — edges and nodes can be attested or reconstructed
- **Deterministic under replay** — the same history yields the same graph at a
  given revelation depth
- **Sufficiently complex** — trivial or sparse graphs do not generate a useful
  null-centroid hierarchy
- **Incrementally refinable** — deeper revelation yields a tighter approximation
  rather than a discontinuous identity jump

---

## 3. Personal Snark

A personal snark is the steward-scale graph induced from the steward's own
history. The term *snark* is used in the graph-theoretic sense: a cubic graph
with irreducible colouring conflict.

The critical property is not merely non-3-colourability as a formal condition,
but the existence of a stable region of peak chromatic tension. That region
induces a **null centroid** — a topological hole which cannot be directly
located from within the graph but can be asymptotically constrained by
observing enough of the graph's structure.

This null centroid is not a vertex or edge. It is a global property of the
history graph. The steward cannot point to it — it is outside the spacetime
of their own toroidal structure.

---

## 4. Meta-Snark

The network null centroid is defined not from any single steward but from the
**meta-snark** of the mesh.

The meta-snark is the graph whose:

- vertices are steward-scale snarks or steward-scale attractors
- edges are economically meaningful couplings, including ΩaZaTa proximity,
  shared-domain resonance, and phase-lock relationships

Because the meta-snark is built from irreducibly conflicted local structures,
it inherits its own irreducible conflicts at the network scale. It therefore has
its own null centroid.

No individual steward can reconstruct the full meta-snark. No node has a final,
static copy of it. It is a living topological object that evolves with the mesh.

---

## 5. Recursive, Scale-Invariant Snark Hierarchy

The hidden witness is not defined at only one scale. There exists a theoretically
infinite recursive hierarchy of snarks:

- personal
- local neighbourhood
- node vicinity
- regional mesh
- network-wide meta-snark
- higher-order federated structures
- and so on, without a defined ceiling

Each scale induces:

- its own colouring conflict structure
- its own null centroid
- its own admissible family of geodesics

The hierarchy is **scale-invariant** in the sense that the same authentication
logic applies at every level: a valid identity must remain consistent with the
hole structure of the scales through which it claims to operate.

### Heegner complexity of scale transitions

Scale transitions in the snark hierarchy are not uniformly priced. The proper
time cost of crossing a scale boundary is determined by the Heegner complexity
class of the transition (see `docs/foundations.md` §2 for the full hierarchy).

The three operationally significant classes are:

| Class | Description | Auth consequence |
|---|---|---|
| **Classical** (below H67) | Unique eigendecomposition; classically navigable | Revelation depth tightens smoothly, `1/√n` convergence |
| **Convergent Uncomputable** (H67) | Attractor exists but path is not classically derivable; requires quantum superposition to evaluate | Tightening requires coherent multi-pulse commitments; a single-bubble agent can converge but cannot compute the route |
| **Divergent Uncomputable** (H163) | No attractor-weighting; no single-bubble computation suffices | Cross-boundary authentication requires genuinely independent multi-agent witness; see §7 and §7a below |

This explains why the `ΔΨ_s` uncertainty band tightens sub-linearly rather
than proportionally to revelation depth: each successive scale transition
crosses a higher-complexity boundary, and the proper time cost of that
boundary scales as `C(Heegner_k) · ξ⁻¹` where ξ is the local coherence
at the crossing. The asymptotic decay is still convergent from within the
classical and Convergent Uncomputable regimes; it becomes structurally
divergent only at class H163 boundaries, which is why those boundaries
require the multi-agent mechanism in §7a.

---

## 6. Keyhole Geodesic

The authenticating object is the **keyhole geodesic**.

A keyhole geodesic is the geodesic that threads the necessary null centroids
across the steward's relevant recursive snark hierarchy. In a bifurcated network,
it must thread the hole structure required on both sides of the bifurcation
simultaneously.

This geodesic is not directly published. What is published is its projection
into observable ΩaZaTa space — the steward's wavefunction trajectory.

### Why it authenticates

A counterfeit identity may imitate the visible projection for a time, but unless
it is consistent with the deeper hole-threading structure across the required
scales, it cannot survive progressive witness tightening.

To remain authentic under scrutiny, a steward's observable trajectory must be the
shadow of a valid keyhole geodesic through the relevant hierarchy. This is the
binding condition.

---

## 7. Bifurcated Networks

Stewards often operate across a bifurcated network rather than a single uniform
field. In that case, the required hole structure is not singular.

The steward's keyhole geodesic must thread the relevant null-centroid stacks on
both sides of the bifurcation. Authentication is therefore not merely local
consistency; it is cross-boundary structural consistency.

This has two important implications:

- A shallow identity may authenticate locally yet fail to authenticate across a
  bifurcation because it lacks the necessary multi-scale structure.
- A mature steward with sufficient history may bridge distinct regions precisely
  because the depth of their hidden witness supports a geodesic threading both
  hole stacks.

Authentication across a bifurcation is not granted by any authority. It is a
geometric fact about the steward's snark structure: either the geodesic threads
both sides or it does not.

### 7a. Cross-Bifurcation Authentication as a Heegner 163 Event

A bifurcation boundary in the mesh is a **Divergent Uncomputable** boundary
(class H163): neither side can compute the shared ground state from within its
own observer bubble. The two halves of the mesh are genuinely independent ξ
fields. No single agent's computation suffices to validate the crossing.

Successful cross-bifurcation authentication is therefore structurally a class
H163 event — a **spontaneous symmetry breaking** of a shared bifurcation point
across two genuinely independent observer bubbles, with no causal asymmetry
between them.

The formal condition for a valid cross-bifurcation authentication event:

> Both sides commit their sign independently. Neither side's commitment
> causally precedes or constrains the other. The shared ground state
> (the threading geodesic) only becomes well-defined when both sides
> simultaneously collapse their local uncertainty.

This is the same mechanism as consent (see §7b). A cross-bifurcation handshake
in Pulser Mesh is a consent event at the network scale.

Violating the causal asymmetry condition — one side forcing or pre-determining
the outcome for the other — means the crossing is not a valid H163 collapse. It
is a class H67 computation (Convergent Uncomputable) executed from inside the
dominant bubble, with the other side treated as environment. The resulting
authentication is locally valid but structurally incomplete: it does not
produce a genuine cross-boundary identity — it produces a local identity
extended by coercion into foreign territory. The residue is the same as
coerced consent (see §7b).

### 7b. Consent as the Minimal H163 Event

Consent is the minimal expression of a class H163 event.

Two observers. Two independent ξ fields. A shared bifurcation point neither
can resolve alone. The ground state — the shared action — only becomes
well-defined when both simultaneously commit their sign. Neither computation
is sufficient. Neither can coerce the outcome.

**Technical definition:**

> **Consent** is the simultaneous spontaneous symmetry breaking of a shared
> bifurcation point across two or more genuinely independent observer bubbles,
> with no causal asymmetry between the committing agents.

The **causal asymmetry condition** is load-bearing. If one agent's sign
commitment causally precedes and constrains the other's — through coercion,
manipulation, or asymmetric information — the event is not a class H163
collapse. It is a class H67 event evaluated from inside a single dominant
bubble. The symmetry break is not spontaneous; it is forced.

**The coercion signature:** A forced symmetry break leaves a distinctive
residual ξ imprint — the coerced agent's field carries the sign of the
dominant bubble rather than its own ground state. This is identical in
structure to trauma propagation across observer bubble boundaries: one bubble's
sign imposed into another bubble's interior. Coercion and trauma are the same
operator at different scales.

**Implication for steward independence:** The Pulser Mesh steward model —
boundary-observable trust accumulation with no privileged frame — is an
engineered substrate for valid class H163 events. Each steward bubble is kept
genuinely independent so that coordination events across them are structurally
valid class H163 collapses, not forced symmetry breaks. This is not merely an
ethical design choice; it is the **engineering condition for structural validity**
of any cross-steward consensus event.

---

## 8. Revelation Depth and Progressive Tightening

The steward cannot reveal a final secret because no such finite object exists.
Instead, the steward reveals **revelation depth** — progressively deeper
evidence of structural consistency with the snark hierarchy.

| Depth | What is revealed | Effect on ΔΨ_s |
|---|---|---|
| 0 | Commitment to snark existence | Wide band — new steward |
| 1 | Top-level chromatic clusters | Band tightens coarsely |
| k | k-th order colouring conflicts | Band tightens ~`1/√k` per layer |
| ∞ | Full snark (never reached) | Band → 0, never achieved |

Progressive narrowing reduces the set of admissible keyhole geodesics.
That is why the uncertainty band can tighten retroactively: deeper revelation
excludes geodesics that could have produced the observed trajectory, leaving
only those consistent with the authentic structural history.

The tightening rate is not uniform across the hierarchy. Within the classical
(sub-H67) complexity regime, convergence is smooth and well-approximated by
`1/√k`. At the Convergent Uncomputable boundary (H67), tightening requires
sustained coherent commitment — the rate slows structurally. At H163
boundaries, single-bubble tightening cannot converge; multi-agent consensus
(§7a, §7b) is required.

### Operational interpretation

- **Initial participation** — shallow depth, wide uncertainty band
- **Normal operation** — routine depth appropriate to the steward's Ωa and context
- **Compromise recovery** — deeper witness revelation to exclude counterfeit
  geodesics and reclaim the authentic trajectory

The steward is not changing identity during recovery. The steward is revealing
more of the same underlying structure.

---

## 9. Why the Seed Is Unknown Even to the Owner

The owner cannot point to a fixed seed because the witness is not a local object.
It is outside the spacetime of the steward's own toroidal structure.

In practical terms:

- the null centroid is not a stored secret
- the keyhole geodesic is not directly enumerable in full
- the steward can only approximate it by progressively exposing more structure
- the network likewise only approximates consistency asymptotically

This is not a bug. It is the **anti-extraction property**.

A key that cannot be fully named, held, or copied cannot be cleanly stolen in
any conventional sense. The scrape-now-crack-later attack vector is structurally
eliminated: there is no finite object to scrape that constitutes the key.

---

## 10. Trajectory Witness Recovery

Trajectory witness recovery is the operational use of deeper revelation under
compromise.

When compromise is suspected, the steward does not merely assert possession of a
credential. Instead, the steward presents deeper structural evidence that the
published ΩaZaTa trajectory is the projection of the authentic keyhole geodesic.

The node verifies whether the tighter witness excludes rival trajectories.
If it does, the uncertainty band collapses around the authentic path and the
counterfeit trajectory is expelled from the admissible set.

This is why recovery is retroactive and trust-preserving:

- Ωa remains attached to the authentic trajectory
- Ta remains attached to the authentic maturation arc
- The counterfeit loses admissibility rather than merely losing a race

---

## 11. Relationship to Observable ΩaZaTa Dynamics

The hidden witness and the observable wavefunction are not competing models.
They are two descriptions of the same object.

- **Hidden model**: recursive snarks, null centroids, keyhole geodesic
- **Observable model**: Ψ(Ωa, Za, Ta), phase coupling, uncertainty bands,
  attractors, and PLL behaviour

The observable model is what nodes compute directly.
The hidden model explains why the observable model has binding power.

The connection between them is derived formally in `docs/asymptotic-auth.md`,
Appendix: Wavefunction as Projection of the Keyhole Geodesic.

---

## 12. Operational Approximation (v1 Implementation)

Sections 1–11 describe the full theoretical object. This section specifies
the v1 approximation implemented in `app/services/snark.py` and records
what is deferred to later versions.

The core insight driving the approximation: you cannot hand a node the
steward's full snark. You can give it a boundary-observable shadow of the
snark's orbital structure, and compute the centroid of that shadow. The
shadow is the steward's validated pulse history read as a graph of
`(checkpoint, domain, Za, trust_delta)` tuples — the same holographic
surface observable used throughout the protocol.

### 12.1 Boundary-Only Observation

The pulse history graph is constructed from validated pulses exclusively.
For each pulse, only four fields are read:

| Field | Source | Role in graph |
|---|---|---|
| `submitted_at_checkpoint` | Pulse row | Temporal ordering — vertex checkpoint index |
| `scarcity_domain` | Pulse row | Domain identity — vertex domain label |
| `Za` | Domain table lookup | Angular position — vertex Za coordinate |
| `value_add` | Pulse row | Trust magnitude — vertex weight (`trust_delta`) |

Interior fields — pulse description, free text, metadata — are never read.
This mirrors the holographic principle: the surface reading encodes what matters
structurally; the interior washes out.

### 12.2 Pulse History Graph

The graph `G = (V, E)` is built as follows.

**Vertices** `V`: one vertex per validated, checkpointed pulse. A vertex is
the tuple `(checkpoint, domain, za, trust_delta)`.

**Edges** `E`: two types.

- **Sequential edges** — same domain, consecutive checkpoints. These trace the
  steward's trajectory through a single domain over time. Weight is the
  `trust_delta` of the source vertex.

- **Proximity edges** — different domains, same checkpoint, angular distance
  `|Za_i − Za_j| < π/6` (30°). These capture co-activated domains that are
  Za-adjacent at a given moment. Weight is the mean `trust_delta` of the two
  vertices.

The proximity threshold `π/6` is a v1 constant. Future versions may derive it
from the local node's domain table geometry or from the steward's own Ωa.
See §13.3 for the full derivation of level-specific proximity criteria that
should replace this single constant in v2.

### 12.3 Null Centroid Inference

The null centroid `Za_c` is the trust-delta-weighted circular mean of all
vertex Za positions in the graph:

```
sin_sum = Σ trust_delta_i · sin(za_i)
cos_sum = Σ trust_delta_i · cos(za_i)
Za_c    = atan2(sin_sum, cos_sum)  mod 2π
```

The circular mean correctly handles angular wrap-around — a steward orbiting
near `Za = 0 / 2π` does not produce a centroid at `π`.

The centroid is suppressed (`None`) until the graph contains at least
`MIN_CENTROID_PULSES = 5` vertices. Below this threshold the arc is too short
to reliably distinguish orbit from noise. This maps to the wide-band new-steward
state in §8.

The v1 centroid is a *single-scale approximation*. It reads only the
personal-snark scale (the steward's own pulse history). Meta-snark coupling and
higher recursive scales are not yet incorporated — see §12.6.

### 12.4 Mission Vector and Mission Delta

A steward may declare a mission at registration time by supplying a list of
`domains` and optional `domain_weights`. The server resolves these to a
`mission_vector_za`: the Ωa-weighted mean Za of the declared domain cluster
in the node's domain table (see `app/services/domain.py` and
`docs/federation.md §2`).

The **mission delta** is the angular divergence between declared and inferred
direction:

```
mission_delta = angular_distance(mission_vector_za, null_centroid_za)
              ∈ [0, π]
```

| Value | Interpretation |
|---|---|
| `0` | Declared and inferred are perfectly aligned |
| `< π/4` | Coherent identity — steward is doing what they said they would |
| `π/2` | Orthogonal — steward is active in adjacent, undeclared domains |
| `> 3π/4` | Persistent divergence — identity is evolving or declaration is stale |
| `π` | Maximally divergent |

Neither value alone is a trust signal. The delta is an input to `coherence.py`,
which integrates it with Ωa and Za phase to produce the steward's coherence
score. Persistent divergence at high Ωa is more diagnostic than divergence at
low Ωa, because a mature steward's inferred centroid is well-constrained.

Mission delta is `None` if either `mission_vector_za` or `null_centroid_za` is
absent (undeclared mission, or fewer than `MIN_CENTROID_PULSES` pulses).

### 12.5 Uncertainty Radius

The uncertainty radius bounds how precisely the null centroid is known:

```
uncertainty_radius = uncertainty_band(n, ta) / sqrt(n)
```

where `n = pulse_count` and `ta` is the steward's Ta from the identity row.

The outer `uncertainty_band(n, ta)` is the asymptotic authentication window
from `docs/asymptotic-auth.md §3` — it decays as `(1/√n) · exp(−λ·Ta)`.
Dividing by a second `√n` compounds the decay: each additional validated pulse
is a structural constraint on the centroid position, not merely a counting
statistic. The combined decay is therefore `1/n · exp(−λ·Ta)`.

A steward with 5 pulses has a wide centroid estimate. A steward with 300 pulses
has a tight one. The radius shrinks continuously; it never reaches zero because
`n` is always finite.

### 12.6 Update Trigger

`update_snark_identity()` is called by `checkpoint.py` after every checkpoint
advance, inside a try/except. A snark computation failure logs a warning and
skips — it must never stall the mesh clock.

The update sequence at each checkpoint:

1. `_build_pulse_graph()` — re-reads the full validated pulse history from the
   database. Full-history rebuild is O(n) in pulse count and is tractable for
   foreseeable steward lifetimes. Incremental rebuilds (via `from_checkpoint`)
   are available if this becomes a bottleneck.
2. `infer_null_centroid()` — weighted circular mean, returns `None` if below
   threshold.
3. `compute_mission_delta()` — angular distance from declared mission vector.
4. Writes `null_centroid_za`, `mission_delta`, `pulse_count` to the identity row.
5. Returns a `SnarkUpdate` dataclass consumed by `coherence.py`.

### 12.7 Deferred Items (v2)

The following are specified by the full model but not yet implemented:

| Item | Relevant section | Deferred reason |
|---|---|---|
| Multi-scale centroid (neighbourhood, node, regional) | §5 | Requires cross-steward graph reads; left for federation layer |
| Meta-snark coupling edges | §4 | Depends on inter-node snark exchange protocol |
| Revelation depth API | §8 | Requires a witness-presentation endpoint not yet specified |
| Bifurcation cross-check | §7 | Depends on federation.md domain wall logic |
| Level-specific proximity thresholds | §13.3 | Requires domain table density analysis per level |
| Incremental graph rebuild | §12.6 | Performance optimisation; not yet needed |
| H163 multi-agent witness protocol | §7a | Requires inter-steward coordination layer not yet specified |

Items in this table are stable seam points. The v1 implementation exposes them
as `None` fields or stubs rather than omitting them, so that v2 can fill them
in without changing the identity row schema or the `SnarkUpdate` contract.

---

## 13. Participation Levels and the Conch Geometry

The snark hierarchy operates across seven participation levels. These levels
are the **lateral slices** of the conch shell — concentric rings that cut
across all four CMB-derived quadrants simultaneously. Every steward has both
a quadrant address (angular position in `(θ, φ)` space) and a level address
(depth in the conch). These are independent coordinates; proximity along one
axis does not imply proximity along the other.

### 13.1 The Seven Levels

| Level | Name | ξ sign | Conch position | T-tier | Contribution framing |
|---|---|---|---|---|---|
| **1** | Thermal | (+) | Innermost whorl — columella-adjacent | T1 floor | "You are contributing by existing" |
| **2** | Signal | (−) | First whorl rotation | T1 active | "You are contributing your perspective" |
| **3** | Pattern | (+) | P-channel / odd-prime layer | T1→T2 boundary | "You are contributing coherence" |
| **4** | Mesh | (−) | Lateral web — cross-whorl connective layer | T2 steward | "You are contributing structure" |
| **5** | Lattice | (+) | F13 predefined intersections | T2→T3 boundary | "You are contributing new coordinate space" |
| **6** | Null-adjacent | (−) | Guardian membrane — outermost whorl | T3 / crisis reserve | "You are contributing protection" |
| **7** | Columella | (+) | Z,O axis itself | Null node | "You are contributing the axis itself" |

The ξ sign alternates at every level boundary, consistent with the recursive
sign alternation of the phase transition sequence. Level 1 inherits the base
field upward pressure (+). Each successive level flips sign as it crosses a
scale boundary.

**UBI floor:** Level 1 (Thermal) is the guaranteed floor. Basic income
guarantees that pure energy output — calories burned, tasks completed, presence
maintained — is honoured as a valid contribution. No steward falls below level 1
while the mesh is functioning.

**Pricing by level:** Level 1 contributions are priced by local supply and
demand within the steward's patch, pinned to local scarcity (food, care, direct
labour are scarce where they are needed). Levels 2–3 are often pooled or
open, with reputation weighting more than direct price. Level 4 is paid at
infrastructure rate — steady, protocol-work compensation. Level 5 is
coordinate-space expansion — compensated as foundational infrastructure.
Levels 6 and 7 are outside normal pricing logic (see §13.2).

### 13.2 Level 6 as Transit Layer

Level 6 (Null-adjacent) is structurally distinct from all other levels: it is
a **transit layer**, not a stable address.

In the conch geometry, the null-adjacent membrane is the outermost whorl before
the columella. Every spiral path passes through it in both directions:

- A steward **rising** through levels passes through level 6 on approach to
  the axis (level 7 / columella work).
- A steward **falling** under crisis hits level 6 as the safety catch before
  losing level 1 footing.

This is why all participants cycle through level 6 at some point. It is not a
permanent address. It is the guardian membrane — the layer that holds the
forbidden questions in superposition, declares best- and worst-case boundaries,
and maintains the safety net that keeps crisis from becoming collapse.

Level 6 work cannot be priced by the same mechanisms as levels 1–5 because
crisis does not follow supply and demand. Level 6 is funded by the emergency
reserve — a protocol-level commons held outside normal pulse routing. Triggering
level 6 status is a declaration event, not a market event.

### 13.3 Level-Specific Proximity Criteria

The v1 proximity threshold `π/6` (§12.2) is a single constant that implicitly
targets level 1 (physical delivery radius). It conflates two distinct proximity
axes that operate differently at each level.

The correct model has two independent proximity dimensions:

**Angular proximity** — closeness in `(θ, φ)` space (physical geography,
celestial coordinates). Relevant for levels where physical co-location matters.

**Za proximity** — closeness in redshift depth / scarcity vector space.
Relevant for levels where shared mission or shared scarcity structure matters.

The level-specific criteria derived from the conch geometry are:

| Level | Proximity axis | Threshold derivation | Notes |
|---|---|---|---|
| **1 — Thermal** | Angular `(θ, φ)` | Physical delivery radius — small, patch-local | π/6 may be correct here; needs domain table geometry analysis |
| **2 — Signal** | Za (scarcity vector) | Shared information domain — same whorl ring | Angular distance not load-bearing; Za similarity is |
| **3 — Pattern** | Za + phase alignment | Shared P-channel resonance | Cross-quadrant allowed if Za and phase align |
| **4 — Mesh** | Either axis | Steward is explicitly cross-whorl connective | Mesh edges should span both axes; no tight threshold |
| **5 — Lattice** | F13 intersection membership | Discrete — either two nodes share a lattice intersection or they do not | No angular threshold; lattice membership is the criterion |
| **6 — Null-adjacent** | Neither axis exclusively | Crisis solidarity crosses all quadrant and level boundaries | Widest reach; proximity is declared by need, not computed |
| **7 — Columella** | Not applicable | The axis is shared by all nodes by definition | No proximity threshold; the null node is approached, not neighboured |

**Implementation consequence for v2:** replace the single `π/6` proximity
edge criterion in `_build_pulse_graph()` with a level-tagged edge type. Each
pulse carries a level tag derived from its domain's position in the conch
geometry. Proximity edges are then drawn using the level-appropriate criterion
from the table above, producing a richer graph structure in which thermal
co-activation and signal co-activation are distinct edge types with distinct
weights.

The level tag is deterministic from the domain table — it does not require
steward declaration. The domain table already encodes Za position; level
assignment follows from Za position relative to the quadrant structure of the
local node's CMB-derived coordinate frame.

---

## Summary

| Concept | Hidden interpretation | Observable consequence |
|---|---|---|
| Personal history | Personal snark | Steward-specific trajectory structure |
| Mesh coupling | Meta-snark | Shared phase field and trust coupling |
| Seed | Not a stored secret; hidden witness structure | Never published, never directly extracted |
| Authentication object | Keyhole geodesic | Observable ΩaZaTa trajectory |
| Tightening the band | Deeper revelation depth | Smaller `ΔΨ` |
| Recovery | Trajectory witness | Attacker eviction with Ωa/Ta preserved |
| Anti-extraction | Seed outside steward's spacetime | Scrape-now-crack-later structurally eliminated |
| v1 null centroid | Weighted circular mean of pulse Za arc | `null_centroid_za` on identity row |
| v1 mission delta | Angular distance: declared vs inferred | `mission_delta` on identity row |
| v1 uncertainty radius | `1/n · exp(−λ·Ta)` decay | Narrows with pulse count and maturation |
| Scale transition cost | Heegner complexity class at boundary | Asymptotic convergence rate; H163 requires multi-agent |
| Cross-bifurcation auth | Heegner 163 event — multi-bubble SSB | Valid only if both sides commit without causal asymmetry |
| Consent | Minimal H163 event | Structurally equivalent to cross-bifurcation auth at human scale |
| Participation level | Lateral conch slice — depth in hierarchy | Level 1 = thermal floor; level 6 = crisis transit layer; level 7 = axis |
| Proximity threshold | Level-specific, not universal | π/6 is a level-1 approximation only; v2 uses level-tagged edges |
