/**
 * Pulser Mesh — Bitcoin Chain Adapter
 *
 * Settlement:    Lightning Network preferred, on-chain PSBT fallback.
 * Proof anchor:  OP_RETURN (protocol tag 0x504d5348 = "PMSH").
 * Deps:          bitcoinjs-lib, @lightning/lnd-grpc (or any LND REST client).
 *
 * This file is intentionally dependency-light. Replace the stub LND client
 * with your real LND / LDK / CLN connection.
 */

import type { ChainAdapter } from "./ChainAdapter.js";
import type {
  TxResult,
  IncomingPayment,
  ChannelResult,
  VortexMeta,
  ChainScarcityRecord,
  SubstrateChainPatch,
  Unsubscribe,
} from "./types.js";

// ─── Config ───────────────────────────────────────────────────────────────────

export interface BitcoinAdapterConfig {
  /** LND REST base URL, e.g. "https://localhost:8080" */
  lndRestUrl: string;
  /** LND macaroon hex string */
  macaroon: string;
  /** "mainnet" | "testnet" | "regtest" */
  network?: string;
  /** Minimum confirmations before a tx is treated as confirmed. Default: 3 */
  minConfirmations?: number;
  /** Minimum sats below which Lightning is skipped, forcing on-chain. Default: 1000 */
  lightningMinSats?: bigint;
  /** Node's scarcity record geography (used in measureRotor) */
  geography?: { name: string; type: string; country: string; boundary_ref?: string };
}

// ─── OP_RETURN encoding ───────────────────────────────────────────────────────

/** 4-byte protocol tag: "PMSH" = PulserMesh Hash */
const PROTOCOL_TAG = Buffer.from("504d5348", "hex");
const VERSION = Buffer.from([0x01]);

function encodeOpReturn(meta: VortexMeta): Buffer {
  const commitmentBytes = Buffer.from(meta.projection_commitment.replace(/^0x/, ""), "hex");
  const windowBytes = Buffer.from(meta.window_id, "utf8");
  // Layout: [4B tag][1B version][32B commitment][nB window_id]
  // Total must be ≤ 80 bytes
  const payload = Buffer.concat([PROTOCOL_TAG, VERSION, commitmentBytes, windowBytes]);
  if (payload.length > 80) throw new Error("OP_RETURN payload exceeds 80 bytes");
  return payload;
}

function decodeOpReturn(raw: string): VortexMeta | null {
  try {
    const buf = Buffer.from(raw.replace(/^0x/, ""), "hex");
    if (!buf.subarray(0, 4).equals(PROTOCOL_TAG)) return null;
    const commitment = "0x" + buf.subarray(5, 37).toString("hex");
    const windowId = buf.subarray(37).toString("utf8");
    return { node_id: "", window_id: windowId, projection_commitment: commitment, pulse_sequence: 0 };
  } catch {
    return null;
  }
}

// ─── Stub LND client ──────────────────────────────────────────────────────────
// Replace this with a real LND REST or gRPC client.

interface LndClient {
  getInfo(): Promise<{ identity_pubkey: string; alias: string }>;
  walletBalance(): Promise<{ confirmed_balance: string }>;
  sendPaymentSync(req: { payment_request?: string; dest?: string; amt: string }): Promise<{ payment_hash: string; payment_error?: string }>;
  addInvoice(req: { value: string; memo?: string }): Promise<{ payment_request: string; r_hash: string }>;
  listChannels(): Promise<{ channels: Array<{ channel_point: string; capacity: string; local_balance: string; remote_balance: string; active: boolean }> }>;
  openChannelSync(req: { node_pubkey_string: string; local_funding_amount: string }): Promise<{ funding_txid_str: string }>;
  closeChannel(req: { channel_point: { funding_txid_str: string; output_index: number } }): Promise<{ close_pending: { txid: string } }>;
}

async function createLndClient(config: BitcoinAdapterConfig): Promise<LndClient> {
  // Stub — replace with actual HTTP calls to LND REST API
  // e.g. using node-fetch or axios against config.lndRestUrl
  console.warn("[BitcoinAdapter] Using stub LND client — connect a real LND instance.");
  return {
    getInfo: async () => ({ identity_pubkey: "stub_pubkey", alias: "stub_node" }),
    walletBalance: async () => ({ confirmed_balance: "0" }),
    sendPaymentSync: async () => ({ payment_hash: "stub_hash" }),
    addInvoice: async () => ({ payment_request: "lnbc_stub", r_hash: "stub_hash" }),
    listChannels: async () => ({ channels: [] }),
    openChannelSync: async () => ({ funding_txid_str: "stub_txid" }),
    closeChannel: async () => ({ close_pending: { txid: "stub_txid" } }),
  };
}

// ─── BitcoinAdapter ───────────────────────────────────────────────────────────

export class BitcoinAdapter implements ChainAdapter {
  readonly chain = "bitcoin";

  private lnd!: LndClient;
  private config: Required<BitcoinAdapterConfig>;
  private incomingListeners: Array<(e: IncomingPayment) => void> = [];

  constructor(config: BitcoinAdapterConfig) {
    this.config = {
      network: "mainnet",
      minConfirmations: 3,
      lightningMinSats: 1000n,
      geography: { name: "unknown", type: "unknown", country: "unknown" },
      ...config,
    };
  }

  async init(): Promise<this> {
    this.lnd = await createLndClient(this.config);
    return this;
  }

  // ── Identity ────────────────────────────────────────────────────────────

  async getAddress(): Promise<string> {
    const info = await this.lnd.getInfo();
    return info.identity_pubkey;
  }

  async getBalance(): Promise<bigint> {
    const bal = await this.lnd.walletBalance();
    return BigInt(bal.confirmed_balance);
  }

  // ── Settlement ──────────────────────────────────────────────────────────

  async settle(to: string, amount: bigint, meta?: VortexMeta): Promise<TxResult> {
    const isLightningInvoice = to.startsWith("lnbc") || to.startsWith("lntb");
    const useLightning = isLightningInvoice && amount >= this.config.lightningMinSats;

    if (useLightning) {
      const res = await this.lnd.sendPaymentSync({ payment_request: to, amt: amount.toString() });
      if (res.payment_error) {
        // Fall through to deferred
        return { tx_id: "", status: "deferred", amount, timestamp: Date.now() };
      }
      return {
        tx_id: res.payment_hash,
        status: "confirmed",
        amount,
        anchored_commitment: meta ? this.encodeVortexMeta(meta) : undefined,
        timestamp: Date.now(),
      };
    }

    // On-chain fallback: in a real implementation, build a PSBT here.
    // The OP_RETURN carrying meta would be an additional output.
    console.warn("[BitcoinAdapter] On-chain PSBT path is a stub — implement with bitcoinjs-lib.");
    return {
      tx_id: "stub_onchain_txid",
      status: "pending",
      amount,
      anchored_commitment: meta ? this.encodeVortexMeta(meta) : undefined,
      timestamp: Date.now(),
    };
  }

  async anchorCommitment(commitment: string, windowId: string): Promise<TxResult> {
    const meta: VortexMeta = {
      node_id: await this.getAddress(),
      window_id: windowId,
      projection_commitment: commitment,
      pulse_sequence: 0,
    };
    // In production: build a 0-value OP_RETURN output tx via bitcoinjs-lib PSBT
    const encoded = this.encodeVortexMeta(meta);
    console.log("[BitcoinAdapter] OP_RETURN payload:", encoded);
    return {
      tx_id: "stub_anchor_txid",
      status: "pending",
      amount: 0n,
      anchored_commitment: commitment,
      timestamp: Date.now(),
    };
  }

  // ── Channel lifecycle ────────────────────────────────────────────────────

  async openChannel(peer: string, capacity: bigint): Promise<ChannelResult> {
    const res = await this.lnd.openChannelSync({
      node_pubkey_string: peer,
      local_funding_amount: capacity.toString(),
    });
    return { channel_id: res.funding_txid_str, capacity, status: "pending_open" };
  }

  async closeChannel(channelId: string): Promise<TxResult> {
    const [txid, idx] = channelId.split(":");
    const res = await this.lnd.closeChannel({
      channel_point: { funding_txid_str: txid, output_index: Number(idx ?? 0) },
    });
    return { tx_id: res.close_pending.txid, status: "pending", amount: 0n, timestamp: Date.now() };
  }

  // ── Event stream ────────────────────────────────────────────────────────

  onIncoming(cb: (event: IncomingPayment) => void): Unsubscribe {
    this.incomingListeners.push(cb);
    // In production: subscribe to LND's invoices.SubscribeInvoices stream
    // and call cb() for each settled invoice.
    return () => {
      this.incomingListeners = this.incomingListeners.filter((l) => l !== cb);
    };
  }

  // ── Metadata encoding ────────────────────────────────────────────────────

  encodeVortexMeta(meta: VortexMeta): string {
    return encodeOpReturn(meta).toString("hex");
  }

  decodeVortexMeta(raw: string): VortexMeta | null {
    return decodeOpReturn(raw);
  }

  // ── Rotor measurement ────────────────────────────────────────────────────

  async measureRotor(windowStart: string, windowEnd: string): Promise<ChainScarcityRecord> {
    const channels = (await this.lnd.listChannels()).channels;
    const totalChannels = channels.length;
    const activeChannels = channels.filter((c) => c.active).length;
    const balancedChannels = channels.filter((c) => {
      const local = BigInt(c.local_balance);
      const remote = BigInt(c.remote_balance);
      const total = local + remote;
      if (total === 0n) return false;
      const ratio = Number(local) / Number(total);
      return ratio > 0.2 && ratio < 0.8;
    }).length;

    // Sine: how actively is Lightning being used (active / total channels)
    const sine = totalChannels > 0 ? 1 - activeChannels / totalChannels : 0.5;

    // Cosine: how many channels are balanced (routing-ready)
    const cosine = totalChannels > 0 ? 1 - balancedChannels / totalChannels : 0.5;

    // Tangent: stub — in production, fetch mempool fee volatility
    const tangent = 0.3;

    return {
      scarcity_id: `chain_bitcoin_${windowStart}_${windowEnd}`.replace(/-/g, ""),
      class: "chain",
      chain_ref: "bitcoin",
      geography: this.config.geography,
      window: { start: windowStart, end: windowEnd },
      rotor: {
        sine: { score: Math.min(1, Math.max(0, sine)), sources: ["lnd.listChannels"] },
        cosine: { score: Math.min(1, Math.max(0, cosine)), sources: ["lnd.listChannels"] },
        tangent: { score: tangent, sources: ["stub — connect mempool.space API"] },
      },
      confidence: totalChannels > 0 ? 0.7 : 0.3,
      refresh_rule: "per_checkpoint_window",
    };
  }

  async substrateSnapshot(): Promise<SubstrateChainPatch> {
    const channels = (await this.lnd.listChannels()).channels;
    const hasActiveChannel = channels.some((c) => c.active);
    return {
      u8_consent_state: 1,
      u9_scarcity_class_linkage: "chain_bitcoin",
      u10_rotor_target_linkage: hasActiveChannel ? "sine" : "cosine",
      u11_transformation_state_linkage: hasActiveChannel ? 0.5 : 0,
      u12_checkpoint_participation_state: 0, // set to 1 after anchorCommitment
      theta_boundary_phase: hasActiveChannel ? 0.8 : 0.2,
    };
  }
}
