# Consent Check and Dividend Currency

This document defines two closely related concepts for Pulser Mesh:

1. the consent check,
2. the dividend currency as the loose settlement expression of validated surplus.

The purpose of combining them is simple: consent governs what may enter the mesh, and dividend currency governs what may leave the checkpoint as a valid pulse.

## Why this matters now

At this stage, Pulser Mesh has a unified scarcity schema and a unified validation/checkpoint spec. The missing bridge is a formal account of how an interaction becomes admissible before it is allowed to contribute to checkpoint accounting.

That bridge is consent.

If consent is underspecified, the mesh becomes vulnerable to extraction-by-representation: actors can claim relationships, obligations, or service value on behalf of others without a protocol-legible mutual act.

## Design position

In Pulser Mesh, consent is not only a legal checkbox or UI confirmation. It is a structural condition of admissible relational motion.

Your proposed frame is strong:

- each observer has a triadic rotor,
- from its current self-coordinate it may step along sine, cosine, or tangent,
- consent exists when the relevant observers take the tangent path simultaneously.

This can be treated as the Observer Prime physics layer of consent.

## Observer Prime interpretation

Each observer is modeled as a stateful rotor with available local directions:

\[
R_i = (s_i, k_i, \tau_i)
\]

At each decision step, observer `i` may move by selecting one of the available local vectors from its current self-coordinate.

Interpretation:

- sine path = inward or expressive orientation,
- cosine path = structural or positional orientation,
- tangent path = committing, crossing, or binding orientation.

Under this interpretation, consent is not mere declaration. It is a synchronized binding move.

## Consent axiom

A protocol-counted bilateral relation exists only if both relevant observers take the tangent path at the same decision boundary.

Formally, for observers `a` and `b`:

\[
\mathrm{Consent}(a,b,t) = 1 \iff \tau_a(t) \land \tau_b(t)
\]

In words:

- consent exists at step `t` if both parties choose the tangent branch at the same interaction boundary.

This should be understood as a formal protocol axiom, not as a complete theory of human consent in every legal or moral context.

## Why tangent

The tangent branch is the right choice for consent because it represents threshold crossing and committed relation.

Sine and cosine may describe felt state or structural position, but tangent is the branch that leaves the current self-coordinate in a way that binds one observer to another observer, edge, or obligation.

That means a protocol edge should not be counted merely because:

- one side felt need,
- or one side was structurally positioned,
- but because both sides crossed into a binding relation at the same step.

## First-pass consent rule

A counted edge is admissible only if there is a valid consent event.

A consent event must minimally include:

- both endpoint identities,
- edge type,
- checkpoint window or timestamp,
- proof that both endpoints accepted the relation,
- proof that acceptance refers to the same edge object or edge-intent object.

Prototype representation:

```json
{
  "consent_id": "consent_001",
  "edge_intent_id": "intent_001",
  "parties": ,
  "edge_type": "favor",
  "timestamp": "2026-06-04T10:00:00Z",
  "observer_prime": {
    "node_001": {"branch": "tangent"},
    "node_002": {"branch": "tangent"}
  },
  "status": "mutual"
}
```

## Types of consent check

### 1. Bilateral consent

For favors, trade, care, and direct exchange edges.

Rule:
- both endpoints must choose tangent on the same edge-intent boundary.

### 2. Multi-party consent

For pooled actions, cooperatives, commons governance, or group transformations.

Rule:
- every required party must register tangent-path entry for the same action envelope,
- quorum-only rules should be explicit and narrowly defined.

### 3. Delegated consent

For cases where an authorized representative acts for another participant.

Rule:
- tangent synchronization may occur through a recognized delegation chain,
- the delegation object must itself be valid.

This should be rare and tightly constrained in v1.

## Consent failure conditions

An edge fails consent if:

- only one side chooses tangent,
- parties refer to different edge-intent objects,
- one acceptance falls outside the valid temporal boundary,
- identity is unresolved,
- delegation is invalid,
- consent is later revoked before checkpoint closure where revocation is permitted.

Failure codes:

- `ERR_CONSENT_MISSING`
- `ERR_CONSENT_ASYMMETRIC`
- `ERR_CONSENT_INTENT_MISMATCH`
- `ERR_CONSENT_WINDOW_MISMATCH`
- `ERR_CONSENT_DELEGATION_INVALID`
- `ERR_CONSENT_REVOKED`

## Operational interpretation

The Observer Prime form should be preserved as the normative layer, but checkpoint software will likely implement it through simpler operational evidence such as:

- both parties signing the same edge-intent,
- both parties acknowledging the same obligation hash,
- both parties confirming the same event record,
- or both parties appearing in a jointly validated action envelope.

So the protocol can keep the tangent-synchrony concept while still using normal machine-verifiable artifacts.

## Consent and scarcity

Consent does not prove scarcity reduction.

It proves only that a relation is admissible for counting. Scarcity alignment still has to be checked separately.

This distinction matters because an activity can be fully consensual and still fail to reduce any real scarcity.

## Consent and anti-extraction

The consent check is one of the strongest anti-extractive filters in the protocol.

It prevents:

- unilateral value claims,
- fabricated obligations,
- downstream representation without assent,
- fake service edges,
- and one-sided capture of another actor's activity.

## Dividend currency

The dividend currency should be specified loosely for now.

The protocol does not yet need a final monetary design. It needs a conceptual settlement object that represents validated dividend-bearing output from a checkpoint.

## Design position on currency

The dividend unit should not be treated as a speculative asset first.

Its primary role is to express a validated downstream pulse of common surplus.

So the dividend currency should be defined as:

- checkpoint-emitted,
- derivative of validated surplus,
- downstream in orientation,
- non-apex by design,
- and subordinate to scarcity-reduction legitimacy.

## Minimal concept

Call the loose unit a **dividend pulse unit** for now.

Working properties:

- emitted only after checkpoint acceptance,
- backed by validated common surplus accounting,
- distributed primarily as flat participant dividend,
- optionally partially routed to reserve and reinvestment pools,
- not minted from mere activity volume.

## Loose currency object

```json
{
  "emission_id": "emit_cp_2026_q2_fremantle_001",
  "checkpoint_id": "cp_2026_q2_fremantle_001",
  "validated_surplus": 1280,
  "dividend_pool": 768,
  "unit_name": "pulse",
  "distribution_rule": "flat_eligible_participant_dividend"
}
```

## Currency design constraints

A future dividend currency should satisfy:

- **non-preemptive**: no mint before checkpoint validation,
- **non-apex**: emission cannot be dominated by capital-weighted insiders,
- **non-fabricable**: issuance depends on validated surplus,
- **auditable**: emissions link to checkpoint reason codes and state root,
- **subordinate**: currency follows validated scarcity-reducing activity rather than leading it.

## Open monetary questions

Still intentionally unresolved:

- Is the dividend unit transferable or only claimable?
- Is it redeemable against reserve assets, services, or future obligations?
- Is it one token, one accounting unit, or multiple settlement layers?
- How is decay, hoarding resistance, or circulation pressure handled?
- What part remains off-chain?

## Recommended v1 stance

For v1, define the dividend currency only as a **checkpoint settlement unit**.

Do not yet commit to:

- market trading behavior,
- exchange-rate logic,
- staking logic,
- or broader monetary policy.

That keeps the protocol focused on legitimacy of emission before liquidity design.

## Suggested integration points

This document should connect to the rest of the repo as follows:

- `SCARCITY_SCHEMA.md` defines what real scarcity is being observed,
- `VALIDATION_AND_CHECKPOINT.md` defines how checkpoint admission and payout occur,
- `CONSENT_AND_DIVIDEND.md` defines what makes an edge admissible and what kind of unit may be emitted afterward.

## Next likely split

This document can later separate into:

- `CONSENT_CHECK.md`
- `DIVIDEND_CURRENCY.md`

But for now they sit well together because both concern the admissibility boundary between local action and protocol settlement.
