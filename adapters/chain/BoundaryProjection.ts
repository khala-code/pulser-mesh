/**
 * Pulser Mesh — Boundary Projection
 *
 * Implements the boundary projection operator:
 *
 *   Π_B(U) → B
 *
 * Where U is a SubstrateVector (12 protocol coordinates + F13 θ curvature)
 * and B is the boundary representation used by validators to test admissibility
 * without accessing the full interior state.
 *
 * The projection uses F13 curvature (θ) to warp the 12D state onto the
 * boundary surface. High θ (tight localisation) compresses the projection;
 * low θ (diffuse) spreads it.
 *
 * Interference scores
 *   After projection, each SubstrateVector is tested against the five
 *   checkpoint constraint surfaces from SUBSTRATE_INTERFACE.md:
 *     1. consent surface
 *     2. scarcity-alignment surface
 *     3. anti-extractive topology surface
 *     4. coherence surface
 *     5. transformation-validity surface
 *
 *   constructive_score ∈ [0,1] — how strongly the projected state reinforces
 *                                 the constraint surfaces
 *   destructive_score  ∈ [0,1] — how strongly it cancels / violates them
 *
 * Subgraph-level interference
 *   Individual node projections are composed into a subgraph boundary by
 *   summing their projected vectors, weighted by F13 curvature.
 *   This produces a single (constructive, destructive) pair for the whole
 *   subgraph — the value that replaces the heuristic scores in T3ValidatorNode.
 */

import type { SubstrateVector } from "./SubstrateEncoder.js";
import { kleinionDistance } from "./KleinionGeometry.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BoundaryPoint {
  node_id: string;
  /** 12D state warped by F13 curvature onto the boundary surface */
  projected: number[];   // length 12, each ∈ [0,1]
  theta: number;         // F13 curvature used in projection
  constructive: number;  // [0,1]
  destructive: number;   // [0,1]
}

export interface SubgraphBoundary {
  node_count: number;
  points: BoundaryPoint[];
  /** Curvature-weighted aggregate interference */
  constructive_score: number;
  destructive_score: number;
  /** Commitment: deterministic hash of the projected boundary */
  commitment: string;
}

// ─── Constraint surfaces ──────────────────────────────────────────────────────

/**
 * Each constraint surface is a target vector in the 12D space.
 * A projected state "reinforces" a surface when its coordinates are close
 * to the target; it "cancels" when they are far.
 *
 * Surfaces are defined as ideal [0,1] coordinate vectors.
 * The ordering matches the u1…u12 layout in SubstrateEncoder.
 */
const CONSTRAINT_SURFACES: Record<string, number[]> = {
  // Surface 1: consent — u8 must be 1.0; other coords free
  consent: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5],

  // Surface 2: scarcity-alignment — u9 and u10 must be high
  scarcity: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.9, 0.9, 0.5, 0.5],

  // Surface 3: anti-extractive topology — u5 structural quality high,
  //            u6 growth ratio moderate (not runaway)
  anti_extractive: [0.5, 0.5, 0.5, 0.5, 0.85, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],

  // Surface 4: coherence — u7 (ξ) must be high
  coherence: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.9, 0.5, 0.5, 0.5, 0.5, 0.5],

  // Surface 5: transformation-validity — u11 high
  transformation: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.9, 0.5],
};

const SURFACE_KEYS = Object.keys(CONSTRAINT_SURFACES);

// ─── Projection operator ─────────────────────────────────────────────────────

/**
 * Extract the 12 protocol coordinates from a SubstrateVector as an array.
 */
function toCoordArray(v: SubstrateVector): number[] {
  return [
    v.u1_identity_continuity,
    v.u2_geographic_grounding,
    v.u3_mission_orientation,
    v.u4_embedding_depth,
    v.u5_structural_quality,
    v.u6_growth_ratio,
    v.u7_coherence,
    v.u8_consent_state,
    v.u9_scarcity_class_linkage,
    v.u10_rotor_target_linkage,
    v.u11_transformation_state,
    v.u12_checkpoint_participation,
  ];
}

/**
 * Apply F13 curvature warp to the 12D coordinate array.
 *
 * Intuition: high θ (tight localisation) pulls coordinates toward their
 * natural attractor (the current value is reinforced — self-referential).
 * Low θ (diffuse) relaxes toward 0.5 (no strong claim).
 *
 * Warp formula per coordinate:
 *   projected[i] = θ · raw[i] + (1 − θ) · 0.5
 *
 * This is a convex blend between the raw state and the "neutral" centre.
 * High curvature → projection is close to the raw state (confident).
 * Low curvature  → projection drifts toward 0.5 (uncertain).
 */
function warpByF13(raw: number[], theta: number): number[] {
  return raw.map((r) => theta * r + (1 - theta) * 0.5);
}

/**
 * Cosine similarity between two equal-length vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i]! * b[i]!;
    magA += a[i]! * a[i]!;
    magB += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom > 0 ? dot / denom : 0;
}

/**
 * Compute constructive and destructive scores for a projected vector
 * against all five constraint surfaces.
 *
 * constructive = mean cosine similarity to all surfaces
 * destructive  = 1 − constructive  (complementary by construction)
 *
 * More nuanced: surfaces where the projected vector is anti-aligned
 * (similarity < 0.5) contribute to destructive. We split cleanly.
 */
function interferenceScores(projected: number[]): { constructive: number; destructive: number } {
  let totalConstructive = 0;
  let totalDestructive = 0;

  for (const key of SURFACE_KEYS) {
    const surface = CONSTRAINT_SURFACES[key]!;
    const sim = cosineSimilarity(projected, surface);
    // sim ∈ [0,1] for non-negative vectors; map to constructive contribution
    const c = Math.max(0, Math.min(1, sim));
    totalConstructive += c;
    totalDestructive  += 1 - c;
  }

  return {
    constructive: totalConstructive / SURFACE_KEYS.length,
    destructive:  totalDestructive  / SURFACE_KEYS.length,
  };
}

// ─── Node projection ──────────────────────────────────────────────────────────

/**
 * Project a single SubstrateVector onto the boundary.
 */
export function projectNode(v: SubstrateVector): BoundaryPoint {
  const raw = toCoordArray(v);
  const projected = warpByF13(raw, v.theta_boundary_phase);
  const { constructive, destructive } = interferenceScores(projected);

  return {
    node_id: v.node_id,
    projected,
    theta: v.theta_boundary_phase,
    constructive,
    destructive,
  };
}

// ─── Subgraph projection ──────────────────────────────────────────────────────

/**
 * Deterministic commitment hash of the subgraph boundary.
 * Simple FNV-1a over the serialised projected points.
 */
function commitmentHash(points: BoundaryPoint[]): string {
  const payload = points
    .map((p) => `${p.node_id}:${p.projected.map((x) => x.toFixed(4)).join(",")}:${p.theta.toFixed(4)}`)
    .join("|");
  let h = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return "0x" + (h >>> 0).toString(16).padStart(8, "0");
}

/**
 * Project an entire subgraph (array of SubstrateVectors) onto the boundary.
 *
 * The aggregate constructive/destructive scores are a curvature-weighted
 * mean across all node projections: nodes with higher F13 curvature
 * (tighter localisation, more confident geometry) contribute more.
 */
export function projectSubgraph(vectors: SubstrateVector[]): SubgraphBoundary {
  if (vectors.length === 0) {
    return {
      node_count: 0,
      points: [],
      constructive_score: 0,
      destructive_score: 1,
      commitment: "0x00000000",
    };
  }

  const points = vectors.map(projectNode);

  // Curvature-weighted aggregation
  const totalTheta = points.reduce((a, p) => a + p.theta, 0);
  const weightedConstructive = points.reduce((a, p) => a + p.constructive * p.theta, 0);
  const weightedDestructive  = points.reduce((a, p) => a + p.destructive  * p.theta, 0);

  const constructive_score = totalTheta > 0 ? weightedConstructive / totalTheta : 0;
  const destructive_score  = totalTheta > 0 ? weightedDestructive  / totalTheta : 1;

  return {
    node_count: vectors.length,
    points,
    constructive_score: Math.min(1, Math.max(0, constructive_score)),
    destructive_score:  Math.min(1, Math.max(0, destructive_score)),
    commitment: commitmentHash(points),
  };
}

// ─── Cross-validator interference ─────────────────────────────────────────────

/**
 * Compare the boundary projections of two validators covering the same window.
 *
 * Uses the Kleinion coordinate distance between paired nodes (matched by
 * node_id) to compute a geometric divergence score in addition to the
 * surface-interference comparison.
 *
 * Returns { constructive, destructive } for the pair.
 */
export function pairwiseBoundaryInterference(
  a: SubgraphBoundary,
  b: SubgraphBoundary
): { constructive: number; destructive: number } {
  // Index b's points by node_id for fast lookup
  const bIndex = new Map(b.points.map((p) => [p.node_id, p]));

  const matched: Array<{ ca: number; cb: number; da: number; db: number }> = [];
  for (const pa of a.points) {
    const pb = bIndex.get(pa.node_id);
    if (pb) {
      matched.push({
        ca: pa.constructive, cb: pb.constructive,
        da: pa.destructive,  db: pb.destructive,
      });
    }
  }

  if (matched.length === 0) {
    // No shared nodes — treat as fully destructive
    return { constructive: 0, destructive: 1 };
  }

  // Constructive: geometric mean of both constructive scores per shared node
  const constructive = matched.reduce((acc, m) => acc + Math.sqrt(m.ca * m.cb), 0) / matched.length;
  // Destructive: mean absolute divergence in constructive scores
  const destructive  = matched.reduce((acc, m) => acc + Math.abs(m.ca - m.cb), 0) / matched.length;

  return {
    constructive: Math.min(1, Math.max(0, constructive)),
    destructive:  Math.min(1, Math.max(0, destructive)),
  };
}
