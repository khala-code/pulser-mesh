/**
 * Pulser Mesh — T3 Subgraph Registry
 *
 * A lightweight in-process registry that T3 validator nodes use to:
 *   1. Announce themselves and their latest CheckpointResult.
 *   2. Discover peer validators in the same geography/window.
 *   3. Retrieve peer results for cross-referencing.
 *
 * In production this would be a distributed store (libp2p, IPFS, or a
 * gossip layer). In v1, it is an in-memory singleton suitable for
 * running multiple T3 nodes in the same process or test suite.
 *
 * A persistent adapter (e.g. a simple JSON file, SQLite, or Redis) can
 * be plugged in by implementing the RegistryBackend interface below.
 */

import type { CheckpointResult } from "./T3ValidatorNode.js";

// ─── Backend interface ───────────────────────────────────────────────────────────

export interface RegistryBackend {
  set(key: string, value: CheckpointResult): Promise<void>;
  get(key: string): Promise<CheckpointResult | null>;
  list(prefix: string): Promise<CheckpointResult[]>;
}

/** Default: in-memory map. Replace with a persistent backend for production. */
export class InMemoryBackend implements RegistryBackend {
  private store = new Map<string, CheckpointResult>();

  async set(key: string, value: CheckpointResult): Promise<void> {
    this.store.set(key, value);
  }

  async get(key: string): Promise<CheckpointResult | null> {
    return this.store.get(key) ?? null;
  }

  async list(prefix: string): Promise<CheckpointResult[]> {
    const results: CheckpointResult[] = [];
    for (const [k, v] of this.store.entries()) {
      if (k.startsWith(prefix)) results.push(v);
    }
    return results;
  }
}

// ─── Registry ───────────────────────────────────────────────────────────────────

export class T3SubgraphRegistry {
  private backend: RegistryBackend;

  constructor(backend: RegistryBackend = new InMemoryBackend()) {
    this.backend = backend;
  }

  /**
   * A validator publishes its latest CheckpointResult after running a checkpoint.
   * Key format: `{geography}:{window_start}:{validator_id}`
   */
  async publish(result: CheckpointResult): Promise<void> {
    const key = this._key(result.window.start, result.validator_id);
    await this.backend.set(key, result);
  }

  /**
   * Retrieve a specific validator's result for a window.
   */
  async getResult(windowStart: string, validatorId: string): Promise<CheckpointResult | null> {
    return this.backend.get(this._key(windowStart, validatorId));
  }

  /**
   * List all published results for a given window start date.
   * Used by T3CrossReference to gather peer results.
   */
  async listForWindow(windowStart: string): Promise<CheckpointResult[]> {
    return this.backend.list(`${windowStart}:`);
  }

  private _key(windowStart: string, validatorId: string): string {
    return `${windowStart}:${validatorId}`;
  }
}
