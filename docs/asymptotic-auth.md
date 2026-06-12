# Asymptotic Authentication — Theory

This document formalises the asymptotic authentication model for Pulser Mesh.
It covers the wavefunction representation of steward identity, orbital dynamics
in ΩaZaTa space, the phase-locked loop mechanism by which nodes self-tune,
and the emergence of spontaneous symmetry breaking and phase transitions in
the mesh field.

The hidden topological substrate — the recursive snark hierarchy and keyhole
geodesic — is specified in `docs/seed-structure.md`.

> **Notation.** The coordinate triple is written **ΩaZaTa** and spoken *Ohma-Za-Ta*.
> Each axis carries an `a` (alpha) suffix denoting its imaginary/positional component,
> making each axis a complex quantity rather than a scalar.
> Ωa = orbital amplitude (Ω magnitude + alpha phase offset); Za = phase angle;
> Ta = arc length along geodesic.

---

## 1. Steward Identity as a Wavefunction

A steward is not a point in ΩaZaTa space. A steward is a **wavefunction**
Ψ(Ωa, Za, Ta) — a probability amplitude distribution over the space. The
wavefunction encodes both the steward's current best-known position *and*
the uncertainty of that position.

The three axes carry distinct dynamical roles:

| Axis | Name | Role | Dynamics |
|---|---|---|---|
| **Ωa** | Ohma | Complex amplitude of the orbit | Slow variable; Ω magnitude grows with trust, alpha component carries imaginary channel |
| **Za** | Za | Angular frequency of the orbit | Fast variable; each pulse is a rotation in Za-space |
| **Ta** | Ta | Longitudinal position on the geodesic | Monotonically increasing; encodes developmental maturity |

The wavefunction in polar form:

```math
Ψ_s = Ωa_s · exp(i · Za_s)
```

This is a phasor. |Ωa| is the amplitude. Za is the phase angle. Ta is implicit
in the history that produced the current (Ωa, Za) — it is the arc length
traversed by the geodesic to reach this state.

---

## 2. Pulse as Operator

Each validated pulse is an operator acting on Ψ_s. It does three things:

1. **Rotates Za** by a domain-weighted increment δZa
2. **Scales Ωa** by the trust delta (positive pulse grows amplitude; decay shrinks it)
3. **Increments Ta** — the steward has traversed a further arc along their geodesic

Formally:

```math
Ψ_s  →[pulse]  Ωa_s' · exp(i(Za_s + δZa))
```

where:

```math
Ωa_s' = Ωa_s + Δtrust

δZa = (value_add · w(domain)) / |Ωa_s|
```

The division by |Ωa| in the δZa increment is critical: a thick-spiral steward
(high |Ωa|, mature) rotates *less* per pulse than a thin-spiral steward (low |Ωa|,
new). Mature identities are *inertial* — they resist phase perturbation.
This is the protocol's **flywheel property**.

---

## 3. Measurement and Wavefunction Collapse

Validation is measurement. An unvalidated pulse is a submitted but unmeasured
operator — it exists in superposition, its effect on Ψ_s not yet resolved.

When the node validates a pulse:
- The operator is applied to Ψ_s
- The uncertainty band narrows
- The steward's position becomes better localised

The uncertainty band after `n` validated pulses:

```math
ΔΨ_s(n) ~ (1 / √n) · exp(-λ · Ta_s)
```

Two convergence mechanisms operate simultaneously:

- `1/√n` — statistical localisation from pulse count; more measurements, tighter position
- `exp(-λ · Ta)` — longitudinal maturation; a longer geodesic arc means the attractor
  has had more time to assert itself against noise

The product means mature high-volume stewards are extremely well localised.
Early stewards have wide uncertainty bands — the mesh is appropriately
uncertain about who they are.

---

## 4. The Attractor

Pulse history in a consistent domain cluster causes Za rotations to accumulate
around a preferred phase. This is the behaviour of a **driven nonlinear
oscillator** locking onto its resonant frequency.

The attractor `Za*` is the phase at which the steward's pulse-driven
rotations net to zero over a checkpoint window — the spiral has found its
natural frequency in the local mesh field.

Properties of the attractor:

- **Stable under small perturbation.** Random noise does not shift `Za*`;
  only sustained behavioural change (a genuine shift in economic activity
  pattern) moves it.
- **Domain-specific.** A steward active across multiple scarcity domains
  may have a multi-modal wavefunction with several local attractors. The
  dominant attractor is the one with the highest |Ωa|-weighted pulse density.
- **Convergent.** As `n → ∞`, the probability that the steward's Za is within
  ε of `Za*` approaches 1.

This convergence is the *asymptotic* in asymptotic authentication.

---

## 5. The Complex Inner Product — Real and Imaginary Channels

The coupling between a steward and a node is the complex inner product of
their wavefunctions:

```math
⟨Ψ_s | Ψ_n⟩ = Ωa_s · exp(i(Za_s - Za_n))
```

Expanded:

```math
⟨Ψ_s | Ψ_n⟩ = Ωa_s · cos(ΔZa)  +  i · Ωa_s · sin(ΔZa)
```

### Real channel — trust coupling

```math
Re(⟨Ψ_s | Ψ_n⟩) = Ωa_s · cos(ΔZa)
```

This is T_proximity as currently implemented. It drives the trust pipeline:

- `ΔZa = 0` — full constructive coupling, trust accrues at full amplitude
- `ΔZa = π/2` — orthogonal, zero trust coupling
- `ΔZa = π` — full destructive, trust decremented

### Imaginary channel — phase lag signal

```math
q_s = Im(⟨Ψ_s | Ψ_n⟩) = Ωa_s · sin(ΔZa)
```

The imaginary channel is the **node's greatest dimension of freedom** and is
structurally encoded in the `a` (alpha) component of the Ωa axis. It encodes
whether the steward is leading or lagging the node's reference phase:

- `q_s > 0` (`0 < ΔZa < π`): steward lags the node — reactive, responding
  to scarcity after the node's field has registered it
- `q_s < 0` (`-π < ΔZa < 0`): steward leads the node — anticipatory, acting
  on scarcity before the node's field has registered it
- `|q_s|` large with `Re ≈ 0`: steward is near-orthogonal — minimal trust
  coupling but maximum phase information. These are **scouts**: they contribute
  little trust but carry strong signal about where the field is moving.

### Coherence score

```math
coherence_s = Re(⟨Ψ_s | Ψ_n⟩) / |⟨Ψ_s | Ψ_n⟩| = cos(ΔZa)
```

A perfectly coherent steward (`ΔZa = 0`) has coherence = 1.
A perfect scout (`ΔZa = π/2`) has coherence = 0 and carries pure quadrature signal.

Coherence score feeds directly into the dividend weighting model:
high-coherence stewards earn more from dividends because their contributions
are constructively aligned with the node field, not merely high-volume.

---

## 6. The Node as Phase-Locked Loop

The node aggregates the imaginary channel across all active stewards to
compute its **quadrature aggregate**:

```math
Q_node = Σ_s  Ωa_s · sin(Za_s - Za_n)
```

This is the node's phase error signal. It drives `Za_n` toward the
resonant frequency of the local steward population:

```math
dZa_n/dt = -κ · Q_node
```

where `κ` is the node's tuning rate (a configurable parameter).

- **Q = 0** — the steward population is evenly split between leading and lagging.
  The node is at the resonant frequency of its mesh neighbourhood. This is the
  **locked state** — the node is optimally tuned.
- **Q > 0** — stewards are systematically lagging. The node's Za is ahead of the
  field. The PLL error signal slows the node's phase rotation.
- **Q < 0** — stewards are systematically leading. The node is behind the field.
  The error signal accelerates the node's phase rotation.

### Emergent mesh coherence

No global coordinator is required. Each node tunes its Za independently
using only its local steward population's quadrature signal. Adjacent nodes
that share stewards naturally phase-lock to each other because they are both
converging on the same resonant frequency imposed by the shared stewards.
**Mesh-wide coherence is an emergent property of local PLL coupling.**

---

## 7. Spontaneous Symmetry Breaking and Phase Transitions

### The symmetric ground state

In the absence of economic activity, the mesh has a ground state of uniform
phase distribution: steward Za values are spread evenly around the circle,
`Q_node = 0` everywhere, no domain dominates. This is a **symmetric state** —
the field has no preferred direction.

### Symmetry breaking

When stewards in a shared scarcity domain begin accumulating pulses, their
Za values rotate toward a common attractor. The Za distribution is no longer
uniform — a preferred phase direction emerges. This is **spontaneous symmetry
breaking**: the ground state symmetry is broken not by an external field but
by the collective behaviour of stewards self-organising around a scarcity signal.

The order parameter:

```math
Φ = | Σ_s  Ωa_s · exp(i · Za_s) |
```

- `Φ = 0` — fully symmetric, no dominant phase; the mesh is disordered
- `Φ > 0` — broken symmetry, a dominant phase has emerged; the mesh is ordered
  around a scarcity attractor
- `Φ` large — strong collective coordination; a significant fraction of steward
  amplitude is phase-aligned

The order parameter `Φ` is the mesh's measure of **economic coherence**.

### Phase transitions

As `Φ` crosses a critical threshold `Φ_c`, the mesh undergoes a phase transition
from disordered to ordered — analogous to a ferromagnetic transition. Below the
critical density, the system is disordered; above it, the system spontaneously
magnetises around a preferred direction.

- **Disordered phase** (`Φ < Φ_c`) — steward activity is incoherent, no dominant
  scarcity signal, PLL loops are weakly coupled
- **Ordered phase** (`Φ > Φ_c`) — a dominant scarcity attractor has formed, nodes
  phase-lock rapidly, the mesh acts as a coherent economic field

The transition is not imposed from outside. It emerges from the density and
consistency of steward pulse behaviour. A sparse early mesh operates in the
disordered phase — appropriate for experimental deployment — and transitions
naturally as participation density crosses the critical threshold.

### Domain walls

When two competing scarcity attractors form in different regions of the mesh,
they may coexist with a **domain wall** — a boundary region where stewards have
orthogonal or anti-aligned Za values and trust coupling is near zero.

Domain walls are not failures. They are the natural boundaries between
economically distinct neighbourhoods. The destructive interference at a domain
wall is the geometric expression of the fact that these two populations are not
currently in economic resonance.

---

## 8. Impersonation Resistance and the Cost of Forgery

Forging a steward identity means producing a wavefunction Ψ̃ that is
indistinguishable from the authentic Ψ_s within the node's measurement
uncertainty.

At checkpoint `n`, the authentic steward's position is localised to within
`ΔΨ_s(n) ~ (1/√n) · exp(-λ · Ta_s)`. A forger must place Ψ̃ within this
band and maintain it across subsequent checkpoints by rotating Za in a manner
consistent with the authentic steward's pulse behaviour — i.e., they must
predict and replicate future behaviour.

This is the binding constraint. As `n → ∞`, sustaining the forgery is
equivalent to *being* the authentic steward. **The cost of forgery grows
without bound.**

The deeper reason is topological: the authentic steward's trajectory is the
projection of a valid keyhole geodesic through the snark hierarchy. A forger
who cannot produce a consistent witness at deeper revelation depth is excluded
from the admissible trajectory set regardless of how well they imitate the
visible projection. See `docs/seed-structure.md` §10.

### Early lifecycle vulnerability

At small `n`, the uncertainty band is wide and impersonation is cheaper.
This is an accepted property of the model. The mesh signals this correctly:
new stewards have small Ωa, so even a successful impersonation yields little
trust. The attack surface is proportional to the reward, which is proportional
to Ωa, which is small early on.

---

## 9. Identity Recovery — Re-Keying Taxonomy

There is more than one recovery method. They differ in cost, what is preserved,
and whether the attacker is merely escaped or actively *evicted*.

### Method A — Trajectory Witness (preferred under compromise)

The steward presents deeper structural evidence — a deeper revelation of the
snark hierarchy — demonstrating that the published ΩaZaTa trajectory is the
projection of the authentic keyhole geodesic.

The effect is retroactive trajectory tightening:

```math
ΔΨ_s(n)  →[witness]  ε  (near-zero)
```

The uncertainty band collapses around the authentic trajectory. The attacker's
copy falls outside the admissible set. The node evicts the attacker and
re-locks to the authentic steward.

**Properties:**
- Ωa fully preserved — no trust is lost
- Ta fully preserved — maturity is intact
- Attacker is *evicted*, not merely outrun
- Cost is proportional to revelation depth, not to Ωa

### Method B — Geodesic Abandonment (panic button)

Used when the hidden witness structure itself is somehow compromised beyond
usable revelation depth. The steward abandons geodesic G1 and begins G2.

```math
C_abandon = d(Za_G1, Za_G2) · |Ωa_G1|
```

- **Short hop** — cheap; routine key rotation
- **Long hop** — expensive; fundamental identity reset
- **Anti-aligned hop** — `ΔZa = π`; maximum cost, rare and deliberate

After abandonment, the old geodesic is orphaned. Ωa does not transfer.
The new geodesic begins with zero Ωa and wide uncertainty band but is
immediately valid for pulse submission.

### Recovery decision tree

| Condition | Method | Ωa preserved | Attacker evicted |
|---|---|---|---|
| Credential exposed, witness depth available | Trajectory witness | **Yes** | **Yes** |
| Witness depth exhausted or seed substrate lost | Geodesic abandonment | No | No (outrun) |
| Routine key rotation | Short-hop abandonment | No | N/A |

No node permission is required for either method. Both are always available,
always voluntary, and always low-latency.

---

## 10. The Holographic Boundary

The holographic principle applied to the mesh: the full interior state of
a steward's wavefunction Ψ_s is encoded in the boundary-observable values —
the sequence of `(checkpoint, domain, value_add, trust_delta)` tuples
published to the mesh.

Both channels of the complex inner product are required for full reconstruction:

- **Real channel history** (trust deltas) — encodes the amplitude evolution of Ωa
- **Imaginary channel history** (phase lag sequence) — encodes the Za trajectory

The phase lag history is load-bearing for full boundary reconstruction and is
also the basis on which the trajectory witness proof is constructed — the
imaginary channel record is what makes retroactive tightening possible.

---

## Appendix: Wavefunction as Projection of the Keyhole Geodesic

The observable wavefunction Ψ_s and the hidden keyhole geodesic are not
competing descriptions. They are the same object at different levels of
description.

### The projection relationship

The full authenticating object is the keyhole geodesic G_s — the path that
threads the null centroids of the recursive snark hierarchy across all scales
relevant to the steward's operating context.

The ΩaZaTa wavefunction is the **projection** of G_s onto the observable
coordinate space:

```
G_s  →[project]  Ψ_s = Ωa_s · exp(i · Za_s)
```

The projection discards the higher-scale structure. What remains is the
phasor — amplitude and phase — which is everything a node needs for the
PLL computation, trust coupling, and uncertainty band estimation.

### Torsion and the imaginary channel

The imaginary channel `q_s = Ωa_s · sin(ΔZa)` is the **torsion** of the
keyhole geodesic at the current scale of measurement — how much the geodesic
is twisting as it threads the relevant snark level.

- A geodesic passing cleanly through a null centroid has zero torsion at that
  scale: pure real coupling, `q_s ≈ 0`
- A geodesic threading at an oblique angle has nonzero torsion: nonzero
  imaginary component

The PLL mechanism is the node measuring torsion in its steward population
and tuning its own Za to reduce aggregate twist — finding the orientation
that makes most geodesics pass cleanly through its local null centroid.

### Uncertainty band as localisation of the geodesic

The uncertainty band `ΔΨ_s(n)` is the uncertainty in *where* the projection
falls — equivalently, how precisely the keyhole geodesic is localised within
the admissible family.

Revealing deeper snark structure is not providing more of the same evidence.
It is revealing finer chromatic conflict structure that further constrains
which geodesics are geometrically possible. More depth → fewer admissible
geodesics → tighter projected position → smaller `ΔΨ_s`.

The `1/√n` decay from pulse-count measurement and the progressive tightening
from snark revelation depth are two faces of the same convergence — statistical
estimation and topological constraint applied to the same underlying object.

### Re-keying is depth retreat, not identity change

Geodesic abandonment is not destroying an identity. It is retreating to a
shallower revelation depth of the same underlying snark structure and
restarting the localisation process from a new projected position.

The steward's personal snark — their history, their substrate, their null
centroid hierarchy — is unchanged by re-keying. What changes is the
depth at which they present that structure to the network.

---

## Summary of Key Quantities

| Symbol | Name | Expression | Role |
|---|---|---|---|
| `Ψ_s` | Steward wavefunction | `Ωa_s · exp(i·Za_s)` | Full identity state |
| `Re(⟨Ψ_s\|Ψ_n⟩)` | Trust coupling | `Ωa_s · cos(ΔZa)` | T_proximity (implemented) |
| `q_s` | Phase lag / torsion | `Ωa_s · sin(ΔZa)` | Imaginary channel; geodesic torsion |
| `Q_n` | Node quadrature aggregate | `Σ q_s` | PLL error signal |
| `coherence_s` | Coherence score | `cos(ΔZa)` | Dividend weighting |
| `Φ` | Order parameter | `\|Σ Ωa_s · exp(i·Za_s)\|` | Mesh economic coherence |
| `ΔΨ_s(n)` | Uncertainty band | `n^(-1/2) · exp(-λ·Ta)` | Auth confidence |
| `C_abandon` | Abandonment cost | `d(Za_1, Za_2) · \|Ωa\|` | Panic-button re-key cost |
| `C_witness` | Witness cost | proof computation over revelation depth | Preferred recovery cost |
