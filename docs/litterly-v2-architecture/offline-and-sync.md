# Offline and Synchronization Design

**Status: Proposed design requiring a proof of concept.** This is the highest-risk technical area because the product must accept essential local work while preserving server authority over access, payment, matching, and durable records.

## Proposed Components

- Expo/React Native mobile app.
- PowerSync React Native SDK backed by local SQLite for operational data and pending writes.
- Supabase Postgres as authoritative shared state.
- PowerSync Sync Streams for user/kennel-scoped replication.
- Authenticated write-back commands to the backend; server-side transactions validate and apply domain mutations.

The native PowerSync SQLite adapter requires a custom Expo development build and is not compatible with Expo Go's sandbox. Include an iOS and Android development-build spike early; do not treat Expo Go success as proof that the production native stack works.

Do not use a sync stream as an authorization policy. Do not enable unrestricted client writes to core tables just because they appear in a local SQLite database.

## Read and Write Paths

1. The UI reads operational records from local SQLite so available data remains usable offline.
2. A user action updates local state immediately and is marked `pending` locally. The UI must distinguish local acceptance from server persistence.
3. When online, the sync connector uploads a typed, idempotent command using the signed-in user's credentials.
4. The server revalidates identity, active kennel membership, role, referenced-record ownership, and business invariants in a transaction.
5. The server returns or persists the command result. Authoritative rows then replicate back to the client; rejected/conflicting commands remain visible for review with a safe recovery path.
6. Uploaded command retries use stable operation IDs/idempotency keys so a network retry cannot create duplicate births, matches, entitlement consumption, or documents.

For simple edits, operations may be grouped into a transaction-aware command batch. For consequential operations (birth confirmation, match, delivery, ownership, entitlement), use explicit domain commands rather than treating arbitrary row patches as valid business actions.

## Payment-Gated Birth Behavior

- Offline entry creates a local pending birth and associated newborn records; it is not yet authoritative or fully available to other kennel members.
- On sync, the server checks the kennel's free entitlement, prior consumption, active subscription, and confirmed one-litter purchase using an atomic transaction.
- If entitled, the server accepts the birth and consumes the entitlement exactly once.
- If payment is required or cannot yet be verified, the server preserves the pending state and tells the client what owner action is required. It must not discard the offline birth.
- After purchase confirmation, the same pending operation can be retried idempotently. Checkout completion alone does not grant access.

The product must clarify whether other team members can see a locally pending birth on the originating device, whether it can sync to the kennel as explicitly pending, and what happens if entitlement is still unresolved for an extended period.

## Conflict Handling

- Independent field updates should merge when they do not violate domain invariants.
- Same-field concurrent edits must preserve both candidates and require an authorized member to choose/resolve; avoid last-write-wins for business data.
- For each command type, define whether it is a field patch, append-only event, or state transition.
- Prefer append-only history for weights, consent, payment events, audit events, and final outcomes. Correct errors with explicit correction records or versioned updates rather than silently rewriting consequential history.
- Deletion-versus-edit, duplicate birth submissions, same-animal matches, and ownership changes require dedicated conflict rules.

## Local Data and Revocation

PowerSync keeps data on device, and a device can be offline while membership or sharing is revoked. Immediate revocation on a disconnected device is technically impossible. Before implementation, decide:

- Which records may be cached on each role's device.
- Whether local database encryption is mandatory, and the key lifecycle with OS secure storage.
- Local retention/cleanup on logout, account switch, membership ending, app reinstall, and long periods without reconnection.
- Whether any health, buyer, or document data should never be replicated to a mobile device unless explicitly opened.
- How the app rechecks authorization before serving a deep link or displaying stale sensitive data after reconnect.

Use platform-supported encrypted storage where feasible, minimize cached sensitive fields, and wipe local account data when signing out or switching users. Treat SQLCipher support/native build requirements as a validation item, not assumed protection.

## Sync Stream Design

- Sync only rows needed for the signed-in user's current active kennel and explicitly granted buyer context.
- Scope streams from authenticated identity and current server-side relationships. Never use a client-provided kennel ID as proof of access.
- Partition/subscribe by active workspace or screen to limit unnecessary local copies, while ensuring required offline workflows have completed initial sync.
- Review PowerSync replication roles/permissions and publication table scope; replicate only necessary tables.
- Ensure changes to membership, buyer publication, and file sharing cause relevant future syncs to stop or update. Existing offline copies remain subject to the revocation policy above.

## Required Proof-of-Concept Cases

- Add a birth and weigh-ins in airplane mode, terminate/reopen the app, then reconnect and verify durable exactly-once processing.
- Simulate entitlement missing, purchase pending, confirmed purchase, refund/revocation, and repeated delivery of the same provider event.
- Edit the same field on two devices while offline and verify neither value disappears.
- Make independent edits on separate devices and verify both survive.
- End a membership while a second device is offline; document exactly what can and cannot be prevented before and after reconnect.
- Switch between kennel member and buyer contexts on a shared device and verify no local cross-account leakage.

Requirement traceability: `BR-OFF-*`, `BR-LIT-02`, `BR-LIT-04`, `BR-BIL-01` through `BR-BIL-04`.
