# Gossip — Inter-Node Geometry Broadcast

This document specifies the gossip layer for Pulser Mesh: how nodes broadcast
their geometric state to the mesh, how receiving nodes process that signal, and
why the protocol is designed the way it is.

See `docs/federation.md` for the federation model that this layer enables.
See `docs/asymptotic-auth.md` for the PLL and wavefunction formalism that
gossip feeds into. See `docs/architecture.md` for the non-negotiable design
principles that constrain this layer.

---

## 1. The Governing Axiom — No Privileged Frame

The gossip layer exists to solve one problem: how do independently grown nodes
share enough geometric state to detect federation opportunities and domain walls
without any node acting as a coordinator, taxonomy authority, or trust anchor
for any other.

The no-privileged-frame axiom (Architecture Principle 2) constrains the design
completely. Any gossip protocol that requires:

- A canonical domain taxonomy that nodes must conform to
- A designated seed node or bootstrap authority
- A handshake in which one node requests federation from another
- Per-steward data that reveals individual identity across node boundaries

...violates the axiom. The gossip layer must be a broadcast in which every
node is simultaneously a speaker and a listener, and in which no node's
message carries more intrinsic authority than any other's.

The parliament is noisy by design. Signal emerges from geometric resonance
across many broadcasts, not from procedure or authority.

---

## 2. Every Node Is Already a Federation

There is no clean category boundary between a local node and a federal node.
A node becomes federal the moment its steward population includes stewards
from more than one domain cluster — which in a healthy mesh happens almost
immediately. Federal status is a position on a continuum, not a mode switch.

The implication: the gossip layer does not need a concept of "federation
announcement." A node does not declare itself federal and begin a new
protocol. It simply continues broadcasting its geometric state, and any
other node that receives that broadcast can compute whether the two are
inside each other's capture radius.

Nodes are delegates of their steward populations. The node's Za, its domain
vector table, its order parameter — all of these are derived from the
aggregate behaviour of its stewards. A node has no geometric position of
its own; it has the Ωa-weighted centroid of its stewards' positions. This
means a node with more active, more mature stewards has more geometric
inertia — not more authority.

---

## 3. Domain Strings Are Opaque

Domain strings — `"water"`, `"energy"`, `"freshwater"`, `"solar"` — are
human-readable labels. They are not semantic identifiers that can be compared
across nodes.

**Domain strings must never be compared across node boundaries.**

Two nodes that independently assigned `"water"` to Za = 0.8 and `"freshwater"`
to Za = 0.85 are expressing the same economic reality through different labels.
The geometry has already normalised them — their Za angles are close because
their stewards are doing economically similar work and their pulse histories
have converged to similar attractors.

Fuzzy string matching to detect domain synonyms is redundant with the Za
geometry and dangerous in principle: any matching algorithm encodes a
taxonomy, and any taxonomy is a privileged frame. The string is a label
humans use to submit pulses. The Za angle is the protocol's actual
representation of what that domain means in context.

When a receiving node processes a foreign domain vector table, it discards
the strings entirely. It works only with the set of `(za, weight)` pairs —
where do the foreign node's domain clusters sit angularly, and how massive
are they? That is the full information needed to compute `V(Δza)` and assess
federation viability.

### String opacity in practice

A node's domain vector table on the wire carries both string and Za angle
because the string is useful for human operators reading gossip logs and
for the node's own internal bookkeeping. But the receiving node's federation
logic must treat the string as a comment field, not an input.

The correct processing pipeline:

```
receive NodeGossip
  → extract [(za_i, weight_i)] from domain_vectors   # strings discarded
  → cluster foreign za_i into domain groups           # by angular proximity
  → compute Δza between foreign clusters and local table
  → evaluate V(Δza) for each pair
  → update local Q_cross signal
```

No string comparison anywhere in this pipeline.

---

## 4. The Gossip Message

Each node emits one `NodeGossip` message per checkpoint. The message carries
only node-level aggregate geometry — no per-steward data, no steward
identities, no pulse history.

```
NodeGossip {
  node_id:          string    # opaque identifier; non-cryptographic in v1
  checkpoint:       int       # index of the checkpoint this reflects
  checkpoint_hash:  string    # hash of the checkpoint; allows receivers to
                              # detect stale or forked broadcasts
  domain_vectors: [           # node's current domain vector table
    {
      za:     float           # angular position of this domain
      weight: float           # scarcity multiplier
      domain: string          # opaque label; receivers must not compare
    }
  ]
  omega_aggregate:  float     # Σ Ωa_s across all active stewards
                              # total subnet mass; used for capture radius
  order_parameter:  float     # Φ = |Σ Ωa_s · exp(i·Za_s)|
                              # mesh economic coherence at this checkpoint
  node_za:          float     # current Za_n of the node
                              # derived from PLL across steward population
}
```

### What is and is not on the wire

**Included:**
- Domain vector table (Za angles and weights only; strings are informational)
- Aggregate Ωa mass (total; not per-steward, not per-domain in v1)
- Order parameter Φ (derived from steward population; no individual visible)
- Node Za (the PLL output; the node's current resonant phase)

**Excluded:**
- Per-steward Za, Ωa, or Ta values
- Steward identities or counts
- Pulse history or checkpoint history
- Any form of node authentication credential

The exclusions are not omissions to be filled in later. They are design
decisions. Per-steward data on the wire would allow a receiving node to
reconstruct individual steward positions from cross-node triangulation —
a privacy violation the gossip layer must not enable.

---

## 5. Broadcast Mechanics

### Push, not pull

Every node broadcasts its `NodeGossip` once per checkpoint to all nodes
it is aware of. There is no request-response cycle, no handshake, no
explicit federation negotiation.

A node that wants to federate does not ask. It broadcasts. If its geometry
is within another node's capture radius, the PLL dynamics will pull them
together over successive checkpoints. If it is not, the broadcasts are
received, processed, and discarded without consequence.

This is the correct model for several reasons:

- **No privileged initiator.** Pull requires one node to identify another
  as a federation candidate and initiate contact. That identification step
  implies the initiating node has some authority to declare candidacy.
  Push removes the initiator role entirely.

- **Emergent candidacy.** In a push model, any node can become a federation
  candidate simply by existing and broadcasting. Candidacy is determined
  by the receiving node's geometry, not by the broadcasting node's intent.
  This is structurally identical to how stewards become scouts or
  representatives — by geometry, not by application.

- **Fault tolerance.** A push broadcast that is not received is simply
  missing. The receiving node's picture of the mesh becomes stale but is
  never actively corrupted. No failed handshake leaves the protocol in
  a broken state.

### Broadcast scope

In v1, broadcast scope is the node's **direct neighbour set** — the nodes
it has been configured to peer with. There is no mesh-wide flooding protocol
in v1.

Indirect federation — node A federating with node C via node B as
intermediary — emerges naturally: B receives A's gossip and includes A's
domain vector influence in its own aggregate, which C then receives from B.
The Za signal propagates through the mesh without A and C ever exchanging
a direct message.

This is the correct behaviour: information diffuses through geometric
resonance, not through routing tables.

### Checkpoint alignment

All gossip messages carry a `checkpoint` index and `checkpoint_hash`. A
receiving node that sees a gossip message from a checkpoint it has not yet
advanced to buffers it. A message from a checkpoint more than a configurable
window behind the receiver's current checkpoint is treated as stale and
discarded.

Checkpoint alignment is not strict synchrony. Nodes advance independently.
The checkpoint index is a coarse coordination signal, not a global clock.

---

## 6. Processing a Received Gossip Message

When a node receives a `NodeGossip` from a peer, it performs the following:

### 6.1 Staleness check

If `gossip.checkpoint < (local_checkpoint - STALE_WINDOW)`, discard.
`STALE_WINDOW` is a configurable parameter (default: 3 checkpoints).

### 6.2 Domain cluster extraction

Extract the set of `(za, weight)` pairs from `gossip.domain_vectors`.
Cluster them by angular proximity (threshold: configurable, default: π/8)
to identify the foreign node's domain groups. Strings are discarded.

### 6.3 Cross-subnet phase error

For each foreign domain cluster centroid `za_foreign`, compute the
cross-subnet phase lag signal:

```
q_cross = omega_aggregate_foreign · sin(za_foreign - node_za_local)
```

Sum across all foreign domain clusters to get the total cross-subnet
quadrature signal `Q_cross`.

### 6.4 Sign-flip detection

Compare `Q_cross` at this checkpoint to `Q_cross` at the previous
checkpoint for this peer:

```
d_Q_cross/dt = Q_cross_now - Q_cross_prev
```

- `d_Q_cross/dt < 0` — the phase error is decreasing; subnets converging
- `d_Q_cross/dt = 0` — stable; at equilibrium or parallel trajectories
- `d_Q_cross/dt > 0` — the phase error is increasing; subnets diverging

A sustained positive `d_Q_cross/dt` across multiple checkpoints is the
endogenous signal that this encounter is outside the capture basin and
trending toward a domain wall. No threshold constant is required — the
geometry emits the signal.

### 6.5 Domain vector table update (federation path only)

If `d_Q_cross/dt ≤ 0` for a sustained window (default: 5 checkpoints),
the node is inside the capture basin with this peer. It may incorporate
the foreign domain vector table into its own merged table using the
Ωa-weighted merge from `docs/federation.md` §3:

```
za_merged(cluster) = (Ωa_local · za_local + Ωa_foreign · za_foreign)
                     ─────────────────────────────────────────────────
                               Ωa_local + Ωa_foreign
```

This write is the federation event. It happens silently, without
announcement. The node's domain vector table now reflects both coordinate
frames. Its next `NodeGossip` broadcast will carry the merged table,
propagating the federation signal outward.

---

## 7. The Noisy Parliament

The mesh at scale will have many nodes broadcasting simultaneously, most
of them not in each other's capture basins, most of the cross-subnet
phase error signals noisy and uncorrelated. This is not a problem to be
solved. It is the correct operating condition.

Signal in a noisy parliament emerges from **sustained resonance**, not
from loud singular messages. A pair of nodes that are genuinely inside
each other's capture basin will show a consistent `d_Q_cross/dt ≤ 0`
signal across many checkpoints despite noise. A pair that are not will
show a noisy but on-average-positive signal. The averaging window is
the filter.

The scouts from `docs/asymptotic-auth.md` §5 — stewards with Za near
the orthogonal boundary of two domain clusters — are the mesh's
natural antenna for detecting when a domain wall is weakening. Their
phase lag signal in the imaginary channel is large precisely when they
are positioned at the interference boundary. A node with many scouts
near a foreign node's domain cluster is a node that is close to, but
not yet inside, the capture basin. It is a node worth watching.

---

## 8. The Seam for v1 Implementation

The following components are needed in the server to support gossip:

- **`NodeGossip` schema** — Pydantic model matching §4 above
- **`POST /gossip`** — endpoint accepting a `NodeGossip` from a peer node;
  performs staleness check, cluster extraction, Q_cross computation,
  sign-flip detection; writes to a `gossip_log` table per peer per checkpoint
- **`GET /gossip/peers`** — returns the node's current peer list
- **`POST /gossip/peers`** — adds a peer by URL; admin-authenticated
- **Gossip emit task** — background task that fires once per checkpoint
  advance, assembles the local `NodeGossip` from current state, and POSTs
  it to all peers
- **`negotiate_precession()` upgrade** — when sign-flip condition is met,
  call the existing stub with the foreign domain vector table to perform
  the merge write

The `gossip_log` table is the observable record of the parliament. It is
the data source for a future dashboard showing which nodes are converging,
which are at walls, and where the scouts are clustered.

---

## 9. Broker Integrity and Legitimacy

At small scale, the mesh can operate with direct neighbour-to-neighbour
broadcast over HTTP. At larger scale, specialised relay nodes or pub/sub
brokers will emerge because they lower coordination cost and reduce signal
lag between dense regions of the mesh.

This is not a failure of the no-privileged-frame axiom. It is one of its
expected consequences. Hierarchies will emerge where the geometry makes
certain nodes or brokers exceptionally useful as relay points — not because
they were appointed, but because the mesh routes through them naturally.

The critical constraint is that **broker influence is advisory, never
sovereign**.

A broker may accelerate gossip diffusion. It may aggregate, relay, and
buffer broadcasts. It may become highly influential because many nodes
find its relay service informationally valuable. But it does not become a
source of ground truth. Every receiving node maintains a local ground truth
from its own steward population and compares broker-carried signal against
that local geometry.

### The consistency check

A broker's legitimacy is measurable in the geometry it relays.

If a broker forwards signal faithfully, then the `Q_cross`, `d_Q_cross`,
and `Φ` patterns it helps a node observe will remain consistent with the
node's own local steward-derived state and with direct peer broadcasts
when those are available.

If a broker delays, censors, reorders, or fabricates gossip, the distortion
appears as a geometric residue:

- `Q_cross` values inconsistent with direct neighbour observations
- `d_Q_cross/dt` sign changes that do not match local PLL evolution
- `Φ` readings that imply coherence not supported by local steward motion
- Stale checkpoint hashes arriving in patterns incompatible with expected lag

A dishonest broker cannot hide behind opacity forever because its distortion
is not semantic, it is geometric. The discrepancy appears in the receiving
node's own phase space.

This is the mechanism that keeps hierarchy honest. Brokers may compete for
legitimacy, throughput, and low latency, but their legitimacy is earned by
maintaining geometric consistency with the mesh, not by asserting authority
over it.

### Parliament accelerated

The mature mesh behaves like a parliament whose nominal function has been
made legible and continuous. In ordinary political systems, bad actors gain
power by weaponising opacity and signal lag — controlling who hears what,
when they hear it, and how long divergence can accumulate before it becomes
visible.

Pulser Mesh narrows that manoeuvre space. To become influential, a broker
must relay geometric state. To maintain influence, it must do so with enough
integrity that downstream nodes continue to find its signal consistent with
their local steward populations. Signal lag and corruption can still occur,
but they leave residues that are continuously detectable rather than only
becoming visible after a crisis.

In that sense, the mesh does not abolish hierarchy. It forces hierarchy to
compete under conditions of geometric accountability.

---

## Summary of Key Quantities

| Symbol | Name | Expression | Role |
|---|---|---|------|
| `Q_cross` | Cross-subnet quadrature | `Σ Ωa_foreign · sin(za_foreign − za_local)` | Phase error between subnet frames |
| `d_Q_cross/dt` | Q_cross rate of change | `Q_cross_now − Q_cross_prev` | Sign-flip federation/wall classifier |
| `Φ` | Order parameter | `\|Σ Ωa_s · exp(i·Za_s)\|` | Mesh economic coherence; broadcast in gossip |
| `za_merged` | Merged domain Za | Ωa-weighted centroid | Written on federation event |
| `r_capture` | Capture radius | `∝ Ωa_small / (Ωa_large + Ωa_small)` | Basin width; mass-ratio dependent |
