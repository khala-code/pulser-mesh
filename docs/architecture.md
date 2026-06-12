# Pulser Mesh — Architectural Principles

This document defines the non-negotiable design principles for all Pulser Mesh
implementations. All contributors, node operators, and protocol extensions must
conform to these principles. Where a feature conflicts with a principle, the
principle wins.

> **Notation.** The coordinate triple is written **ΩaZaTa** and spoken *Ohma-Za-Ta*.
> Each axis carries an `a` (alpha) suffix denoting its imaginary/positional component.
> Ωa = orbital amplitude (Ω magnitude + alpha phase offset); Za = phase angle;
> Ta = arc length along geodesic. See `docs/asymptotic-auth.md` for the full
> wavefunction model and `docs/seed-structure.md` for the hidden topological substrate.

---

## 1. Privacy-First — No Sensitive Data on the Wire

**Principle:** No private or sensitive information is ever published to the mesh,
stored in a node database, or included in a pulse payload. The protocol encodes
*economic geometry*, not personal data.

### What this means in practice

- **Steward identity is positional, not biographical.** An ΩaZaTa coordinate
  triple `(Ωa, Za, Ta)` is the only persistent identifier. No names, emails,
  government IDs, physical addresses, or biometrics are stored or transmitted
  across the wire.
- **Pulse payloads contain only economic geometry.** `scarcity_domain`,
  `value_add`, and a free-text `description` are the only fields. The
  description must describe the *action* (e.g. "mapped runoff diversion from
  shed roof"), never the actor.
- **API keys are geometric hashes.** The `pm_` steward key is derived from
  rotor phase — it encodes position, not identity. It cannot be reverse-engineered
  to reveal who the steward is.
- **Node logs must not record request bodies** in any form that leaves the node.
  Access logs may record timestamps and response codes for local administration.

### Local node administration

Nodes may store private data locally for operational and administrative purposes
— operator contact details, internal labels, audit logs, infrastructure
configuration. This is explicitly permitted. The node operator is solely
responsible for the security of locally stored data. The obligation is:

> **Keep it off the wire. Keep it secure. The mesh cannot protect what it
> never sees.**

No protocol mechanism enforces local data security; that is the operator's domain.

### Rationale

The mesh is designed for long-term operation across adversarial network
environments. Data published today may be harvested and retained indefinitely.
The only safe guarantee is that sensitive data is never published in the first place.

---

## 2. Scrape-Now-Crack-Later Threat Mitigation

**Principle:** The protocol is designed so that a complete historical scrape of
all mesh traffic yields no exploitable sensitive information, even if future
cryptographic advances (quantum or otherwise) break today's hash functions.

### Threat model

A scrape-now-crack-later (SNCL) attack works as follows:

1. An adversary captures and archives all mesh traffic today.
2. At a future date, improved cryptographic tools allow them to reverse
   hashes or break key derivation schemes that are currently secure.
3. The adversary retroactively deanonymises or impersonates historical
   participants.

### Mitigations

| Layer | Mitigation | Rationale |
|---|---|---|
| **Identity** | ΩaZaTa position contains no PII by design | Cracking the hash reveals a geometric coordinate, not a person |
| **Keys** | Steward keys rotate at each checkpoint via checkpoint hash | A cracked old key is only valid for that checkpoint window |
| **Pulses** | Pulse payloads carry no PII (see Principle 1) | Nothing sensitive to recover even if decrypted |
| **Holographic boundary** | Only boundary-observable values are published | Interior steward state is never transmitted in full |
| **Hidden witness** | The steward's seed is not a stored secret — it is a topological structure outside the steward's own spacetime (see `docs/seed-structure.md` §9) | There is no finite object to scrape that constitutes the key |
| **Asymptotic auth** | Identity hardens over time via attractor convergence | Early sparse history has wide uncertainty; forging a mature identity requires replicating the full developmental trajectory |
| **Recovery taxonomy** | Compromised identity may be reclaimed by trajectory witness or voluntarily abandoned | Preferred recovery evicts attacker without surrendering accumulated trust |

### Anti-extraction property

The deepest mitigation against SNCL is structural, not cryptographic. A
conventional key is a finite object that can be harvested and later cracked.
The steward's hidden witness is a keyhole geodesic threading a recursive snark
hierarchy — a topological structure that cannot be fully named, held, or copied.

> **There is no finite object to scrape that constitutes the key.**

This is formally defined as the **anti-extraction property** in
`docs/seed-structure.md` §9. It is the reason the protocol can remain
SNCL-resistant even if every cryptographic primitive currently in use is
eventually broken: the object an adversary would need to crack does not exist
in extractable form.

Cryptographic primitives (see Principle 7) remain important for session
security and key rotation. The anti-extraction property is the long-horizon
guarantee that operates beneath them.

### What is intentionally public

The following are designed to be observable by any mesh participant and
are not considered sensitive:

- Checkpoint hashes and indices
- Pulse `scarcity_domain` and `value_add` (aggregate economic signal)
- Steward `trust_resource` balance (economic participation signal)
- Node ΩaZaTa reference position

### What must never be public

- Raw API key values (node or steward)
- Steward registration metadata (time of first registration, IP address)
- Free-text pulse descriptions in aggregate queryable form (descriptions
  are per-steward readable only, not mesh-wide queryable)
- Any mapping between ΩaZaTa coordinates and real-world identity

---

## 3. ΩaZaTa Coordinates Are Topologically Unique, Approximate, and Voluntarily Mutable

**Principle:** No two stewards or nodes can occupy the same ΩaZaTa coordinate.
This is a topological guarantee, not an administrative one — the geometry of
the space makes simultaneous occupation impossible. Coordinates are however
always approximate, continuously evolving, and can be voluntarily changed at
minimal cost.

### Uniqueness

ΩaZaTa coordinates are unique by construction. The spiral geometry of the space
does not permit two distinct entities to occupy the same position simultaneously
— any apparent collision is a measurement approximation, not a true overlap.
This is the foundation of the protocol's Sybil resistance: you cannot create a
duplicate identity because the space does not have room for duplicates.

### Approximation and trajectory

A steward's coordinate is never known exactly — it is always an approximation
of a continuously evolving position. Over time, the pulse history traces a
*geodesic* through ΩaZaTa space: a trajectory that is:

- **Unpredictable in advance** — future position cannot be determined without
  living the pulse history that produces it
- **Verifiable asymptotically** — the trajectory converges to a consistent
  attractor within a shrinking uncertainty band as history accumulates
- **Consistent** — the attractor is stable; random noise does not shift it,
  only sustained behavioural change does

This is the asymptotic authentication model: identity is not a static credential
but a convergent trajectory. The longer the history, the narrower the
uncertainty band, and the harder the identity is to forge.

### Voluntary recovery and re-authentication

If a steward's coordinate is compromised — whether through a successful
impersonation attack, a suspected breach, or simply at the steward's own
discretion — the steward may voluntarily tighten the uncertainty band on their
existing trajectory or begin a new geodesic from a fresh coordinate.

Properties of recovery:

- **Trajectory witness is preferred when possible.** If the steward can prove
  consistency with the historical trajectory, the authentic identity is reclaimed
  and the attacker is evicted.
- **Geodesic abandonment remains available.** If the prior trajectory cannot be
  reclaimed, the steward may always abandon it and begin again elsewhere.
- **Voluntary at any time.** No threshold of compromise needs to be proven.
  A steward may recover or re-key preemptively.
- **Minimal coordination cost.** Recovery does not require node permission or
  central approval. The mesh responds to geometry, not administrative ceremony.

### Impersonation resistance

A successful impersonation attack — where an adversary convincingly mimics a
steward's trajectory — becomes progressively harder as the authentic pulse
history deepens. Early in a steward's lifecycle the uncertainty band is wide
and impersonation is cheaper; at maturity the attractor is so well-defined that
sustaining the impersonation requires accurately predicting and replicating the
steward's future behaviour, which is equivalent to *being* that steward.

The protocol does not guarantee impersonation is impossible; it guarantees
that the cost of sustained impersonation grows without bound.

---

## 4. Geometry Encodes Behaviour, Not Belief

**Principle:** The ΩaZaTa coordinate system encodes a steward's *economic
behaviour pattern* — the interference signature of their pulse history. It
does not encode ideology, affiliation, demographics, or any categorical
label about the steward as a person.

This means:
- Two stewards at near-identical ΩaZaTa positions are economically equivalent
  to the mesh regardless of who they are.
- Proximity and constructive interference are purely geometric — they
  describe alignment of economic contribution patterns, not social or
  political alignment.
- The destructive interference rejection at validation is a signal that
  the pulse's geometric contribution does not add coherently to the local
  mesh field — it is not a judgment about the steward.

---

## 5. The Node Admin Key is Not a Master Key

**Principle:** The node admin key (`API_KEY_SECRET`) grants operational
privileges on a single node. It cannot impersonate a steward, forge a pulse
on behalf of a steward, or override the geometric trust pipeline.

- Admin key operations: register stewards, validate pulses, read node state.
- Admin key cannot: submit pulses as a steward, modify trust balances directly,
  or bypass the T_proximity / T_decay / T_scarcity pipeline.
- Any future federation protocol between nodes must not allow one node's
  admin key to gain admin privileges on another node.

---

## 6. Trust Pipeline Integrity

**Principle:** The full trust pipeline —
`T_proximity · T_decay · T_scarcity · value_add` — must execute in full
for every pulse at validation. No shortcut paths, admin overrides, or
bulk-validation endpoints that skip pipeline stages are permitted.

This ensures:
- Geometric authenticity: proximity is always checked
- Temporal honesty: decay always penalises stale pulses
- Scarcity weighting: domain context always applies
- The pipeline is the consensus mechanism; bypassing it breaks consensus

---

## 7. Cryptographic Agility

**Principle:** No cryptographic primitive is hardcoded. Hash functions,
key derivation schemes, and signature algorithms are configurable and
upgradeable without protocol-breaking changes.

Current defaults:
- Key derivation: SHA-256 of rotor phase + checkpoint hash
- Checkpoint hash: SHA-256 of prior checkpoint + timestamp

All hash function references must go through `app/services/crypto.py`
(to be created) so they can be swapped to SHA-3, BLAKE3, or
post-quantum alternatives as standards evolve.

Cryptographic agility is the session-layer mitigation against SNCL attacks.
The anti-extraction property (Principle 2) is the structural mitigation that
operates beneath it — the two are complementary, not competing.

---

## 8. Consent Boundaries Are Enforced by Geometry

**Principle:** The tan(Za) pole — where Za approaches π/2 — is the
consent boundary. Stewards near this boundary produce near-zero or
negative trust coupling with the reference node. This is not a
permissions system; it is the natural behaviour of the interference
geometry.

No administrative override can force constructive interference between
stewards whose Za positions are geometrically orthogonal or anti-aligned.
This is the protocol's anti-coercion property.

---

## Appendix: SNCL Attack Surface Summary

```
Scrape target             Sensitive?   Mitigation
──────────────────────────────────────────────────────────────────────────────
Checkpoint hashes         No           Designed to be public
Pulse domains/values      No           Aggregate economic signal only
Steward trust balance     No           Public participation metric
Steward ΩaZaTa coords     Low          Topologically unique; no PII mapping
pm_ API keys              Yes          Rotate per checkpoint; hash only
Pulse descriptions        Medium       Per-steward read only; not queryable
Registration metadata     Yes          Never leaves node (Principle 1)
Real-world identity       N/A          Never collected
Steward hidden witness    N/A          Not a finite object; anti-extraction
                                       property (seed-structure.md §9)
Local admin data          Operator     Node operator responsibility only
```
