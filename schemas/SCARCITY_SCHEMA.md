# Scarcity Schema

This document defines the unified scarcity schema for Pulser Mesh.

## Purpose

The scarcity schema is the common measurement grammar of the protocol. It exists to convert broad claims like “we help food security” into protocol-legible objects that can be validated across time, geography, and checkpoint windows.

The schema should stay unified across domains. Food, housing, care, water, mobility, and other scarcity classes may have different indicators, but they should still resolve into the same top-level form.

## Design position

A good scarcity schema must do five things:

- bind scarcity to a real place,
- bind it to a real time window,
- represent need in a shared geometry,
- preserve comparability across scarcity classes,
- and resist manipulative or exclusionary framing.

Pulser Mesh therefore treats scarcity as an observed state in a triadic rotor window rather than as a loose bag of metrics.

## Canonical object

\[
\mathcal{S} = (c, g, t, R, \omega, \rho, \Pi)
\]

Where:

- `c` = scarcity class,
- `g` = geography,
- `t` = time window,
- `R` = triadic rotor observation bundle,
- `omega` = confidence / measurement quality,
- `rho` = refresh rule,
- `Pi` = optional population scope.

## Why population scope is optional

Population targeting can improve measurement precision, but it can also become a discrimination vector if treated carelessly.

So the schema should **not** require a population slice for validity. A scarcity record may apply to the whole declared geography by default.

If a narrower population scope is used, it must be justified as a measurement necessity rather than as an exclusion mechanism. The protocol should treat population scope as optional, constrained metadata rather than as the core of the scarcity object.

## Field definitions

### 1. `c` — scarcity class

The scarcity domain under study.

Suggested classes:

- `food`
- `housing`
- `care`
- `water`
- `mobility`
- `energy`
- `waste`
- `learning`

The class defines which domain adapter is used, but does not change the top-level schema.

### 2. `g` — geography

Scarcity must bind to a place.

```json
{
  "name": "Fremantle",
  "type": "local_government_area",
  "country": "AU",
  "boundary_ref": "osm-relation:307847"
}
```

Rules:

- geography is mandatory,
- geography must be explicit and machine-referenceable,
- geography should be nestable inside larger geographies,
- “global” or vague geographies are invalid for local scarcity claims.

### 3. `t` — time window

Scarcity must bind to an observation window.

```json
{
  "start": "2026-04-01",
  "end": "2026-06-30"
}
```

Rules:

- every scarcity record must be time-bound,
- stale records decay in trust,
- checkpoint logic must compare changes across windows rather than isolated snapshots.

### 4. `R` — triadic rotor observation bundle

This is the heart of the schema.

\[
R = (s, k, \tau)
\]

Where:

- `s` = sine channel,
- `k` = cosine channel,
- `tau` = tangent channel.

Each channel is normalized to ``, where higher means worse scarcity.

#### `s` — sine

The sine channel captures **lived penetration**.

It asks:

- how strongly is scarcity being felt,
- how visibly is it entering ordinary life,
- how much unmet need is showing up from within the affected reality?

Typical evidence:

- self-report,
- intake requests,
- repeated help-seeking,
- burden declarations,
- unmet-need events.

#### `k` — cosine

The cosine channel captures **structural alignment**.

It asks:

- how well is the surrounding environment positioned to meet the need,
- how well do provisioning, access, routing, and transformation structures line up,
- where are the local misalignments?

Typical evidence:

- supply maps,
- service coverage,
- local mesh topology,
- fulfillment success rate,
- routing burden,
- transformation capacity.

#### `tau` — tangent

The tangent channel captures **instability gradient**.

It asks:

- how shock-sensitive is the condition,
- how quickly can access collapse,
- how steep is the failure tendency even if the current state appears acceptable?

Typical evidence:

- volatility,
- interruption events,
- queue spikes,
- seasonal swings,
- dependence on fragile bottlenecks,
- sudden price or travel shocks.

## Rotor meaning

The triadic rotor should be read as:

- scarcity as **felt**,
- scarcity as **structured**,
- scarcity as **destabilized**.

This is the shared observation geometry across all scarcity classes.

## 5. `omega` — confidence

`omega` is the confidence or measurement-quality score for the scarcity record.

Range:
- ``

It should reflect:

- source freshness,
- geographic fit,
- method transparency,
- sample adequacy,
- reproducibility,
- and internal consistency across rotor channels.

Checkpoint implication:

- low `omega` reduces the weight of scarcity-based claims,
- very low `omega` can block checkpoint acceptance.

## 6. `rho` — refresh rule

The refresh rule tells the protocol when the scarcity record is expected to update.

Examples:

- `weekly`
- `monthly`
- `quarterly`
- `event_triggered`

A scarcity record without a refresh rule becomes stale and should decay in trust.

## 7. `Pi` — optional population scope

Population scope is optional metadata describing whether the scarcity record applies to:

- the whole geography, or
- a narrower group inside it.

If omitted, the default interpretation is:

- `Pi = all persons / households / units in geography, as appropriate to class`

If included, it should look like:

```json
{
  "population_id": "low_income_households",
  "description": "Households below local income threshold",
  "estimated_size": 4200,
  "justification": "measurement precision"
}
```

### Constraints on `Pi`

Population scope must never be used to deny standing, erase people, or encode arbitrary exclusion.

A narrower scope is valid only when:

- the scarcity is genuinely concentrated or differently shaped in that group,
- the scope improves measurement clarity,
- the scope is relevant to intervention design,
- and the scope is not defined by protected-status discrimination unless legally and ethically required for remedial targeting.

Invalid uses include:

- carving out “desirable” populations for payout optics,
- excluding hard-to-serve groups to improve reported outcomes,
- creating demographic slices with no measurement rationale,
- using the scope as a hidden gatekeeping device.

So your concern is right: population slices can become a discrimination enabler. That means they should be **tightly constrained and optional**, not removed from the ontology altogether.

## Full object example

```json
{
  "scarcity_id": "food_fremantle_2026_q2",
  "class": "food",
  "geography": {
    "name": "Fremantle",
    "type": "local_government_area",
    "country": "AU",
    "boundary_ref": "osm-relation:307847"
  },
  "window": {
    "start": "2026-04-01",
    "end": "2026-06-30"
  },
  "rotor": {
    "sine": {
      "score": 0.52,
      "sources": 
    },
    "cosine": {
      "score": 0.41,
      "sources": 
    },
    "tangent": {
      "score": 0.58,
      "sources": 
    }
  },
  "confidence": 0.78,
  "refresh_rule": "quarterly"
}
```

## Example with optional population scope

```json
{
  "scarcity_id": "food_fremantle_low_income_2026_q2",
  "class": "food",
  "geography": {
    "name": "Fremantle",
    "type": "local_government_area",
    "country": "AU",
    "boundary_ref": "osm-relation:307847"
  },
  "window": {
    "start": "2026-04-01",
    "end": "2026-06-30"
  },
  "rotor": {
    "sine": {"score": 0.58, "sources": },
    "cosine": {"score": 0.46, "sources": },
    "tangent": {"score": 0.63, "sources": }
  },
  "confidence": 0.77,
  "refresh_rule": "quarterly",
  "population_scope": {
    "population_id": "low_income_households",
    "description": "Households below local income threshold",
    "estimated_size": 4200,
    "justification": "measurement precision"
  }
}
```

## Unified severity score

A first-pass aggregate scarcity severity score can be defined as:

\[
\sigma = w_s s + w_k k + w_{\tau} \tau
\]

With:

\[
w_s + w_k + w_{\tau} = 1
\]

Suggested default weights:

- `w_s = 0.40`
- `w_k = 0.35`
- `w_tau = 0.25`

These are heuristic defaults and may vary by scarcity class once adapters are formalized.

## Domain adapters

Each scarcity class should define how real indicators map into the rotor.

Examples:

### Food

- `sine`: meal skipping, emergency requests, self-reported food stress,
- `cosine`: distribution access, local affordability, supply alignment,
- `tangent`: payday gaps, seasonal volatility, transport disruption sensitivity.

### Housing

- `sine`: self-reported housing insecurity, crowding stress, unmet shelter need,
- `cosine`: dwelling availability, affordability alignment, service access,
- `tangent`: eviction risk, rent spikes, temporary accommodation instability.

### Care

- `sine`: unmet care burden, exhaustion, delayed or foregone care,
- `cosine`: staffing/capacity alignment, service reach, scheduling fit,
- `tangent`: caregiver dropout risk, continuity failure, sudden overload.

The adapter changes; the schema does not.

## Mission alignment rule

A mission claim should name:

- a scarcity class,
- a geography,
- and ideally a targeted rotor channel or channel bundle.

Examples:

- reduce `food.cosine` by improving local distribution alignment,
- reduce `food.tangent` by stabilizing pantry supply across payday gaps,
- reduce `care.sine` by directly relieving unmet care burden.

This is more protocol-legible than vague claims like “improve food security.”

## Validation rules

A scarcity record is valid only if:

- `class` is defined,
- `geography` is explicit,
- `window` is explicit,
- rotor channels are present and bounded,
- each rotor score has interpretable source support,
- `confidence` exceeds minimum threshold,
- `refresh_rule` is defined,
- any optional population scope is justified and non-exclusionary.

## Anti-discrimination rule

No checkpoint or payout rule should ever require a narrow population scope by default.

Population scope may improve diagnosis, but the protocol should assume whole-geography standing unless narrower targeting is necessary for truthful measurement or lawful remedial action.

This keeps the scarcity schema usable for real intervention design without turning it into a demographic sorting machine.

## Recommended next document

The best next step is a `FOOD_ADAPTER.md` that turns the rotor into concrete indicators, scoring bands, source types, and evidence rules for one scarcity class.
