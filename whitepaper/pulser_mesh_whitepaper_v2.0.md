# Pulser Mesh — Whitepaper v2.0

## A geometry-only economic pump for local surplus, verified scarcity reduction, and universal dividend flow

> **Notation.** The steward coordinate triple is written **ΩaZaTa** and spoken *Ohma-Za-Ta*.
> Ωa = orbital amplitude (magnitude + alpha phase offset); Za = phase angle;
> Ta = arc length along the steward's geodesic. This notation is used consistently
> throughout this document and all protocol specifications.

> **Version note.** v2.0 supersedes v1.0 in the following areas: steward identity
> model (asymptotic authentication replaces static key model), privacy and
> scrape-now-crack-later threat model (formalised), trust-resource clarification
> (explicitly not a tradable asset), and the "This is not a cryptocurrency" section.
> The scarcity mesh model, node tuple, and dividend logic from v1.0 are carried
> forward and updated for notation consistency.

---

## Abstract

Pulser Mesh is an economic protocol that converts local meshes of favours, trade,
and value-added transformation into upward pulses of common surplus without
requiring a central apex or discretionary redistributor. The system treats
extractive economies as bottleneck geometries and replaces them with a
mesh-and-pulse architecture.

At the centre of the design is a simple claim: when local economic actors
verifiably reduce a real scarcity in a real place, some portion of the resulting
surplus should flow back to all participating persons as a flat dividend rather
than concentrating at a corporate or financial apex. Pulser Mesh is the protocol
layer for measuring that reduction, validating the local graph, rolling it up
into a common surplus pool, and redistributing value without turning the system
back into a pyramid.

v2.0 adds a formal identity model — asymptotic authentication via ΩaZaTa
wavefunction dynamics — that hardens steward identity over time without storing
private data anywhere in the mesh. It also makes explicit what Pulser Mesh is
not: it is not a cryptocurrency, not a token, and not a speculative instrument.

---

## 1. Problem

Modern economies are highly effective at measuring price and throughput, but
much less effective at measuring whether an activity actually reduces scarcity
for real people in a real geography. This creates a structural gap between
financial growth and material improvement, allowing firms to expand even when
they worsen food insecurity, housing precarity, ecological stress, or social
breakdown.

The same gap appears in digital networks. Blockchain systems are strong at
ordering transactions and proving state transitions, but most do not encode
whether the transactions themselves are socially constructive, locally grounded,
or anti-extractive. In practice, this means many networks inherit the same
apex-seeking dynamics as legacy finance: fees flow upward, validation power
centralises, and social surplus is privatised.

Pulser Mesh starts from a different premise: the problem is geometric before it
is moral. Economies fail when too much flow is forced through too few bottlenecks,
when social value can be skimmed from above, and when local meshes lose the
ability to circulate value without passing through a choke point. The protocol
therefore focuses first on topology, then on measurement, then on settlement.

---

## 2. Design Intuition

A useful metaphor for Pulser Mesh is the trompe and pulser pump: water and air
are entrained in a local vortex, pressure separates phases, and the resulting
pulse lifts water above its original level with no rotating impeller. The
protocol aims to do the same with social and economic flow: local interaction
generates a surplus signal, that signal separates at a checkpoint, and the
checkpoint emits a dividend pulse back into the base layer.

This image matters because it suggests a protocol that is geometry-driven rather
than manager-driven. The goal is not to place a wiser ruler at the top of the
hourglass; it is to remove the bottleneck as the defining economic form and
replace it with a circulation-and-lift mechanism that can be audited at each layer.

---

## 3. System Overview

Pulser Mesh has three operational layers:

| Layer | Function | Typical trust model |
|---|---|---|
| Local mesh | Records favours, trade, mutual support, and production relationships | Relational trust |
| Checkpoint / shell | Verifies local graph conditions, computes surplus, issues proofs | Procedural trust |
| Settlement / core | Enforces invariant rules and dividend distribution | Minimal trust / cryptographic |

The local mesh is where real life happens: households, cooperatives, farms,
bakeries, suppliers, clinics, neighbourhood groups, and firms all participate
in a graph of bilateral or multilateral obligations. The checkpoint layer
compresses that graph into a validated economic snapshot, and the settlement
layer accepts only snapshots that satisfy the protocol's anti-extractive
conditions.

---

## 4. Node Model

Each economic node is represented by a tuple:

$$\mathcal{N} = (p, q, \phi, \vec{m}_s, \vec{g}, \Xi)$$

This tuple defines not just what a node is, but how it grows, what scarcity it
addresses, where it is grounded, and whether it is coherent enough to participate
as a stable agent.

**p and q** represent the node's winding structure across two dimensions:
productive depth and social embedding. Nodes with coprime \((p, q)\) are treated
as genuine convergences; non-coprime pairs indicate cartel-like parallelism.

**Growth ratio \(\phi\)** captures local growth. The protocol prefers bounded,
self-similar growth rather than explosive expansion detached from local grounding.

**Mission vector \(\vec{m}_s\)** is the direction in which a node claims to
reduce a specific scarcity class. A mission is legitimate only if it points
toward a real deficit measurable in the node's declared geography.

**Geographic grounding \(\vec{g}\)** grounds the node in a specific place and
scale. Geography is irreducible because the same scarcity class can have very
different causes in different places.

**Coherence \(\Xi\)** is the node's coherence floor: whether it is stable enough
to hold a consistent identity, maintain valid commitments, and avoid collapsing
into extractive behaviour under stress.

---

## 5. Steward Identity — Asymptotic Authentication

v2.0 introduces a formal identity model for stewards (individual and firm
participants in the mesh). This replaces the implicit static-key assumption of v1.0.

### 5.1 Identity as a wavefunction

A steward is not a point in ΩaZaTa space. A steward is a **wavefunction**
Ψ(Ωa, Za, Ta) — a probability amplitude distribution over the coordinate space.
The wavefunction encodes both current best-known position and the uncertainty
of that position.

| Axis | Role | Dynamics |
|---|---|---|
| **Ωa** | Complex orbital amplitude | Slow; grows with trust resource, alpha component carries the imaginary channel |
| **Za** | Phase angle | Fast; each validated pulse rotates Za by a domain-weighted increment |
| **Ta** | Arc length along geodesic | Monotonically increasing; encodes developmental maturity |

Each validated pulse is an operator on Ψ: it rotates Za, scales Ωa, and
increments Ta. The phase increment per pulse scales inversely with |Ωa| —
a mature steward with large orbital amplitude is *inertial*, resisting phase
perturbation from noise or attempted impersonation. This is the protocol's
**flywheel property**.

### 5.2 Convergent identity

Pulse history in a consistent domain causes Za rotations to accumulate around
a preferred phase — a **Za attractor**. As the history deepens, the uncertainty
band around the steward's position narrows:

$$\Delta\Psi_s(n) \sim \frac{1}{\sqrt{n}} \cdot e^{-\lambda \cdot Ta_s}$$

Statistical localisation from pulse count and longitudinal maturation from
geodesic arc length operate simultaneously. Mature high-volume stewards are
extremely well localised. The longer the history, the harder the identity is
to forge.

### 5.3 Identity recovery

If a steward's position is compromised, two recovery paths are available:

- **Trajectory witness (preferred):** The steward presents deeper structural
  evidence that their published ΩaZaTa trajectory is authentic. The uncertainty
  band collapses around the authentic path; the attacker is evicted. Ωa and Ta
  are fully preserved.
- **Geodesic abandonment:** The steward abandons their current geodesic and
  begins a new one. Ωa is not transferred; the new geodesic starts fresh.
  Used when the trajectory witness path is unavailable.

Both methods are always available, always voluntary, and require no node
permission.

### 5.4 The hidden witness — anti-extraction property

The steward's identity is grounded in a **hidden witness**: a keyhole geodesic
threading a recursive snark hierarchy derived from the steward's own history.
This witness is not a stored secret. It is a topological structure that cannot
be fully named, held, or copied — it exists outside the spacetime of the
steward's own toroidal structure.

> **There is no finite object to scrape that constitutes the key.**

This is the anti-extraction property. It means the scrape-now-crack-later
attack vector — harvesting today's traffic to crack later with improved
cryptographic tools — is structurally eliminated at the identity layer, not
merely deferred by key rotation. Full specification: `docs/seed-structure.md`.

---

## 6. Scarcity Fields

Pulser Mesh treats scarcity as a field, not a scalar. For food, the field
decomposes into four dimensions: availability, access, utilisation, and
stability.

$$S_{food}(\vec{g}) = \begin{pmatrix} S_{availability}(\vec{g}) \\ S_{access}(\vec{g}) \\ S_{utilisation}(\vec{g}) \\ S_{stability}(\vec{g}) \end{pmatrix}$$

A valid economic actor must specify which component of the field it is acting
on and demonstrate that the component is declining in the wake of its activity.
Measurement uses human-bioavailable output, not raw mass or throughput proxies.

---

## 7. Value-Added Transformation

Value-added in Pulser Mesh means the increase in alignment between an input
resource and a local scarcity-deficit vector. A transformation is valid when
it moves a resource closer to satisfying an actual deficit in a real place.

This allows the protocol to distinguish between superficially similar activities.
Grain-to-flour, flour-to-bread, bread-to-delivered meals, and meals-to-stable
daily access are distinct operators on the deficit vector. Each is rewarded
according to the measured reduction it produces, not its nominal market value.

---

## 8. Privacy Model and Scrape-Now-Crack-Later Threat

The mesh is designed for long-term operation across adversarial network
environments. Data published today may be harvested and retained indefinitely.
The only safe guarantee is that sensitive data is never published in the first place.

### 8.1 What is published

The following are designed to be observable by any mesh participant:

- Checkpoint hashes and indices
- Pulse `scarcity_domain` and `value_add` (aggregate economic signal)
- Steward `trust_resource` balance (economic participation signal)
- Node ΩaZaTa reference position

None of these encode personal identity. A steward's ΩaZaTa coordinate is a
geometric position derived from pulse behaviour — it cannot be reverse-engineered
to reveal who the steward is.

### 8.2 What is never published

- Raw API key values (node or steward)
- Steward registration metadata (time of first registration, IP address)
- Free-text pulse descriptions in aggregate queryable form
- Any mapping between ΩaZaTa coordinates and real-world identity
- The steward's hidden witness structure

### 8.3 SNCL mitigation layers

| Layer | Mitigation | Rationale |
|---|---|---|
| Identity | ΩaZaTa position contains no PII | Cracking the hash reveals a coordinate, not a person |
| Keys | Steward keys rotate per checkpoint | A cracked old key covers only that checkpoint window |
| Pulses | Payloads carry no PII | Nothing sensitive to recover even if decrypted |
| Hidden witness | Not a finite extractable object | Anti-extraction property eliminates the attack structurally |
| Asymptotic auth | Identity hardens over time | Forging a mature identity requires replicating the full trajectory |
| Cryptographic agility | Hash functions and KDF configurable | SHA-3, BLAKE3, post-quantum upgrades without protocol breaks |

---

## 9. Trust Resource — What It Is and What It Is Not

Stewards accumulate `trust_resource` as validated pulses are accepted by the
mesh. This section defines the trust resource precisely to prevent
misclassification as a speculative financial instrument.

### 9.1 What trust resource is

- A **protocol-internal measure** of a steward's accumulated contribution to
  verified scarcity reduction in their operating domain.
- A **weighting factor** that determines how much influence a steward's
  ΩaZaTa position has on local phase coupling and dividend weighting.
- A **maturity signal**: high trust resource means the steward's identity is
  well-localised and their contributions are phase-aligned with the mesh field.
- **Earned exclusively** through validated real-world pulses. There is no other
  mechanism by which trust resource can be acquired.

### 9.2 What trust resource is not

- **Not a token.** Trust resource has no on-chain representation, no contract
  address, and no token standard.
- **Not transferable.** Trust resource cannot be sent, sold, traded, or delegated
  to another steward. It is bound to a specific ΩaZaTa trajectory and has no
  meaning outside of it.
- **Not redeemable.** Trust resource is not exchangeable for any fiat currency,
  cryptocurrency, or other asset class.
- **Not a financial instrument.** Trust resource carries no expectation of
  profit from the efforts of others.
- **Not owned.** A steward does not *own* their trust resource. They *inhabit*
  the geometric position that trust resource describes. If a geodesic is
  abandoned, the trust resource associated with it does not transfer; it is
  orphaned with the abandoned trajectory.

---

## 10. This Is Not a Cryptocurrency

Pulser Mesh will be read alongside blockchain whitepapers. The following
distinctions are stated plainly and without defensiveness because the
comparison is often the first question a technically literate reader will ask.

| Common crypto red flag | Pulser Mesh position |
|---|---|
| **Premining** | No supply exists to mine. Trust resource is earned only through validated real-world pulses submitted after the protocol is running. There is no genesis allocation, no founder reserve, and no pre-genesis issuance of any kind. |
| **Token sale / ICO / presale** | There is no token. There is no sale. There is no whitelist, presale allocation, or fundraising instrument tied to protocol participation. |
| **Founder allocation** | The node operator's trust resource starts at zero, identical to any other steward. No protocol mechanism creates a privileged initial position for any party, including the protocol's authors. |
| **Speculative asset** | Trust resource has no exchange mechanism, no transfer mechanism, and no price. It cannot be bought, sold, or traded. There is nothing to speculate on. |
| **Pump-and-dump** | There is no tradable asset to pump. Value in the protocol accrues as scarcity reduction in the physical world and as dividend capacity in the mesh — neither of which is a liquid market position. |
| **Anonymous team with no accountability** | The protocol is open-source. The code, the specification, and the architectural principles are the primary artefacts. They are auditable in full by any reader. |
| **Whitepaper-first, code-never** | The protocol is running-code-first, whitepaper second. The node implementation, the trust pipeline, and the asymptotic authentication model are implemented and testable before this document exists. |
| **Artificial scarcity** | Trust resource is not scarce by design. There is no cap, no halving schedule, and no mechanism that restricts how much trust resource can exist. Growth is bounded only by the rate of real scarcity reduction in the world. |
| **Exit liquidity structure** | No participant holds a position that benefits from other participants' entry into the system. Dividend flow is flat; the protocol does not create a structure where early participants profit from the activity of later participants. |

### Why these distinctions matter

Many of the pathologies that produced speculative bubbles and outright fraud in
digital asset markets were geometric before they were moral: they were systems
that created apex-seeking flow structures and then filled those structures with
speculative pressure. Pulser Mesh is designed from the topology up to be
incompatible with those structures. The table above is not merely a disclaimer —
each entry reflects a specific protocol design decision made to eliminate the
corresponding attractor.

---

## 11. Dividend Logic

Once a local graph passes checkpoint validation, the system computes a common
surplus and emits a dividend pulse. The dividend is not a wage, profit share,
or discretionary welfare transfer. It is a flat distribution of verified
common surplus generated by scarcity-reducing activity and filtered through
anti-extractive rules.

Dividend flow is designed to expand the base of people able to participate in
the protocol rather than merely enriching nodes closest to the checkpoint.
When purchasing power or security flows back to individuals, the effective
participant base grows with it — the protocol feeds its own substrate.

---

## 12. Local Graph and Consent

The base layer is a graph of nodes and edges representing favours, obligations,
transactions, care commitments, deliveries, and value-added transformations.
No edge is valid without consent. This rule protects the integrity of the
graph and preserves the distinction between local favour logic and impersonal
market logic. Without this boundary the base layer becomes legible to predatory
financial extraction.

---

## 13. Checkpoints and Proofs

Pulser Mesh compresses local graph state at checkpoints. A checkpoint accepts
a local state only if it satisfies the protocol's anti-extractive conditions
and if its mission claims are consistent with measured scarcity in its geography.

The long-term design goal is zero-knowledge rollup circuits so that the
checkpoint can verify legitimacy without exposing the full social graph.
Real favour and care networks contain sensitive relational information that
should not be published as plain on-chain state.

---

## 14. Anti-Extractive Conditions

Pulser Mesh rejects local states that look topologically extractive:

- \(\gcd(p,q)=1\) — clean convergence, not a cartel-like composite loop
- \(q > q_{min}\) — minimum social embedding, not pure detached throughput
- \(\phi\) is bounded — no uncontrolled apex-seeking growth
- Mission vector reduces a measured scarcity in declared geography over time
- Steward coherence \(\Xi\) remains above threshold

These define a workable initial rule set for implementation and iterative
refinement toward full formal anti-extractive proofs.

---

## 15. Legal and Social Layering

| Layer | Function | Norm type |
|---|---|---|
| T1 | Individual existence and inalienable standing | Rights |
| T2 | Family, kinship, and relational mesh | Social norms and consent |
| T3 | Firms, contracts, and impersonal exchange | Market norms and zero-trust procedures |

Many modern pathologies arise from T3 market logic invading T2 care networks
or T1 personhood. The protocol is designed so that T3 entities can coordinate
at scale without claiming inalienable status that properly belongs only at T1.

---

## 16. Why Blockchain at All

Pulser Mesh does not assume every local interaction should be on-chain. It
uses chain infrastructure selectively: checkpoint verification, settlement
finality, and dividend distribution. Execution and social context remain
off-chain; proofs and settlement reside on-chain.

Purely on-chain systems often become legibility machines for extractive
finance. Pulser Mesh uses blockchain where it adds verifiability and minimises
exposure where it would flatten social texture into speculation.

---

## 17. Relationship to Existing Crypto Architectures

Pulser Mesh inverts common crypto fee flows. In many blockchain systems, user
activity generates fees that accrue to validators, sequencers, or token holders.
In Pulser Mesh, user and firm activity generate a surplus signal that is
validated at checkpoints and pulsed back down to participating persons as a
flat dividend.

This does not eliminate specialised infrastructure operators. It changes their
role from permanent apex claimants to bounded protocol maintainers.

---

## 18. Implementation Roadmap

| Phase | Focus | Status |
|---|---|---|
| 0 | Protocol specification — node tuples, scarcity schemas, validation rules | Complete |
| 1 | Local mesh prototype — favours, transactions, consent flags | Running (experimental) |
| 2 | Scarcity oracle — open dataset integration for food, housing, geography | Planned |
| 3 | Node registry — steward ΩaZaTa registration and attestation | Planned |
| 4 | Checkpoint rollup — surplus computation and dividend pulse | Planned |
| 5 | Privacy-preserving proofs — ZK verification of anti-extractive conditions | Research |

---

## 19. Risks and Open Questions

Pulser Mesh depends on measurement quality. Scarcity fields can be noisy,
lagging, politically manipulated, or incomplete. The protocol requires
transparent data provenance, local challenge mechanisms, and strong separation
between field measurement and interested commercial actors.

Anti-extractive topology is easier to describe than to prove. Early versions
use heuristic tests and bounded rule sets rather than full formal guarantees.
The long-term challenge is to evolve these into proof systems that remain
computationally tractable and socially legible.

The asymptotic authentication model assumes that steward history is sufficiently
rich to support a stable null-centroid approximation. Sparse early-lifecycle
stewards have wide uncertainty bands — this is accepted and correctly signals
low trust rather than masking it.

---

## 20. Conclusion

Pulser Mesh proposes a different economic primitive: not the firm as a
profit-maximising silo, nor the state as a discretionary redistributor, but the
validated scarcity-reducing node embedded in a local graph and connected to a
checkpoint that converts verified surplus into universal pulses.

The protocol's wager is that geometry matters. If local meshes remain
consensual, if checkpoints remain bounded, if scarcity reduction is measured
in the world rather than asserted in a pitch deck, and if common surplus is
pulsed back down instead of siphoned upward, then a new class of economic
network becomes possible — one that is structurally incompatible with the
pathologies that have defined the first generation of digital asset markets.

Pulser Mesh is that wager written as infrastructure.

---

## Appendix: Document Map

| Document | Contents |
|---|---|
| `whitepaper/pulser_mesh_whitepaper_v2.0.md` | This document — system overview, identity model, trust resource, anti-scam declaration |
| `whitepaper/pulser_mesh_whitepaper_v1.0.md` | Original whitepaper — retained for provenance |
| `docs/architecture.md` | Non-negotiable design principles for all implementations |
| `docs/asymptotic-auth.md` | Full wavefunction model, PLL dynamics, symmetry breaking, recovery taxonomy |
| `docs/seed-structure.md` | Hidden witness, recursive snark hierarchy, keyhole geodesic, anti-extraction property |
| `GLOSSARY.md` | Term definitions |
| `SUBSTRATE_INTERFACE.md` | Substrate adapter specification |
