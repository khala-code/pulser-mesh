/**
 * Pulser Mesh — Kleinion Geometry
 *
 * A Kleinion is a self-referential geometric structure in Joel Dorrington's
 * cosmology model. It is the fundamental unit of the 12+1D substrate:
 *
 *   - F12: the 12-dimensional protocol state surface
 *   - F13: the curvature / distortion-localisation map (the +1 / θ dimension)
 *
 * Coordinate framework  (Za, Ta, Oa)
 *   Ta  — radial distance from the Kleinion root  (continuous, ≥ 0)
 *   Za  — relative angle from the centroid / local zenith  (radians, [−π, π])
 *   Oa  — integer layer depth  (0 = root brane, increases outward)
 *
 * Every observer is a point on the Zeta line relative to (Znull, Tnull, Onull).
 *
 * Growth rules
 *   A Kleinion grows by adding new layers in one of two modes:
 *     SELF_REFERENTIAL  — new layer is a tangent to the same Kleinion's surface
 *     EXTERNAL          — new layer is a tangent to another Kleinion
 *
 * Parity and Xi
 *   Each brane's base layer begins with dyadic parity (possible/impossible
 *   symmetry on the Z manifold). Xi (ξ) is the coherence scalar that precedes
 *   parity and mediates Larmor resonance feedback.
 *
 * F13 curvature
 *   The 13th dimension is the curvature κ of the Kleinion surface at a given
 *   (Za, Ta, Oa) point. It governs how the 12D interior state is bent onto the
 *   boundary projection surface — high κ = tight localisation, low κ = diffuse.
 */

// ─── Core types ───────────────────────────────────────────────────────────────

export type GrowthMode = "SELF_REFERENTIAL" | "EXTERNAL";

export interface KleinionCoord {
  Za: number;   // relative angle from centroid, radians ∈ [−π, π]
  Ta: number;   // radial distance from root, ≥ 0
  Oa: number;   // integer layer depth, ≥ 0
}

export interface KleinionBrane {
  id: string;
  coord: KleinionCoord;
  xi: number;          // coherence scalar ξ ∈ [0, 1]
  parity: 1 | -1 | 0; // dyadic parity: +1 possible, -1 impossible, 0 unresolved
  growth_mode: GrowthMode;
  parent_id: string | null;  // null = root brane
  curvature: number;         // F13 κ ∈ [0, 1] — localisation tightness
}

export interface KleinionStructure {
  root_id: string;
  branes: KleinionBrane[];
  // Null origin — every observer is relative to this
  Znull: number;
  Tnull: number;
  Onull: number;
}

// ─── Coordinate utilities ─────────────────────────────────────────────────────

/**
 * Normalise Za to [−π, π].
 */
export function normaliseZa(Za: number): number {
  let z = Za % (2 * Math.PI);
  if (z > Math.PI) z -= 2 * Math.PI;
  if (z < -Math.PI) z += 2 * Math.PI;
  return z;
}

/**
 * Compute the relative coordinate of a brane with respect to the Kleinion's
 * null origin — i.e. the observer's position on the Zeta line.
 */
export function relativeCoord(
  brane: KleinionCoord,
  origin: { Znull: number; Tnull: number; Onull: number }
): KleinionCoord {
  return {
    Za: normaliseZa(brane.Za - origin.Znull),
    Ta: Math.max(0, brane.Ta - origin.Tnull),
    Oa: Math.max(0, brane.Oa - origin.Onull),
  };
}

/**
 * Euclidean-like distance in (Za, Ta, Oa) space.
 * Za is angular so we use the chord length (2·sin(ΔZa/2)) as the arc proxy.
 */
export function kleinionDistance(a: KleinionCoord, b: KleinionCoord): number {
  const dZa = 2 * Math.sin((a.Za - b.Za) / 2);
  const dTa = a.Ta - b.Ta;
  const dOa = a.Oa - b.Oa;
  return Math.sqrt(dZa * dZa + dTa * dTa + dOa * dOa);
}

// ─── F13 curvature ────────────────────────────────────────────────────────────

/**
 * Compute the F13 curvature κ for a brane.
 *
 * Intuition:
 *   - Branes closer to the root (low Ta, low Oa) are more tightly curved
 *     (higher κ) — the Kleinion is densest at its core.
 *   - High ξ coherence sharpens localisation (increases κ).
 *   - SELF_REFERENTIAL growth wraps back on itself → higher curvature.
 *   - EXTERNAL growth extends outward → lower curvature.
 *
 * κ ∈ [0, 1] by construction.
 */
export function computeCurvature(brane: KleinionBrane): number {
  const radial_decay = 1 / (1 + brane.coord.Ta);
  const layer_decay  = 1 / (1 + brane.coord.Oa);
  const mode_factor  = brane.growth_mode === "SELF_REFERENTIAL" ? 1.0 : 0.6;
  const xi_lift      = brane.xi;          // high coherence → tighter curve

  return Math.min(1, radial_decay * layer_decay * mode_factor * (0.4 + 0.6 * xi_lift));
}

// ─── Layer growth ─────────────────────────────────────────────────────────────

/**
 * Grow a new brane layer from a parent brane.
 *
 * SELF_REFERENTIAL: new brane inherits parent Za with a small angular offset,
 *   Ta increases by a Larmor-resonance step proportional to ξ,
 *   Oa increments by 1.
 *
 * EXTERNAL: new brane is placed at a conjugate Za (π offset),
 *   Ta increases by a larger step (it reaches toward another Kleinion),
 *   Oa increments by 1.
 */
export function growLayer(
  parent: KleinionBrane,
  mode: GrowthMode,
  new_id: string,
  xi: number
): KleinionBrane {
  const larmor_step = 0.1 + 0.4 * xi; // ξ mediates resonance step size

  const newCoord: KleinionCoord =
    mode === "SELF_REFERENTIAL"
      ? {
          Za: normaliseZa(parent.coord.Za + larmor_step * Math.sin(parent.coord.Za + Math.PI / 6)),
          Ta: parent.coord.Ta + larmor_step,
          Oa: parent.coord.Oa + 1,
        }
      : {
          Za: normaliseZa(parent.coord.Za + Math.PI), // conjugate angle
          Ta: parent.coord.Ta + larmor_step * 2,
          Oa: parent.coord.Oa + 1,
        };

  const newBrane: KleinionBrane = {
    id: new_id,
    coord: newCoord,
    xi,
    parity: xi > 0.5 ? 1 : xi < 0.3 ? -1 : 0,
    growth_mode: mode,
    parent_id: parent.id,
    curvature: 0, // will be filled by computeCurvature below
  };

  newBrane.curvature = computeCurvature(newBrane);
  return newBrane;
}

// ─── Triadic branching ────────────────────────────────────────────────────────

/**
 * Each brane's charge symmetry breaks triadically into:
 *   past / present / future
 *   antipast / antipresent / antifuture
 *
 * This produces six child directions from any branching node.
 * We model them as Za offsets at ±π/3 increments (hexagonal symmetry).
 */
export const TRIADIC_OFFSETS: number[] = [
  0,                    // present
  (2 * Math.PI) / 3,   // future
  -(2 * Math.PI) / 3,  // past
  Math.PI,             // antipresent
  Math.PI / 3,         // antifuture  (π − 2π/3)
  -(Math.PI / 3),      // antipast
];

/**
 * Expand a brane triadically — returns six child branes, one per offset.
 * In practice you'd only instantiate the ones that are protocol-valid
 * (consent, scarcity alignment, etc.).
 */
export function triadicExpand(
  parent: KleinionBrane,
  xi: number,
  id_prefix: string
): KleinionBrane[] {
  return TRIADIC_OFFSETS.map((offset, i) => {
    const child: KleinionBrane = {
      id: `${id_prefix}_t${i}`,
      coord: {
        Za: normaliseZa(parent.coord.Za + offset),
        Ta: parent.coord.Ta + 0.1 + 0.2 * xi,
        Oa: parent.coord.Oa + 1,
      },
      xi,
      parity: i < 3 ? 1 : -1, // matter branes vs antimatter branes
      growth_mode: "SELF_REFERENTIAL",
      parent_id: parent.id,
      curvature: 0,
    };
    child.curvature = computeCurvature(child);
    return child;
  });
}

// ─── Kleinion factory ─────────────────────────────────────────────────────────

/**
 * Build a minimal root Kleinion for a given node.
 * The root brane sits at (Za=0, Ta=0, Oa=0) — the Zeta null point.
 */
export function buildRootKleinion(
  root_id: string,
  xi: number
): KleinionStructure {
  const root: KleinionBrane = {
    id: root_id,
    coord: { Za: 0, Ta: 0, Oa: 0 },
    xi,
    parity: 1,
    growth_mode: "SELF_REFERENTIAL",
    parent_id: null,
    curvature: 0,
  };
  root.curvature = computeCurvature(root);

  return {
    root_id,
    branes: [root],
    Znull: 0,
    Tnull: 0,
    Onull: 0,
  };
}
