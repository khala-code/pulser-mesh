/**
 * Pulser Mesh — ChainAdapter Interface
 *
 * The abstract contract that both BitcoinAdapter and EthereumAdapter implement.
 * The mesh core calls this interface without knowing which chain is underneath.
 */

import type {
  TxResult,
  IncomingPayment,
  ChannelResult,
  VortexMeta,
  ChainScarcityRecord,
  SubstrateChainPatch,
  Unsubscribe,
} from "./types.js";

export interface ChainAdapter {
  // ── Identity ──────────────────────────────────────────────────────────────

  /** Human-readable chain identifier, e.g. "bitcoin" or "ethereum". */
  readonly chain: string;

  /** Returns the node's primary address or pubkey on this chain. */
  getAddress(): Promise<string>;

  /** Returns the current spendable balance in base units (satoshis / wei). */
  getBalance(): Promise<bigint>;

  // ── Settlement ────────────────────────────────────────────────────────────

  /**
   * Settle a surplus pulse to a recipient.
   * Implementations should prefer off-chain paths (Lightning / L2) and fall
   * back to on-chain only when necessary.
   *
   * @param to    Destination address or Lightning payment request
   * @param amount  Value in base units (satoshis / wei)
   * @param meta  Optional vortex metadata to embed in the transaction
   */
  settle(
    to: string,
    amount: bigint,
    meta?: VortexMeta
  ): Promise<TxResult>;

  /**
   * Anchor a substrate projection_commitment on-chain for this checkpoint
   * window. Returns the tx in which the commitment was embedded.
   *
   * Bitcoin: encodes in OP_RETURN
   * Ethereum: encodes in calldata or emits via MeshCheckpoint contract
   */
  anchorCommitment(commitment: string, windowId: string): Promise<TxResult>;

  // ── Channel lifecycle (optional — Lightning / state channels) ─────────────

  openChannel?(peer: string, capacity: bigint): Promise<ChannelResult>;
  closeChannel?(channelId: string): Promise<TxResult>;

  // ── Event stream ──────────────────────────────────────────────────────────

  /**
   * Subscribe to incoming payments. The callback fires for every confirmed
   * inbound payment and is responsible for feeding events back into the mesh.
   */
  onIncoming(cb: (event: IncomingPayment) => void): Unsubscribe;

  // ── Vortex metadata encoding ──────────────────────────────────────────────

  /** Encode VortexMeta into a chain-appropriate byte string. */
  encodeVortexMeta(meta: VortexMeta): string;

  /** Decode chain-embedded bytes back into VortexMeta. Returns null if invalid. */
  decodeVortexMeta(raw: string): VortexMeta | null;

  // ── Rotor / scarcity measurement ──────────────────────────────────────────

  /**
   * Measure the chain's current rotor state for the given window.
   * This is what feeds the chain scarcity record at checkpoint time.
   */
  measureRotor(
    windowStart: string,
    windowEnd: string
  ): Promise<ChainScarcityRecord>;

  /**
   * Derive a substrate coordinate patch from the latest chain state.
   * The mesh core applies this patch to the node's 12+1D substrate vector.
   */
  substrateSnapshot(): Promise<SubstrateChainPatch>;
}
