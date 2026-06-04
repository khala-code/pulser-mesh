/**
 * Pulser Mesh — Substrate Encoder
 *
 * Maps a MeshNode (protocol domain object) onto a full SubstrateVector
 * U = (u1 … u12; θ) using the node's Kleinion geometry to derive the
 * F13 boundary-phase coordinate θ.
 *
 * The 12 structured coordinates follow the layout in SUBSTRATE_INTERFACE.md:
 *
 *   u1   identity continuity        ← node_id hash → [0,1]
 *   u2   geographic grounding       ← geography present + normalised
 *   u3   mission orientation        ← mission_class encoded
 *   u4   embedding depth            ← embedding_depth [0,1]
 *   u5   structural quality         ← derived from edge diversity (passed in)
 *   u6   growth ratio               ← from graph metrics (passed in)
 *   u7   coherence                  ← ξ directly
 *   u8   consent state              ← 0 or 1
 *   u9   scarcity class linkage     ← from scarcity record confidence
 *   u10  rotor target linkage       ← rotor channel score
 *   u11  transformation state       ← passed in
 *   u12  checkpoint participation   ← 0 before checkpoint, 1 after
 *
 *   θ    boundary phase             ← F13 curvature of the node's Kleinion
 *                                     root brane
 */

import type { MeshNode, ScarcityRecord } from "./T3ValidatorNode.js";
import {
  buildRootKleinion,
  growLayer,
  computeCurvature,
  type KleinionStructure,
} from "./KleinionGeometry.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubstrateVector {
  node_id: string;
  u1_identity_continuity: number;
  u2_geographic_grounding: number;
  u3_mission_orientation: number;
  u4_embedding_depth: number;
  u5_structural_quality: number;
  u6_growth_ratio: number;
  u7_coherence: number;
  u8_consent_state: number;
  u9_scarcity_class_linkage: number;
  u10_rotor_target_linkage: number;
  u11_transformation_state: number;
  u12_checkpoint_participation: number;
  theta_boundary_phase: number;  // F13 curvature
  kleinion: KleinionStructure;   // the live geometry for further projection
}

export interface EncoderContext {
  structural_quality?: number;    // from graph metrics (W_G proxy)
  growth_ratio?: number;          // u6: edge growth rate this window
  transformation_state?: number;  // u11: transformation schema linkage [0,1]
  scarcity_record?: ScarcityRecord;
  checkpoint_complete?: boolean;
}

// ─── Mission class encoding ───────────────────────────────────────────────────

const MISSION_CLASS_SCORES: Record<string, number> = {
  food:     0.90,
  care:     0.85,
  housing:  0.80,
  mobility: 0.70,
  chain:    0.60,  // T3 market/firm layer
  other:    0.50,
};

function encodeMission(mission_class: string): number {
  return MISSION_CLASS_SCORES[mission_class] ?? 0.50;
}

// ─── Rotor target linkage ─────────────────────────────────────────────────────

function encodeRotorLinkage(
  rotor_target: "sine" | "cosine" | "tangent",
  record: ScarcityRecord | undefined
): number {
  if (!record) return 0.5;
  return record.rotor[rotor_target] ?? 0.5;
}

// ─── Identity hash → [0,1] ───────────────────────────────────────────────────

function identityScore(node_id: string): number {
  // Deterministic [0,1] from node_id string — not cryptographic, just stable.
  let h = 0;
  for (let i = 0; i < node_id.length; i++) {
    h = (h * 31 + node_id.charCodeAt(i)) >>> 0;
  }
  return (h % 1000) / 1000;
}

// ─── Main encoder ─────────────────────────────────────────────────────────────

/**
 * Encode a MeshNode into its SubstrateVector.
 *
 * Builds the node's root Kleinion from its ξ value, then optionally grows
 * one additional layer to reflect the node's embedding trajectory, and uses
 * the resulting F13 curvature as the θ boundary-phase coordinate.
 */
export function encodeNode(
  node: MeshNode,
  ctx: EncoderContext = {}
): SubstrateVector {
  // Build root Kleinion
  const kleinion = buildRootKleinion(node.node_id, node.xi);

  // Grow one layer to reflect embedding trajectory
  const root = kleinion.branes[0]!;
  const mode = node.embedding_depth > 0.6 ? "SELF_REFERENTIAL" : "EXTERNAL";
  const layer1 = growLayer(root, mode, `${node.node_id}_l1`, node.xi);
  kleinion.branes.push(layer1);

  // θ = curvature of the grown layer (F13 — distortion/localisation map)
  const theta = computeCurvature(layer1);

  const scarcity_record = ctx.scarcity_record;

  return {
    node_id: node.node_id,
    u1_identity_continuity:     identityScore(node.node_id),
    u2_geographic_grounding:    node.geography ? 1.0 : 0.0,
    u3_mission_orientation:     encodeMission(node.mission_class),
    u4_embedding_depth:         Math.min(1, Math.max(0, node.embedding_depth)),
    u5_structural_quality:      Math.min(1, Math.max(0, ctx.structural_quality ?? node.xi)),
    u6_growth_ratio:            Math.min(1, Math.max(0, ctx.growth_ratio ?? 0.5)),
    u7_coherence:               Math.min(1, Math.max(0, node.xi)),
    u8_consent_state:           node.consent_state,
    u9_scarcity_class_linkage:  scarcity_record?.confidence ?? 0.5,
    u10_rotor_target_linkage:   encodeRotorLinkage(node.mission_rotor_target, scarcity_record),
    u11_transformation_state:   Math.min(1, Math.max(0, ctx.transformation_state ?? 0.5)),
    u12_checkpoint_participation: ctx.checkpoint_complete ? 1 : 0,
    theta_boundary_phase:       theta,
    kleinion,
  };
}

/**
 * Encode all valid nodes in a subgraph to their substrate vectors.
 */
export function encodeSubgraph(
  nodes: MeshNode[],
  ctx: EncoderContext = {}
): SubstrateVector[] {
  return nodes.map((n) => encodeNode(n, ctx));
}
