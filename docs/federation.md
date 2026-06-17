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

Not all subnet encounters result in federation. When two subnets have
domain vector tables that are too far apart — where the Za distance between
shared domains exceeds a coherence threshold — the subnets may coexist at a
**domain wall** rather than federate.

A domain wall is the federation equivalent of destructive interference: the
two coordinate systems are sufficiently anti-aligned that merging them would
cost more in precession than the trust gained from interoperability.

Domain walls are not failures. They are the natural boundaries between
economically distinct communities. Stewards near a domain wall — those with
Za positions orthogonal to both sides — are the scouts of
`docs/asymptotic-auth.md` §5: minimal trust coupling with either side, but
maximum phase information about the gap between them.

These scouts are the natural candidates for a future bridging node that could,
if conditions change, facilitate federation across the wall.

---

## 7. The Seam for v2 Implementation

The following are explicitly deferred:

- **Live precession computation** — the Ωa-weighted domain vector merge
  requires access to aggregate steward data across subnets, which requires
  a federation gossip protocol not yet specified.
- **Domain wall detection** — requires a coherence threshold calibration
  across domain pairs, which should emerge from operational data rather
  than be hardcoded.
- **Representative election mechanism** — the collective null centroid
  computation requires a collective boundary definition (which stewards
  belong to which collective) that is not yet formalised.

The v1 server implementation provides:

- Node-local `DomainVector` table with Za angle and weight per domain
- Mission vector resolution: domain cluster → Za angle at registration
- `mission_delta` field: angular difference between declared and inferred
  trajectory, updated per checkpoint
- `negotiate_precession()` stub: accepts a foreign domain vector table,
  computes the merged set and precession cost per steward, returns without
  writing — ready for the federation gossip layer to call when specified

---

## Summary of Key Quantities

| Symbol | Name | Expression | Role |
|---|---|---|---|
| `dv(domain)` | Domain vector | `(za, weight)` per domain per node | Node-local coordinate assignment |
| `mv_s` | Mission vector | `Za` resolved from declared domains | Steward's stated direction of travel |
| `Δmv_s` | Mission delta | `\|mv_s - null_centroid_s_za\|` | Declared vs inferred trajectory divergence |
| `za_merged` | Merged domain Za | Ωa-weighted centroid of two subnet Za values | Result of federation negotiation |
| `C_precession(s)` | Precession cost | `\|Δza_domain\| · Ωa_s` | Cost to steward of coordinate frame shift |
| `null_centroid_collective` | Collective centroid | Ωa-weighted centroid of member null centroids | Basis for representative election |
