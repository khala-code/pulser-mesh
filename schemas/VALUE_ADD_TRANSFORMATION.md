# Value-Add Transformation Schema

This document defines the schema for value-add transformation in Pulser Mesh.

## Purpose

Value-add transformation is a cross-domain schema that describes how an input is transformed into an output in a way that moves a scarcity condition toward resolution.

That makes it a protocol-level object.

Adapters describe how a particular scarcity class is observed. The transformation schema describes how an action or institution changes the world in a scarcity-relevant way.

## Core claim

Pulser Mesh should not treat “value-add” in the ordinary accounting sense alone.

In this protocol, value-add means:

- an input is transformed,
- the transformation is real and attributable,
- the output is closer to satisfying a live scarcity channel than the input was,
- and the transformation can therefore contribute to validated common surplus.

This applies across domains.

Examples:

- grain to bread,
- ingredients to meals,
- vacant building to habitable shelter,
- idle vehicle capacity to reachable mobility,
- fragmented care time to stable care coverage.

## Canonical object

\[
\mathcal{T} = (i, o, m, g, c, r, a, \chi)
\]

Where:

- `i` = input state,
- `o` = output state,
- `m` = transformation method,
- `g` = geography,
- `c` = scarcity class,
- `r` = targeted rotor channel impact,
- `a` = attribution bundle,
- `chi` = transformation validity score.

## Why this is a schema

This object is not specific to food, housing, care, or mobility. It is reusable across all of them.

It belongs at the same level as:

- node tuple,
- scarcity schema,
- validation/checkpoint spec,
- consent check.

A domain adapter can reference this schema, but should not redefine it.

## Field definitions

### 1. `i` — input state

The resource, service, capacity, or condition before transformation.

Examples:

- raw produce,
- uncooked ingredients,
- unused cold storage,
- volunteer care hours,
- empty seats in a transport route,
- underused building stock.

The input must be typed.

```json
{
  "resource_type": "ingredients",
  "unit": "kg",
  "quantity": 120,
  "quality": "mixed",
  "state": "raw"
}
```

### 2. `o` — output state

The resulting resource, service, or condition after transformation.

Examples:

- cooked meals,
- stabilized pantry inventory,
- habitable shelter units,
- delivered rides,
- covered care shifts.

```json
{
  "resource_type": "prepared_meals",
  "unit": "meal",
  "quantity": 320,
  "quality": "ready_to_consume",
  "state": "distributed_ready"
}
```

### 3. `m` — transformation method

The process that links input to output.

Examples:

- cook,
- store,
- transport,
- package,
- repair,
- assemble,
- route,
- coordinate,
- schedule,
- rehabilitate.

This field should be explicit because different methods affect different scarcity channels.

### 4. `g` — geography

The place in which the transformation is claimed to matter.

Transformation without geography is too abstract for checkpoint validation.

### 5. `c` — scarcity class

The scarcity domain the transformation addresses.

Examples:

- `food`
- `housing`
- `care`
- `mobility`

### 6. `r` — targeted rotor channel impact

This is where the transformation schema plugs into the triadic rotor scarcity model.

`r` should specify which scarcity channel or channels the transformation plausibly affects.

Examples:

```json
{
  "primary": ,
  "secondary": 
}
```

Examples of interpretation:

- cooking ingredients into prepared meals may reduce `food.sine` and `food.cosine`,
- adding storage capacity may reduce `food.tangent`,
- routing a pantry service may reduce `food.cosine`,
- converting idle volunteer hours into scheduled coverage may reduce `care.tangent` and `care.cosine`.

### 7. `a` — attribution bundle

The attribution bundle records why the protocol should believe this transformation actually occurred and mattered.

Suggested components:

- provenance of input,
- provenance of output,
- method evidence,
- timing,
- counterparties,
- relation to scarcity target,
- confidence in causal relevance.

### 8. `chi` — transformation validity score

`chi` is a bounded score summarizing whether the transformation is valid enough to contribute to checkpoint accounting.

Range:
- ``

It should reflect:

- material reality of transformation,
- traceability,
- efficiency,
- scarcity relevance,
- and anti-gaming resilience.

## Transformation rule

A transformation contributes to validated value-add only if:

1. the output is meaningfully closer to satisfying a scarcity channel than the input,
2. the transformation is attributable,
3. the transformation is geographically grounded,
4. the transformation is not merely relabeling,
5. the transformation is not dominated by extractive capture.

## Distance-to-scarcity intuition

The guiding idea is not simply that outputs are “worth more.”

The guiding idea is that the output is **closer to human-usable scarcity resolution** than the input.

For example:

- raw ingredients may exist,
- but if the target population lacks cooking capacity, then ready meals may be much closer to reducing `food.sine`,
- and local storage or routing improvements may be much closer to reducing `food.tangent` or `food.cosine`.

## Anti-fake transformation rule

The schema should reject transformations that are mostly performative.

Examples:

- relabeling without substantive state change,
- multiple claims on the same transformation event,
- route padding to inflate “activity,”
- packaging theater without meaningful scarcity improvement,
- transformations that increase volume but not accessibility or stability.

## Example object

```json
{
  "transformation_id": "tx_food_001",
  "input_state": {
    "resource_type": "ingredients",
    "unit": "kg",
    "quantity": 120,
    "quality": "mixed",
    "state": "raw"
  },
  "output_state": {
    "resource_type": "prepared_meals",
    "unit": "meal",
    "quantity": 320,
    "quality": "ready_to_consume",
    "state": "distributed_ready"
  },
  "method": "cook_and_portion",
  "geography": {
    "name": "Fremantle",
    "type": "local_government_area",
    "country": "AU",
    "boundary_ref": "osm-relation:307847"
  },
  "scarcity_class": "food",
  "rotor_impact": {
    "primary": ,
    "secondary": 
  },
  "attribution": {
    "input_proof": ,
    "output_proof": ,
    "timing": "2026-06-04T10:30:00Z",
    "confidence": 0.82
  },
  "transformation_validity": 0.79
}
```

## Relationship to food adapter

The food adapter should reference this schema but not absorb it.

The food adapter answers:
- how is food scarcity measured in rotor terms?

The value-add transformation schema answers:
- how does an action transform something into a more scarcity-resolving state?

Those are related but different layers.

## Relationship to validation and checkpoint logic

At checkpoint time, transformation records can be evaluated by asking:

- was the transformation real?
- what scarcity class did it address?
- which rotor channel did it plausibly improve?
- did the relevant scarcity channel move in the expected direction?
- what share of that movement is attributable?

This makes the transformation schema one of the central bridges between local action and validated surplus.

## Minimal validation rules

A transformation record is valid only if:

- input and output states are typed,
- method is explicit,
- geography is explicit,
- scarcity class is explicit,
- rotor impact is declared,
- attribution evidence exists,
- transformation validity exceeds threshold,
- no duplicate claim on the same transformation event exists.

## Next revision note for food adapter

The food adapter should eventually be updated to explicitly point to this schema whenever food preparation, storage, routing, or distribution changes the effective distance from scarcity resolution.
