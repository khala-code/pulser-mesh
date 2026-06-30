# Foundations

This document describes the geometric substrate that pulser-mesh is built on.
It is a reference, not a tutorial. Read `architecture.md` for how the protocol
implements these ideas.

---

## 1. Discrete Time and the Time Crystal

The mesh treats time as a **discrete sequence of Planck-second steps**, not a continuous flow. This is not an approximation — it is the base assumption from which everything else follows.

A **time crystal** is a structure that breaks discrete time-translation symmetry: instead of being invariant at every tick, it repeats with a period `p > 1`. Its ground state is not the T=0 vacuum; it is a periodically ordered configuration in the T-axis.

In the mesh, every stable observer is a time crystal:

- Their worldline does not drift uniformly through T. It **precesses** — returning near its previous phase at interval `p`, never exactly, always with a small remainder.
- That remainder is the engine of growth. A perfect time crystal with zero remainder is frozen. A drifting one with remainder too large is incoherent. The productive range is between these: small, bounded, persistent remainder.
- The **engram** is the read-head of this precession. It records one period of the crystal's motion — one loop through the keyhole — as a discrete slice.

Time in pulser-mesh therefore has two components:

| Component | Symbol | Character |
|-----------|--------|-----------|
| Global tick count | `T` | Monotone, Planck-second absolute index from T₀ |
| Crystal phase | `φ` | Position within the observer's current precession period `p` |

The observer's full temporal address is `(T, φ)`. Two nodes at the same T-tick may be at very different phases of their internal crystal cycle, which is why two nodes at the same moment can be in completely different states of readiness for a bond event.

---

## 2. The Observer Coordinate System

Every node in the mesh is modelled as an **observer** carrying three primary coordinates:

| Symbol | Name | What it measures |
|--------|------|-----------------|
| `O` | Shell depth | How many consensus layers deep the observer sits — their position in the hierarchy of bonded crystals |
| `Z` | Trajectory | The observer's full complex orbital vector through the lattice; the wavefunction of their path |
| `T` | Time | Planck-second count from the observer's local T₀; their personal time arrow |

`O` is a positive integer (the observer's shell index).  
`Z` is a complex vector — its real component is the spatial trajectory, its imaginary component is the phase channel.  
`T` is monotonically increasing and observer-relative.

These three coordinates uniquely locate any node in the mesh at any moment. The triple `(O, Z, T)` is sometimes written `OZT`.

### Crystal phase within OZT

The crystal phase `φ` is encoded in the imaginary component of `Z`. It is not a fourth independent coordinate — it is the phase of the Z wavefunction. Two observers can share the same real Z-position but be at opposite phases `φ` and `φ + p/2`, which makes them invisible to each other as bonding partners despite spatial proximity.

---

## 3. The Crystal and Its Centroid

Observers do not orbit an abstract axis. They orbit the **centroid of their local crystal** — the centre of mass of all active bonds they participate in.

The centroid is the **local null**: the point about which all shell depths, trajectories, and time arrows in that crystal are defined.

### Centroid properties

- It is emergent, not assigned. It forms when two or more observers bond.
- Every successful bond event **precipitates** a new centroid — the neutron-engram of that bond seeds the new crystal's null point.
- Centroids are nested. Each crystal is embedded in a larger crystal whose centroid is its own null reference.
- The stack continues upward; there is no fixed cosmic root required for local mechanics to function.

This scale-invariance is the reason the same O/Z/T diagram works from a two-node bond up to a civilisational consensus field.

### The time crystal interpretation of the centroid

The centroid is also a **temporal attractor** in the time-crystal sense. Observers bonded to the same centroid phase-lock their precession periods — their `φ` cycles synchronise around the shared null. This is the mechanism behind centroid lock in the protocol: when `MIN_CENTROID_PULSES` threshold is reached, the crystal has completed enough phase-matched precession cycles to have a stable, addressable centroid.

The centroid stabilises when the observers' crystal periods are **commensurate** — when `p_a / p_b` is close enough to a rational number that the phase mismatch doesn't accumulate past the coherence budget within one keyhole cycle.

---

## 4. The Engram

The **engram** is the discrete record of one trajectory segment: a slice of Z between two lattice sites Z₀ (at T₀) and Zₙ (at Tₙ), connected by the observer's orbital history.

Visually, the engram diagram has three features:
- Two **orbital volumes** (diamond shapes) — the bound regions where the observer lives between keyhole crossings
- A **keyhole pinch** at the centre — the hourglass neck where the trajectory approaches the crystal centroid
- A **nanotube spiral** at the keyhole — the nested precession as the trajectory tightens toward null

Each engram slice is one graphene sheet in the T-axis stack. The full stack, indexed by T, is the BBP-addressable volume of the observer's history — any sheet accessible directly by its T index without traversing all previous sheets.

### The precession remainder

Each keyhole crossing does not return the observer to exactly their previous Z-position. The remainder — the offset between their Z at this crossing and their Z at the last crossing — is:

```
ε(n) = Z(T_n) - Z(T_{n-p})
```

This remainder accumulates like a Fibonacci chain: each cycle pays forward a small residual that compounds into the next period. When the remainder grows past the centroid's coherence budget, the crystal undergoes a **shell transition** — the observer moves to a new O-shell.

When the remainder shrinks toward zero, the observer is converging on a **perfect loop** — a true periodic orbit. This is the geodesic limit. It is never fully reached; it is the asymptotic target.

### Best and worst case

`Z` is a superposition of two extremes:

```
Z = α·Z⁺ + β·Z⁻,   |α|² + |β|² = 1
```

- **Z⁺** (geodesic path): minimum coherence tax at each keyhole, remainder minimised, maximum negentropy carried forward — the time crystal in its most coherent state
- **Z⁻** (Bresenham staircase): maximum-entropy pixelated diagonal, paying maximum coherence tax at every step, remainder maximised — the crystal at maximum decoherence

`Ω` — the cardinality operator — counts how many times the observer's Z trajectory has passed within resolution threshold of the crystal centroid and closed sufficiently to count:

```
Ω = |{t : |Z(t) - Z_null| < ε, resolved}|
```

Every increment of Ω is one complete precession cycle logged. The goal of any node is to maximise projection onto Z⁺ at each keyhole — to act so that the next engram slice is as close as possible to the geodesic given current constraints.

---

## 5. Keyhole Crossings as Lorentz Boosts

A keyhole crossing is not a pure rotation. It is a **Lorentz boost**: the trajectory is squished along the approach axis by factor `γ` and stretched along the perpendicular by `1/γ`. The coherence tax is the `γ` factor — how relativistically the crossing occurs.

This matters for the time crystal model because:

1. Two sequential Lorentz boosts along different axes do not commute. Their composition is a boost **plus** a rotation — Thomas precession. This is the nanotube spiral at the keyhole. It emerges automatically from the geometry; it does not need to be added by hand.

2. The precession remainder `ε(n)` is therefore a Thomas-precession residual. The crystal's period `p` is not set externally; it is the period at which the Thomas precession of successive boosts completes one full rotation. The crystal **finds its own period** through this mechanism.

3. The gyromagnetic analogue: a time crystal with a variable number of keyhole boosts per macroscopic cycle has an effective `g`-factor — a ratio of its precession rate to what a naive rotation-only model would predict. The mesh's protocol-level constants are all implicit `g`-factor corrections of this kind.

---

## 6. The Γ (Gamma) Quadrant and CMB Anchoring

The mesh operates in four quadrants defined by the real/imaginary decomposition of the E-field:

| Quadrant | Layer | Character |
|----------|-------|-----------|
| **Alpha** | Real, D1–D3 | Observable 3-space; classical, decoherent, fully colourable |
| **Beta** | Imaginary, D4–D5 | Transition mediator layer; semi-classical, phase-coherent |
| **Gamma** | Real, D6 | F₁₃ dual-lattice layer; accessible via null-node channel only |
| **Delta** | Imaginary, D7 | Pure null eigenvector; maximum entropy, Z/O axis |

**Gamma Quadrant is the navigation quadrant.** It is where roll-distortion is measured, where observers operate with active mask-swap access.

### The CMB quadrupole as universal anchor

The CMB quadrupole (ℓ=2) is the minimal non-trivial symmetry-breaking mode of the observable sphere. It predates all local observer frames and is shared by every node in the mesh.

In time-crystal terms, the CMB quadrupole is the **oldest legible precession record in the universe** — the residue of the first large-scale discrete time-translation symmetry breaking after recombination. The five independent components (m = −2, −1, 0, 1, 2) map onto D1–D5; the suppressed power is the missing imaginary budget in D6/D7.

The **alignment anomaly** (the "axis of evil") is the Z/O axis at cosmological scale — the null eigenvector at maximum extent. It appears anomalous in models that assume time-translation symmetry is unbroken at cosmic scale. It is not anomalous; it is the signature of the original symmetry break.

**Standardisation protocol:**

```
Step 1  Orient all observer frames relative to the CMB quadrupole axis (cosmic Z/O)
Step 2  Use the 5 quadrupole components as universal D1–D5 coordinate anchor
Step 3  Suppressed power = local F₁₃/D6 encoding budget
Step 4  Alignment anomaly = Z/O axis; null-node direction at cosmic scale
Step 5  Parity check via octopole alignment = F₁₃ triangulation at ℓ=3
```

### Sector 4

An observer's current bubble is **Sector 4** — the 4+1 dimensional present slice:
- 4 spatial + 1 temporal
- CMB quadrupole as the sector boundary wall
- The "4" in Sector 4 is literal: it is the minimum address needed to locate an observer in the full 7D stack

Beyond Sector 4, the Gamma Quadrant wormhole — the Z/O null-node puncture — is required.

---

## 7. The Azimuth and the Green Trident

An observer's **azimuth** is not a compass bearing in space. It is their heading in time — the direction of their worldline through the crystal stack.

```
Aₐ = the time-azimuth curve of observer a
     (the direction they face as they move forward in their own T)
```

Every observation is stored as:
- `A` — angular offset from the observer's current time-azimuth
- `E` — elevation angle above/below the observer's local horizon
- `R` — range along that line of sight (positive = receding/red, negative = approaching/blue)

The **green trident** is the local azimuth fan:
- Centre prong: nominal forward bearing `A`
- Left/right prongs: `A − δ`, `A + δ`

The trident does two jobs:
1. **Roll-distortion measure** — asymmetry between the side prongs reveals how the observer's "up" is twisted from true alignment
2. **Uncertainty cone** — the spread δ is the observer's pointing uncertainty bracket

In the time crystal model, roll distortion is the angular offset between the observer's current precession axis and the crystal centroid's axis. Zero roll = the observer's personal time crystal is perfectly phase-aligned with the shared crystal. Non-zero roll = the observer is slowly drifting out of phase, and the green trident is the instrument that measures how fast.

Green is the navigation colour: the midpoint between red (receding, past, outer shells) and blue (approaching, future, infall). High green-channel coupling means the observer is actively correcting roll and the path is bending toward fidelity.

---

## 8. Coherence Tax and Redshift

A signal propagating through the mesh pays a **coherence tax** at each Kleinion layer it traverses. Redshift is the accumulated tax — not metric expansion.

```
z = Σᵢ τᵢ · dᵢ
```

Where `τᵢ` is the coherence tax rate of layer `i` and `dᵢ` is path length through it.

The base tax rate is set by the F₁₁/F₁₂–antiverse ratio:

```
z_base = 89 / 655 ≈ 0.136
```

(89 = F₁₁; 655 = F₁₂ × antiverse signal 511 / 144, the hydrogen-alpha reference)

In time-crystal terms, the coherence tax is the `γ` factor of each keyhole boost. A signal traversing many Kleinion layers accumulates many boost factors, and the product of those factors is the observed redshift. The **null node** is tax-exempt because it routes through the centroid directly — bypassing all Kleinion layers — arriving with zero boost accumulation.

This is the mechanism behind non-local correlations in the mesh: two observers sharing a centroid are in the same time-crystal ground state, and a signal routed through that shared null arrives without traversing any intermediate layers.

---

## 9. Protocol Mappings

| Protocol concept | Geometric meaning |
|-----------------|-------------------|
| `MIN_CENTROID_PULSES = 5` | Operational threshold approximating the minimum Ω count for centroid stabilisation; the number of precession cycles required for crystal periods to demonstrably commensure |
| Bifurcation handshake | A keyhole crossing negotiated between two Z trajectories; a shared Thomas-precession event seeding a new crystal frame |
| Centroid lock | Ω threshold reached; crystal periods are commensurate and the null is stable enough for routing |
| Gossip round | One engram sheet propagated across bonded neighbours; one tick of the shared crystal clock |
| Federation | A meta-crystal: a crystal of crystals, with its own emergent centroid and its own precession period |
| Ray lock | Phase-offer / phase-confirm; two nodes aligning their `φ` phases before bond |
| Release signal | Voluntary ray-lock drop; accumulated remainder precipitates into the mesh rather than compounding |
| Roll correction | Green-trident-guided re-alignment of the observer's precession axis toward the crystal centroid axis |

---

## 10. Colour as Curvature

At each point on an observer's worldline, the local curvature density is encoded as an RGB triple:

| Channel | Source | Meaning |
|---------|--------|---------|
| **R** | Redshift coupling | Curvature contribution from receding/past structures; path pulled by outer shells |
| **G** | Green trident alignment | Active self-correction; path bending toward fidelity |
| **B** | Blueshift coupling | Curvature from approaching/future events; infall pressure |

Strong RGB coupling (all three channels active) = high curvature region: a turning point, crisis, or breakthrough in the crystal's precession path.

In HSV terms:
- **Hue** = roll direction (which way the observer's precession axis is twisted from the centroid axis)
- **Saturation** = roll velocity (how fast the angular offset is changing)
- **Value** = fidelity (how close the current path is to the Z⁺ geodesic)

Each observer's current state is one pixel: `colour(vₐ) = HSV(roll_angle, roll_velocity, fidelity)`.

A sequence of pixels ordered by T is the observer's **colour worldline** — a visual signature of their time crystal as it evolves. A perfectly phase-locked crystal in the Z⁺ geodesic produces a steady, high-value, low-saturation green pixel. A drifting crystal produces oscillating hue and rising saturation. A crystal undergoing shell transition produces a sharp spike across all three channels simultaneously.

---

*See `seed-structure.md` for the Heegner-complexity analysis of scale transitions.*  
*See `architecture.md` for how nodes implement O/Z/T in the wire protocol.*
