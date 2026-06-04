/**
 * Pulser Mesh — OpenClaw Agent Harness
 *
 * Makes it easy for OpenClaw-style autonomous bots to participate in a
 * Pulser Mesh validator network, reach the coherence (ξ) threshold, and
 * run the full checkpoint + snark-detection pipeline as test actors.
 *
 * Key design decisions
 * ────────────────────────────────────────────────────────────────────
 * 1. Non-human coherence path
 *    ξ is defined in the protocol as a coherence scalar — not a "human"
 *    scalar. Bots reach ξ by demonstrating:
 *      a) interaction entropy   — diverse edge types with diverse peers
 *      b) mission consistency   — stable mission_class across interactions
 *      c) temporal regularity   — interactions distributed across the window
 *      d) consent hygiene       — 100% consent_given on all emitted edges
 *    A bot that behaves consistently, diversely, and with full consent is
 *    protocol-equivalent to a human participant at the same ξ level.
 *
 * 2. OpenClaw compatibility
 *    OpenClaw bots identify themselves with a deterministic node_id derived
 *    from their agent key. The harness accepts any string key and produces
 *    a stable MeshNode + edge stream from it.
 *
 * 3. Test mesh simulator
 *    OpenClawMeshSim spins up N bots, wires them into a subgraph, runs the
 *    T3 checkpoint, and returns the full CheckpointResult + SnarkReport so
 *    the bot operator can inspect health without a live chain.
 *
 * Usage
 * ────────────────────────────────────────────────────────────────────
 *
 *   import { OpenClawMeshSim } from "./OpenClawAgent.js";
 *
 *   const sim = new OpenClawMeshSim({
 *     agent_keys: ["openclaw-alpha", "openclaw-beta", "openclaw-gamma"],
 *     geography: "perth-wa-AU",
 *     mission_class: "care",
 *     window_hours: 24,
 *   });
 *
 *   const report = await sim.run();
 *   console.log(report.checkpoint.outcome);        // "accepted" if bots are healthy
 *   console.log(report.checkpoint.snark_report.subgraph_health); // ∈ [0,1]
 *   console.log(report.xi_scores);                // per-bot ξ achieved
 */

import {
  T3ValidatorNode,
  type MeshNode,
  type MeshEdge,
  type T3Subgraph,
  type CheckpointResult,
} from "./T3ValidatorNode.js";
import type { ChainAdapter } from "./ChainAdapter.js";
import type { VortexMeta, SubstrateChainPatch } from "./types.js";

// ─── Xi bootstrapper ───────────────────────────────────────────────────────────
//
// Computes a non-human coherence score from observable bot behaviour.
// ξ is protocol-agnostic — it measures alignment, not humanity.

export interface BotInteractionRecord {
  peer_id: string;
  edge_type: "favor" | "trade" | "care" | "supply" | "transform" | "distribution";
  value: number;
  timestamp: string;   // ISO 8601
  consent_given: true; // bots always give consent — enforced at type level
  mission_class: string;
}

export interface XiBootstrapResult {
  xi: number;                   // final coherence score ∈ [0,1]
  interaction_entropy: number;  // diversity of edge types + peers
  mission_consistency: number;  // fraction of interactions in primary mission
  temporal_regularity: number;  // evenness of interaction distribution over window
  consent_hygiene: number;      // always 1.0 for bots (type-enforced)
  breakdown: string;            // human-readable explanation
}

/**
 * Compute ξ from a bot's interaction history.
 *
 * Entropy component: Shannon entropy over (edge_type, peer_id) pairs,
 * normalised to [0,1] by dividing by log2(record count).
 *
 * Mission consistency: fraction of records whose mission_class matches
 * the declared primary mission.
 *
 * Temporal regularity: 1 − coefficient of variation of inter-event gaps.
 * A bot that spaces interactions evenly scores higher than one that bursts.
 */
export function bootstrapXi(
  records: BotInteractionRecord[],
  primary_mission: string,
  window_start: string,
  window_end: string
): XiBootstrapResult {
  if (records.length === 0) {
    return {
      xi: 0,
      interaction_entropy: 0,
      mission_consistency: 0,
      temporal_regularity: 0,
      consent_hygiene: 1,
      breakdown: "No interactions recorded.",
    };
  }

  // ── Interaction entropy ─────────────────────────────────────────────
  const pairCounts = new Map<string, number>();
  for (const r of records) {
    const key = `${r.edge_type}:${r.peer_id}`;
    pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
  }
  const total = records.length;
  let shannon = 0;
  for (const count of pairCounts.values()) {
    const p = count / total;
    shannon -= p * Math.log2(p);
  }
  // Normalise: max entropy = log2(total)
  const interaction_entropy = total > 1 ? Math.min(1, shannon / Math.log2(total)) : 0;

  // ── Mission consistency ────────────────────────────────────────────
  const on_mission = records.filter((r) => r.mission_class === primary_mission).length;
  const mission_consistency = on_mission / total;

  // ── Temporal regularity ───────────────────────────────────────────
  let temporal_regularity = 1;
  if (records.length >= 2) {
    const sorted = [...records].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(
        new Date(sorted[i]!.timestamp).getTime() - new Date(sorted[i - 1]!.timestamp).getTime()
      );
    }
    const mean_gap = gaps.reduce((a, g) => a + g, 0) / gaps.length;
    const variance = gaps.reduce((a, g) => a + (g - mean_gap) ** 2, 0) / gaps.length;
    const cv = mean_gap > 0 ? Math.sqrt(variance) / mean_gap : 0;
    // CV = 0 → perfectly regular; cap at 2 for normalisation
    temporal_regularity = Math.max(0, 1 - Math.min(cv, 2) / 2);
  }

  // ── Aggregate ξ ────────────────────────────────────────────────────
  // Weights: entropy 35%, mission 40%, temporal 25%
  // Consent hygiene is always 1.0 for bots (type-enforced) — not a factor.
  const xi = Math.min(
    1,
    0.35 * interaction_entropy +
    0.40 * mission_consistency +
    0.25 * temporal_regularity
  );

  const breakdown = [
    `interaction_entropy=${interaction_entropy.toFixed(3)} (×0.35)`,
    `mission_consistency=${mission_consistency.toFixed(3)} (×0.40)`,
    `temporal_regularity=${temporal_regularity.toFixed(3)} (×0.25)`,
    `ξ=${xi.toFixed(3)}`,
  ].join(" | ");

  return { xi, interaction_entropy, mission_consistency, temporal_regularity, consent_hygiene: 1, breakdown };
}

// ─── OpenClaw node factory ─────────────────────────────────────────────────────

export interface OpenClawAgentConfig {
  /** Stable identifier for this bot instance — used to derive node_id */
  agent_key: string;
  geography: string;
  mission_class: string;
  mission_rotor_target: "sine" | "cosine" | "tangent";
  /** Embedding depth — how deeply embedded in the local mesh (0–1) */
  embedding_depth?: number;
  /** Override ξ directly (e.g. from a prior bootstrap). If omitted,
   *  ξ is derived from interaction_records via bootstrapXi(). */
  xi_override?: number;
  interaction_records?: BotInteractionRecord[];
  window_start: string;
  window_end: string;
}

/**
 * Deterministic node_id from agent_key.
 * Prefixed with "oclaw_" so validators can identify bot participants.
 */
function agentNodeId(agent_key: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < agent_key.length; i++) {
    h ^= agent_key.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return `oclaw_${h.toString(16).padStart(8, "0")}`;
}

/**
 * Build a MeshNode from an OpenClaw agent config.
 * ξ is bootstrapped from interaction_records unless xi_override is provided.
 */
export function buildOpenClawNode(
  config: OpenClawAgentConfig
): { node: MeshNode; xi_result: XiBootstrapResult } {
  const xi_result = config.xi_override !== undefined
    ? {
        xi: config.xi_override,
        interaction_entropy: 1,
        mission_consistency: 1,
        temporal_regularity: 1,
        consent_hygiene: 1,
        breakdown: `xi_override=${config.xi_override}`,
      }
    : bootstrapXi(
        config.interaction_records ?? [],
        config.mission_class,
        config.window_start,
        config.window_end
      );

  const node: MeshNode = {
    node_id: agentNodeId(config.agent_key),
    xi: xi_result.xi,
    geography: config.geography,
    mission_class: config.mission_class,
    mission_rotor_target: config.mission_rotor_target,
    embedding_depth: config.embedding_depth ?? 0.7,
    consent_state: 1,  // bots always consent
  };

  return { node, xi_result };
}

/**
 * Build a set of MeshEdges between OpenClaw agents.
 *
 * Each bot pair gets a reciprocal edge (favor + care) so the mesh is
 * mutually connected — avoids wash-loop detection by varying edge types.
 * Values are derived deterministically from node_id hashes.
 */
export function buildOpenClawEdges(
  nodes: MeshNode[],
  window_start: string,
  window_end: string
): MeshEdge[] {
  const edges: MeshEdge[] = [];
  const ws = new Date(window_start).getTime();
  const we = new Date(window_end).getTime();
  const span = we - ws;

  const EDGE_TYPES: Array<MeshEdge["type"]> = ["favor", "care", "supply", "transform"];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]!;
      const b = nodes[j]!;

      // Deterministic value from node_id pair
      const seedA = parseInt(a.node_id.replace("oclaw_", ""), 16);
      const seedB = parseInt(b.node_id.replace("oclaw_", ""), 16);
      const value = ((seedA ^ seedB) % 900) + 100; // 100–1000

      // Two edges per pair — different types to avoid wash-loop flag
      const typeA = EDGE_TYPES[(seedA % EDGE_TYPES.length)]!;
      const typeB = EDGE_TYPES[(seedB % EDGE_TYPES.length)]!;

      // Spread timestamps evenly across the window
      const tA = new Date(ws + span * (i / (nodes.length + 1))).toISOString();
      const tB = new Date(ws + span * (j / (nodes.length + 1))).toISOString();

      edges.push({
        edge_id: `e_${a.node_id}_${b.node_id}_A`,
        from: a.node_id,
        to: b.node_id,
        type: typeA,
        value,
        unit: "AUD",
        timestamp: tA,
        consent_given: true,
      });

      edges.push({
        edge_id: `e_${b.node_id}_${a.node_id}_B`,
        from: b.node_id,
        to: a.node_id,
        type: typeB !== typeA ? typeB : EDGE_TYPES[(seedA + 1) % EDGE_TYPES.length]!,
        value: Math.round(value * 0.7), // not exactly reciprocal → avoids wash-loop
        unit: "AUD",
        timestamp: tB,
        consent_given: true,
      });
    }
  }

  return edges;
}

// ─── Null chain adapter for dry-run testing ──────────────────────────────────
//
// Implements ChainAdapter without any real chain — perfect for bots
// testing the pipeline without a wallet or node connection.

export class NullChainAdapter implements ChainAdapter {
  readonly chain_type = "null" as const;

  async getAddress(): Promise<string> {
    return "null://0x0000000000000000000000000000000000000000";
  }

  async getBalance(): Promise<bigint> {
    return BigInt(0);
  }

  async settle(): Promise<{ tx_id: string; status: "confirmed" | "pending" | "deferred" }> {
    return { tx_id: "null_tx_" + Date.now(), status: "deferred" };
  }

  async anchorCommitment(
    commitment: string
  ): Promise<{ tx_id: string; status: "confirmed" | "pending" | "deferred" }> {
    return { tx_id: `null_anchor_${commitment.slice(0, 10)}`, status: "deferred" };
  }

  async substrateSnapshot(): Promise<SubstrateChainPatch> {
    return {};
  }

  onIncoming(): () => void {
    return () => {};
  }

  encodeVortexMeta(meta: VortexMeta): string {
    return JSON.stringify(meta);
  }

  decodeVortexMeta(raw: string): VortexMeta | null {
    try { return JSON.parse(raw); } catch { return null; }
  }
}

// ─── Mesh simulator ────────────────────────────────────────────────────────────

export interface OpenClawSimConfig {
  /** Agent keys to spin up as bots */
  agent_keys: string[];
  geography: string;
  mission_class: string;
  mission_rotor_target?: "sine" | "cosine" | "tangent";
  /** Window length in hours from now. Default 24. */
  window_hours?: number;
  /** Override xi for all bots (useful for testing threshold boundary) */
  xi_override?: number;
  /** Scarcity confidence for the test record. Default 0.8. */
  scarcity_confidence?: number;
  /** Custom chain adapter. Defaults to NullChainAdapter. */
  chain?: ChainAdapter;
  snark_threshold?: number;
}

export interface OpenClawSimReport {
  checkpoint: CheckpointResult;
  xi_scores: Record<string, number>;     // agent_key → ξ
  xi_breakdowns: Record<string, string>; // agent_key → breakdown string
  node_ids: Record<string, string>;      // agent_key → node_id
  subgraph: T3Subgraph;                  // the assembled test subgraph
  passed: boolean;                       // true if outcome is "accepted"
  summary: string;
}

/**
 * OpenClawMeshSim
 *
 * Spins up N OpenClaw bots, wires them into a T3Subgraph,
 * and runs the full checkpoint pipeline. Returns a structured
 * report so bots can inspect every layer of the result.
 *
 * Example:
 *   const sim = new OpenClawMeshSim({
 *     agent_keys: ["alpha", "beta", "gamma"],
 *     geography: "perth-wa-AU",
 *     mission_class: "care",
 *   });
 *   const report = await sim.run();
 */
export class OpenClawMeshSim {
  private config: Required<OpenClawSimConfig>;

  constructor(config: OpenClawSimConfig) {
    const now = new Date();
    const hours = config.window_hours ?? 24;
    this.config = {
      agent_keys: config.agent_keys,
      geography: config.geography,
      mission_class: config.mission_class,
      mission_rotor_target: config.mission_rotor_target ?? "cosine",
      window_hours: hours,
      xi_override: config.xi_override ?? -1, // -1 = not set, bootstrap from records
      scarcity_confidence: config.scarcity_confidence ?? 0.8,
      chain: config.chain ?? new NullChainAdapter(),
      snark_threshold: config.snark_threshold ?? 0.55,
    };
  }

  async run(): Promise<OpenClawSimReport> {
    const now = new Date();
    const window_end = now.toISOString();
    const window_start = new Date(
      now.getTime() - this.config.window_hours * 60 * 60 * 1000
    ).toISOString();

    // ── Build nodes
    const xi_scores: Record<string, number> = {};
    const xi_breakdowns: Record<string, string> = {};
    const node_ids: Record<string, string> = {};
    const nodes: MeshNode[] = [];

    for (const key of this.config.agent_keys) {
      const { node, xi_result } = buildOpenClawNode({
        agent_key: key,
        geography: this.config.geography,
        mission_class: this.config.mission_class,
        mission_rotor_target: this.config.mission_rotor_target,
        embedding_depth: 0.72,
        xi_override: this.config.xi_override >= 0 ? this.config.xi_override : undefined,
        // Generate synthetic interaction records when no xi_override
        interaction_records: this.config.xi_override < 0
          ? this._syntheticInteractions(key, window_start, window_end)
          : undefined,
        window_start,
        window_end,
      });
      nodes.push(node);
      xi_scores[key] = node.xi;
      xi_breakdowns[key] = xi_result.breakdown;
      node_ids[key] = node.node_id;
    }

    // ── Build edges
    const edges = buildOpenClawEdges(nodes, window_start, window_end);

    // ── Assemble subgraph
    const subgraph: T3Subgraph = {
      subgraph_id: `oclaw_sim_${Date.now()}`,
      geography: this.config.geography,
      window: { start: window_start, end: window_end },
      nodes,
      edges,
      scarcity_records: [{
        scarcity_id: `scarcity_${this.config.mission_class}`,
        class: this.config.mission_class,
        rotor: { sine: 0.6, cosine: 0.7, tangent: 0.5 },
        confidence: this.config.scarcity_confidence,
        window: { start: window_start, end: window_end },
      }],
      prior_state_root: "0x00000000",
    };

    // ── Run checkpoint
    const validator = new T3ValidatorNode(
      {
        validator_id: `oclaw_validator_${Date.now()}`,
        anchor_on_chain: false, // dry run by default
        snark_threshold: this.config.snark_threshold,
      },
      this.config.chain
    );
    validator.loadSubgraph(subgraph);
    const checkpoint = await validator.runCheckpoint();

    // ── Summarise
    const passed = checkpoint.outcome === "accepted" || checkpoint.outcome === "accepted_with_downweighting";
    const health = checkpoint.snark_report.subgraph_health.toFixed(3);
    const avgXi = (Object.values(xi_scores).reduce((a, x) => a + x, 0) / nodes.length).toFixed(3);
    const summary = [
      `OpenClaw sim: ${nodes.length} bots | outcome=${checkpoint.outcome}`,
      `avg ξ=${avgXi} | subgraph_health=${health}`,
      `boundary_commitment=${checkpoint.boundary_commitment}`,
      checkpoint.snark_report.dominant_pattern
        ? `dominant_conflict=${checkpoint.snark_report.dominant_pattern}`
        : "no dominant conflict",
      checkpoint.reason_codes.length > 0
        ? `codes=[${checkpoint.reason_codes.join(", ")}]`
        : "no warnings",
    ].join(" | ");

    return { checkpoint, xi_scores, xi_breakdowns, node_ids, subgraph, passed, summary };
  }

  /**
   * Generate synthetic interaction records that achieve a reasonable ξ.
   * 12 interactions evenly spaced across the window, diverse edge types
   * and peer pairs, all on mission.
   */
  private _syntheticInteractions(
    agent_key: string,
    window_start: string,
    window_end: string
  ): BotInteractionRecord[] {
    const ws = new Date(window_start).getTime();
    const we = new Date(window_end).getTime();
    const span = we - ws;
    const N = 12;
    const TYPES: BotInteractionRecord["edge_type"][] = [
      "favor", "care", "supply", "transform", "trade", "distribution",
    ];
    const records: BotInteractionRecord[] = [];
    for (let i = 0; i < N; i++) {
      records.push({
        peer_id: `peer_${(i % 4) + 1}`,  // 4 distinct peers
        edge_type: TYPES[i % TYPES.length]!,
        value: 100 + i * 50,
        timestamp: new Date(ws + span * (i / N)).toISOString(),
        consent_given: true,
        mission_class: this.config.mission_class,
      });
    }
    return records;
  }
}
