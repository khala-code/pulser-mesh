# Transport — How NodeGossip Moves

This document specifies how `NodeGossip` messages move between nodes. It
is deliberately scoped to the wire format and delivery mechanics. The
truth model — how a receiving node evaluates what it receives — is
specified in `docs/gossip.md`. This document only covers how a message
gets from one node to another.

The core principle throughout is **transport-truth separation**: the
transport layer is an optimisable, replaceable infrastructure concern.
The truth model is a protocol invariant. Changes to how messages travel
must never require changes to how messages are evaluated.

---

## 1. The Two Transport Modes

### Mode A — Direct Neighbour HTTP (v1 baseline)

Node A has Node B's URL in its peer table. At each checkpoint, Node A
assembles its `NodeGossip` and POSTs it directly to Node B's
`POST /gossip` endpoint. Node B does the same in return.

```
Node A  ──POST /gossip──►  Node B
Node B  ──POST /gossip──►  Node A
```

Properties:
- No intermediary. The message either arrives or it doesn't.
- Latency is network round-trip only.
- Relay metadata fields (see §3) are absent or empty.
- The receiving node can trust that `node_id` in the message is the
  direct sender because there is no relay path to spoof.
- Correct and sufficient for v1 with a small peer set (tens of nodes).

Failure behaviour: a POST that fails (timeout, connection refused, non-2xx)
is logged and dropped. The receiving node's picture of that peer becomes
stale. No retry storm. The next checkpoint's broadcast is a fresh attempt.

### Mode B — Relay via Broker

Node A publishes its `NodeGossip` to a broker (pub/sub topic, message
queue, or relay node). The broker forwards it to all subscribers,
including Node B. Node B receives the message through the broker rather
than directly from Node A.

```
Node A  ──publish──►  Broker  ──deliver──►  Node B
```

The broker may be:
- A pub/sub service (Redis Streams, NATS, Kafka)
- A relay node — another Pulser Mesh node acting as a message forwarder
- A regional aggregator that buffers and fans out broadcasts for a subnet

Properties:
- Lower coordination cost at scale; one publish reaches many subscribers.
- Introduces a relay path that must be audited (see §3 and §4).
- The `node_id` in the message is still the originating node, not the
  broker. The broker's identity is carried in relay metadata.
- Correct for v2 and beyond when the peer set grows beyond direct HTTP's
  practical scale.

---

## 2. The NodeGossip Envelope

When a `NodeGossip` travels via relay, it is wrapped in an envelope that
preserves the original message and adds relay metadata. The receiving node
unpacks the envelope, verifies relay metadata, and processes the inner
`NodeGossip` exactly as it would a direct message.

```
GossipEnvelope {
  gossip:           NodeGossip    # the original message, unmodified
  relay_path: [                   # ordered list of relay hops
    {
      relay_id:     string        # opaque identifier of this relay node
      relay_za:     float         # relay node's Za at time of relay
      relay_omega:  float         # relay node's Ωa aggregate at time of relay
      relayed_at:   int           # wall-clock ms at time of relay
      hop_index:    int           # 0 = direct from origin, 1 = first relay, etc.
    }
  ]
  origin_checkpoint_hash: string  # checkpoint_hash from the inner gossip,
                                  # repeated here for fast staleness check
                                  # without unpacking the full message
}
```

For direct HTTP (Mode A), the envelope is omitted. The `NodeGossip` is
sent as the POST body directly. There is no relay path.

### Why relay_za and relay_omega

These fields exist to enable the broker consistency check (§4). A relay
node that is itself a Pulser Mesh participant has a Za position and an
Ωa mass. The receiving node can compare the relay's claimed Za with what
it knows about that relay's domain vector table from previous gossip. A
relay whose claimed Za has drifted sharply between the gossip it just
relayed and its own prior broadcasts is a relay worth treating with
scepticism.

This is lightweight. It does not require cryptographic verification. It
is a geometric plausibility check — the same principle the mesh uses
everywhere: consistency is detectable from the geometry without a trusted
third party.

---

## 3. Relay Metadata and What It Reveals

Relay metadata is not secret. A node that relays gossip is publicly
acknowledging that it did so, at what Za position it sat when it relayed,
and how much Ωa mass it carried at that moment.

This means:
- A broker cannot relay anonymously. Its identity is in the relay path.
- A broker that alters the inner `NodeGossip` will produce a
  `gossip.checkpoint_hash` that does not match `origin_checkpoint_hash`.
  The receiving node detects the tampering immediately and discards.
- A broker that delays messages will show a `relayed_at` timestamp far
  from `gossip.checkpoint`'s expected wall-clock window. The receiving
  node can flag the delay and apply a scepticism weight to that relay's
  future messages.
- A broker that drops messages selectively will show gaps in the
  receiving node's `gossip_log` that are inconsistent with the broker's
  claimed relay_omega (a high-mass broker claiming to relay everything
  but producing systematic gaps is a detectable pattern).

None of these checks require the receiving node to trust the broker. They
are all derivable from the receiving node's own local log and the relay
metadata in the envelope.

---

## 4. The Broker Consistency Check

This is the operationalisation of the principle from `docs/gossip.md` §9:
every node maintains a local ground truth and uses it to audit broker
signal.

The check runs once per received `GossipEnvelope` with a non-empty
`relay_path`. It does not run for direct HTTP messages (Mode A).

```
for each hop in envelope.relay_path:
  prior_relay_gossip = gossip_log.latest(peer_id = hop.relay_id)

  if prior_relay_gossip is None:
    # First time seeing this relay. Accept, log, accumulate.
    continue

  # Check 1: Za drift
  za_drift = abs(hop.relay_za - prior_relay_gossip.node_za)
  if za_drift > ZA_DRIFT_THRESHOLD:          # default: pi/4
    log_relay_anomaly(hop.relay_id, "za_drift", za_drift)

  # Check 2: Timestamp lag
  expected_lag = checkpoint_period_ms * (local_checkpoint - gossip.checkpoint)
  actual_lag   = hop.relayed_at - gossip_origin_wall_clock_estimate
  if actual_lag > expected_lag * LAG_TOLERANCE:  # default: 2.0x
    log_relay_anomaly(hop.relay_id, "lag", actual_lag)

  # Check 3: Checkpoint hash integrity
  if envelope.origin_checkpoint_hash != envelope.gossip.checkpoint_hash:
    log_relay_anomaly(hop.relay_id, "hash_mismatch", None)
    discard envelope
    return
```

A relay that accumulates anomaly log entries across many envelopes can
be downweighted or removed from the peer table by the node operator.
This is a manual action in v1. Automated scepticism weighting is v2.

The `relay_anomaly_log` table is the audit trail of broker behaviour.
It is the mesh's institutional memory of which brokers have been
geometrically consistent and which have not. Over time, brokers with
clean anomaly logs will attract more routing; brokers with dirty logs
will lose it. This is the legitimacy competition from `gossip.md` §9
made operational.

---

## 5. Peer Discovery

### v1 — Manual configuration

Peers are added via `POST /gossip/peers` (admin-authenticated). The
peer table stores `{peer_id, url, added_at, last_seen_checkpoint}`.
Manual config is correct for a controlled early deployment.

### v2 — Steward-mediated discovery

When a steward registers on a node, the steward carries a `home_node_url`
in their registration payload. The receiving node can optionally send a
peer introduction message to the steward's home node: "I have one of
your stewards; here is my gossip endpoint." The home node adds the
introducing node to its peer table.

This is architecturally consistent with the principle that nodes are
delegates of stewards. Stewards are the connective tissue of the mesh.
A steward who operates on two nodes is implicitly creating a peer
relationship between those nodes, and the peer discovery protocol
formalises that relationship without requiring any central directory.

The introducing node does not need to be trusted. It is simply providing
a URL. The receiving home node will evaluate the introducer's geometric
signal over subsequent checkpoints through the same consistency check
it applies to all peers.

### What peer discovery must not do

- Require a central registry or bootstrap authority
- Require the introducing party to vouch for the introduced party
- Reveal steward identity or Za position during the introduction

The introduction is: "here is a URL that speaks `POST /gossip`." Nothing
more. The mesh evaluates the rest geometrically.

---

## 6. Transport Invariants

These properties must hold regardless of which transport mode is in use.
They are the contract between the transport layer and the truth model.

1. **The inner `NodeGossip` is never modified in transit.** Relay nodes
   add envelope metadata but do not alter `gossip.*` fields.

2. **`checkpoint_hash` integrity is always checkable.** `origin_checkpoint_hash`
   in the envelope must equal `gossip.checkpoint_hash`. Any mismatch
   means the message was altered and must be discarded.

3. **`node_id` always refers to the originating node, not the relay.**
   A broker's identity is in `relay_path`, never in `gossip.node_id`.

4. **Stale messages are discarded before processing.** The staleness
   check from `gossip.md` §6.1 applies to the `gossip.checkpoint` field
   in the inner message, not to any relay timestamp.

5. **Transport failure is silent degradation, not protocol failure.**
   A message that does not arrive leaves the receiving node with a stale
   picture of that peer. It does not corrupt the receiving node's own
   state. The next successful delivery corrects the staleness.

6. **No transport layer secret.** Relay path, relay Za, relay timing —
   all of this is visible to the receiving node. There is no transport-level
   credential or token that a broker holds but the receiving node cannot
   inspect.

---

## 7. v1 Seam — What the Server Needs

For direct HTTP gossip (Mode A), the server needs:

- **`peers` table** — `(peer_id, url, added_at, last_seen_checkpoint,
  last_seen_at, anomaly_count)`. The anomaly count is v1's manual signal.
- **`POST /gossip`** — accepts a raw `NodeGossip` (no envelope in v1;
  direct HTTP only). Runs the processing pipeline from `gossip.md` §6.
  Writes to `gossip_log`.
- **`GET /gossip/peers`** — returns peer list with last_seen and anomaly
  count. Useful for operator observation.
- **`POST /gossip/peers`** — adds a peer by `{peer_id, url}`. Admin-auth.
- **`DELETE /gossip/peers/{peer_id}`** — removes a peer. Admin-auth.
- **Gossip emit task** — fires on `advance_checkpoint`, assembles local
  `NodeGossip`, POSTs to every URL in the peer table. Logs failures to
  `peers.last_seen` gap (no update = delivery failure).

The `GossipEnvelope`, relay metadata, broker consistency check, and
steward-mediated peer discovery are v2 additions. They plug into the
existing `POST /gossip` endpoint as an extended request body without
breaking the v1 direct HTTP path.
