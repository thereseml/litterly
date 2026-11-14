# Architecture Decision Register

All decisions below are **proposals** pending stakeholder approval. Record accepted/rejected decisions and dates here before basing an implementation plan on them.

| ID | Decision | Current proposal | Status | Gate / open question |
| --- | --- | --- | --- | --- |
| ADR-001 | Mobile application stack | Expo + React Native + TypeScript for iOS and Android. | Proposed | Confirm team skills, native-module needs, accessibility and minimum OS targets. |
| ADR-002 | Backend and primary database | Supabase managed Postgres, Auth, Storage, and Edge Functions in a suitable EU region. | Proposed | Confirm DPA/data residency, subprocessors, backup/restore, support needs, plan/cost, and performance. |
| ADR-003 | Authorization | RLS for row access plus transaction-backed server commands for sensitive state transitions. | Proposed | Approve full owner/editor/reader/buyer/support matrix; test RLS and privileged paths. |
| ADR-004 | Offline replication | PowerSync client SQLite and Sync Streams backed by Supabase Postgres. | Proposed | Prove native build, sync/write path, same-field conflict workflow, access revocation, data minimization, and operational cost. |
| ADR-005 | Offline writes | Local pending commands; authenticated idempotent server validation/application for domain transitions. | Proposed | Finalize command taxonomy, conflict ownership, and pending-birth visibility. |
| ADR-006 | In-app billing | Platform billing integration; evaluate RevenueCat; backend kennel entitlement ledger is canonical. | Open | Confirm per-litter purchase mapping, ownership transfer, refunds, subscription lifecycle, regional exceptions, and store review. |
| ADR-007 | File storage | Private object storage with Postgres metadata/share grants and short-lived downloads. | Proposed | Confirm file limits, retention/deletion, revocation expectations, scanning, and document renderer. |
| ADR-008 | Sensitive-data offline policy | Minimize local copies; wipe local account data on logout/switch; define encryption and offline access window. | Open | Product/legal must decide risk tolerance; disconnected device revocation cannot be immediate. |
| ADR-009 | Deployment model | Managed modular monolith, separate dev/staging/prod environments, schema-as-code and tested migrations. | Proposed | Choose CI/CD and environment ownership after stack approval; ensure production data is not used in dev. |
| ADR-010 | Buyer application entry surface | Minimal mobile web application form from link/QR; ongoing authenticated buyer access through the mobile app. | Planning assumption | Explicitly approve this narrow web surface against the MVP's “no web client” exclusion; decide if applicants must create an account before submission. |

## Approval Checklist

- Confirm technology choices with the people who will maintain and operate the product.
- Complete data residency, privacy, and supplier review for Supabase and PowerSync, including contracts and subprocessors.
- Prove that RLS and PowerSync Sync Streams enforce the same intended read scope without treating either as a substitute for the other.
- Prove that all local writes pass through an authorized, idempotent backend write path for sensitive operations.
- Resolve offline caching and device revocation expectations, including buyer and health data.
- Validate store billing rules and per-litter product modeling in the actual target storefronts.
- Confirm a file/document processing approach using representative kennel templates.
- Record accepted ADRs, then produce the implementation plan with dependencies and acceptance tests.

## Unresolved Business Decisions That Block Final Design

- Complete permissions by role, including reader access to buyer information and health records.
- Membership removal/account recovery and local data handling after membership ends.
- Audit event retention and who can view audit history.
- Access revocation requirements for active sessions, cached data, buyer downloads, and exports.
- Matched/withdrawn application retention and consent/legal requirements.
- Subscription lifecycle, refund and payment-failure behavior.
- Time, date, measurement units, weight alerts, and due-date estimation rules.
- Export/deletion scope and retention after kennel deletion.
- Buyer applicant identity and consent/account flow, including the narrow mobile web intake exception to the no-web-client MVP boundary.

See the [business open-questions register](../litterly-v2/open-questions-and-proposed-requirements.md) for the source list.
