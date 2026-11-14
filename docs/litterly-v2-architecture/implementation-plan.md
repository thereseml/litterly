# Litterly V2 Implementation Plan

**Status: Planning baseline.** This plan converts the business requirements and proposed architecture into a dependency-ordered delivery sequence. It intentionally has no estimates: the repository contains no product code, team composition, or delivery constraints from which to estimate responsibly. The Expo/React Native, Supabase, and PowerSync stack remains provisional until Phase 0 passes and the decision register is approved.

## Planning Rules

- Deliver vertical slices that include authorization, persistence, UI, and tests, not disconnected infrastructure alone.
- Keep requirement IDs attached to implementation issues and acceptance tests.
- Treat server/database state as authoritative for membership, entitlements, matching, and final outcomes; clearly label local pending work.
- No phase can waive a security/privacy or data-reliability acceptance criterion to meet a schedule.
- Unresolved product decisions are explicit phase gates. Implementers must not silently invent policy.
- Each phase ends with a demoable result and an explicit exit review before dependent work expands.

## Phase 0: Decisions and Technical Proof of Concept

**Goal:** Prove the riskiest architecture assumptions before committing product implementation to a stack.

**Prerequisites:** Confirm that the proposed stack is an acceptable candidate for evaluation. Review blocking questions in the [business open-questions register](../litterly-v2/open-questions-and-proposed-requirements.md).

**Work:**

- Build a minimal Expo app with supported iOS and Android development builds and PowerSync's native SQLite adapter. Do not use Expo Go as the production compatibility test.
- Connect a local/development Supabase Postgres project and a PowerSync development instance; define one kennel-scoped stream.
- Prove offline read, local write, process restart, reconnect, retry, and authoritative server round-trip.
- Implement one typed, authenticated, idempotent write-back command for a pending birth. Verify the server checks current membership and atomically resolves a mock entitlement result.
- Demonstrate same-field concurrent edits reaching a review state without silent last-write-wins; demonstrate independent field edits merging.
- Test a minimal owner/editor/reader and two-kennel boundary through direct API requests, RLS, Sync Streams, and a buyer-scoped read fixture.
- Trace a private file metadata/share-grant check, without committing to a document renderer.
- Research/validate iOS and Google Play purchase product mapping for the free litter, per-litter purchase, and subscription models. Do not make a real production purchase integration in this phase.
- Record performance, operational cost, EU data processing/residency, and licensing/vendor risks for Supabase and PowerSync.

**Exit criteria:**

- Development builds run on physical or representative iOS and Android devices.
- Pending work survives app restart/offline periods and is either accepted exactly once or remains visibly pending/rejected with a retry/review path.
- Current server membership and tenant scope are checked at write time; direct cross-kennel and buyer-to-buyer requests are denied.
- The conflict demo preserves both same-field candidates for explicit resolution.
- Billing policy research identifies a compliant candidate product model or an unresolved blocker; no client-only payment assertion is accepted.
- Stakeholders accept, reject, or revise ADR-001 through ADR-008 in the [decision register](decision-register.md). If the offline model or supplier/compliance review fails, revise the architecture before proceeding.

**Traceability:** `BR-OFF-*`, `BR-ACC-03`/`04`, `BR-BUY-05`/`06`, `BR-BIL-01`/`03`/`05`.

## Phase 1: Product and Platform Foundations

**Goal:** Establish a safe, repeatable foundation for domain work.

**Dependencies:** Phase 0 accepted; platform, backend, and sync choices approved for MVP development.

**Work:**

- Create the mobile app and backend project structure, environment configuration, and separate local/development, staging, and production environments.
- Add schema-as-code migrations, local backend startup/test instructions, generated database types if applicable, and safe migration review practices.
- Add CI checks for formatting, static analysis/type checks, unit tests, database migration validation, and security-sensitive integration tests.
- Establish secret handling, error reporting, structured logs, backup/restore expectations, and alert ownership. Never put server or provider secrets in the mobile client.
- Set up localization infrastructure for English, Swedish, Norwegian Bokmål, Danish, and Finnish. Define how dates, times, numbers, and measurement units are formatted before domain screens ship.
- Add a common authorization/error/sync-state presentation pattern so features can show pending, synced, and review-needed states consistently.
- Add an outbox/job foundation if confirmed as the selected approach for asynchronous work; notification delivery must not be a transaction prerequisite.

**Exit criteria:**

- A clean checkout can run the documented local stack and automated tests.
- Migrations apply from an empty database and fail safely on invalid order/schema.
- CI blocks merge on failed checks and has a path for database/RLS tests.
- No production secrets or production personal data are required for local development.
- Every supported language can render a representative flow without hard-coded UI strings; locale formatting decisions are documented.

**Traceability:** `BR-NOT-03`, release outcomes in [MVP boundaries and release](../litterly-v2/mvp-boundaries-and-release.md).

## Phase 2: Identity, Kennel, and Access Governance

**Goal:** Establish authenticated users, kennel ownership, and enforceable role boundaries before operational data is introduced.

**Dependencies:** Phase 1. The complete role/action matrix and account recovery/member-removal behavior must be approved.

**Work:**

- Implement email-based and Apple/Google authentication, account recovery, and session handling.
- Implement kennel creation, membership lifecycle, owner/editor/reader roles, personal invitations, acceptance/expiry/revocation, and the one-active-kennel constraint.
- Implement two-party ownership transfer as an atomic, auditable flow that keeps kennel data and entitlements attached to the kennel.
- Implement RLS and negative tests for every initial table and operation. Establish current membership as the authorization source; do not trust client-selected kennel IDs.
- Add account/kennel support metadata separation and a support workflow that cannot read operational rows.
- Implement export request and deletion workflows only after export contents, retention, legal basis, confirmation, and 30-day cancellation/final deletion behavior are approved. Until then, expose no misleading placeholder that implies deletion has completed.
- Define audit event schema and retention before enabling sensitive admin operations in production.

**Exit criteria:**

- New users can create/recover an account and create a kennel with only the required initial information.
- Owner/editor/reader permissions pass an approved role matrix via both UI and direct API/RLS tests.
- Invitations are recipient-bound and single-use/expiring; membership rules prevent a second active kennel.
- Ownership transfer requires both confirmations, preserves records/entitlements, and is audit-recorded.
- Support access is demonstrably denied operational-data access.
- Deletion/export are either implemented to approved policy or explicitly blocked from production scope pending decisions.

**Traceability:** `BR-ACC-*`.

## Phase 3: Animal, Litter, and Core Breeder Workflows

**Goal:** Deliver the private kennel operational workspace and primary litter lifecycle.

**Dependencies:** Phase 2. Approve lifecycle states, required/optional fields, correction rules, units/timezone handling, due-date formula, weigh-in cadence, and weight thresholds. Phase 0 sync patterns must be productionized for these entities.

**Work:**

- Implement kennel-scoped owned animal profiles and kennel-scoped limited external parent profiles, with searchable cat/dog breed selection and “Other”.
- Implement parent-linked planned litters and agreed litter/offspring lifecycle states.
- Implement birth entry with stable IDs and temporary newborn identity, including birth order, time, sex, identifying characteristics, optional birth weight, and later name assignment.
- Implement individual weights and efficient multi-offspring weighing rounds with agreed duplicate behavior and units.
- Implement private timeline entries and kennel-created checklists; implement explicit delivery review for incomplete checklist items.
- Implement operational overview for active litters, upcoming tasks, checklist progress, and configured weight flags/trends.
- Implement animal availability and final outcome as separate state dimensions; preserve history when retired, delivered, deceased, or archived.
- Apply offline local persistence and sync states to all agreed essential structured operations; implement conflict review and retry/recovery paths.

**Exit criteria:**

- A kennel can record planned mating through born litter, individual offspring, weights, notes, timeline, and checklists.
- Temporary identity can be replaced with an official name without losing relationships or history.
- Duplicate weights follow the approved update/review behavior; same-field conflicts preserve both candidates.
- No weight flag is presented as a veterinary diagnosis; thresholds/cadence are kennel-configured as decided.
- Delivery is not silently blocked or silently accepted when checklist items are incomplete; the user reviews and confirms how to proceed.
- A litter is never auto-archived, and a match/reservation never implies delivery.
- Offline work survives restart and reconnects without data loss or duplicate authoritative records.

**Traceability:** `BR-ANI-*`, `BR-LIT-*`, `BR-OFF-01` through `BR-OFF-03`.

## Phase 4: Buyer Applications, Matching, and Buyer Access

**Goal:** Collect applications privately and expose only explicitly authorized buyer information.

**Dependencies:** Phases 2 and 3. Current planning assumption is a minimal mobile web application form from a link/QR, with ongoing authenticated buyer access through the mobile app. Explicitly approve this narrow web surface against the “no web client” MVP exclusion. Decide buyer identity/account requirements, link expiration/revocation, application editing/version behavior, spam controls, matched/withdrawn retention, and reader access to buyer PII. Public/unlisted links must not create a public kennel web client or marketplace.

**Work:**

- Implement kennel-configurable application questions and version forms so submitted answers retain their meaning after a form changes.
- Implement unlisted links/QR codes and direct invites with rate limits, abuse protection, and link revoke/expiry behavior.
- Implement the minimal mobile web intake surface and a clear transition to the mobile app for ongoing buyer access; revise this scope if stakeholders reject the web-surface exception.
- Implement applicant identity and account flow; persist Litterly privacy-policy and kennel-notice versions and consent time.
- Implement multiple applications per buyer, update and withdrawal paths, and notification suppression after withdrawal.
- Implement matching with a server-side uniqueness constraint for active offspring matches and private buyer information.
- Implement buyer views for own applications, matched animal, and explicitly published eligible litter updates; no direct messaging.
- Implement post-delivery cutoff for litter updates while preserving explicitly shared own-animal documents as defined by the requirements.
- Implement unmatched-application deletion after 12 months and agreed lifecycle for other application types.

**Exit criteria:**

- A buyer can apply to multiple litters/animals and cannot see other buyers' data.
- A buyer can complete the application from the approved link/QR journey without being shown kennel/member-only data or other applicants' information.
- Consent records identify the exact policy/notice versions accepted and the acceptance time.
- Withdrawn applications cannot be matched and produce no later application-related notifications.
- Concurrent attempts to match one offspring cannot create two active matches.
- Private timeline entries remain private; buyer-visible updates require explicit publication and eligibility.
- Delivery removes litter-update access; own-animal document grants follow the approved lifecycle.
- Retention jobs are idempotent, auditable, and tested against the approved policy.

**Traceability:** `BR-BUY-*`, `BR-LIT-06`, `BR-DOC-02`, `BR-NOT-01`/`02`.

## Phase 5: Health Records, Media, Templates, and Generated Documents

**Goal:** Provide private health records and controlled document workflows.

**Dependencies:** Phases 2 and 3; buyer sharing from Phase 4 for buyer-scoped documents. Approve structured health fields, supported formats/size limits, deletion/retention, share revocation, and representative template behavior.

**Work:**

- Implement structured health records for current, retired, and historical kennel-owned animals.
- Implement private-by-default uploads with validated metadata, progress/failure states, ownership checks, and explicit share grants.
- Implement DOCX placeholder and fillable PDF template ingestion, field detection/mapping review, required-field activation checks, and versioning.
- Implement authorized PDF generation with template/data provenance and private output storage.
- Implement buyer-specific document sharing and post-delivery access only for the matched buyer/animal relationship.
- Add content-type/size limits, safe document parsing, malware scanning or an explicitly approved alternative, and operational cleanup rules.

**Exit criteria:**

- Files cannot be listed, read, replaced, or deleted across kennel boundaries through direct API/storage calls.
- Buyer file access requires a current, explicit grant and does not expose other buyers' or animals' files.
- Offline selected local files are never represented as uploaded/shared.
- Templates with unresolved required fields cannot activate; representative DOCX and PDF templates generate acceptable output on supported platforms/viewers.
- Generated files retain the source template version and data provenance; electronic signatures and Litterly-provided legal/veterinary content remain excluded.
- Revocation behavior and limits for previously downloaded files are stated to users and match approved policy.

**Traceability:** `BR-DOC-*`, `BR-OFF-04`, `BR-BUY-07`.

## Phase 6: Billing and Entitlement Enforcement

**Goal:** Make access rules work with confirmed purchases and subscriptions without losing offline work.

**Dependencies:** Phase 0 policy research; phases 2 and 3; approved billing products, provider, store mappings, ownership-transfer, refund, renewal, and failure policies.

**Work:**

- Implement kennel-owned entitlement ledger and event history with provider transaction IDs, idempotency, effective dates, and audited manual correction policy.
- Implement one free litter entitlement and consume it atomically at the first confirmed birth.
- Implement selected platform purchase/subscription flows, server verification or trusted provider notifications, transaction deduplication, restore/reconciliation, cancellation/refund/revocation, and owner payment-method management.
- Gate authoritative birth acceptance on confirmed entitlement. Preserve offline local birth entries as pending until entitlement resolves.
- Keep prices and currencies configurable; localize price display from the store/provider response rather than hard-coding amounts.
- Test entitlement transfer when kennel ownership changes without transferring the kennel's records to a purchaser's personal account.

**Exit criteria:**

- Checkout completion alone never grants product access; only a verified server-side event/transaction updates the kennel ledger.
- The free entitlement is consumed exactly once, and further births follow the approved product rule.
- Duplicate/out-of-order provider events do not duplicate or incorrectly revoke access.
- Refund, cancellation, renewal failure, owner transfer, and restore outcomes follow approved policies.
- Offline birth records remain intact and clearly pending through payment failure or delayed verification.
- Platform purchases pass store sandbox testing and current policy review before production enablement.

**Traceability:** `BR-BIL-*`, `BR-OFF-05`, `BR-ACC-06`.

## Phase 7: Notifications, Localization, and Pilot Readiness

**Goal:** Complete cross-cutting user communication and validate release-level outcomes on iOS and Android.

**Dependencies:** Feature event definitions and privacy decisions from Phases 2–6.

**Work:**

- Implement preference-aware notifications for checklist/weight events, applications, publications, matches, and documents through the selected channels.
- Keep important state in-app; notifications are not the sole delivery surface. Keep sensitive payloads minimal and check access eligibility at send time.
- Complete Swedish, Norwegian Bokmål, Danish, Finnish, and English UI copy and locale formatting.
- Complete accessibility checks, device/OS support matrix, performance/resource testing, and crash/offline recovery testing.
- Complete threat modeling, RLS/storage policy review, privacy/legal review, backup/restore test, deletion/retention test, and support/runbook readiness.
- Prepare app review accounts/demo data and review notes without exposing real kennel/buyer data.
- Run end-to-end controlled-pilot journeys on representative iOS and Android devices.

**Exit criteria:**

- Notification preferences work by member and relevant litter, with required security/invitation notices protected from disablement.
- Buyer withdrawal and access revocation suppress later ineligible messages.
- All five interface languages work through onboarding, litter workflows, buyer access, payment states, and document generation.
- Pilot journeys meet [release-level outcomes](../litterly-v2/mvp-boundaries-and-release.md) on both platforms.
- Security, privacy, data-reliability, store-policy, and operational sign-offs are recorded; no unresolved blocking decision is hidden as an implementation default.

**Traceability:** `BR-NOT-*`, `BR-ANI-*`, `BR-LIT-*`, and all release-level outcomes.

## Cross-Phase Engineering Requirements

- Every migration includes schema review and tests for RLS, constraints, indexes, and rollback/forward-recovery expectations.
- Every endpoint/function is tested for authentication, authorization, validation, idempotency, and failure behavior.
- Every offline-capable workflow is tested with network loss before, during, and after a mutation, app termination, retry, duplicate upload, and concurrent device changes.
- Every private file workflow is tested against unauthorized list/read/write/delete and buyer-share revocation.
- Maintain synthetic fixtures for at least two kennels, multiple roles, multiple buyers, external parent profiles, and conflicting devices.
- Log operational identifiers and outcomes, not unnecessary health, buyer, or document content.
- Keep analytics out of sensitive health/application fields unless an explicit privacy review approves the collection.

## Plan Exit: Ready for Controlled Pilot

The plan is complete when all phase exit criteria are met, requirement coverage is traceable, unresolved decisions are either closed or explicitly outside the pilot scope, and the end-to-end journeys meet the release-level outcomes on both iOS and Android. This is not a substitute for production, legal, or app-store approval.
