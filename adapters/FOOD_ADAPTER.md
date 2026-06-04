# Food Adapter

This document defines the first domain adapter for Pulser Mesh by mapping food scarcity into the unified scarcity schema.

## Purpose

The food adapter translates real food-scarcity indicators into the protocol's triadic rotor:

\[
R = (s, k, \tau)
\]

Where:

- `s` = sine, lived penetration,
- `k` = cosine, structural alignment,
- `tau` = tangent, instability gradient.

The adapter exists so food-related missions can be validated against a consistent, protocol-legible frame rather than vague “food security” language.

## Core interpretation

Food scarcity is not just “not enough food exists.” It is a condition in which people in a geography cannot reliably obtain and use adequate food through stable, reachable, and non-fragile provisioning paths.

The adapter therefore measures food scarcity as:

- how strongly the lack is entering lived experience,
- how badly provisioning structures are misaligned with need,
- and how unstable food access is under ordinary shocks.

## Adapter scope

This adapter is designed for:

- neighborhoods,
- municipalities,
- local government areas,
- districts,
- or similar place-bound geographies.

It is not intended as a national macro-food-security model in v1.

## Canonical object shape

A food scarcity record uses the general scarcity schema and adds food-specific evidence mappings.

```json
{
  "scarcity_id": "food_fremantle_2026_q2",
  "class": "food",
  "geography": {},
  "window": {},
  "rotor": {
    "sine": {},
    "cosine": {},
    "tangent": {}
  },
  "confidence": 0.0,
  "refresh_rule": "quarterly"
}
```

## Food rotor mapping

## 1. Sine — lived food penetration

The sine channel measures how strongly food scarcity is entering daily life.

This is the closest thing to the directly felt burden of food lack.

### Typical sine indicators

- self-reported meal skipping,
- self-reported anxiety about running out of food,
- emergency food requests,
- repeated aid intake,
- child meal disruption,
- reduced dietary quality due to affordability,
- socially visible coping behavior such as rationing.

### Interpretation

High sine means food scarcity is not merely structural or theoretical. It is being actively experienced.

### Example evidence sources

- intake forms,
- surveys,
- pantry request logs,
- community-service records,
- school meal stress signals,
- repeated food-request edges in the mesh.

### Example scoring bands

| Sine score | Interpretation |
|---|---|
| 0.00–0.20 | Minimal lived food stress |
| 0.21–0.40 | Mild but visible food strain |
| 0.41–0.60 | Significant lived food scarcity |
| 0.61–0.80 | Severe repeated food burden |
| 0.81–1.00 | Acute food deprivation / emergency pattern |

## 2. Cosine — structural food alignment

The cosine channel measures how well the local provisioning environment is aligned with satisfying food need.

This includes not only existence of food, but the actual arrangement of access pathways.

### Typical cosine indicators

- local food outlet coverage,
- affordability relative to local household conditions,
- pantry/community kitchen reach,
- route and transport burden,
- transformation capacity from raw to edible food,
- last-mile distribution fit,
- fulfillment success rate in local food-support flows.

### Interpretation

High cosine means the surrounding structure is poorly aligned with food access, even if some food is physically present somewhere in the region.

### Example evidence sources

- price basket datasets,
- food outlet maps,
- pantry and kitchen service maps,
- routing/travel time data,
- distribution graph topology,
- fulfillment/failure records,
- inventory-to-demand mismatch patterns.

### Example scoring bands

| Cosine score | Interpretation |
|---|---|
| 0.00–0.20 | Strong structural alignment |
| 0.21–0.40 | Moderate access friction |
| 0.41–0.60 | Significant provisioning mismatch |
| 0.61–0.80 | Severe structural misalignment |
| 0.81–1.00 | Near-breakdown in food access structure |

## 3. Tangent — food instability gradient

The tangent channel measures how fragile or shock-sensitive food access is.

This captures how quickly apparently acceptable access can fail.

### Typical tangent indicators

- food price volatility,
- queue surges,
- pantry stockout frequency,
- disruption sensitivity to transport loss,
- seasonal food instability,
- payday-gap dependence,
- concentration of supply through fragile bottlenecks.

### Interpretation

High tangent means food access may be temporarily functioning but is dangerously unstable.

### Example evidence sources

- weekly price variance,
- stockout logs,
- service interruption records,
- queue-growth time series,
- transport disruption data,
- weather or seasonal dependence,
- supplier concentration measures.

### Example scoring bands

| Tangent score | Interpretation |
|---|---|
| 0.00–0.20 | Stable food access |
| 0.21–0.40 | Mild instability |
| 0.41–0.60 | Noticeable fragility |
| 0.61–0.80 | Severe instability risk |
| 0.81–1.00 | Acute collapse tendency |

## Food severity score

A first-pass food scarcity severity score can be defined as:

\[
\sigma_f = w_s s + w_k k + w_{\tau} \tau
\]

With suggested defaults:

- `w_s = 0.40`
- `w_k = 0.35`
- `w_tau = 0.25`

These weights slightly privilege lived burden while preserving structure and fragility.

## Recommended source mix

A food record should ideally draw from at least two of the following source families:

- lived-report sources,
- service/intake sources,
- local mesh edge data,
- environmental or map-based sources,
- market/price sources,
- operational service stability data.

A stronger record uses all of them when available.

## Anti-vanity rule

The adapter should reject naive food metrics that are easy to celebrate but weakly tied to real scarcity reduction.

### Bad standalone metrics

- meals distributed,
- kilograms moved,
- number of pantry visits,
- number of volunteers,
- total revenue through food operations.

These may describe activity, but not whether food scarcity actually fell.

### Better measurement logic

A food intervention is stronger when it can show one or more of the following:

- lower lived food stress,
- better access alignment,
- lower shock sensitivity,
- improved continuity across payday gaps,
- reduced unmet request frequency,
- reduced reliance on emergency-only pathways.

## Mission targeting

Food-related node missions should target one or more food rotor channels explicitly.

Good examples:

- reduce `food.sine` by relieving repeated meal-skipping pressure,
- reduce `food.cosine` by improving last-mile pantry distribution,
- reduce `food.tangent` by stabilizing access through weekly stock buffering,
- reduce `food.cosine` and `food.tangent` by adding local transformation capacity.

Weak example:

- “support food security.”

That phrase is too broad for validation.

## Food action-to-rotor mapping

The following table gives first-pass mappings from intervention type to likely rotor channel effect.

| Intervention type | Primary rotor target | Secondary rotor target | Notes |
|---|---|---|---|
| Emergency food parcels | Sine | Tangent | Relieves immediate lived burden; may not fix structure |
| Pantry route redesign | Cosine | Tangent | Improves access geometry and may stabilize continuity |
| Community kitchen expansion | Cosine | Sine | Adds transformation capacity and can reduce lived burden |
| Price buffering / subsidy | Sine | Tangent | Lowers immediate affordability stress and shock exposure |
| Local storage / buffer stock | Tangent | Cosine | Mainly stabilizes volatility and stockout risk |
| Nutrition education alone | Weak direct effect | Weak direct effect | Insufficient unless paired with real access change |

## Validation rules specific to food

A food scarcity claim is stronger when:

- the geography is local and explicit,
- the time window is short enough to detect change,
- the rotor channels each have interpretable evidence,
- price and access are both represented,
- instability is treated as a first-class dimension,
- and claimed interventions map plausibly to the targeted rotor channel.

A food scarcity claim should be rejected or heavily downweighted when:

- it relies only on volume moved,
- it ignores affordability,
- it ignores geography,
- it ignores instability,
- or it claims structural improvement with only one-off relief evidence.

## Example record

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
      "score": 0.57,
      "sources": 
    },
    "cosine": {
      "score": 0.44,
      "sources": 
    },
    "tangent": {
      "score": 0.62,
      "sources": 
    }
  },
  "confidence": 0.79,
  "refresh_rule": "quarterly"
}
```

## Suggested first pilot indicators

A realistic first pilot can start with a narrow food bundle such as:

- self-reported meal stress,
- emergency request frequency,
- basket affordability ratio,
- average travel burden to access points,
- pantry fulfillment rate,
- stockout frequency,
- weekly queue volatility.

That is enough to populate the rotor without pretending to solve all food measurement at once.

## Checkpoint implications

At checkpoint time, food-related claims should be evaluated by asking:

1. which food rotor channel did the node claim to affect?
2. does the claimed activity plausibly affect that channel?
3. did the food rotor move in the claimed direction during the relevant window?
4. how much of that movement is attributable with usable confidence?

This is the bridge between the scarcity schema and checkpoint validation.

## Open questions

- Should food adequacy and nutrition quality be explicit subcomponents of sine, cosine, or both?
- How should surplus food redistribution be scored when it relieves burden but leaves structure unchanged?
- What is the cleanest first affordability metric for a local pilot?
- How should household-level volatility be represented when only service-level data is available?
