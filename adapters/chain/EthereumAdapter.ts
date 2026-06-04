/**
 * Pulser Mesh — Ethereum Chain Adapter
 *
 * Settlement:    Native ETH transfer with VortexMeta encoded in calldata.
 * Proof anchor:  Calldata on a self-transfer, or MeshCheckpoint contract event.
 * Deps:          viem (https://viem.sh) — install with: npm install viem
 *
 * Replace the stub wallet/client setup with your real key management.
 */

import type { ChainAdapter } from "./ChainAdapter.js";
import type {
  TxResult,
  IncomingPayment,
  VortexMeta,
  ChainScarcityRecord,
  SubstrateChainPatch,
  Unsubscribe,
} from "./types.js";

// ─── Config ───────────────────────────────────────────────────────────────────

export interface EthereumAdapterConfig {
  /** JSON-RPC endpoint, e.g. "https://mainnet.infura.io/v3/YOUR_KEY" or a local Anvil URL */
  rpcUrl: string;
  /** Private key hex (0x-prefixed). Use a secrets manager in production. */
  privateKey: string;
  /** Optional: deployed MeshCheckpoint contract address for structured anchoring */
  checkpointContractAddress?: `0x${string}`;
  /** Chain ID. 1 = mainnet, 11155111 = Sepolia, 31337 = Anvil/Hardhat local */
  chainId?: number;
  /** Node's scarcity record geography */
  geography?: { name: string; type: string; country: string; boundary_ref?: string };
}

// ─── Calldata encoding ────────────────────────────────────────────────────────
// Layout: [4B selector "PMSH"][1B version][32B commitment][nB window_id UTF-8]

const SELECTOR = "504d5348"; // "PMSH"

function encodeCalldata(meta: VortexMeta): `0x${string}` {
  const commitment = meta.projection_commitment.replace(/^0x/, "").padStart(64, "0");
  const windowHex = Buffer.from(meta.window_id, "utf8").toString("hex");
  return `0x${SELECTOR}01${commitment}${windowHex}`;
}

function decodeCalldata(raw: string): VortexMeta | null {
  try {
    const data = raw.replace(/^0x/, "");
    if (!data.startsWith(SELECTOR)) return null;
    const commitment = "0x" + data.slice(8 + 2, 8 + 2 + 64);
    const windowId = Buffer.from(data.slice(8 + 2 + 64), "hex").toString("utf8");
    return { node_id: "", window_id: windowId, projection_commitment: commitment, pulse_sequence: 0 };
  } catch {
    return null;
  }
}

// ─── MeshCheckpoint ABI (minimal) ─────────────────────────────────────────────
// Deploy this contract for structured on-chain checkpoint records.
// Source: see adapters/chain/MeshCheckpoint.sol

const MESH_CHECKPOINT_ABI = [
  {
    name: "commitCheckpoint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "commitment", type: "bytes32" },
      { name: "windowStart", type: "uint32" },
      { name: "windowEnd", type: "uint32" },
    ],
    outputs: [],
  },
  {
    name: "CheckpointCommitted",
    type: "event",
    inputs: [
      { name: "node", type: "address", indexed: true },
      { name: "commitment", type: "bytes32", indexed: false },
      { name: "windowStart", type: "uint32", indexed: false },
      { name: "windowEnd", type: "uint32", indexed: false },
    ],
  },
] as const;

// ─── Stub viem client ─────────────────────────────────────────────────────────
// This file imports viem types structurally. Install viem to get real behaviour:
//   npm install viem

async function createViemClients(config: EthereumAdapterConfig) {
  try {
    // Dynamic import so the file is loadable even without viem installed
    const { createPublicClient, createWalletClient, http, privateKeyToAccount } = await import("viem");
    const account = privateKeyToAccount(config.privateKey as `0x${string}`);
    const transport = http(config.rpcUrl);
    // Dynamically resolve chain — default to local Anvil
    let chain;
    try {
      const { mainnet, sepolia, anvil } = await import("viem/chains");
      chain = config.chainId === 1 ? mainnet : config.chainId === 11155111 ? sepolia : anvil;
    } catch {
      chain = undefined;
    }
    const publicClient = createPublicClient({ chain, transport });
    const walletClient = createWalletClient({ account, chain, transport });
    return { publicClient, walletClient, account };
  } catch {
    console.warn("[EthereumAdapter] viem not installed — using stub clients. Run: npm install viem");
    return null;
  }
}

// ─── EthereumAdapter ──────────────────────────────────────────────────────────

export class EthereumAdapter implements ChainAdapter {
  readonly chain = "ethereum";

  private clients: Awaited<ReturnType<typeof createViemClients>> = null;
  private config: Required<EthereumAdapterConfig>;
  private incomingListeners: Array<(e: IncomingPayment) => void> = [];
  private unwatchIncoming?: () => void;

  constructor(config: EthereumAdapterConfig) {
    this.config = {
      checkpointContractAddress: undefined as unknown as `0x${string}`,
      chainId: 31337,
      geography: { name: "unknown", type: "unknown", country: "unknown" },
      ...config,
    };
  }

  async init(): Promise<this> {
    this.clients = await createViemClients(this.config);
    return this;
  }

  // ── Identity ────────────────────────────────────────────────────────────

  async getAddress(): Promise<string> {
    if (!this.clients) return "0xstub";
    return this.clients.account.address;
  }

  async getBalance(): Promise<bigint> {
    if (!this.clients) return 0n;
    return this.clients.publicClient.getBalance({ address: this.clients.account.address });
  }

  // ── Settlement ──────────────────────────────────────────────────────────

  async settle(to: string, amount: bigint, meta?: VortexMeta): Promise<TxResult> {
    if (!this.clients) {
      console.warn("[EthereumAdapter] Stub settle — install viem.");
      return { tx_id: "0xstub", status: "deferred", amount, timestamp: Date.now() };
    }

    const data = meta ? this.encodeVortexMeta(meta) : undefined;
    const hash = await this.clients.walletClient.sendTransaction({
      to: to as `0x${string}`,
      value: amount,
      ...(data ? { data: data as `0x${string}` } : {}),
    });

    return {
      tx_id: hash,
      status: "pending",
      amount,
      anchored_commitment: meta?.projection_commitment,
      timestamp: Date.now(),
    };
  }

  async anchorCommitment(commitment: string, windowId: string): Promise<TxResult> {
    const nodeAddress = await this.getAddress();

    if (!this.clients) {
      return { tx_id: "0xstub_anchor", status: "deferred", amount: 0n, timestamp: Date.now() };
    }

    // Prefer structured contract event if contract is deployed
    if (this.config.checkpointContractAddress) {
      const windowStartTs = Math.floor(new Date(windowId.split("_")[0] ?? "2026-01-01").getTime() / 1000);
      const windowEndTs = windowStartTs + 7776000; // ~90 days
      const hash = await this.clients.walletClient.writeContract({
        address: this.config.checkpointContractAddress,
        abi: MESH_CHECKPOINT_ABI,
        functionName: "commitCheckpoint",
        args: [
          commitment.replace(/^0x/, "").padStart(64, "0") as `0x${string}`,
          windowStartTs,
          windowEndTs,
        ],
      });
      return { tx_id: hash, status: "pending", amount: 0n, anchored_commitment: commitment, timestamp: Date.now() };
    }

    // Fallback: self-transfer with calldata
    const meta: VortexMeta = {
      node_id: nodeAddress,
      window_id: windowId,
      projection_commitment: commitment,
      pulse_sequence: 0,
    };
    const data = this.encodeVortexMeta(meta) as `0x${string}`;
    const hash = await this.clients.walletClient.sendTransaction({
      to: nodeAddress as `0x${string}`,
      value: 0n,
      data,
    });
    return { tx_id: hash, status: "pending", amount: 0n, anchored_commitment: commitment, timestamp: Date.now() };
  }

  // ── Event stream ────────────────────────────────────────────────────────

  onIncoming(cb: (event: IncomingPayment) => void): Unsubscribe {
    this.incomingListeners.push(cb);

    if (this.clients && this.config.checkpointContractAddress && !this.unwatchIncoming) {
      this.unwatchIncoming = this.clients.publicClient.watchContractEvent({
        address: this.config.checkpointContractAddress,
        abi: MESH_CHECKPOINT_ABI,
        eventName: "CheckpointCommitted",
        onLogs: (logs) => {
          for (const log of logs) {
            const event: IncomingPayment = {
              from: (log as unknown as { args: { node: string } }).args.node ?? "",
              amount: 0n,
              tx_id: log.transactionHash ?? "",
              timestamp: Date.now(),
            };
            this.incomingListeners.forEach((l) => l(event));
          }
        },
      });
    }

    return () => {
      this.incomingListeners = this.incomingListeners.filter((l) => l !== cb);
      if (this.incomingListeners.length === 0) {
        this.unwatchIncoming?.();
        this.unwatchIncoming = undefined;
      }
    };
  }

  // ── Metadata encoding ────────────────────────────────────────────────────

  encodeVortexMeta(meta: VortexMeta): string {
    return encodeCalldata(meta);
  }

  decodeVortexMeta(raw: string): VortexMeta | null {
    return decodeCalldata(raw);
  }

  // ── Rotor measurement ────────────────────────────────────────────────────

  async measureRotor(windowStart: string, windowEnd: string): Promise<ChainScarcityRecord> {
    let gasPrice = 0n;
    let blockNumber = 0n;

    if (this.clients) {
      try {
        gasPrice = await this.clients.publicClient.getGasPrice();
        blockNumber = await this.clients.publicClient.getBlockNumber();
      } catch {
        // stub fallback
      }
    }

    // Tangent: gas price relative to a 10 gwei baseline
    const baselineGwei = 10_000_000_000n;
    const tangentRaw = gasPrice > 0n ? Number(gasPrice) / Number(baselineGwei) : 1;
    const tangent = Math.min(1, tangentRaw / 10); // normalise to [0,1]

    // Sine: stub — in production, count surplus-pulse txs to mesh nodes
    const sine = 0.3;

    // Cosine: stub — in production, measure channel graph coverage vs mesh edges
    const cosine = 0.4;

    return {
      scarcity_id: `chain_ethereum_${windowStart}_${windowEnd}`.replace(/-/g, ""),
      class: "chain",
      chain_ref: "ethereum",
      geography: this.config.geography,
      window: { start: windowStart, end: windowEnd },
      rotor: {
        sine: { score: sine, sources: ["stub — connect mesh tx graph"] },
        cosine: { score: cosine, sources: ["stub — connect mesh edge graph"] },
        tangent: { score: Math.min(1, Math.max(0, tangent)), sources: [`eth_gasPrice: ${gasPrice.toString()} wei`] },
      },
      confidence: gasPrice > 0n ? 0.65 : 0.2,
      refresh_rule: "per_checkpoint_window",
    };
  }

  async substrateSnapshot(): Promise<SubstrateChainPatch> {
    const balance = await this.getBalance();
    const hasBalance = balance > 0n;
    return {
      u8_consent_state: 1,
      u9_scarcity_class_linkage: "chain_ethereum",
      u10_rotor_target_linkage: "cosine",
      u11_transformation_state_linkage: hasBalance ? 0.5 : 0,
      u12_checkpoint_participation_state: 0,
      theta_boundary_phase: hasBalance ? 0.7 : 0.1,
    };
  }
}
