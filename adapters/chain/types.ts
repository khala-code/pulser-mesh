/**
 * Pulser Mesh — Chain Adapter Types
 *
 * Shared types for the Bitcoin and Ethereum chain adapters.
 * All value amounts use bigint (satoshis for BTC, wei for ETH).
 */

// ─── Rotor ───────────────────────────────────────────────────────────────────

export interface RotorScore {
  score: number; // [0, 1] — higher = worse (more scarcity / friction)
  sources: string[];
}

export interface Rotor {
  sine: RotorScore;    // lived value penetration
  cosine: RotorScore;  // structural alignment of chain rails with mesh topology
  tangent: RotorScore; // instability gradient (fees, congestion, routing failure)
}

// ─── Scarcity record ─────────────────────────────────────────────────────────

export interface Geography {
  name: string;
  type: string;
  country: string;
  boundary_ref?: string;
}

export interface Window {
  start: string; // ISO 8601 date
  end: string;
}

export type ChainRef = "bitcoin" | "ethereum";

export interface ChainScarcityRecord {
  scarcity_id: string;
  class: "chain";
  chain_ref: ChainRef;
  geography: Geography;
  window: Window;
  rotor: Rotor;
  confidence: number; // [0, 1]
  refresh_rule: string;
}

// ─── Vortex / mesh metadata ───────────────────────────────────────────────────

export interface VortexMeta {
  node_id: string;
  window_id: string;         // e.g. "2026_q2"
  projection_commitment: string; // hex hash from substrate boundary projection
  pulse_sequence: number;    // monotonically increasing pulse counter
}

// ─── Settlement ──────────────────────────────────────────────────────────────

export type SettlementStatus = "confirmed" | "pending" | "failed" | "deferred";

export interface TxResult {
  tx_id: string;             // txid (BTC) or tx hash (ETH)
  status: SettlementStatus;
  amount: bigint;            // satoshis (BTC) or wei (ETH)
  fee?: bigint;
  confirmations?: number;
  anchored_commitment?: string; // projection_commitment encoded in this tx
  timestamp: number;         // unix ms
}

// ─── Incoming payment event ───────────────────────────────────────────────────

export interface IncomingPayment {
  from: string;              // address or pubkey
  amount: bigint;
  vortex_meta?: VortexMeta;  // decoded mesh metadata if present
  tx_id: string;
  timestamp: number;
}

export type Unsubscribe = () => void;

// ─── Channel (Lightning / state channel) ─────────────────────────────────────

export interface ChannelResult {
  channel_id: string;
  capacity: bigint;
  status: "open" | "pending_open" | "closed";
}

// ─── Substrate coordinate patch ──────────────────────────────────────────────
// Partial update to substrate coords driven by chain events.

export interface SubstrateChainPatch {
  u8_consent_state?: number;              // 0 or 1
  u9_scarcity_class_linkage?: string;    // scarcity_id
  u10_rotor_target_linkage?: string;     // "sine" | "cosine" | "tangent"
  u11_transformation_state_linkage?: number; // 0=pending, 0.5=confirmed, 1=settled
  u12_checkpoint_participation_state?: number; // 0 or 1
  theta_boundary_phase?: number;         // confirmation depth [0, 1]
}
