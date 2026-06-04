# Pulser Mesh

Pulser Mesh is an open protocol for turning local meshes of favors, trade, and value-added transformation into validated pulses of common surplus and universal dividend flow.

The project starts from a simple idea: if local economic actors verifiably reduce a real scarcity in a real place, some of the resulting surplus should flow back to participating persons as a flat downstream dividend rather than concentrating at an apex.

## Core idea

Pulser Mesh borrows its image from the trompe and pulser pump: a no-moving-parts water system that entrains flow locally and lifts water above its source through geometry rather than a central impeller. In protocol terms:

- Local activity creates the flow field.
- A checkpoint separates valid surplus from extractive noise.
- The protocol emits a dividend pulse back into the base layer.

This is meant to be the opposite of a pyramid. Instead of routing value upward into a bottleneck, Pulser Mesh validates local graphs and pulses verified common surplus back down to the people and places that generated it.

## What the repo is for

This repository is the open development home for:

- The Pulser Mesh whitepaper and evolving protocol specification.
- Data models for nodes, edges, scarcity fields, and checkpoints.
- Prototype graph logic for local favor and trade meshes.
- Validation rules for anti-extractive topology.
- Early cryptographic and rollup experiments for checkpoint proofs.

## System sketch

Pulser Mesh has three conceptual layers:

| Layer | Role |
|---|---|
| Local mesh | Records favors, trade, consent, and value-added transformations |
| Checkpoint / shell | Validates local graph state and computes common surplus |
| Settlement / core | Finalizes proofs and distributes dividend pulses |

The local layer is intentionally relational and place-specific. The checkpoint layer is where graph conditions and scarcity claims are validated. The settlement layer is minimal and exists mainly to enforce invariant rules and payout logic.

## Initial protocol concepts

The first version of the model revolves around a node tuple:

\[
\mathcal{N} = (p, q, \phi, \vec{m}_s, \vec{g}, \Xi)
\]

Where:

- \(p\), \(q\): winding / structural embedding parameters.
- \(\phi\): local growth ratio.
- \(\vec{m}_s\): mission vector in scarcity space.
- \(\vec{g}\): geographic grounding.
- \(\Xi\): coherence floor for stable participation.

The long-term goal is to validate this tuple against real scarcity fields, local graph behavior, and bounded anti-extractive conditions rather than mere self-description.

## Scarcity-first orientation

Pulser Mesh treats scarcity as a measurable field rather than a slogan. For food, that means working with dimensions such as availability, access, utilization, and stability rather than a single vague “impact” score. A mission is legitimate only if it can be shown to reduce an actual deficit in the node’s declared geography over time.

## Suggested first milestones

1. Formalize the node tuple and validation predicates.
2. Build a local graph prototype for favors and trade.
3. Define the first scarcity oracle for one scarcity class, likely food.
4. Implement checkpoint logic that accepts valid local graph snapshots.
5. Add proof and settlement experiments once the local model is coherent.

## Design principles

- Local first.
- Consent before aggregation.
- Geography before abstraction.
- Scarcity reduction before valuation.
- Bounded growth over apex extraction.
- Open specification over black-box governance.

## Current status

The project is at the open design and prototyping stage. The immediate goal is to build the conceptual substrate in public, pressure-test the language, and iterate toward code that can represent the local mesh and checkpoint logic faithfully.

## Read next

- `whitepaper/pulser_mesh_whitepaper_v1.0.md`
- `GLOSSARY.md`
- `CONTRIBUTIONS.md`
