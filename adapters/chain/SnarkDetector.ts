/**
 * Pulser Mesh — Snark Detector
 *
 * Uses the Kleinion landscape as the detection space for unhealthy /
 * extractive behaviour patterns ("snarks").
 *
 * Core thesis
 * ──────────────────────────────────────────────────────────────────────────
 * Healthy behaviour: the five color conflicts (tensions between constraint
 * surfaces) converge toward the SELF_REFERENTIAL centroid of the Kleinion
 * (Za = 0, Ta = 0, Oa = 0). Each node's boundary projection aligns with all
 * five surfaces, so the conflict vectors are short and point inward.
 *
 * Snark (unhealthy behaviour): color conflicts diverge outward from the
 * centroid. The node's projected state reinforces some constraint surfaces
 * while cancelling others, pulling the conflict vector to high Za / Ta.
 *
 * Detection algorithm
 * ──────────────────────────────────────────────────────────────────────────
 * For each BoundaryPoint:
 *   1. Compute per-surface cosine similarity against each of the five
 *      constraint surfaces → five "color" scores C_1 … C_5.
 *   2. A "color conflict" between surfaces i and j is |C_i - C_j|.
 *      We reduce this to a single conflict magnitude and a Za direction:
 *        conflict_magnitude = mean(|C_i - C_j|) for all pairs
 *        conflict_Za = the angular dispersion of the five scores mapped
 *                      to the Kleinion Za circle
 *   3. Convergence score for a node:
 *        centroid_distance = kleinionDistance(node_brane_coord, {Za:0,Ta:0,Oa:0})
 *        convergence = exp(−conflict_magnitude × centroid_distance)
 *      → 1.0 = perfectly converged (healthy)
 *      → 0.0 = maximally divergent (snark)
 *   4. Subgraph health = ξ-weighted mean of node convergence scores.
 *      A subgraph is "snarky" if health < snark_threshold (default 0.55).
 *
 * Color palette (five constraint surfaces)
 * ──────────────────────────────────────────────────────────────────────────
 *   RED    — consent surface
 *   ORANGE — scarcity-alignment surface
 *   YELLOW — anti-extractive topology surface
 *   GREEN  — coherence surface
 *   BLUE   — transformation-validity surface
 *
 * Conflict pattern taxonomy
 * ──────────────────────────────────────────────────────────────────────────
 *   RED↔ORANGE   (consent vs scarcity)   → extractive consent gaming
 *   RED↔YELLOW   (consent vs topology)   → apex capture with consent cover
 *   ORANGE↔GREEN (scarcity vs coherence) → incoherent scarcity claim
 *   YELLOW↔BLUE  (topology vs transform) → wash-loop transformation fraud
 *   GREEN↔BLUE   (coherence vs transform)→ coherence inflation
 */

import type { BoundaryPoint, SubgraphBoundary } from "./BoundaryProjection.js";
import { kleinionDistance, type KleinionCoord } from "./KleinionGeometry.js";
import type { SubstrateVector } from "./SubstrateEncoder.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SnarkColor = "RED" | "ORANGE" | "YELLOW" | "GREEN" | "BLUE";

export const COLOR_SURFACE_MAP: Record<SnarkColor, string> = {
  RED:    "consent",
  ORANGE: "scarcity",
  YELLOW: "anti_extractive",
  GREEN:  "coherence",
  BLUE:   "transformation",
};

// Map each color to a Za angle on the Kleinion circle (evenly spaced)
const COLOR_ZA: Record<SnarkColor, number> = {
  RED:    0,
  ORANGE: (2 * Math.PI) / 5,
  YELLOW: (4 * Math.PI) / 5,
  GREEN:  -(4 * Math.PI) / 5,
  BLUE:   -(2 * Math.PI) / 5,
};

const COLORS: SnarkColor[] = ["RED", "ORANGE", "YELLOW", "GREEN", "BLUE"];

export interface ColorConflict {
  color_a: SnarkColor;
  color_b: SnarkColor;
  magnitude: number;    // |C_a - C_b| ∈ [0,1]
  pattern: string;      // human-readable taxonomy label
}

export interface NodeSnarkProfile {
  node_id: string;
  color_scores: Record<SnarkColor, number>;   // C_1…C_5 ∈ [0,1]
  conflicts: ColorConflict[];                  // all 10 color pairs
  conflict_magnitude: number;                  // mean |C_i - C_j|
  conflict_Za: number;                         // angular dispersion in Za space
  brane_coord: KleinionCoord;                  // from the node's Kleinion root
  centroid_distance: number;                   // kleinionDistance to (0,0,0)
  convergence: number;                         // ∈ [0,1], 1 = healthy
  is_snark: boolean;
  dominant_conflict?: ColorConflict;           // highest magnitude pair
}

export interface SnarkReport {
  subgraph_id: string;
  node_profiles: NodeSnarkProfile[];
  subgraph_health: number;          // ξ-weighted mean convergence ∈ [0,1]
  is_snarky: boolean;               // true if health < snark_threshold
  snark_count: number;              // nodes flagged individually
  dominant_pattern?: string;        // most common conflict pattern
  snark_threshold: number;
  timestamp: number;
}

// ─── Constraint surface re-evaluation ────────────────────────────────────────
//
// We re-score each projected vector against each surface independently
// to get per-color scores. This mirrors BoundaryProjection's interferenceScores
// but returns the per-surface breakdown rather than the aggregate.

const CONSTRAINT_SURFACES: Record<string, number[]> = {
  consent:         [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5],
  scarcity:        [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.9, 0.9, 0.5, 0.5],
  anti_extractive: [0.5, 0.5, 0.5, 0.5, 0.85,0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  coherence:       [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.9, 0.5, 0.5, 0.5, 0.5, 0.5],
  transformation:  [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.9, 0.5],
};

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i]! * b[i]!;
    magA += a[i]! * a[i]!;
    magB += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom > 0 ? Math.max(0, Math.min(1, dot / denom)) : 0;
}

function perSurfaceScores(projected: number[]): Record<SnarkColor, number> {
  return {
    RED:    cosineSimilarity(projected, CONSTRAINT_SURFACES["consent"]!),
    ORANGE: cosineSimilarity(projected, CONSTRAINT_SURFACES["scarcity"]!),
    YELLOW: cosineSimilarity(projected, CONSTRAINT_SURFACES["anti_extractive"]!),
    GREEN:  cosineSimilarity(projected, CONSTRAINT_SURFACES["coherence"]!),
    BLUE:   cosineSimilarity(projected, CONSTRAINT_SURFACES["transformation"]!),
  };
}

// ─── Conflict taxonomy ────────────────────────────────────────────────────────

const CONFLICT_PATTERNS: Partial<Record<string, string>> = {
  "RED:ORANGE":   "extractive consent gaming",
  "RED:YELLOW":   "apex capture with consent cover",
  "RED:GREEN":    "incoherent consent claim",
  "RED:BLUE":     "transformation fraud under consent",
  "ORANGE:YELLOW":"scarcity-topology misalignment",
  "ORANGE:GREEN": "incoherent scarcity claim",
  "ORANGE:BLUE":  "scarcity transformation fraud",
  "YELLOW:GREEN": "structural coherence conflict",
  "YELLOW:BLUE":  "wash-loop transformation fraud",
  "GREEN:BLUE":   "coherence inflation",
};

function conflictKey(a: SnarkColor, b: SnarkColor): string {
  // Canonical order: alphabetical
  return [a, b].sort().join(":");
}

function buildConflicts(scores: Record<SnarkColor, number>): ColorConflict[] {
  const conflicts: ColorConflict[] = [];
  for (let i = 0; i < COLORS.length; i++) {
    for (let j = i + 1; j < COLORS.length; j++) {
      const ca = COLORS[i]!;
      const cb = COLORS[j]!;
      const magnitude = Math.abs(scores[ca] - scores[cb]);
      const key = conflictKey(ca, cb);
      conflicts.push({
        color_a: ca,
        color_b: cb,
        magnitude,
        pattern: CONFLICT_PATTERNS[key] ?? `${key} tension`,
      });
    }
  }
  return conflicts;
}

// ─── Angular dispersion in Za space ──────────────────────────────────────────
//
// Map each color's score to a weighted unit vector on the Za circle,
// then compute the magnitude of the resultant (1 = all aligned, 0 = dispersed).
// We invert: dispersion = 1 - resultant_magnitude → 0 = healthy, 1 = conflicted.

function conflictZa(scores: Record<SnarkColor, number>): number {
  let sumX = 0, sumY = 0;
  for (const color of COLORS) {
    const za = COLOR_ZA[color];
    const w  = scores[color];
    sumX += w * Math.cos(za);
    sumY += w * Math.sin(za);
  }
  const resultant = Math.sqrt(sumX * sumX + sumY * sumY) / COLORS.length;
  return Math.max(0, Math.min(1, 1 - resultant)); // dispersion
}

// ─── Node profiling ───────────────────────────────────────────────────────────

/**
 * Profile a single BoundaryPoint on the Kleinion landscape.
 *
 * @param point   — output of projectNode()
 * @param vector  — the SubstrateVector for this node (provides Kleinion coords)
 */
export function profileNode(
  point: BoundaryPoint,
  vector: SubstrateVector
): NodeSnarkProfile {
  const color_scores = perSurfaceScores(point.projected);
  const conflicts    = buildConflicts(color_scores);
  const conflict_magnitude = conflicts.reduce((a, c) => a + c.magnitude, 0) / conflicts.length;
  const conflict_Za  = conflictZa(color_scores);

  // Brane coord: use the grown layer (L1) if present, else root
  const branes = vector.kleinion.branes;
  const brane  = branes[branes.length - 1] ?? branes[0]!;
  const brane_coord: KleinionCoord = brane.coord;

  const centroid: KleinionCoord = { Za: 0, Ta: 0, Oa: 0 };
  const centroid_distance = kleinionDistance(brane_coord, centroid);

  // Convergence: healthy when conflict is low AND close to centroid.
  // exp(−x) gives 1 at x=0, decays smoothly toward 0.
  const convergence = Math.exp(-(conflict_magnitude * (1 + centroid_distance)));

  const dominant_conflict = conflicts.reduce(
    (best, c) => (c.magnitude > (best?.magnitude ?? 0) ? c : best),
    undefined as ColorConflict | undefined
  );

  const SNARK_NODE_THRESHOLD = 0.45;

  return {
    node_id: point.node_id,
    color_scores,
    conflicts,
    conflict_magnitude,
    conflict_Za,
    brane_coord,
    centroid_distance,
    convergence,
    is_snark: convergence < SNARK_NODE_THRESHOLD,
    dominant_conflict,
  };
}

// ─── Subgraph snark detection ─────────────────────────────────────────────────

export interface SnarkDetectorOptions {
  snark_threshold?: number;   // subgraph health floor, default 0.55
}

/**
 * Run snark detection over an entire SubgraphBoundary.
 *
 * Requires the paired SubstrateVectors (same order / same node_ids) so we
 * can access the Kleinion geometry for each BoundaryPoint.
 */
export function detectSnarks(
  boundary: SubgraphBoundary,
  vectors: SubstrateVector[],
  subgraph_id: string,
  options: SnarkDetectorOptions = {}
): SnarkReport {
  const snark_threshold = options.snark_threshold ?? 0.55;

  // Build a fast lookup: node_id → SubstrateVector
  const vecIndex = new Map(vectors.map((v) => [v.node_id, v]));

  const node_profiles: NodeSnarkProfile[] = boundary.points
    .map((point) => {
      const vec = vecIndex.get(point.node_id);
      if (!vec) return null;
      return profileNode(point, vec);
    })
    .filter((p): p is NodeSnarkProfile => p !== null);

  if (node_profiles.length === 0) {
    return {
      subgraph_id,
      node_profiles: [],
      subgraph_health: 0,
      is_snarky: true,
      snark_count: 0,
      snark_threshold,
      timestamp: Date.now(),
    };
  }

  // ξ-weighted mean convergence
  const totalXi  = vectors.reduce((a, v) => a + v.u7_coherence, 0);
  const weightedConvergence = node_profiles.reduce((a, p) => {
    const xi = vecIndex.get(p.node_id)?.u7_coherence ?? 0.5;
    return a + p.convergence * xi;
  }, 0);
  const subgraph_health = totalXi > 0 ? Math.min(1, Math.max(0, weightedConvergence / totalXi)) : 0;

  // Dominant conflict pattern across the subgraph
  const patternCounts = new Map<string, number>();
  for (const p of node_profiles) {
    if (p.dominant_conflict) {
      const pat = p.dominant_conflict.pattern;
      patternCounts.set(pat, (patternCounts.get(pat) ?? 0) + 1);
    }
  }
  const dominant_pattern = patternCounts.size > 0
    ? [...patternCounts.entries()].sort((a, b) => b[1] - a[1])[0]![0]
    : undefined;

  return {
    subgraph_id,
    node_profiles,
    subgraph_health,
    is_snarky: subgraph_health < snark_threshold,
    snark_count: node_profiles.filter((p) => p.is_snark).length,
    dominant_pattern,
    snark_threshold,
    timestamp: Date.now(),
  };
}

// ─── Centroid convergence visualisation helper ────────────────────────────────
//
// Intended for future diagram generation (MESH_TO_PULSE.svg etc.).
// Returns each node's conflict vector as a 2D point in Za space,
// so a renderer can draw arrows from each node toward (0,0).

export interface ConflictVector2D {
  node_id: string;
  x: number;        // Za cos component of the conflict centroid
  y: number;        // Za sin component of the conflict centroid
  magnitude: number;
  converging: boolean; // true if vector points toward origin
}

export function conflictVectors2D(report: SnarkReport): ConflictVector2D[] {
  return report.node_profiles.map((p) => {
    // Weighted resultant of the per-color score vectors on the Za circle
    let sumX = 0, sumY = 0;
    for (const color of COLORS) {
      const za = COLOR_ZA[color];
      const w  = p.color_scores[color];
      sumX += w * Math.cos(za);
      sumY += w * Math.sin(za);
    }
    const mag = Math.sqrt(sumX * sumX + sumY * sumY);
    // "Converging" = resultant points toward (0,0) i.e. mag is small
    // and the brane Za also trends toward 0
    const converging = mag < 0.5 && Math.abs(p.brane_coord.Za) < Math.PI / 3;
    return {
      node_id: p.node_id,
      x: sumX / COLORS.length,
      y: sumY / COLORS.length,
      magnitude: mag / COLORS.length,
      converging,
    };
  });
}
