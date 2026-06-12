# Pulser Mesh — Architectural Principles

This document defines the non-negotiable design principles for all Pulser Mesh
implementations. All contributors, node operators, and protocol extensions must
conform to these principles. Where a feature conflicts with a principle, the
principle wins.

---

## 1. Privacy-First — No Sensitive Data on the Wire

**Principle:** No private or sensitive information is ever published to the mesh,
stored in a node database, or included in a pulse payload. The protocol encodes
*economic geometry*, not personal data.

### What this means in practice

- **Steward identity is positional, not biographical.** An OaZaTa coordinate
  triple `(Oa, Za, Ta)` is the only persistent identifier. No names, emails,
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
| **Identity** | OaZaTa position contains no PII by design | Cracking the hash reveals a geometric coordinate, not a person |
| **Keys** | Steward keys rotate at each checkpoint via checkpoint hash | A cracked old key is only valid for that checkpoint window |
| **Pulses** | Pulse payloads carry no PII (see Principle 1) | Nothing sensitive to recover even if decrypted |
| **Holographic boundary** | Only boundary-observable values are published | Interior steward state is never transmitted in full |
| **Asymptotic auth (v2)** | Identity hardens over time via attractor convergence | Early sparse history has wide uncertainty; forging a mature identity requires replicating the full developmental trajectory |
| **Geodesic re-keying** | Compromised identity can be voluntarily abandoned at any time | Minimal cost to re-authenticate from a new trajectory; see Principle 3 |

### What is intentionally public

The following are designed to be observable by any mesh participant and
are not considered sensitive:

- Checkpoint hashes and indices
- Pulse `scarcity_domain` and `value_add` (aggregate economic signal)
- Steward `trust_resource` balance (economic participation signal)
- Node OaZaTa reference position

### What must never be public

- Raw API key values (node or steward)
- Steward registration metadata (time of first registration, IP address)
- Free-text pulse descriptions in aggregate queryable form (descriptions
  are per-steward readable only, not mesh-wide queryable)
- Any mapping between OaZaTa coordinates and real-world identity

---

## 3. OaZaTa Coordinates Are Topologically Unique, Approximate, and Voluntarily Mutable

**Principle:** No two stewards or nodes can occupy the same OaZaTa coordinate.
This is a topological guarantee, not an administrative one — the geometry of
the space makes simultaneous occupation impossible. Coordinates are however
always approximate, continuously evolving, and can be voluntarily changed at
minimal cost.

### Uniqueness

OaZaTa coordinates are unique by construction. The spiral geometry of the space
does not permit two distinct entities to occupy the same position simultaneously
— any apparent collision is a measurement approximation, not a true overlap.
This is the foundation of the protocol's Sybil resistance: you cannot create a
duplicate identity because the space does not have room for duplicates.

### Approximation and trajectory

A steward's coordinate is never known exactly — it is always an approximation
of a continuously evolving position. Over time, the pulse history traces a
*geodesic* through OaZaTa space: a trajectory that is:

- **Unpredictable in advance** — future position cannot be determined without
  living the pulse history that produces it
- **Verifiable asymptotically** — the trajectory converges to a consistent
  attractor within a shrinking uncertainty band as history accumulates
- **Consistent** — the attractor is stable; random noise does not shift it,
  only sustained behavioural change does

This is the asymptotic authentication model: identity is not a static credential
but a convergent trajectory. The longer the history, the narrower the
uncertainty band, and the harder the identity is to forge.

### Voluntary re-keying (geodesic reset)

If a steward's coordinate is compromised — whether through a successful
impersonation attack, a suspected breach, or simply at the steward's own
discretion — the steward may voluntarily abandon their current trajectory and
begin a new geodesic from a fresh coordinate.

Properties of geodesic re-keying:

- **Minimal cost.** Re-keying does not require proving the old identity or
  obtaining permission from the node. The old trajectory is simply abandoned.
- **Voluntary at any time.** No threshold of compromise needs to be proven.
  A steward may re-key preemptively.
- **Trust is not transferable.** The accumulated `trust_resource` on the old
  trajectory does not automatically migrate to the new one. Trust must be
  re-earned on the new geodesic. This is the cost of re-keying and also its
  security property: a stolen identity is worth less over time as the
  legitimate steward re-establishes their trajectory.
- **The old trajectory becomes orphaned.** Pulses submitted on the old key
  remain in the historical record but the key ceases to be valid for new
  submissions after re-keying.

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

**Principle:** The OaZaTa coordinate system encodes a steward's *economic
behaviour pattern* — the interference signature of their pulse history. It
does not encode ideology, affiliation, demographics, or any categorical
label about the steward as a person.

This means:
- Two stewards at near-identical OaZaTa positions are economically equivalent
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

This is the primary long-term mitigation against SNCL attacks on the
cryptographic layer specifically.

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
Scrape target          Sensitive?   Mitigation
─────────────────────────────────────────────────────────────────────
Checkpoint hashes      No           Designed to be public
Pulse domains/values   No           Aggregate economic signal only
Steward trust balance  No           Public participation metric
Steward OaZaTa coords  Low          Topologically unique; no PII mapping
pm_ API keys           Yes          Rotate per checkpoint; hash only
Pulse descriptions     Medium       Per-steward read only; not queryable
Registration metadata  Yes          Never leaves node (Principle 1)
Real-world identity    N/A          Never collected
Local admin data       Operator     Node operator responsibility only
```
