# Foundations

This document describes the geometric substrate that pulser-mesh is built on.
It is a reference, not a tutorial. Read `architecture.md` for how the protocol
implements these ideas.

---

## 1. The Observer Coordinate System

Every node in the mesh is modelled as an **observer** carrying three coordinates:

| Symbol | Name | What it measures |
|--------|------|-----------------|
| `O` | Shell depth | How many consensus layers deep the observer sits — their position in the hierarchy of bonded crystals |
| `Z` | Trajectory | The observer's full complex orbital vector through the lattice; the wavefunction of their path |
| `T` | Time | Planck-second count from the observer's local T₀; their personal time arrow |

`O` is a positive integer (the observer's shell index).
`Z` is a complex vector — its real component is the spatial trajectory, its imaginary component is the phase channel.
`T` is monotonically increasing and observer-relative.

These three coordinates uniquely locate any node in the mesh at any moment.

---

## 2. The Crystal and Its Centroid

Observers do not orbit an abstract axis. They orbit the **centroid of their local crystal** — the centre of mass of all active bonds they participate in.

The centroid is the **local null**: the point about which all shell depths, trajectories, and time arrows in that crystal are defined.

Properties of the centroid:
- It is emergent, not assigned. It forms when two or more nodes bond.
- Every successful bond event **precipitates** a new centroid — the neutron-engram of that bond seeds the new crystal's null point.
- Centroids are nested. Each crystal is embedded in a larger crystal whose centroid is its own null reference. The stack continues upward; there is no fixed cosmic root required for local mechanics to function.

This scale-invariance is the reason the same O/Z/T diagram works from a two-node bond up to a civilisational consensus field.

---

## 3. The Engram

The **engram** is the discrete record of one trajectory segment: a slice of Z between two lattice sites Z₀ (at T₀) and Zₙ (at Tₙ), connected by the observer's orbital history.

The engram diagram has three visual features:
- Two **orbital volumes** (diamond shapes) — the bound regions where the observer lives between keyhole crossings
- A **keyhole pinch** at the centre — the hourglass neck where the trajectory approaches the crystal centroid
- A **nanotube spiral** at the keyhole — the nested precession as the trajectory tightens toward null

Each engram slice is one graphene sheet. The full stack of sheets, indexed by T, is the BBP-addressable volume of the observer's history — any sheet accessible directly by its T index without traversing all previous sheets.

### Best and worst case

`Z` is a superposition of two extremes:

```
Z = α·Z⁺ + β·Z⁻,   |α|² + |β|² = 1
```

- **Z⁺** (geodesic path): minimum coherence tax at each keyhole, maximum negentropy carried forward
- **Z⁻** (Bresenham staircase): maximum-entropy pixelated diagonal, paying maximum coherence tax at every step

`Ω` — the cardinality operator — counts how many times the observer's Z trajectory has passed within resolution threshold of the crystal centroid and closed sufficiently to count. Each keyhole crossing collapses the superposition locally and increments Ω if the approach was close enough.

```
Ω = |{t : |Z(t) - Z_null| < ε, resolved}|
```

The goal of any node is to maximise projection onto Z⁺ at each keyhole — to act so that the next engram slice is as close as possible to the geodesic, given current constraints.

---

## 4. The Γ (Gamma) Quadrant and CMB Anchoring

The mesh operates in four quadrants defined by the real/imaginary decomposition of the E-field:

| Quadrant | Layer | Character |
|----------|-------|-----------|
| **Alpha** | Real, D1–D3 | Observable 3-space; classical, decoherent, fully colourable |
| **Beta** | Imaginary, D4–D5 | Transition mediator layer; semi-classical, phase-coherent |
| **Gamma** | Real, D6 | F₁₃ dual-lattice layer; accessible via null-node channel only |
| **Delta** | Imaginary, D7 | Pure null eigenvector; maximum entropy, Z/O axis |

**Gamma Quadrant is the navigation quadrant.** It is where roll-distortion is measured, where the green trident is held, where observers operate with active mask-swap access.

### The CMB quadrupole as universal anchor

The CMB quadrupole (ℓ=2) is the minimal non-trivial symmetry-breaking mode of the observable sphere. It predates all local observer frames and is shared by every node in the mesh. It is used as the universal coordinate anchor for the following reasons:

1. **Five independent components** (m = −2, −1, 0, 1, 2) map directly onto D1–D5 of the stack — the fully observable five-dimensional slice
2. **The alignment anomaly** (the "axis of evil") is the Z/O axis at cosmological scale — the null eigenvector at maximum extent. It is not anomalous; it is the cosmic null direction announcing itself from the T₋∞ boundary
3. **The suppressed power** in the quadrupole is the missing imaginary (E⁻) component — the budget sitting in D6/D7, inaccessible to standard measurement

**Standardisation protocol:**

```
Step 1  Orient all observer frames relative to the CMB quadrupole axis (cosmic Z/O)
Step 2  Use the 5 quadrupole components as universal D1–D5 coordinate anchor
Step 3  Suppressed power = local F₁₃/D6 encoding budget
Step 4  Alignment anomaly = Z/O axis; the null-node direction at cosmic scale
Step 5  Parity check via octopole alignment = F₁₃ triangulation at ℓ=3
```

### Sector 4

An observer's current bubble is **Sector 4** — the 4+1 dimensional present slice:
- 4 spatial + 1 temporal
- CMB quadrupole as the sector boundary wall
- The "4" in Sector 4 is literal: it is the first non-trivial sector address, the minimum address needed to locate an observer in the full 7D stack

Beyond Sector 4, the Gamma Quadrant wormhole — the Z/O null-node puncture — is required.

---

## 5. The Azimuth and the Green Trident

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

Green is the navigation colour: the midpoint between red (receding, past, outer shells) and blue (approaching, future, infall). High green-channel coupling means the observer is actively correcting roll and the path is bending toward fidelity.

---

## 6. Coherence Tax and Redshift

A signal propagating through the mesh pays a **coherence tax** at each Kleinion layer it traverses. Redshift is the accumulated tax — not metric expansion.

```
z = Σᵢ τᵢ · dᵢ
```

Where `τᵢ` is the coherence tax rate of layer `i` and `dᵢ` is path length through it.

The base tax rate is derived from the F₁₁/F₁₂-antiverse ratio:

```
z_base = 89 / 655 ≈ 0.136
```

(89 = F₁₁; 655 = F₁₂ × antiverse signal 511 / 144, the hydrogen-alpha reference)

The **null node** is tax-exempt. A signal routed through the null-node connection arrives with zero redshift because it interfaces directly with the base field rather than traversing a consensus layer. This is the mechanism behind non-local correlations in the mesh.

---

## 7. Protocol Mappings

| Protocol concept | Geometric meaning |
|-----------------|-------------------|
| `MIN_CENTROID_PULSES = 5` | Operational threshold approximating the minimum Ω count for centroid stabilisation (ζ₀); an engineering approximation, not a fundamental constant |
| Bifurcation handshake | A keyhole crossing event — two Z trajectories negotiating a shared crystal frame |
| Centroid lock | Ω threshold reached; the crystal centroid is stable enough for routing |
| Gossip round | One engram sheet propagated across bonded neighbours |
| Federation | A meta-crystal: a crystal of crystals, with its own emergent centroid |
| Ray lock | Phase-offer / phase-confirm; two nodes aligning their Z vectors before bond |
| Release signal | Voluntary ray-lock drop; surplus precipitates into the mesh |

---

## 8. Colour as Curvature

At each point on an observer's worldline, the local curvature density is encoded as an RGB triple:

| Channel | Source | Meaning |
|---------|--------|---------|
| **R** | Redshift coupling | Curvature contribution from receding/past structures; path pulled by outer shells |
| **G** | Green trident alignment | Active self-correction; path bending toward fidelity |
| **B** | Blueshift coupling | Curvature from approaching/future events; infall pressure |

Strong RGB coupling (all three channels active) = high curvature region: a turning point, crisis, or breakthrough.

In HSV terms:
- **Hue** = roll direction (which way the observer is twisted from true alignment)
- **Saturation** = roll velocity (how fast distortion is changing)
- **Value** = fidelity (how close the current path is to the Z⁺ geodesic)

Each observer's current state is one pixel: `colour(vₐ) = HSV(roll_angle, roll_velocity, fidelity)`.

---

*See `seed-structure.md` for the Heegner-complexity analysis of scale transitions.
See `architecture.md` for how nodes implement O/Z/T in the wire protocol.*
