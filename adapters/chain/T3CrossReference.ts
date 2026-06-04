/**
 * Pulser Mesh — T3 Cross-Reference Engine
 *
 * After each T3 validator runs its checkpoint, it publishes its result
 * to the T3SubgraphRegistry. The cross-reference engine then:
 *
 *   1. Gathers all peer results for the same window.
 *   2. Computes pairwise interference scores (constructive / destructive).
 *   3. Detects divergences — validators that disagree significantly.
 *   4. Produces a CrossReferenceReport that any validator can inspect.
 *   5. Optionally derives a quorum-weighted consensus surplus.
 *
 * Interference semantics (from SUBSTRATE_INTERFACE.md):
 *   - constructive: projected states reinforce each other → high agreement
 *   - destructive:  projected states cancel each other → divergence / flag
 *
 * In v1, "interference" is computed as the difference between validators'
 * constructive_score and destructive_score vectors. Future versions can
 * compile this into a formal ZKP boundary projection once the proof backend
 * is chosen.
 */

import type { CheckpointResult, CheckpointOutcome } from "./T3ValidatorNode.js";
import type { T3SubgraphRegistry } from "./T3SubgraphRegistry.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PairwiseInterference {
  validator_a: string;
  validator_b: string;
  constructive: number;   // [0,1] — how strongly they reinforce each other
  destructive: number;    // [0,1] — how strongly they diverge
  surplus_delta: number;  // |adjusted_surplus_a - adjusted_surplus_b|
  outcome_match: boolean; // both reached the same CheckpointOutcome
  flagged: boolean;       // true if destructive > threshold or surplus_delta > threshold
}

export interface CrossReferenceReport {
  window_start: string;
  validator_count: number;
  validators: string[];
  pairwise: PairwiseInterference[];
  // Quorum consensus
  quorum_outcome: CheckpointOutcome | "no_quorum";
  quorum_surplus: number;        // weighted median of adjusted_surplus
  quorum_constructive: number;   // mean constructive score across all pairs
  quorum_destructive: number;    // mean destructive score across all pairs
  // Flags
  divergent_validators: string[];
  flagged_pairs: PairwiseInterference[];
  timestamp: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface CrossReferenceConfig {
  /** Destructive score above which a pair is flagged. Default: 0.4 */
  destructive_flag_threshold: number;
  /** Surplus delta above which a pair is flagged (absolute value). Default: 500 */
  surplus_delta_threshold: number;
  /** Minimum validators needed to form a quorum. Default: 2 */
  quorum_min: number;
  /** Fraction of validators that must agree on outcome for quorum. Default: 0.6 */
  quorum_fraction: number;
}

const DEFAULT_XREF_CONFIG: CrossReferenceConfig = {
  destructive_flag_threshold: 0.4,
  surplus_delta_threshold: 500,
  quorum_min: 2,
  quorum_fraction: 0.6,
};

// ─── T3CrossReference ───────────────────────────────────────────────────────────

export class T3CrossReference {
  private registry: T3SubgraphRegistry;
  private config: CrossReferenceConfig;

  constructor(registry: T3SubgraphRegistry, config: Partial<CrossReferenceConfig> = {}) {
    this.registry = registry;
    this.config = { ...DEFAULT_XREF_CONFIG, ...config };
  }

  /**
   * Run cross-reference for all validators that have published results
   * for the given window. Returns a full CrossReferenceReport.
   */
  async crossReference(windowStart: string): Promise<CrossReferenceReport> {
    const results = await this.registry.listForWindow(windowStart);

    if (results.length === 0) {
      return this._emptyReport(windowStart);
    }

    const validators = results.map((r) => r.validator_id);
    const pairwise = this._computePairwise(results);
    const flagged_pairs = pairwise.filter((p) => p.flagged);

    // Divergent validators: appear in more than half of flagged pairs
    const flagCount = new Map<string, number>();
    for (const p of flagged_pairs) {
      flagCount.set(p.validator_a, (flagCount.get(p.validator_a) ?? 0) + 1);
      flagCount.set(p.validator_b, (flagCount.get(p.validator_b) ?? 0) + 1);
    }
    const divergent_validators = [...flagCount.entries()]
      .filter(([, count]) => count > flagged_pairs.length / 2)
      .map(([id]) => id);

    // Quorum outcome: most common outcome among non-divergent validators
    const cleanResults = results.filter((r) => !divergent_validators.includes(r.validator_id));
    const quorum_outcome = this._quorumOutcome(cleanResults);

    // Quorum surplus: weighted median of adjusted_surplus from clean results
    const quorum_surplus = this._weightedMedian(
      cleanResults.map((r) => r.adjusted_surplus),
      cleanResults.map((r) => r.constructive_score)
    );

    const quorum_constructive = pairwise.length > 0
      ? pairwise.reduce((a, p) => a + p.constructive, 0) / pairwise.length
      : 0;
    const quorum_destructive = pairwise.length > 0
      ? pairwise.reduce((a, p) => a + p.destructive, 0) / pairwise.length
      : 0;

    return {
      window_start: windowStart,
      validator_count: results.length,
      validators,
      pairwise,
      quorum_outcome,
      quorum_surplus,
      quorum_constructive,
      quorum_destructive,
      divergent_validators,
      flagged_pairs,
      timestamp: Date.now(),
    };
  }

  // ── Pairwise interference ───────────────────────────────────────────────

  private _computePairwise(results: CheckpointResult[]): PairwiseInterference[] {
    const pairs: PairwiseInterference[] = [];

    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const a = results[i]!;
        const b = results[j]!;

        // Constructive: geometric mean of both constructive scores
        const constructive = Math.sqrt(a.constructive_score * b.constructive_score);

        // Destructive: how differently their scores project
        // |constructive_a - constructive_b| + |destructive_a - destructive_b| / 2
        const destructive = (
          Math.abs(a.constructive_score - b.constructive_score) +
          Math.abs(a.destructive_score - b.destructive_score)
        ) / 2;

        const surplus_delta = Math.abs(a.adjusted_surplus - b.adjusted_surplus);
        const outcome_match = a.outcome === b.outcome;

        const flagged =
          destructive > this.config.destructive_flag_threshold ||
          surplus_delta > this.config.surplus_delta_threshold ||
          !outcome_match;

        pairs.push({
          validator_a: a.validator_id,
          validator_b: b.validator_id,
          constructive,
          destructive,
          surplus_delta,
          outcome_match,
          flagged,
        });
      }
    }

    return pairs;
  }

  // ── Quorum helpers ─────────────────────────────────────────────────────

  private _quorumOutcome(results: CheckpointResult[]): CheckpointOutcome | "no_quorum" {
    if (results.length < this.config.quorum_min) return "no_quorum";

    const counts: Record<string, number> = {};
    for (const r of results) counts[r.outcome] = (counts[r.outcome] ?? 0) + 1;
    const [topOutcome, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]!;

    return topCount / results.length >= this.config.quorum_fraction
      ? (topOutcome as CheckpointOutcome)
      : "no_quorum";
  }

  private _weightedMedian(values: number[], weights: number[]): number {
    if (values.length === 0) return 0;
    const totalWeight = weights.reduce((a, w) => a + w, 0);
    if (totalWeight === 0) return values.reduce((a, v) => a + v, 0) / values.length;

    const sorted = values
      .map((v, i) => ({ v, w: weights[i] ?? 0 }))
      .sort((a, b) => a.v - b.v);

    let cumulative = 0;
    const half = totalWeight / 2;
    for (const { v, w } of sorted) {
      cumulative += w;
      if (cumulative >= half) return v;
    }
    return sorted[sorted.length - 1]!.v;
  }

  private _emptyReport(windowStart: string): CrossReferenceReport {
    return {
      window_start: windowStart,
      validator_count: 0,
      validators: [],
      pairwise: [],
      quorum_outcome: "no_quorum",
      quorum_surplus: 0,
      quorum_constructive: 0,
      quorum_destructive: 0,
      divergent_validators: [],
      flagged_pairs: [],
      timestamp: Date.now(),
    };
  }
}
