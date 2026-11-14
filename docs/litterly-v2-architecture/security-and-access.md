# Security and Access Model

**Status: Proposed baseline.** The business requirements define role names and broad responsibilities but do not yet approve a complete permission matrix. The proposed defaults below are least-privilege guidance pending product, privacy, and legal review.

## Trust Boundaries

- The mobile client, its local database, device storage, and all submitted values are untrusted.
- Supabase Auth establishes identity; active membership and resource relationships establish authorization.
- Postgres RLS is the primary data-access boundary for user-scoped database requests.
- Edge Functions or database RPCs handle sensitive multi-row operations and must re-check the caller's identity, current membership, role, and business invariants.
- PowerSync Sync Streams filter which rows are copied to a device; they do not authorize writes and cannot retract data from a device that is offline.
- The PowerSync Postgres replication role may have elevated read privileges to replicate data. Limit its publication and credentials to the smallest practical scope; do not mistake Sync Stream filters for protection from a compromised replication service or misconfiguration.
- Storage object keys and client-supplied file paths are not secrets. Private bucket policies and metadata/share-grant checks authorize access.
- Internal support tools must use a separate, narrowly scoped path and must not grant general operational-data access.

## Candidate Permission Matrix

| Capability | Owner | Editor | Reader | Buyer | Internal support |
| --- | --- | --- | --- | --- | --- |
| Read kennel operational records | Yes | Yes | Yes | No, except explicitly shared buyer view | No |
| Create/update animal, litter, weight, timeline, checklist records | Yes | Yes | No | No | No |
| Read/manage buyer applications and matches | Yes | Yes | **Undecided; proposed deny personal buyer details** | Own application only | No |
| Publish litter updates/share files with buyers | Yes | Yes | No | No | No |
| Manage members/invitations/ownership | Yes | No | No | No | No |
| Manage billing/payment method/entitlements | Yes | No | No | No | Subscription/account support metadata only |
| Request export or deletion | Yes | No | No | No | No |
| Access kennel operational records for support | No | No | No | No | No |

This matrix needs stakeholder approval and additional rows for template activation, health-record access, audit history, member removal, and sensitive-action re-authentication. Editors are described as managing operational work; exact boundaries must be confirmed.

## Enforcement Recommendations

- Require RLS on every exposed table. Default to deny and add narrowly scoped policies for each operation.
- Derive access from current database membership and relationship rows. Do not rely on client state or long-lived role claims that can remain stale after role changes.
- Include `kennel_id` (or an equivalent tenant key) on kennel-owned data and enforce tenant consistency with foreign keys/constraints where possible.
- Use transaction-backed server commands for ownership transfer, matching, delivery finalization, entitlement consumption, and other multi-row invariants.
- Validate app roles on the server/database. Hiding a UI control is not authorization.
- Keep privileged/service-role credentials server-only. Functions that bypass RLS must have a small scope, validate caller permissions explicitly, log sensitive actions, and return only the minimum required data.
- For Storage, use private buckets, RLS on object operations, opaque object keys, size/type validation, and short-lived access URLs only after current authorization checks.
- Record auditable events for member/role changes, ownership transfer, buyer sharing/revocation, match changes, exports, deletion, and billing state transitions once retention/visibility policy is decided.
- Apply rate limits and abuse protection to public/unlisted application endpoints and invitation flows; a hard-to-guess URL alone is insufficient protection.

## Authentication and Account Security

The candidate is Supabase Auth for email and Apple/Google sign-in. Implement the authorization context separately from identity. Before production, decide session lifetime, re-authentication for export/deletion/ownership/payment changes, account recovery safeguards, MFA policy, and response to compromised accounts.

## Access Revocation and Offline Copies

Revocation has two meanings that must not be conflated:

- Server-side requests and future syncs can be denied after membership/share revocation is observed.
- Data already downloaded to a disconnected device or saved/exported by a recipient cannot be recalled immediately.

Product/legal stakeholders must define the tolerated offline access window and whether this is acceptable for kennel and buyer data. On reconnect, the app should refresh authorization before syncing further, stop exposing records no longer authorized, and remove/wipe local account data on logout or account switch where feasible. Encryption at rest reduces device-loss exposure but does not prevent a person controlling an unlocked device from reading the data.

## Verification Requirements

- Test owner/editor/reader/buyer/support access using direct API requests, not only screens.
- Prove cross-kennel reads and writes fail for every entity and storage operation.
- Prove buyer A cannot read buyer B's application, matched animal data, or documents.
- Test role change, membership end, share revocation, and account deletion with active sessions and an offline device that later reconnects.
- Test every RLS policy with both allowed and denied fixtures; require security review before production migrations.

Requirement traceability: `BR-ACC-*`, `BR-BUY-*`, `BR-DOC-02`, `BR-OFF-03`.
