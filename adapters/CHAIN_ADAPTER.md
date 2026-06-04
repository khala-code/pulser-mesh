# Chain Adapter

This document defines the chain adapter for Pulser Mesh, mapping on-chain economic state for Bitcoin and Ethereum into the unified scarcity schema and substrate interface.

## Purpose

The chain adapter translates on-chain economic conditions — value flow, settlement structure, and liquidity fragility — into the protocol's triadic rotor:

$$
R = (s, k, \tau)
$$

Where:

- `s` = sine, lived value penetration into the mesh,
- `k` = cosine, structural alignment of chain rails with mesh topology,
- `tau` = tangent, instability gradient (fee volatility, congestion, liquidity fragility).

The adapter exists so chain-linked nodes and settlement events can be validated against a consistent, protocol-legible frame rather than raw transaction volume.

## Design position

This adapter sits at the boundary between Pulser Mesh's geometry-native value routing and external settlement layers. It does two distinct things:

1. **Value-flow mapping** — translates on-chain payment activity into rotor coordinates for checkpoint validation.
2. **Proof anchoring** — provides a path for committing substrate `projection_commitment` hashes on-chain as tamper-evident checkpoint records.

These are separable concerns and can be implemented independently.

## Adapter scope

This adapter is designed for:

- mesh nodes that settle surplus pulses via Bitcoin (on-chain or Lightning) or Ethereum (mainnet or L2),
- checkpoint validators that want tamper-evident on-chain commitment of substrate boundary projections,
- rotor evaluation of a geography's or node's chain-accessible economic conditions.

It is not intended as a full blockchain node integration or a general crypto payment gateway in v1.

## Supported chains

| Chain | Settlement path | Proof anchoring path |
|---|---|---|
| Bitcoin | Lightning Network (preferred) / on-chain PSBT | `OP_RETURN` (≤80 bytes) |
| Ethereum | Native ETH transfer with calldata | Calldata or minimal `MeshCheckpoint` contract event |

## Canonical object shape

A chain scarcity record uses the general scarcity schema with `class: "chain"` and a `chain_ref` sub-class.

```json
{
  "scarcity_id": "chain_bitcoin_fremantle_2026_q2",
  "class": "chain",
  "chain_ref": "bitcoin",
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
      "score": 0.0,
      "sources": []
    },
    "cosine": {
      "score": 0.0,
      "sources": []
    },
    "tangent": {
      "score": 0.0,
      "sources": []
    }
  },
  "confidence": 0.0,
  "refresh_rule": "per_checkpoint_window"
}
```

## Chain rotor mapping

## 1. Sine — lived value penetration

The sine channel measures how actively on-chain value is circulating through real mesh interactions, rather than sitting locked or dormant.

High sine means the chain is being used as a live settlement rail, not just a theoretical option.

### Typical sine indicators

- active payment channels open between mesh nodes (Lightning),
- settlement frequency: number of surplus-pulse settlements per window,
- ratio of active-to-dormant node wallets in the mesh subgraph,
- on-chain or Lightning routing success rate,
- average time from surplus trigger to settled confirmation.

### Example scoring bands

| Sine score | Interpretation |
|---|---|
| 0.00–0.20 | Chain rarely used; value flows are off-chain or absent |
| 0.21–0.40 | Occasional use; not yet a primary settlement rail |
| 0.41–0.60 | Regular use; chain is an active mesh settlement path |
| 0.61–0.80 | High throughput; chain is the primary surplus-pulse rail |
| 0.81–1.00 | Near-complete chain settlement integration |

## 2. Cosine — structural alignment

The cosine channel measures how well the chain's settlement rails align with the geographic and social topology of the mesh — not just whether value can move in principle, but whether it can move along the actual edges that matter.

High cosine means there is significant friction: nodes that need to exchange value cannot reliably do so via the chain due to access, routing depth, or custody barriers.

### Typical cosine indicators

- channel graph coverage: what fraction of active mesh edges have an open payment channel or established settlement path,
- custody access gap: how many mesh nodes lack self-custodial wallet infrastructure,
- routing depth: average hop count between mesh node pairs on the Lightning graph,
- geographic coverage: fraction of mesh geography with stable internet for chain access,
- last-mile settlement reach: whether surplus pulses from peripheral nodes can actually reach the chain.

### Example scoring bands

| Cosine score | Interpretation |
|---|---|
| 0.00–0.20 | Strong structural alignment; chain reaches all active mesh edges |
| 0.21–0.40 | Moderate friction; most edges covered but some gaps |
| 0.41–0.60 | Significant misalignment; many mesh edges cannot settle on-chain |
| 0.61–0.80 | Severe structural gap; chain rails cover a minority of mesh topology |
| 0.81–1.00 | Near-complete structural misalignment |

## 3. Tangent — instability gradient

The tangent channel measures how fragile or shock-sensitive chain settlement is during the window. Even when the chain is structurally reachable, high tangent means settlement can fail suddenly under ordinary conditions.

### Typical tangent indicators

- on-chain fee volatility (standard deviation of sat/vbyte or gwei over the window),
- mempool congestion events: number of periods where confirmation time exceeded threshold,
- Lightning channel liquidity imbalance: fraction of channels with one-sided depletion,
- L2 sequencer downtime (Ethereum L2 paths),
- fork or reorg frequency during the window,
- proportion of failed payment attempts due to routing or liquidity failure.

### Example scoring bands

| Tangent score | Interpretation |
|---|---|
| 0.00–0.20 | Stable settlement conditions |
| 0.21–0.40 | Mild volatility; generally reliable |
| 0.41–0.60 | Noticeable fragility; occasional settlement failure |
| 0.61–0.80 | High instability; frequent disruption |
| 0.81–1.00 | Acute collapse tendency; chain unreliable as settlement rail |

## Chain severity score

A first-pass chain settlement friction score:

$$
\sigma_c = w_s s + w_k k + w_{\tau} \tau
$$

With suggested defaults:

- `w_s = 0.35`
- `w_k = 0.40`
- `w_tau = 0.25`

Structural alignment is slightly privileged because a chain that cannot reach mesh topology is a deeper problem than one that is currently underused.

## Substrate coordinate mappings

The chain adapter populates or informs the following 12+1D substrate coordinates:

| Coordinate | Chain meaning |
|---|---|
| `u8` consent_state | Wallet signing consent: node has authorised on-chain settlement operations |
| `u9` scarcity_class_linkage | Links to this chain scarcity record (`scarcity_id`) |
| `u10` rotor_target_linkage | The specific rotor channel (sine/cosine/tangent) targeted by chain activity |
| `u11` transformation_state_linkage | Settlement completion state: pending / confirmed / failed |
| `u12` checkpoint_participation_state | Whether the node has committed a boundary projection on-chain this window |
| `theta` boundary_phase | Transaction finality depth: confirmation count normalised to [0, 1] |

## Proof anchoring

The substrate `projection_commitment` field (a hash of the boundary projection) can be anchored on-chain to create a tamper-evident checkpoint record without revealing the interior substrate state.

### Bitcoin: OP_RETURN

The commitment is encoded in an `OP_RETURN` output (≤80 bytes). A minimal encoding is:

```
[4-byte protocol tag] [1-byte version] [32-byte commitment hash] [window_id up to 43 bytes]
```

Protocol tag suggestion: `0x504d5348` (`PMSH` — PulserMesh Hash).

This keeps the on-chain footprint minimal and does not require a smart contract.

### Ethereum: calldata or contract event

For simple anchoring, the commitment is passed as calldata in a zero-value self-transfer. For structured on-chain records, a minimal `MeshCheckpoint` contract can emit:

```solidity
event CheckpointCommitted(
    address indexed node,
    bytes32 commitment,
    uint32 windowStart,
    uint32 windowEnd
);
```

This gives validators a structured event stream to reconstruct checkpoint history without trusting any single node's local state.

## Settlement path decision

The adapter should apply the following priority order when settling a surplus pulse:

1. **Lightning Network** (Bitcoin) or **L2** (Ethereum) — preferred for speed and cost,
2. **On-chain** — fallback for large settlements or when channel liquidity is exhausted,
3. **Deferred** — if both paths are unavailable, the pulse is queued and the tangent score is incremented.

## Anti-vanity rule

The adapter should reject chain metrics that are easy to observe but weakly tied to real mesh value flow.

### Weak standalone metrics

- total transaction count,
- total value transferred (nominal),
- wallet address count,
- block space consumed.

These describe chain activity in general, not whether Pulser Mesh's value geometry is functioning.

### Better measurement logic

A chain integration is stronger when it can show:

- surplus pulses are settling within expected latency,
- channel graph covers active mesh edges,
- no node is structurally excluded from settlement due to custody or routing gaps,
- fee shocks are not causing pulse deferral,
- proof commitments are landing on-chain at each checkpoint window.

## Validation rules specific to chain

A chain scarcity claim is stronger when:

- the window is aligned with mesh checkpoint windows,
- fee and congestion data are drawn from on-chain sources, not estimates,
- routing coverage is measured against the actual mesh edge graph, not a generic network,
- consent state (`u8`) is confirmed per node before any settlement is recorded.

A chain scarcity claim should be rejected or heavily downweighted when:

- it uses nominal volume as a proxy for mesh value flow,
- it ignores routing coverage,
- it ignores fee volatility,
- or it claims settlement alignment without verified channel graph data.

## Checkpoint implications

At checkpoint time, chain-linked claims should be evaluated by asking:

1. which chain rotor channel did the node claim to affect?
2. does the claimed settlement activity plausibly affect that channel?
3. did the chain rotor move in the claimed direction during the relevant window?
4. is a `projection_commitment` anchored on-chain for this window?
5. does the on-chain commitment match the locally reported substrate boundary projection?

## Open questions

- Should Lightning channel capacity count toward cosine alignment, or only active balanced channels?
- Is `theta` (boundary phase) better mapped to confirmation depth or to finality probability (accounting for reorg risk)?
- Should Ethereum L2 paths (e.g. Base, Arbitrum) be sub-classed separately or treated as `chain_ref: "ethereum"` with a `layer` field?
- What is the minimum on-chain footprint for a proof anchor that validators can reconstruct without a full node?
- Should the chain adapter emit a rotor update synchronously on settlement confirmation, or batch per checkpoint window?
- How should multi-sig or ERC-4337 smart account custody be scored in the consent state (`u8`) coordinate?
