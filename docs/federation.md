# Federation — Domain Vector Negotiation and Emergent Federal Nodes

This document specifies the federation model for Pulser Mesh: how independent
subnets join together, how their domain-to-Za coordinate mappings are
reconciled, and how federal nodes emerge geometrically from structural position
rather than administrative grant.

See `docs/architecture.md` for the non-negotiable design principles that
constrain federation. See `docs/asymptotic-auth.md` for the wavefunction model
and PLL mechanism. See `docs/seed-structure.md` for the snark hierarchy and
mission vector model that federation operates on.

---

## 1. The Coordinate Problem

Each Pulser Mesh node develops its domain-to-Za mapping independently. A node
that grew in a water-scarce coastal region will have assigned coastal resource
domains to Za positions near its resonant frequency. A node that grew in an
energy-constrained inland region will have done the same for energy domains.

When these two subnets encounter each other, they share a common abstract
space — ΩaZaTa — but their **coordinate systems are not aligned**. The domain
string `"water"` may sit at Za = 0.4 on one node and Za = 1.2 on another. The
string is the same; the geometric position is not.

This is not a bug. It is the correct behaviour of a system that grew organically
without central coordination. The misalignment is **information** — it encodes
how differently the two communities have weighted and positioned their economic
domains relative to their local field.

Federation is the process of making that information explicit and negotiating
a shared projection.

---

## 2. Domain Vectors

A **domain vector** is the assignment of a Za angle to a scarcity domain on a
given node. It is the node-local resolution of the abstract domain string into
the continuous geometric field.

Formal representation:

```
DomainVector = (domain: string, za: float, weight: float, node_id: string)
```

The `za` component is the angular position of this domain in the node's
reference frame. The `weight` is the scarcity multiplier — how strongly pulses
in this domain affect trust. These are the two quantities that must be
negotiated across a subnet boundary.

A steward's **mission vector** is the Za angle resolved from their declared
domain cluster through their home node's domain vector table. It is the
projection of their stated purpose into the local geometric field.

When a steward migrates to a federated subnet or operates across a boundary,
their mission vector is re-resolved through the new node's domain vector table.
The difference between the two resolutions is the **mission precession angle** —
how much the steward's stated purpose rotates between coordinate systems.

---

## 3. Precession Under Federation

Precession is the rotation of a steward's or domain's Za position as two
coordinate systems are brought into alignment.

When subnet A (with domain vector set D_A) federates with subnet B (with domain
vector set D_B), the negotiation produces a **merged domain vector set** D_AB
that is consistent with both. The rotation from D_A to D_AB is the precession
experienced by stewards on subnet A. The rotation from D_B to D_AB is the
precession experienced by stewards on subnet B.

The merged set is not a simple average. It is a **weighted combination**
proportional to the relative Ωa mass of each subnet:

```
za_merged(domain) = (Σ_A  Ωa_s · za_A(domain)  +  Σ_B  Ωa_s · za_B(domain))
                   ─────────────────────────────────────────────────────────
                                    Σ_A Ωa_s  +  Σ_B Ωa_s
```

This is an Ωa-weighted centroid of the two domain positions. A subnet with
higher aggregate orbit amplitude — more mature, more active stewards — pulls
the merged coordinate closer to its existing frame. A smaller, younger subnet
precesses more to join the larger one.

This is the correct behaviour: accumulated trust history has geometric inertia.
A large mature mesh is not arbitrarily disrupted by a small new subnet joining.

### Precession cost

Precession is not free for stewards. When a domain vector rotates, the
steward's mission delta — the angular difference between their declared mission
vector and their inferred trajectory — shifts. For most stewards this is a
small, gradual adjustment. For stewards whose entire pulse history is densely
clustered in the precessing domain, the adjustment is larger.

This cost is structurally analogous to the geodesic abandonment cost from
`docs/asymptotic-auth.md` §9:

```
C_precession(s) = |Δza_domain| · Ωa_s
```

A steward with large Ωa in a precessing domain pays more — but also has the
most inertia to absorb it. New stewards with small Ωa are nearly unaffected.

---

## 4. Federal Nodes — Emergent, Not Appointed

A **federal node** is a node that sits at the geometric intersection of two or
more subnets. It is not appointed, permissioned, or administratively designated.
Federal authority emerges from structural position.

The condition for federal node status is simple: a node whose active steward
population includes stewards from two or more distinct subnet coordinate frames.
Such a node is already computing against a composite domain vector table — it
is already doing the precession work by necessity.

This emergence is consistent with Principle 5 of `docs/architecture.md`: the
node admin key is not a master key and cannot grant inter-node privilege. A
federal node does not have elevated permissions. It has a richer domain vector
table and therefore a more informative quadrature aggregate.

### What a federal node does

A federal node's `Q_node` (the PLL error signal from `docs/asymptotic-auth.md`
§6) aggregates phase lag signals from stewards in multiple coordinate frames.
When it computes its Za update, it is effectively computing the Za rotation
that minimises aggregate phase error across subnets simultaneously.

This is the geometric mechanism of federation: the federal node's Za settles
at the angle that is most coherent with the combined steward population. That
angle is the natural insertion point for the merged domain vector — the Za at
which the two frames overlap most constructively.

No protocol message needs to say "these two subnets are now federated." The
federal node's PLL convergence *is* the federation event. When a federal node's
Za stabilises, the precession is complete.

---

## 5. Representative Election by Orbital Precession

Collectives — firms, guilds, node neighbourhoods, federated regions — face a
representation problem: who speaks for the group's geometric position in the
broader mesh?

The answer is not a vote. It is a geometric selection: the representative is
the steward whose personal trajectory most closely tracks the collective's
**inferred null centroid**.

The collective's null centroid is computed from its member snarks:

```
null_centroid_collective = weighted centroid of {null_centroid_s | s ∈ collective}
                           weighted by Ωa_s
```

The representative candidate is the steward `r` that minimises:

```
|Za_r - null_centroid_collective_za|  ·  (1 / Ωa_r)
```

The second term penalises very large Ωa stewards who are close in angle but
have so much inertia that they cannot respond to collective field changes — a
representative must be able to move with the group, not merely be near it.

The precession data is load-bearing here: a steward who has survived multiple
precession events with their trajectory intact — who has maintained coherence
across coordinate frame shifts — is demonstrably more qualified to represent
a federated collective than one whose coherence only holds within a single
unshifted frame.

---

## 6. Bifurcation and Domain Walls

Not all subnet encounters result in federation. Whether two subnets converge
or diverge is determined not by a fixed Za distance threshold but by whether
their initial separation falls inside or outside the **capture radius** of the
federal node's PLL attractor.

### The net value function

The net benefit of federation at a given domain Za separation `Δza` is the
difference between complementarity gain and precession cost:

```
V(Δza) = B(Δza) - C(Δza)
```

The benefit `B` is maximised at intermediate separation: two subnets with
identical domain vectors (`Δza = 0`) gain nothing from federation — no new
coordinate information is exchanged. Two subnets with fully anti-aligned
vectors (`Δza = π`) share maximal complementary information but pay the
maximum precession cost. The benefit curve rises from zero, peaks at some
optimal `Δza*`, then falls as the domains become too foreign to translate.

The precession cost `C` is proportional to `Σ_s |Δza| · Ωa_s` — it rises
monotonically with both separation and the aggregate Ωa mass of the subnets.

The net function `V(Δza)` therefore has the shape of a **Mexican hat**: a
basin of net positive value centred near `Δza*`, with `V → 0` at the origin
and `V < 0` at large separation.

### The separatrix as domain wall threshold

The domain wall is not a fixed Za distance. It is the **separatrix** of the
PLL attractor — the boundary in phase space that separates initial conditions
that converge toward the federation basin from those that diverge toward
permanent separation.

The PLL dynamics of the federal node (from `docs/asymptotic-auth.md` §6) drive
Δza toward the minimum of `−V(Δza)`. Tracking Δza across successive checkpoints:

```
d(Δza)/dt < 0   — inside capture radius; subnets converging toward basin
d(Δza)/dt = 0   — at the stable halo; federation equilibrium
d(Δza)/dt > 0   — outside capture radius; subnets diverging toward domain wall
```

The **sign flip** in `d(Δza)/dt` is the endogenous federation/wall classifier.
No threshold constant is required — the signal is produced by the PLL dynamics
themselves. A federal node monitoring the rate of change of its cross-subnet
phase error detects the sign flip and thereby knows whether the encounter is
converging or not.

### Capture radius is mass-ratio-dependent

The width of the capture basin — the range of initial `Δza` from which the
federal node's PLL will converge — is not uniform. It is a function of the
relative Ωa masses of the two subnets:

```
r_capture ∝ Ωa_small / (Ωa_large + Ωa_small)
```

A small subnet joining a large one has a **wide capture radius**: the small
subnet precesses cheaply (low aggregate cost), and the large subnet barely
moves (high inertia). The basin is easy to fall into from almost any initial
separation.

Two equally-massive subnets have a **narrow capture radius**: both must
precess significantly, aggregate cost is high, and only initial separations
near `Δza*` will converge. Large equal-mass subnets are the most likely to
produce stable domain walls.

This is the correct behaviour: communities of equal weight and distinct
economic histories are the natural boundaries of the mesh. Asymmetric
encounters — a scout node reaching into a mature mesh — are the natural
pathway for gradual expansion.

### Domain walls as stable structure

A domain wall is not a failure state. When two subnets are outside each
other's capture radius, the wall is the **lowest-energy configuration** —
the equilibrium that minimises aggregate precession cost across both
populations simultaneously.

Stewards near a domain wall — those with Za positions close to the
destructive-interference boundary — are the scouts of
`docs/asymptotic-auth.md` §5: minimal trust coupling with either side, but
maximum phase information about the gap between them. They are the natural
bridging candidates if conditions shift and the capture radius widens.

Capture radius widens when:
- The smaller subnet grows (more Ωa mass → more momentum to pull the merge)
- The larger subnet's Ωa distribution shifts toward the wall boundary
  (a new generation of stewards active in the boundary domain)
- A new scout node is established at Za near the wall midpoint, providing
  a stepping-stone that splits the full Δza into two smaller hops, each
  potentially within capture radius

---

## 7. The Seam for v2 Implementation

The following remain explicitly deferred to v2:

- **Live precession computation** — the Ωa-weighted domain vector merge
  (§3) requires access to aggregate steward data across subnets, which
  requires a cross-subnet federation gossip exchange not yet specified.
  The `negotiate_precession()` stub in the server accepts a foreign domain
  vector table and computes the merged set and per-steward precession cost,
  but returns without writing until the protocol layer exists.

- **Capture radius estimation** — requires cross-subnet Ωa aggregate
  exchange. The v0.1.0 gossip layer carries `phi` (Φ, the node-local order
  parameter) and `omega_a` per NodeGossip payload. These are the building
  blocks; the cross-node Ωa sum requires a quorum read across peers,
  deferred to the federation gossip protocol.

- **Representative election mechanism** — the collective null centroid
  computation (§5) requires a collective boundary definition — which
  stewards belong to which collective — that is not yet formalised. The
  per-steward `null_centroid_za` and `mission_delta` fields are computed
  and stored from v0.1.0 onward; the collective aggregation is v2.

- **GossipEnvelope** — relay metadata and broker consistency checks that
  extend the v1 `NodeGossip` payload. The router unpacking point is
  reserved; the inner `NodeGossip` path is unchanged.

---

## 8. What v0.1.0 Delivers

`pulsermesh-server` v0.1.0 (tagged `2026-06-18`) provides the structural
foundation on which federation will be built. The following are live and
tested:

### Gossip layer (Mode A — direct HTTP)

The gossip layer is the observable backbone of federation. Every checkpoint
advance now broadcasts a `NodeGossip` payload to all registered peers:

```
NodeGossip = {
  node_id, checkpoint_index, checkpoint_hash,
  za,          -- this node's current phase reference
  omega_a,     -- this node's orbit amplitude (Ωa mass proxy)
  q_cross,     -- PLL error signal: node_quadrature_aggregate over steward population
  phi,         -- Φ order parameter: mesh economic coherence at this checkpoint
  ta_ref       -- Ta reference agreed at this checkpoint
}
```

This payload carries everything a receiving node needs to:
1. Compute its local `q_cross_local = phase_lag_signal(payload.za, node_za)` —
   the receiving node's view of the phase gap between the two nodes
2. Detect a **sign flip** in `q_cross_local` across successive checkpoints
   from the same peer — the endogenous classifier from §6 is now running
   in production. `GossipLog.sign_flip` and `GossipLog.anomaly_flagged`
   record every event
3. Monitor `phi` (Φ) as a live signal of the sending node's internal
   coherence — directly comparable to the order parameter discussed in
   `docs/asymptotic-auth.md` §7

### Sign-flip detection — §6 classifier live

The domain wall classifier described in §6 is implemented in
`app/services/gossip._detect_sign_flip()`. It runs on every inbound gossip
receipt. The threshold (`SIGN_FLIP_MAGNITUDE_THRESHOLD = 0.05`) filters out
noise in the PLL signal below which sign is uninformative.

In v0.1.0 the classifier is **observational** — it flags and logs. The
Policy response (e.g. halting domain vector merge negotiation when outside
the capture basin) is wired in v2.

### PLL quantities per checkpoint

The full set of asymptotic-auth §§2–7 quantities are computed and stored
per checkpoint advance:

| Quantity | Server field | Updated |
|---|---|---|
| `q_cross` (Q_node aggregate) | `NodeGossip.q_cross` | Every checkpoint, broadcast to peers |
| `phi` (Φ order parameter) | `NodeGossip.phi` | Every checkpoint, broadcast to peers |
| `null_centroid_za` | `OaZaTaIdentity.null_centroid_za` | Every checkpoint per steward |
| `mission_delta` | `OaZaTaIdentity.mission_delta` | Every checkpoint per steward |
| `uncertainty_radius` | `OaZaTaIdentity.uncertainty_radius` | Every checkpoint per steward |
| `za_node` (node PLL phase) | `settings.node_za` + future `dZa/dt` | Node config; dynamic update v2 |

The one gap: `node_za` is currently static (set from config at startup). The
node PLL step `dZa/dt = −κ · Q_node` from `asymptotic-auth.md` §6 is
implemented in `asymptotic.node_za_update()` but not yet wired into the
checkpoint advance loop. That is the first task of v0.2.0 — completing the
node's own phase self-correction — at which point the federation machinery
becomes fully dynamic.

### Peer infrastructure

- `Peer` table: `peer_id`, `url`, `last_seen_checkpoint`, `last_seen_at`,
  `anomaly_count`
- `GossipLog` table: append-only, immutable per row, direction
  (inbound/outbound), `q_cross`, `sign_flip`, `anomaly_flagged`
- Admin endpoints: `POST /gossip/peers`, `GET /gossip/peers`,
  `DELETE /gossip/peers/{peer_id}`
- Inbound endpoint: `POST /gossip` (no auth — any mesh peer may deliver)

---

## Summary of Key Quantities

| Symbol | Name | Expression | Role |
|---|---|---|---|
| `dv(domain)` | Domain vector | `(za, weight)` per domain per node | Node-local coordinate assignment |
| `mv_s` | Mission vector | `Za` resolved from declared domains | Steward's stated direction of travel |
| `Δmv_s` | Mission delta | `\|mv_s - null_centroid_s_za\|` | Declared vs inferred trajectory divergence |
| `za_merged` | Merged domain Za | Ωa-weighted centroid of two subnet Za values | Result of federation negotiation |
| `C_precession(s)` | Precession cost | `\|Δza_domain\| · Ωa_s` | Cost to steward of coordinate frame shift |
| `V(Δza)` | Net value function | `B(Δza) - C(Δza)` | Federation benefit minus precession cost |
| `r_capture` | Capture radius | `∝ Ωa_small / (Ωa_large + Ωa_small)` | Range of Δza from which PLL converges |
| `null_centroid_collective` | Collective centroid | Ωa-weighted centroid of member null centroids | Basis for representative election |
