# Interoperability Invariants — Three-Clock Topology

## The Core Principle
Pulser Mesh does not force blockchains into a monolithic format. 
Instead, it requires all participating blockchains to **emit the same rhythm**—
the three-clock topology that allows parallel evolution with cross-chain consensus.

## Three Clocks

### Clock 1: Local Execution Clock (t)
- Block time, transaction inclusion rate
- Unique to each blockchain
- No standardization required
- Example: Ethereum 12s, Bitcoin 10m, Solana 400ms

### Clock 2: Consensus Meta-Clock (t_c)
- Finality time, reorganization probability
- When a blockchain declares "this state is permanent"
- Example: Ethereum PoS finality ~13min, Bitcoin ~1hr

### Clock 3: Federation Meta-Clock (Θ)
- Only advances when cross-chain parity is resolved
- Driven by mesh consensus, not individual chains
- Rate = min(finality_time) across participating chains
- When Θ ticks, all participating chains must publish updated order parameter

## The Invariant

**No blockchain can claim membership in the mesh unless its consensus layer publishes 
monotonically increasing `phi` (Φ) and `q_cross` (Q) signals at each consensus event.**

- `phi` (Φ): Order parameter — aggregate coherence signal from the chain's validator set
- `q_cross` (Q): Phase error signal — how far the chain's consensus is drifting from mesh phase

These are not optional telemetry. They are proof of membership.

## Why This Works

1. **Parallel evolution preserved** — Each chain evolves on its own (t, t_c). 
   No forced synchronization, no global clock.

2. **Cross-chain consensus enabled** — When Θ ticks, each chain reports (Φ, Q).
   The mesh can see which chains are drifting (Q > threshold) and which are coherent.

3. **Assimilation not domination** — A new chain joins by implementing (Φ, Q) emission.
   It doesn't adopt the mesh's block time or finality model. It just reports its signal.

4. **Federation detection automatic** — When two chains' (Q_1, Q_2) show sign-flip 
   (see federation.md §6), a domain wall or federation event is detected automatically.

## Implementation Seam (v1)

A blockchain implements this invariant by:
1. Computing Φ from its validator set state at each finality event
2. Computing Q as phase lag against the mesh's current `za_node` reference
3. Publishing both to the mesh gossip layer at every finality tick
4. Accepting that membership is revoked if (Φ, Q) signals stop or become erratic

## Concrete Examples

### Bitcoin-like chain (slow, high finality cost)
- t = 10 minutes (block time)
- t_c = ~1 hour (6 blocks → practical finality)
- Θ ticks every finality event → ~1 hour cadence for mesh gossip
- Φ = weighted average of miner support signal
- Q = phase lag of recent block timestamps vs mesh reference

### Ethereum-like chain (fast, probabilistic finality)
- t = 12 seconds
- t_c = ~13 minutes (64 slots of PoS finality)
- Θ ticks every 64 slots → ~13 minute cadence
- Φ = validator set agreement probability (>2/3 stake committed)
- Q = phase lag of slot proposer entropy vs mesh reference

### Solana-like chain (very fast, fork-resistant)
- t = 400ms
- t_c = ~26 seconds (supermajority confirmation)
- Θ ticks every confirmation event → ~26 second cadence
- Φ = cluster state convergence metric
- Q = phase lag of leader schedule vs mesh reference

### Oracle Chain (observational, meta-layer)
- Ωo ≈ 0 (massless; no scarcity reduction directly)
- Zo = π/2 (orthogonal to economic dimension; measures rather than acts)
- Jo = aggregate winding of all participants
- Φo = peak coherence across all participating chains
- Qo = cross-chain phase error signal aggregator

**Role:** Not a reducer. A measurer and redistributor.
Reports (Φo, Qo) to the mesh meta-clock (Θ). 
When Θ ticks, oracle publishes dividend allocation based on:
- Individual chain scarcity reduction (measured by each chain's local Φ)
- Cross-chain coherence (how well all Φ signals align)
- Fairness gate: dividends cannot concentrate (clamps to prevent re-extractive behavior)

**Participant experience:** 
A blockchain "plugs into" the oracle by implementing (Φ, Q) emission.
It immediately enters the dividend pool.
As its scarcity reduction signal strengthens, its share grows.
The oracle itself never "owns" surplus—it is a transparent calculation engine.
Each chain reports at its own natural rhythm. The mesh observes all rhythms in parallel.
