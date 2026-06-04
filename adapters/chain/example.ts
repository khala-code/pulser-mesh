/**
 * Pulser Mesh — Chain Adapter Usage Example
 *
 * Demonstrates how to wire up Bitcoin and Ethereum adapters,
 * run a surplus-pulse settlement, anchor a checkpoint commitment,
 * and read back rotor scores.
 *
 * Run (after installing deps):
 *   npx ts-node adapters/chain/example.ts
 *
 * Dependencies:
 *   npm install viem           # Ethereum adapter
 *   npm install bitcoinjs-lib  # Bitcoin on-chain (optional for Lightning-only)
 */

import { BitcoinAdapter } from "./BitcoinAdapter.js";
import { EthereumAdapter } from "./EthereumAdapter.js";
import type { VortexMeta } from "./types.js";

// ─── Config ───────────────────────────────────────────────────────────────────
// Replace these with real values. Never commit private keys to version control.

const BTC_CONFIG = {
  lndRestUrl: "https://localhost:8080",
  macaroon: "YOUR_LND_MACAROON_HEX",
  network: "testnet" as const,
  geography: { name: "Fremantle", type: "local_government_area", country: "AU" },
};

const ETH_CONFIG = {
  rpcUrl: "http://localhost:8545",          // Anvil local node
  privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Anvil default key
  chainId: 31337,                           // local Anvil
  geography: { name: "Fremantle", type: "local_government_area", country: "AU" },
};

// ─── Example vortex metadata ─────────────────────────────────────────────────

const VORTEX_META: VortexMeta = {
  node_id: "node_fremantle_001",
  window_id: "2026_q2",
  projection_commitment: "0xabc1230000000000000000000000000000000000000000000000000000000000",
  pulse_sequence: 1,
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Pulser Mesh — Chain Adapter Example ===");

  // ── Bitcoin ────────────────────────────────────────────────────────────────
  console.log("\n[BTC] Initialising...");
  const btc = await new BitcoinAdapter(BTC_CONFIG).init();

  const btcAddress = await btc.getAddress();
  const btcBalance = await btc.getBalance();
  console.log(`[BTC] Address : ${btcAddress}`);
  console.log(`[BTC] Balance : ${btcBalance} sats`);

  // Subscribe to incoming payments
  const unsub = btc.onIncoming((event) => {
    console.log("[BTC] Incoming payment:", event);
  });

  // Settle a surplus pulse (Lightning invoice or on-chain address)
  const btcTx = await btc.settle(
    "lntb10u1stub_invoice",  // replace with a real Lightning invoice
    10_000n,                 // 10,000 satoshis
    VORTEX_META
  );
  console.log("[BTC] Settle result:", btcTx);

  // Anchor substrate commitment for this checkpoint window
  const btcAnchor = await btc.anchorCommitment(
    VORTEX_META.projection_commitment,
    VORTEX_META.window_id
  );
  console.log("[BTC] Anchor result:", btcAnchor);

  // Rotor measurement
  const btcRotor = await btc.measureRotor("2026-04-01", "2026-06-30");
  console.log("[BTC] Rotor:", JSON.stringify(btcRotor.rotor, null, 2));

  // Substrate patch
  const btcPatch = await btc.substrateSnapshot();
  console.log("[BTC] Substrate patch:", btcPatch);

  unsub();

  // ── Ethereum ───────────────────────────────────────────────────────────────
  console.log("\n[ETH] Initialising...");
  const eth = await new EthereumAdapter(ETH_CONFIG).init();

  const ethAddress = await eth.getAddress();
  const ethBalance = await eth.getBalance();
  console.log(`[ETH] Address : ${ethAddress}`);
  console.log(`[ETH] Balance : ${ethBalance} wei`);

  // Settle a surplus pulse
  const ethTx = await eth.settle(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // replace with real recipient
    1_000_000_000_000_000n,                       // 0.001 ETH in wei
    VORTEX_META
  );
  console.log("[ETH] Settle result:", ethTx);

  // Anchor commitment (calldata path — no contract needed)
  const ethAnchor = await eth.anchorCommitment(
    VORTEX_META.projection_commitment,
    VORTEX_META.window_id
  );
  console.log("[ETH] Anchor result:", ethAnchor);

  // Rotor measurement
  const ethRotor = await eth.measureRotor("2026-04-01", "2026-06-30");
  console.log("[ETH] Rotor:", JSON.stringify(ethRotor.rotor, null, 2));

  // Decode metadata from a raw calldata string
  const encoded = eth.encodeVortexMeta(VORTEX_META);
  const decoded = eth.decodeVortexMeta(encoded);
  console.log("[ETH] Encode/decode roundtrip:", decoded);

  console.log("\n=== Done ===");
}

main().catch(console.error);
