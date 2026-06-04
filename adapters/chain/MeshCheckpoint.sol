// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  MeshCheckpoint
 * @notice Minimal on-chain checkpoint commitment registry for Pulser Mesh.
 *
 * Each mesh node calls `commitCheckpoint` once per checkpoint window to anchor
 * its substrate boundary projection on-chain. Validators can reconstruct the
 * full checkpoint history from emitted events without trusting any single node.
 *
 * Deployment:
 *   Local:   npx hardhat run --network localhost (or Anvil)
 *   Testnet: npx hardhat run --network sepolia
 *
 * No access control is applied in v1 — any address can commit. Spam resistance
 * and staking-based sybil resistance are deferred to a future version.
 */
contract MeshCheckpoint {
    // ─── Events ───────────────────────────────────────────────────────────────

    /**
     * @param node        The mesh node's Ethereum address.
     * @param commitment  The substrate boundary projection hash (32 bytes).
     * @param windowStart UNIX timestamp of the checkpoint window start.
     * @param windowEnd   UNIX timestamp of the checkpoint window end.
     */
    event CheckpointCommitted(
        address indexed node,
        bytes32 commitment,
        uint32 windowStart,
        uint32 windowEnd
    );

    // ─── Storage ──────────────────────────────────────────────────────────────

    /// @notice Returns the last commitment hash for a given (node, windowStart).
    mapping(address => mapping(uint32 => bytes32)) public commitments;

    // ─── Core ─────────────────────────────────────────────────────────────────

    /**
     * @notice Anchor a substrate projection_commitment for a checkpoint window.
     * @dev    Overwrites any previous commitment for the same (msg.sender, windowStart).
     *         Idempotent: re-committing the same hash is a no-op in terms of state.
     */
    function commitCheckpoint(
        bytes32 commitment,
        uint32 windowStart,
        uint32 windowEnd
    ) external {
        require(windowEnd > windowStart, "MeshCheckpoint: invalid window");
        commitments[msg.sender][windowStart] = commitment;
        emit CheckpointCommitted(msg.sender, commitment, windowStart, windowEnd);
    }

    /**
     * @notice Verify that a node committed a specific hash for a window.
     * @return True if the stored commitment matches the provided hash.
     */
    function verify(
        address node,
        uint32 windowStart,
        bytes32 expectedCommitment
    ) external view returns (bool) {
        return commitments[node][windowStart] == expectedCommitment;
    }
}
