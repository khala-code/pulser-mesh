/**
 * Pulser Mesh — T3 Validator Node
 *
 * A T3 validator node operates at the impersonal market/firm layer (T3).
 * It runs a local subgraph, executes the 8-stage checkpoint pipeline against
 * that subgraph, and publishes its checkpoint result so other T3 nodes can
 * cross-reference it.
 *
 * Architecture:
 *   T3ValidatorNode
 *     ├─ owns a ChainAdapter (BTC or ETH) for settlement + proof anchoring
 *     ├─ maintains a local T3Subgraph (nodes + edges + scarcity records)
 *     ├─ runs the checkpoint pipeline on demand
 *     └─ registers itself with T3SubgraphRegistry for cross-referencing
 *
 * Cross-referencing:
 *   After a checkpoint, the node publishes its CheckpointResult to the
 *   registry. Other T3 nodes pull peer results, compare constructive/
 *   destructive interference scores, and flag divergences.
 */

import type { ChainAdapter } from "./ChainAdapter.js";
import type { VortexMeta, SubstrateChainPatch } from "./types.js";

// ─── Domain types ──────────────────────────────────────────────────────────────

export type NodeId = string;
export type EdgeType = "favor" | "trade" | "care" | "supply" | "transform" | "distribution";
export type CheckpointOutcome = "accepted" | "accepted_with_downweighting" | "flagged_for_review" | "rejected";

export interface MeshNode {
  node_id: NodeId;
  xi: number;           // coherence [0,1]
  geography: string;    // osm ref or name
  mission_class: string; // e.g. "food", "care", "chain"
  mission_rotor_target: "sine" | "cosine" | "tangent";
  embedding_depth: number; // u4 [0,1]
  consent_state: 1 | 0;
}

export interface MeshEdge {
  edge_id: string;
  from: NodeId;
  to: NodeId;
  type: EdgeType;
  value: number;        // non-negative, typed by unit
  unit: string;         // e.g. "AUD", "sats", "wei", "kg", "hours"
  timestamp: string;    // ISO 8601
  consent_given: boolean;
}

export interface ScarcityRecord {
  scarcity_id: string;
  class: string;
  rotor: { sine: number; cosine: number; tangent: number };
  confidence: number;
  window: { start: string; end: string };
}

export interface T3Subgraph {
  subgraph_id: string;
  geography: string;
  window: { start: string; end: string };
  nodes: MeshNode[];
  edges: MeshEdge[];
  scarcity_records: ScarcityRecord[];
  prior_state_root: string;
}

// ─── Checkpoint result ─────────────────────────────────────────────────────────

export interface GraphShapeMetrics {
  cr1: number;              // concentration ratio of most central node
  diversity_min: number;    // minimum distinct counterparties across nodes
  wash_loop_score: number;  // circular flow suspicion [0,1]
  locality_ratio: number;   // fraction of edges within declared geography
  bottleneck_score: number; // apex capture [0,1]
}

export interface ScarcityAlignmentResult {
  aligned: boolean;
  rotor_channel: "sine" | "cosine" | "tangent" | null;
  direction_consistent: boolean;
  attribution_confidence: number;
  failure_codes: string[];
}

export interface CheckpointResult {
  checkpoint_id: string;
  validator_id: string;
  subgraph_id: string;
  window: { start: string; end: string };
  outcome: CheckpointOutcome;
  reason_codes: string[];
  graph_metrics: GraphShapeMetrics;
  scarcity_alignment: ScarcityAlignmentResult;
  downweight_factor: number;      // W in [0,1]
  validated_surplus: number;      // Sigma_v
  adjusted_surplus: number;       // Sigma_v_adj = W * Sigma_v
  payout_split: {
    reserve_buffer: number;       // 20%
    maintenance: number;          // 5%
    dividend_pool: number;        // 60%
    local_reinvestment: number;   // 15%
  };
  state_root: string;             // hash of accepted state
  substrate_patch: SubstrateChainPatch;
  anchored_on_chain: boolean;
  chain_tx_id?: string;
  timestamp: number;
  // Interference scores for cross-referencing
  constructive_score: number;     // alignment with constraint surfaces [0,1]
  destructive_score: number;      // cancellation against constraints [0,1]
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface T3ValidatorConfig {
  validator_id: string;
  xi_min: number;             // coherence floor, e.g. 0.5
  cr1_max: number;            // max concentration ratio, e.g. 0.35
  cr1_warn: number;           // warn threshold, e.g. 0.25
  diversity_k: number;        // min counterparties, e.g. 2
  wash_loop_max: number;      // hard cap, e.g. 0.6
  locality_min: number;       // min local edge ratio, e.g. 0.4
  bottleneck_max: number;     // hard cap, e.g. 0.5
  confidence_min: number;     // min scarcity confidence, e.g. 0.5
  anchor_on_chain: boolean;   // whether to anchor commitment on-chain at checkpoint
}

const DEFAULT_CONFIG: Omit<T3ValidatorConfig, "validator_id"> = {
  xi_min: 0.5,
  cr1_max: 0.35,
  cr1_warn: 0.25,
  diversity_k: 2,
  wash_loop_max: 0.6,
  locality_min: 0.4,
  bottleneck_max: 0.5,
  confidence_min: 0.5,
  anchor_on_chain: true,
};

// ─── Utility ─────────────────────────────────────────────────────────────────────

function simpleHash(input: string): string {
  // Deterministic non-cryptographic hash for state roots in v1.
  // Replace with sha256 in production.
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return "0x" + h.toString(16).padStart(8, "0");
}

function clamp(v: number, lo = 0, hi = 1): number {
  return Math.min(hi, Math.max(lo, v));
}

// ─── T3ValidatorNode ────────────────────────────────────────────────────────────

export class T3ValidatorNode {
  readonly validator_id: string;
  private config: T3ValidatorConfig;
  private chain: ChainAdapter;
  private subgraph: T3Subgraph | null = null;
  private lastResult: CheckpointResult | null = null;

  constructor(config: Partial<T3ValidatorConfig> & { validator_id: string }, chain: ChainAdapter) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.validator_id = config.validator_id;
    this.chain = chain;
  }

  // ── Subgraph management ────────────────────────────────────────────────

  /** Replace or set the local subgraph this validator runs against. */
  loadSubgraph(subgraph: T3Subgraph): void {
    this.subgraph = subgraph;
  }

  getSubgraph(): T3Subgraph | null {
    return this.subgraph;
  }

  getLastResult(): CheckpointResult | null {
    return this.lastResult;
  }

  // ── Checkpoint pipeline (8 stages) ─────────────────────────────────────

  async runCheckpoint(): Promise<CheckpointResult> {
    if (!this.subgraph) throw new Error("T3ValidatorNode: no subgraph loaded");
    const sg = this.subgraph;
    const reason_codes: string[] = [];

    // ── Stage 1: envelope validation
    if (!sg.geography) reason_codes.push("ERR_GEOGRAPHY_MISSING");
    if (!sg.window?.start || !sg.window?.end) reason_codes.push("ERR_WINDOW_INVALID");
    if (reason_codes.length > 0) return this._reject(reason_codes, sg);

    // ── Stage 2: entity screening — filter nodes by xi and consent
    const validNodes = sg.nodes.filter((n) => {
      if (n.xi < this.config.xi_min) { reason_codes.push(`ERR_XI_TOO_LOW:${n.node_id}`); return false; }
      if (!n.consent_state) { reason_codes.push(`ERR_CONSENT_MISSING:${n.node_id}`); return false; }
      if (!n.geography) { reason_codes.push(`ERR_GEOGRAPHY_MISSING:${n.node_id}`); return false; }
      if (!n.mission_class) { reason_codes.push(`ERR_MISSION_MISSING:${n.node_id}`); return false; }
      return true;
    });
    const validNodeIds = new Set(validNodes.map((n) => n.node_id));

    // ── Stage 3: edge screening
    const validEdges = sg.edges.filter((e) => {
      if (!validNodeIds.has(e.from) || !validNodeIds.has(e.to)) return false;
      if (!e.consent_given) { reason_codes.push(`ERR_CONSENT_MISSING:${e.edge_id}`); return false; }
      if (e.value < 0) { reason_codes.push(`ERR_EDGE_VALUE_INVALID:${e.edge_id}`); return false; }
      const ts = new Date(e.timestamp).getTime();
      const ws = new Date(sg.window.start).getTime();
      const we = new Date(sg.window.end).getTime();
      if (ts < ws || ts > we) { reason_codes.push(`ERR_EDGE_OUT_OF_WINDOW:${e.edge_id}`); return false; }
      return true;
    });

    // ── Stage 4: graph shape analysis
    const metrics = this._analyzeGraph(validNodes, validEdges, sg.geography);

    if (metrics.cr1 > this.config.cr1_max) {
      reason_codes.push("ERR_GRAPH_CONCENTRATION");
      return this._reject(reason_codes, sg, metrics);
    }
    if (metrics.wash_loop_score > this.config.wash_loop_max) {
      reason_codes.push("ERR_WASH_LOOP");
      return this._reject(reason_codes, sg, metrics);
    }
    if (metrics.locality_ratio < this.config.locality_min) {
      reason_codes.push("ERR_LOCALITY_TOO_LOW");
      return this._reject(reason_codes, sg, metrics);
    }
    if (metrics.bottleneck_score > this.config.bottleneck_max) {
      reason_codes.push("ERR_BOTTLENECK_APEX");
      return this._reject(reason_codes, sg, metrics);
    }

    // ── Stage 5: scarcity alignment
    const scarcityResult = this._evaluateScarcityAlignment(validNodes, validEdges, sg.scarcity_records);
    if (!scarcityResult.aligned) {
      reason_codes.push(...scarcityResult.failure_codes);
      return this._reject(reason_codes, sg, metrics, scarcityResult);
    }

    // ── Stage 6: surplus estimation
    const avgXi = validNodes.reduce((a, n) => a + n.xi, 0) / (validNodes.length || 1);
    const totalValue = validEdges.reduce((a, e) => a + e.value, 0);
    const scarcityLift = (
      (1 - sg.scarcity_records[0]?.rotor.sine ?? 0) +
      (1 - sg.scarcity_records[0]?.rotor.cosine ?? 0)
    ) / 2;
    const validated_surplus = totalValue * avgXi * scarcityLift * scarcityResult.attribution_confidence;

    // ── Stage 7: downweighting
    const W_q = clamp(metrics.locality_ratio);
    const W_xi = clamp(avgXi);
    const W_omega = clamp(sg.scarcity_records[0]?.confidence ?? 0.5);
    const W_A = clamp(scarcityResult.attribution_confidence);
    const W_G = clamp(1 - metrics.cr1);
    const downweight_factor = W_q * W_xi * W_omega * W_A * W_G;
    const adjusted_surplus = downweight_factor * validated_surplus;

    // Interference scores for cross-referencing (constructive = alignment, destructive = friction)
    const constructive_score = clamp((W_xi + W_omega + W_A) / 3);
    const destructive_score = clamp((metrics.cr1 + metrics.wash_loop_score + metrics.bottleneck_score) / 3);

    if (metrics.cr1 > this.config.cr1_warn) reason_codes.push("WARN_GRAPH_DOWNSCALED");
    if (metrics.diversity_min < this.config.diversity_k) reason_codes.push("WARN_LOW_DIVERSITY");

    // ── Stage 8: finalise
    const state_root = simpleHash(
      JSON.stringify({ validNodes, validEdges, validated_surplus, adjusted_surplus })
    );

    const substrate_patch = await this.chain.substrateSnapshot();
    substrate_patch.u12_checkpoint_participation_state = 1;
    substrate_patch.theta_boundary_phase = clamp(constructive_score);

    // Anchor on-chain if configured
    let anchored_on_chain = false;
    let chain_tx_id: string | undefined;
    if (this.config.anchor_on_chain) {
      try {
        const tx = await this.chain.anchorCommitment(state_root, sg.window.start);
        anchored_on_chain = tx.status !== "deferred";
        chain_tx_id = tx.tx_id;
      } catch (e) {
        reason_codes.push("WARN_ANCHOR_FAILED");
      }
    }

    const outcome: CheckpointOutcome =
      reason_codes.some((c) => c.startsWith("WARN")) && downweight_factor < 1
        ? "accepted_with_downweighting"
        : "accepted";

    const result: CheckpointResult = {
      checkpoint_id: `cp_${sg.window.start}_${this.validator_id}`,
      validator_id: this.validator_id,
      subgraph_id: sg.subgraph_id,
      window: sg.window,
      outcome,
      reason_codes,
      graph_metrics: metrics,
      scarcity_alignment: scarcityResult,
      downweight_factor,
      validated_surplus,
      adjusted_surplus,
      payout_split: {
        reserve_buffer: adjusted_surplus * 0.20,
        maintenance: adjusted_surplus * 0.05,
        dividend_pool: adjusted_surplus * 0.60,
        local_reinvestment: adjusted_surplus * 0.15,
      },
      state_root,
      substrate_patch,
      anchored_on_chain,
      chain_tx_id,
      timestamp: Date.now(),
      constructive_score,
      destructive_score,
    };

    this.lastResult = result;
    return result;
  }

  // ── Graph analysis (Stage 4) ─────────────────────────────────────────────

  private _analyzeGraph(
    nodes: MeshNode[],
    edges: MeshEdge[],
    geography: string
  ): GraphShapeMetrics {
    if (edges.length === 0) {
      return { cr1: 0, diversity_min: 0, wash_loop_score: 0, locality_ratio: 0, bottleneck_score: 0 };
    }

    // CR1: flow share of the most active node (by total edge value)
    const totalValue = edges.reduce((a, e) => a + e.value, 0);
    const nodeFlow = new Map<NodeId, number>();
    for (const e of edges) {
      nodeFlow.set(e.from, (nodeFlow.get(e.from) ?? 0) + e.value);
      nodeFlow.set(e.to, (nodeFlow.get(e.to) ?? 0) + e.value);
    }
    const maxFlow = Math.max(...nodeFlow.values());
    const cr1 = totalValue > 0 ? maxFlow / (totalValue * 2) : 0;

    // Diversity: min distinct counterparties per node
    const counterparties = new Map<NodeId, Set<NodeId>>();
    for (const e of edges) {
      if (!counterparties.has(e.from)) counterparties.set(e.from, new Set());
      if (!counterparties.has(e.to)) counterparties.set(e.to, new Set());
      counterparties.get(e.from)!.add(e.to);
      counterparties.get(e.to)!.add(e.from);
    }
    const diversity_min = nodes.length > 0
      ? Math.min(...nodes.map((n) => counterparties.get(n.node_id)?.size ?? 0))
      : 0;

    // Wash-loop score: ratio of reciprocal-pair value to total value
    const edgeMap = new Map<string, number>();
    for (const e of edges) edgeMap.set(`${e.from}->${e.to}`, (edgeMap.get(`${e.from}->${e.to}`) ?? 0) + e.value);
    let reciprocalValue = 0;
    for (const e of edges) {
      const reverse = edgeMap.get(`${e.to}->${e.from}`) ?? 0;
      if (reverse > 0) reciprocalValue += Math.min(e.value, reverse);
    }
    const wash_loop_score = totalValue > 0 ? clamp(reciprocalValue / totalValue) : 0;

    // Locality: fraction of edges whose both endpoints share the declared geography
    const localEdges = edges.filter((e) => {
      const fn = nodes.find((n) => n.node_id === e.from);
      const tn = nodes.find((n) => n.node_id === e.to);
      return fn?.geography === geography && tn?.geography === geography;
    });
    const locality_ratio = clamp(localEdges.length / edges.length);

    // Bottleneck: fraction of edges passing through the single highest-degree node
    const degree = new Map<NodeId, number>();
    for (const e of edges) {
      degree.set(e.from, (degree.get(e.from) ?? 0) + 1);
      degree.set(e.to, (degree.get(e.to) ?? 0) + 1);
    }
    const maxDegree = Math.max(...degree.values());
    const bottleneck_score = edges.length > 0 ? clamp(maxDegree / (edges.length * 2)) : 0;

    return { cr1, diversity_min, wash_loop_score, locality_ratio, bottleneck_score };
  }

  // ── Scarcity alignment (Stage 5) ─────────────────────────────────────────

  private _evaluateScarcityAlignment(
    nodes: MeshNode[],
    edges: MeshEdge[],
    records: ScarcityRecord[]
  ): ScarcityAlignmentResult {
    const failure_codes: string[] = [];

    if (records.length === 0) {
      failure_codes.push("ERR_SCHEMA_MISSING");
      return { aligned: false, rotor_channel: null, direction_consistent: false, attribution_confidence: 0, failure_codes };
    }

    const record = records[0]!;
    if (record.confidence < this.config.confidence_min) {
      failure_codes.push("ERR_CONFIDENCE_TOO_LOW");
      return { aligned: false, rotor_channel: null, direction_consistent: false, attribution_confidence: 0, failure_codes };
    }

    // Check node missions bind to the scarcity class
    const missionClasses = new Set(nodes.map((n) => n.mission_class));
    if (!missionClasses.has(record.class) && !missionClasses.has("chain")) {
      failure_codes.push("ERR_MISSION_CLASS_INVALID");
      return { aligned: false, rotor_channel: null, direction_consistent: false, attribution_confidence: 0, failure_codes };
    }

    // Determine primary rotor target from node missions
    const rotorTargets = nodes.map((n) => n.mission_rotor_target);
    const targetCounts = { sine: 0, cosine: 0, tangent: 0 };
    for (const t of rotorTargets) targetCounts[t]++;
    const primaryTarget = (Object.entries(targetCounts).sort((a, b) => b[1] - a[1])[0]![0]) as "sine" | "cosine" | "tangent";

    // Direction consistent: the rotor channel is actually elevated (scarcity present to reduce)
    const rotorScore = record.rotor[primaryTarget];
    const direction_consistent = rotorScore > 0.3;
    if (!direction_consistent) failure_codes.push("ERR_ROTOR_LINK_MISSING");

    // Attribution confidence: blend of record confidence + edge coverage
    const attribution_confidence = clamp(record.confidence * (direction_consistent ? 1 : 0.3));
    if (attribution_confidence < 0.2) failure_codes.push("ERR_ATTRIBUTION_WEAK");

    const aligned = failure_codes.length === 0;
    return { aligned, rotor_channel: primaryTarget, direction_consistent, attribution_confidence, failure_codes };
  }

  // ── Rejection helper ──────────────────────────────────────────────────────────

  private _reject(
    reason_codes: string[],
    sg: T3Subgraph,
    metrics?: GraphShapeMetrics,
    scarcity?: ScarcityAlignmentResult
  ): CheckpointResult {
    const empty_metrics: GraphShapeMetrics = { cr1: 0, diversity_min: 0, wash_loop_score: 0, locality_ratio: 0, bottleneck_score: 0 };
    const empty_scarcity: ScarcityAlignmentResult = { aligned: false, rotor_channel: null, direction_consistent: false, attribution_confidence: 0, failure_codes: reason_codes };
    const result: CheckpointResult = {
      checkpoint_id: `cp_${sg.window.start}_${this.validator_id}`,
      validator_id: this.validator_id,
      subgraph_id: sg.subgraph_id,
      window: sg.window,
      outcome: "rejected",
      reason_codes,
      graph_metrics: metrics ?? empty_metrics,
      scarcity_alignment: scarcity ?? empty_scarcity,
      downweight_factor: 0,
      validated_surplus: 0,
      adjusted_surplus: 0,
      payout_split: { reserve_buffer: 0, maintenance: 0, dividend_pool: 0, local_reinvestment: 0 },
      state_root: simpleHash(sg.subgraph_id + "rejected"),
      substrate_patch: {},
      anchored_on_chain: false,
      timestamp: Date.now(),
      constructive_score: 0,
      destructive_score: 1,
    };
    this.lastResult = result;
    return result;
  }
}
