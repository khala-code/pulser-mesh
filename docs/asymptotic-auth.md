# Asymptotic Authentication — Theory

This document formalises the asymptotic authentication model for Pulser Mesh.
It covers the wavefunction representation of steward identity, orbital dynamics
in OaZaTa space, the phase-locked loop mechanism by which nodes self-tune,
and the emergence of spontaneous symmetry breaking and phase transitions in
the mesh field.

Implementation notes are in `docs/asymptotic-auth-impl.md`.

---

## 1. Steward Identity as a Wavefunction

A steward is not a point in OaZaTa space. A steward is a **wavefunction**
Ψ(Oa, Za, Ta) — a probability amplitude distribution over the space. The
wavefunction encodes both the steward's current best-known position *and*
the uncertainty of that position.

The three axes carry distinct dynamical roles:

| Axis | Name | Role | Dynamics |
|---|---|---|---|
| **Oa** | Omega / thickness | Amplitude of the orbit | Slow variable; grows with trust accumulation, shrinks under decay |
| **Za** | Zeta / phase | Angular frequency of the orbit | Fast variable; each pulse is a rotation in Za-space |
| **Ta** | Tau / arc length | Longitudinal position on the geodesic | Monotonically increasing; encodes developmental maturity |

The wavefunction in polar form:

\[ \Psi_s = \text{Oa}_s \cdot e^{i \cdot Za_s} \]

This is a phasor. Oa is the amplitude. Za is the phase angle. Ta is implicit
in the history that produced the current (Oa, Za) — it is the arc length
traversed by the geodesic to reach this state.

---

## 2. Pulse as Operator

Each validated pulse is an operator acting on \(\Psi_s\). It does three things:

1. **Rotates Za** by a domain-weighted increment \(\delta Za\)
2. **Scales Oa** by the trust delta (positive pulse grows amplitude; decay shrinks it)
3. **Increments Ta** — the steward has traversed a further arc along their geodesic

Formally:

\[ \Psi_s \xrightarrow{\text{pulse}} \text{Oa}_s' \cdot e^{i(Za_s + \delta Za)} \]

where

\[ \text{Oa}_s' = \text{Oa}_s + \Delta\text{trust} \]
\[ \delta Za = \frac{\text{value\_add} \cdot w(\text{domain})}{\text{Oa}_s} \]

The division by Oa in the Za increment is critical: a thick-spiral steward
(high Oa, mature) rotates *less* per pulse than a thin-spiral steward (low Oa,
new). Mature identities are *inertial* — they resist phase perturbation.
This is the protocol's flywheel property.

---

## 3. Measurement and Wavefunction Collapse

Validation is measurement. An unvalidated pulse is a submitted but unmeasured
operator — it exists in superposition, its effect on \(\Psi_s\) not yet
resolved.

When the node validates a pulse:
- The operator is applied to \(\Psi_s\)
- The uncertainty band narrows
- The steward's position becomes better localised

The uncertainty band after \(n\) validated pulses:

\[ \Delta\Psi_s(n) \sim \frac{1}{\sqrt{n}} \cdot e^{-\lambda \cdot \text{Ta}_s} \]

Two convergence mechanisms operate simultaneously:
- \(1/\sqrt{n}\): statistical localisation from pulse count — more measurements,
  tighter position
- \(e^{-\lambda \cdot \text{Ta}}\): longitudinal maturation — a longer geodesic
  arc means the attractor has had more time to assert itself against noise

The product means mature high-volume stewards are extremely well localised.
Early stewards have wide uncertainty bands — the mesh is appropriately
uncertain about who they are.

---

## 4. The Attractor

Pulse history in a consistent domain cluster causes Za rotations to accumulate
around a preferred phase. This is the behaviour of a **driven nonlinear
oscillator** locking onto its resonant frequency.

The attractor \(Za^*\) is the phase at which the steward's pulse-driven
rotations net to zero over a checkpoint window — the spiral has found its
natural frequency in the local mesh field.

Properties of the attractor:
- **Stable under small perturbation.** Random noise does not shift \(Za^*\);
  only sustained behavioural change (a genuine shift in economic activity
  pattern) moves it.
- **Domain-specific.** A steward active across multiple scarcity domains
  may have a multi-modal wavefunction with several local attractors. The
  dominant attractor is the one with the highest Oa-weighted pulse density.
- **Convergent.** As \(n \to \infty\), the probability that the steward's
  Za is within \(\epsilon\) of \(Za^*\) approaches 1.

This convergence is the *asymptotic* in asymptotic authentication.

---

## 5. The Complex Inner Product — Real and Imaginary Channels

The coupling between a steward and a node is the complex inner product of
their wavefunctions:

\[ \langle \Psi_s | \Psi_n \rangle = \text{Oa}_s \cdot e^{i(Za_s - Za_n)} \]

Expanded:

\[ \langle \Psi_s | \Psi_n \rangle = \text{Oa}_s \cos(\Delta Za) + i \cdot \text{Oa}_s \sin(\Delta Za) \]

### Real channel — trust coupling

\[ \text{Re}(\langle \Psi_s | \Psi_n \rangle) = \text{Oa}_s \cos(\Delta Za) \]

This is T_proximity as currently implemented. It drives the trust pipeline:
- \(\Delta Za = 0\): full constructive coupling, trust accrues at full amplitude
- \(\Delta Za = \pi/2\): orthogonal, zero trust coupling
- \(\Delta Za = \pi\): full destructive, trust decremented

### Imaginary channel — phase lag signal

\[ q_s = \text{Im}(\langle \Psi_s | \Psi_n \rangle) = \text{Oa}_s \sin(\Delta Za) \]

The imaginary channel is the **node's greatest dimension of freedom**.
It encodes whether the steward is leading or lagging the node's reference phase:

- \(q_s > 0\) (\(0 < \Delta Za < \pi\)): steward lags the node — reactive,
  responding to scarcity after the node's field has registered it
- \(q_s < 0\) (\(-\pi < \Delta Za < 0\)): steward leads the node — anticipatory,
  acting on scarcity before the node's field has registered it
- \(|q_s|\) large with \(\text{Re} \approx 0\): steward is near-orthogonal.
  Minimal trust coupling but maximum phase information. These are **scouts** —
  they contribute little trust but carry strong signal about where the field is moving.

### Coherence score

The coherence of a steward is the fraction of their coupling amplitude
that is in-phase (real channel) rather than quadrature (imaginary channel):

\[ \text{coherence}_s = \frac{\text{Re}(\langle \Psi_s | \Psi_n \rangle)}{|\langle \Psi_s | \Psi_n \rangle|} = \cos(\Delta Za) \]

A perfectly coherent steward (\(\Delta Za = 0\)) has coherence = 1.
A perfect scout (\(\Delta Za = \pi/2\)) has coherence = 0 and carries
pure quadrature signal.

Coherence score feeds directly into the dividend weighting model:
high-coherence stewards earn more from dividends because their contributions
are constructively aligned with the node field, not merely high-volume.

---

## 6. The Node as Phase-Locked Loop

The node aggregates the imaginary channel across all active stewards to
compute its **quadrature aggregate**:

\[ Q_{\text{node}} = \sum_s \text{Oa}_s \cdot \sin(Za_s - Za_n) \]

This is the node's phase error signal. It drives Za_node toward the
resonant frequency of the local steward population:

\[ \dot{Za}_n = -\kappa \cdot Q_{\text{node}} \]

where \(\kappa\) is the node's tuning rate (a configurable parameter).

**When \(Q = 0\):** the steward population is evenly split between leading
and lagging. The node is at the resonant frequency of its mesh neighbourhood.
This is the **locked state** — the node is optimally tuned.

**When \(Q > 0\):** stewards are systematically lagging. The node's Za is
ahead of the field. The PLL error signal slows the node's phase rotation.

**When \(Q < 0\):** stewards are systematically leading. The node is behind
the field. The error signal accelerates the node's phase rotation.

### Emergent mesh coherence

No global coordinator is required. Each node tunes its Za independently
using only its local steward population's quadrature signal. Adjacent nodes
that share stewards will naturally phase-lock to each other because they
are both converging on the same resonant frequency imposed by the shared
stewards. **Mesh-wide coherence is an emergent property of local PLL coupling.**

This is the mechanism by which the mesh self-organises without central authority.

---

## 7. Spontaneous Symmetry Breaking and Phase Transitions

### The symmetric ground state

In the absence of economic activity, the mesh has a ground state of uniform
phase distribution: steward Za values are spread evenly around the circle,
\(Q_{\text{node}} = 0\) everywhere, no domain dominates.

This is a **symmetric state** — the field has no preferred direction.

### Symmetry breaking

When stewards in a shared scarcity domain begin accumulating pulses, their
Za values rotate toward a common attractor. The Za distribution is no longer
uniform — a preferred phase direction emerges. This is **spontaneous symmetry
breaking**: the ground state symmetry is broken not by an external field but
by the collective behaviour of stewards self-organising around a scarcity signal.

The order parameter is:

\[ \Phi = \left| \sum_s \text{Oa}_s \cdot e^{i \cdot Za_s} \right| \]

- \(\Phi = 0\): fully symmetric, no dominant phase — the mesh is disordered
- \(\Phi > 0\): broken symmetry, a dominant phase has emerged — the mesh is
  ordered around a scarcity attractor
- \(\Phi\) large: strong collective coordination, a significant fraction of
  steward amplitude is phase-aligned

The order parameter \(\Phi\) is the mesh's measure of **economic coherence**.

### Phase transitions

As \(\Phi\) crosses a critical threshold \(\Phi_c\), the mesh undergoes a
phase transition from disordered to ordered. This is analogous to a
ferromagnetic transition — below the critical temperature (sparse steward
activity) the system is disordered; above it (dense coordinated activity)
the system spontaneously magnetises around a preferred direction.

In the mesh:
- **Disordered phase** (\(\Phi < \Phi_c\)): steward activity is incoherent,
  no dominant scarcity signal, PLL loops are weakly coupled
- **Ordered phase** (\(\Phi > \Phi_c\)): a dominant scarcity attractor has
  formed, nodes phase-lock rapidly, the mesh acts as a coherent economic field

The transition is not imposed from outside. It emerges from the density and
consistency of steward pulse behaviour. This is the protocol's **scaling
property**: a sparse early mesh operates in the disordered phase (appropriate
for experimental deployment) and transitions to the ordered phase naturally
as participation density crosses the critical threshold.

### Domain walls

When two competing scarcity attractors form in different regions of the mesh
(e.g. a water-domain cluster and an energy-domain cluster), they may coexist
with a **domain wall** — a boundary region where stewards have orthogonal
or anti-aligned Za values and trust coupling is near zero.

Domain walls are not failures. They are the natural boundaries between
economically distinct neighbourhoods. The destructive interference at a
domain wall is the geometric expression of the fact that these two
populations are not currently in economic resonance.

---

## 8. Impersonation Resistance and the Cost of Forgery

Forging a steward identity means producing a wavefunction \(\tilde{\Psi}\)
that is indistinguishable from the authentic \(\Psi_s\) within the node's
measurement uncertainty.

At checkpoint \(n\), the authentic steward's position is localised to within:

\[ \Delta\Psi_s(n) \sim \frac{1}{\sqrt{n}} \cdot e^{-\lambda \cdot \text{Ta}_s} \]

A forger must place \(\tilde{\Psi}\) within this band. To do so they must:
1. Know the authentic steward's current Za to within \(\Delta\Psi_s(n)\)
2. Maintain that position across subsequent checkpoints
3. Continue to rotate Za in a manner consistent with the authentic
   steward's pulse behaviour — i.e., predict and replicate future behaviour

Requirement 3 is the binding constraint. At \(n \to \infty\), sustaining
the forgery is equivalent to *being* the authentic steward. The cost of
forgery grows without bound.

### Early lifecycle vulnerability

At small \(n\), the uncertainty band is wide and impersonation is cheaper.
This is an accepted property of the model — early stewards are inherently
less authenticated. The mesh signals this through the small Oa of new
stewards: their coupling amplitude is low, so even a successful impersonation
yields little trust. The attack surface is proportional to the reward,
which is proportional to Oa, which is small early on.

---

## 9. Geodesic Re-Keying

A steward may voluntarily abandon their current geodesic \(G_1\) and begin
a new one \(G_2\). The cost is:

\[ C_{\text{rekey}} = d(Za_{G_1}, Za_{G_2}) \cdot \text{Oa}_{G_1} \]

where \(d\) is the angular distance between the old attractor and the new
starting position. This has the right incentive shape:
- **Short hop** (new Za near old Za): cheap. Appropriate for routine
  key rotation or minor compromise.
- **Long hop** (new Za far from old Za): expensive. Appropriate for
  a fundamental identity shift. The high cost reflects the real economic
  loss of abandoning a mature, high-Oa trajectory.
- **Anti-aligned hop** (\(\Delta Za = \pi\)): maximum cost. The steward
  is moving to the diametrically opposite phase. This should be rare and
  deliberate.

After re-keying:
- The old geodesic is orphaned. Old keys are invalid for new submissions.
- Trust (Oa) on the old geodesic does not transfer.
- The new geodesic begins with zero Oa and wide uncertainty band.
- The new geodesic is immediately valid for pulse submission.

Re-keying is the protocol's **panic button**. It is always available,
always voluntary, and always low-latency. No node permission is required.

---

## 10. The Holographic Boundary

The holographic principle applied to the mesh: the full interior state of
a steward's wavefunction \(\Psi_s\) is encoded in the boundary-observable
values — the sequence of (checkpoint, domain, value_add, trust_delta) tuples
published to the mesh.

Both channels of the complex inner product are required for full reconstruction:
- **Real channel history** (trust deltas) — encodes the amplitude evolution of Oa
- **Imaginary channel history** (phase lag sequence) — encodes the Za trajectory

Without the imaginary channel, the boundary encodes only the magnitude of the
steward's economic activity, not the phase. A node observing only the real
channel cannot distinguish between a steward who has been consistently
leading the field (anticipatory) and one who has been consistently lagging
(reactive) — even if their trust balances are identical.

The phase lag history is therefore load-bearing for full boundary reconstruction.
This is the theoretical foundation for including the imaginary channel
(\(q_s = \text{Oa}_s \sin(\Delta Za)\)) in the pulse record.

---

## Summary of Key Quantities

| Symbol | Name | Expression | Role |
|---|---|---|---|
| \(\Psi_s\) | Steward wavefunction | \(\text{Oa}_s \cdot e^{i Za_s}\) | Full identity state |
| \(\text{Re}(\langle\Psi_s\|\Psi_n\rangle)\) | Trust coupling | \(\text{Oa}_s \cos(\Delta Za)\) | T_proximity (implemented) |
| \(q_s\) | Phase lag signal | \(\text{Oa}_s \sin(\Delta Za)\) | Imaginary channel (v2) |
| \(Q_n\) | Node quadrature aggregate | \(\sum_s q_s\) | PLL error signal |
| \(\text{coherence}_s\) | Coherence score | \(\cos(\Delta Za)\) | Dividend weighting |
| \(\Phi\) | Order parameter | \(\|\sum_s \Psi_s\|\) | Mesh economic coherence |
| \(\Delta\Psi_s(n)\) | Uncertainty band | \(n^{-1/2} e^{-\lambda \text{Ta}}\) | Auth confidence |
| \(C_{\text{rekey}}\) | Re-keying cost | \(d(Za_1, Za_2) \cdot \text{Oa}\) | Identity mobility cost |
