# Contributions Guide

Thanks for taking an interest in Pulser Mesh.

This project is being built in the open and is still at an early stage. That is a feature, not a bug. The main goal right now is to improve the conceptual clarity, formal consistency, and implementability of the protocol before prematurely hardening the stack.

## What kinds of contributions help most

### 1. Conceptual clarification

Useful contributions include:

- Tightening definitions.
- Spotting contradictions or hidden assumptions.
- Simplifying language without flattening meaning.
- Converting metaphor into data structure, rule, or test case.

### 2. Protocol design

Areas of interest:

- Node and edge schemas.
- Graph validation rules.
- Scarcity field representations.
- Checkpoint and settlement logic.
- Privacy-preserving proof strategies.

### 3. Data and measurement

Especially valuable:

- Open datasets for scarcity or geography.
- Better ways to model local deficits.
- Methods for evaluating mission claims against reality.
- Critiques of naive metrics or Goodhart-style failure modes.

### 4. Prototype code

Strong early prototype targets:

- Local graph storage and visualization.
- Consent-aware edge creation.
- Node tuple validators.
- Scarcity oracle experiments.
- Rollup/checkpoint simulations.

### 5. Critique

The project needs critics, not cheerleaders. The best contributions may be:

- “This definition collapses in the following edge case.”
- “This metric will obviously be gamed.”
- “This legal assumption fails in jurisdiction X.”
- “This topology still hides an apex.”

## Working norms

- Be precise.
- Be generous.
- Attack the model, not the person.
- Name assumptions explicitly.
- Prefer examples over vague agreement.
- Distinguish speculation from implementation.
- Keep local reality in view; avoid purely abstract elegance detached from use.

## Pull request guidance

A good PR usually does one of these things:

- Improves the wording of one concept substantially.
- Adds one concrete mechanism or schema.
- Refactors one part of the documentation into something more legible.
- Adds one prototype with a clear purpose and limitations.
- Identifies one major open question and sharpens it.

Please avoid giant “everything rewrite” PRs early on unless discussed first.

## Suggested issue labels

Suggested label set for the repo:

- `theory`
- `protocol`
- `schema`
- `graph`
- `scarcity`
- `oracle`
- `proofs`
- `legal`
- `docs`
- `good-first-issue`
- `open-question`
- `blocked`

## Open questions worth tackling

- What is the minimal useful node tuple for a first prototype?
- How should \(\Xi\) be estimated operationally rather than poetically?
- What is the simplest scarcity field to implement first?
- Which graph conditions best approximate anti-extractive topology before full formal proofs exist?
- What should remain off-chain permanently?
- What is the cleanest legal wrapper for real-world pilots?

## How to contribute right now

1. Read the whitepaper.
2. Read the glossary.
3. Open an issue if a concept feels muddy, circular, or underdefined.
4. Open a draft PR if you want to formalize a concept into code or schema.
5. Add examples. Examples are disproportionately useful.

## Early contributor mindset

Pulser Mesh is not trying to ship a meme coin or a cosmetic governance layer. It is trying to define a protocol where local, scarcity-reducing activity can be measured, validated, and pulsed back into the base without being captured by an apex.

That means contributors should optimize for:

- clarity over hype,
- robustness over speed,
- grounding over abstraction,
- and open iteration over false certainty.

If that sounds good, welcome aboard.
