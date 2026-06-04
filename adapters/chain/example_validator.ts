/**
 * Pulser Mesh — T3 Validator + Cross-Reference Example
 *
 * Spins up three T3 validator nodes sharing the same registry,
 * loads a sample subgraph into each, runs independent checkpoints,
 * then cross-references results to detect interference patterns.
 *
 * Run:
 *   npx ts-node adapters/chain/example_validator.ts
 */

import { EthereumAdapter } from "./EthereumAdapter.js";
import { T3ValidatorNode } from "./T3ValidatorNode.js";
import { T3SubgraphRegistry, InMemoryBackend } from "./T3SubgraphRegistry.js";
import { T3CrossReference } from "./T3CrossReference.js";
import type { T3Subgraph } from "./T3ValidatorNode.js";

// ─── Shared infrastructure ─────────────────────────────────────────────────────────

const registry = new T3SubgraphRegistry(new InMemoryBackend());
const xref = new T3CrossReference(registry, { quorum_min: 2, destructive_flag_threshold: 0.35 });

// Shared Anvil chain adapter (single local node for the example)
const sharedEth = new EthereumAdapter({
  rpcUrl: "http://localhost:8545",
  privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  chainId: 31337,
  geography: { name: "Fremantle", type: "local_government_area", country: "AU" },
});

// ─── Sample subgraph ─────────────────────────────────────────────────────────────

const WINDOW = { start: "2026-04-01", end: "2026-06-30" };

const BASE_SUBGRAPH: T3Subgraph = {
  subgraph_id: "sg_fremantle_2026_q2",
  geography: "Fremantle",
  window: WINDOW,
  nodes: [
    { node_id: "node_A", xi: 0.82, geography: "Fremantle", mission_class: "food", mission_rotor_target: "sine", embedding_depth: 0.7, consent_state: 1 },
    { node_id: "node_B", xi: 0.76, geography: "Fremantle", mission_class: "food", mission_rotor_target: "cosine", embedding_depth: 0.6, consent_state: 1 },
    { node_id: "node_C", xi: 0.65, geography: "Fremantle", mission_class: "chain", mission_rotor_target: "tangent", embedding_depth: 0.5, consent_state: 1 },
  ],
  edges: [
    { edge_id: "e1", from: "node_A", to: "node_B", type: "supply", value: 400, unit: "AUD", timestamp: "2026-05-10T10:00:00Z", consent_given: true },
    { edge_id: "e2", from: "node_B", to: "node_C", type: "trade",  value: 250, unit: "AUD", timestamp: "2026-05-15T14:00:00Z", consent_given: true },
    { edge_id: "e3", from: "node_C", to: "node_A", type: "favor",  value: 100, unit: "AUD", timestamp: "2026-05-20T09:00:00Z", consent_given: true },
    { edge_id: "e4", from: "node_A", to: "node_C", type: "supply", value: 180, unit: "AUD", timestamp: "2026-06-01T11:00:00Z", consent_given: true },
  ],
  scarcity_records: [
    {
      scarcity_id: "food_fremantle_2026_q2",
      class: "food",
      rotor: { sine: 0.57, cosine: 0.44, tangent: 0.62 },
      confidence: 0.79,
      window: WINDOW,
    },
  ],
  prior_state_root: "0x00000000",
};

// Validator 2 sees a slightly different view (e.g. has one extra edge)
const SUBGRAPH_V2: T3Subgraph = {
  ...BASE_SUBGRAPH,
  subgraph_id: "sg_fremantle_2026_q2_v2",
  edges: [
    ...BASE_SUBGRAPH.edges,
    { edge_id: "e5", from: "node_B", to: "node_A", type: "care", value: 60, unit: "hours", timestamp: "2026-06-10T08:00:00Z", consent_given: true },
  ],
};

// Validator 3 has a suspicious wash loop to test flagging
const SUBGRAPH_V3_SUSPICIOUS: T3Subgraph = {
  ...BASE_SUBGRAPH,
  subgraph_id: "sg_fremantle_2026_q2_v3",
  edges: [
    { edge_id: "e1",  from: "node_A", to: "node_B", type: "trade", value: 1000, unit: "AUD", timestamp: "2026-05-10T10:00:00Z", consent_given: true },
    { edge_id: "e1r", from: "node_B", to: "node_A", type: "trade", value: 990,  unit: "AUD", timestamp: "2026-05-10T10:01:00Z", consent_given: true },
    { edge_id: "e2",  from: "node_A", to: "node_C", type: "trade", value: 100,  unit: "AUD", timestamp: "2026-05-15T10:00:00Z", consent_given: true },
  ],
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Pulser Mesh — T3 Validator + Cross-Reference Example ===");

  await sharedEth.init();

  // ── Create three T3 validator nodes ────────────────────────────────────────────
  const v1 = new T3ValidatorNode({ validator_id: "v1_fremantle", anchor_on_chain: false }, sharedEth);
  const v2 = new T3ValidatorNode({ validator_id: "v2_fremantle", anchor_on_chain: false }, sharedEth);
  const v3 = new T3ValidatorNode({ validator_id: "v3_suspicious", anchor_on_chain: false }, sharedEth);

  // ── Load subgraphs ─────────────────────────────────────────────────────────────
  v1.loadSubgraph(BASE_SUBGRAPH);
  v2.loadSubgraph(SUBGRAPH_V2);
  v3.loadSubgraph(SUBGRAPH_V3_SUSPICIOUS);

  // ── Run independent checkpoints ─────────────────────────────────────────────
  console.log("\n[V1] Running checkpoint...");
  const r1 = await v1.runCheckpoint();
  console.log(`[V1] Outcome: ${r1.outcome} | surplus: ${r1.adjusted_surplus.toFixed(2)} | constructive: ${r1.constructive_score.toFixed(3)}`);

  console.log("\n[V2] Running checkpoint...");
  const r2 = await v2.runCheckpoint();
  console.log(`[V2] Outcome: ${r2.outcome} | surplus: ${r2.adjusted_surplus.toFixed(2)} | constructive: ${r2.constructive_score.toFixed(3)}`);

  console.log("\n[V3] Running checkpoint (suspicious subgraph)...");
  const r3 = await v3.runCheckpoint();
  console.log(`[V3] Outcome: ${r3.outcome} | surplus: ${r3.adjusted_surplus.toFixed(2)} | destructive: ${r3.destructive_score.toFixed(3)}`);

  // ── Publish to registry ─────────────────────────────────────────────────────────
  await registry.publish(r1);
  await registry.publish(r2);
  await registry.publish(r3);
  console.log("\n[Registry] 3 results published.");

  // ── Cross-reference ───────────────────────────────────────────────────────────
  console.log("\n[XRef] Cross-referencing...");
  const report = await xref.crossReference(WINDOW.start);

  console.log(`[XRef] Validators : ${report.validators.join(", ")}`);
  console.log(`[XRef] Quorum outcome  : ${report.quorum_outcome}`);
  console.log(`[XRef] Quorum surplus  : ${report.quorum_surplus.toFixed(2)}`);
  console.log(`[XRef] Constructive    : ${report.quorum_constructive.toFixed(3)}`);
  console.log(`[XRef] Destructive     : ${report.quorum_destructive.toFixed(3)}`);

  if (report.flagged_pairs.length > 0) {
    console.log(`\n[XRef] ⚠️  ${report.flagged_pairs.length} flagged pair(s):`);
    for (const p of report.flagged_pairs) {
      console.log(`  ${p.validator_a} ↔ ${p.validator_b}: destructive=${p.destructive.toFixed(3)}, surplus_delta=${p.surplus_delta.toFixed(2)}, outcome_match=${p.outcome_match}`);
    }
  }

  if (report.divergent_validators.length > 0) {
    console.log(`\n[XRef] ❌ Divergent validators: ${report.divergent_validators.join(", ")}`);
  } else {
    console.log("\n[XRef] ✓ No divergent validators detected.");
  }

  console.log("\n=== Done ===");
}

main().catch(console.error);
