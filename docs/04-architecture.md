# Mobile Architecture And Migration

## Recommended Architecture

Build an Expo/React Native TypeScript client in this repository. Reuse the existing Express/Mongoose API after security and consistency work. Keep administration on the existing web surface. Do not assume the presence of Supabase tooling means a Supabase migration is required.

```text
Litterly iOS / Android
  Native screens + design tokens
  Query cache + validated API client
  Secure credentials + account-scoped local drafts
             |
             | HTTPS, versioned authenticated API
             v
Existing API, extended and hardened
  Authorization + request validation
  Domain commands + reporting
  Sessions + entitlements + audit
             |
             +-- MongoDB replica set / transaction-capable hosting
             +-- Background jobs / durable outbox
             +-- Email provider
             +-- Apple / Google / existing Stripe adapters
             +-- Push service -> APNs / FCM

Existing breeder web and admin -> same domain authority
```

This is a recommendation, not confirmation of infrastructure ownership or permission to alter Catbreeder. This task changes documentation only; no source backend, database, or deployment has been changed.

## Decision Records

| Decision | Recommendation and rationale | Revisit when |
| --- | --- | --- |
| Native framework | Expo + React Native + TypeScript; one team and shared mobile domain/UI | A proven native-only dependency cannot be supported |
| Routing | Expo Router with native stack/tab navigation | A selected SDK version or accessibility limitation requires an alternative |
| Server state | TanStack Query; explicit invalidation after mutations | Not a substitute for offline sync or domain validation |
| Local UI state | Component state first, small shared store only when needed | Cross-route draft/session coordination makes it necessary |
| Forms | React Hook Form + runtime schemas such as Zod | Validate native accessibility and bundle impact |
| UI system | Small owned native primitives and exported theme tokens | Avoid a large component library that changes the inherited visual language |
| Charts | A maintained RN-compatible chart implementation with accessible list fallback | Select after testing target Expo version, small datasets, and gesture/screen-reader behavior |
| Credentials | Short-lived access token in memory; rotating refresh credential in SecureStore | Never use AsyncStorage/localStorage for bearer credentials |
| Local drafts | Account-scoped encrypted draft storage, backed by protected key management | Implementation proof must cover logout, reinstall/backup behavior, and shared-device access |
| Backend | Harden existing Express/MongoDB rather than rewrite domain at once | Owner explicitly selects new backend after migration-cost review |
| Build/release | EAS development/preview/production builds, TestFlight and Play testing | Organization requirements mandate self-hosted builds |
| Purchase adapter | Native Apple/Google billing; evaluate RevenueCat against direct SDKs | Provider cost, data processing, portability, and product model are agreed |

Choose supported stable package versions together when scaffolding. Do not put guessed Expo/React Native versions in a lockfile or depend on Expo Go for features requiring custom native modules, push credentials, or purchases. Use development builds early.

At foundation, record minimum supported iOS/Android versions and representative low-end/oldest-supported devices based on the selected SDK and breeder audience. Verify current store SDK/target requirements and native-library compatibility, including Android 16 KB page-size support where applicable. Define an API/binary support window, version capability response, deprecation notice, and required-upgrade behavior. An upgrade requirement must still offer protected draft recovery/export and a safe account/support path; it must not silently discard unsaved care.

## Proposed Repository Layout

```text
app/                         Expo Router routes, thin screen entry points
src/components/              Shared native primitives
src/features/                litters, animals, weighing, buyers, tasks, account
src/theme/                   Inherited tokens and accessibility variants
src/api/                     Transport, generated contracts, error handling
src/auth/                    Session lifecycle and secure storage
src/drafts/                  Protected local draft persistence
src/localization/            Swedish resources and locale formatting
src/testing/                 Fixtures and test helpers
assets/                      Approved branding and fonts
e2e/                         Native journey tests
docs/                        This blueprint
```

Do not create a speculative monorepo or duplicate the whole backend here. Keep server work in its owning repository unless a deliberate consolidation decision is made. Publish versioned API schemas/client artifacts for both repositories; maintain one authoritative contract, not manually diverging interfaces.

## Client Responsibilities

- Render native controls, optimistic drafts, loading/error/conflict states, and understandable server decisions.
- Validate for fast feedback, but treat server validation/authorization/entitlements as authoritative.
- Parse locale input to canonical numbers/dates once; render using locale formatters.
- Scope query keys and persisted drafts to account ID; clear them when changing/logging out of accounts.
- Invalidate Today, litter, animal, insights, and task queries after relevant mutations.
- Never store API secrets, Stripe secrets, email-provider secrets, or admin credentials in public Expo configuration.
- Support old/new API coexistence through a declared mobile compatibility policy. App-store rollout does not upgrade all installations immediately.

## Online-First And Draft Safety

For v1, drafts are editable without connectivity; a server mutation is only confirmed when the server acknowledges or reconciliation proves it committed. No automatic offline queue and no promise of background synchronization.

| Event | Required behavior |
| --- | --- |
| App backgrounded/killed during entry | Restore the latest protected draft for the same account |
| Offline before save | Keep draft, show offline state, offer retry when online |
| Timeout after request | Keep the same mutation ID and query/retry its status; never create a new independent mutation blindly |
| Another device edits a daily measurement | Version conflict prompts explicit review |
| Session expires | Reauthenticate same account, reconcile pending mutation, preserve draft securely |
| User logs out | Warn before discarding unsaved draft, then clear credentials, cache, device binding, and local sensitive data |
| User switches account | No previous account's draft/cache appears or submits under the new identity |

Before claiming offline-first later, add durable queue states, dependency ordering, tombstones, idempotency retention, multi-device conflict resolution, and recovery after partial history changes. Do not call a cached screen full offline support.

## Backend Work Required

### Security Gate

1. Add strict runtime schemas to all externally supplied bodies/query parameters; reject objects/arrays where scalar values are expected, including reset tokens.
2. Reproduce and resolve the reset-token query risk in an isolated environment; hash reset tokens, expire/consume once, and add regression tests.
3. Add revocable rotating refresh sessions, access-token expiry policy, refresh replay detection, and password-change/reset revocation.
4. Require recent authentication for email/password/deletion changes; verify new email and prevent account enumeration.
5. Fail closed for missing or unauthorized parent records on child reads/writes. Owner comes from session, never request body.
6. Add persistent security audit for support/admin and sensitive domain operations; exclude secrets and unnecessary personal content.
7. Unify account/litter/animal deletion paths, protect the last active administrator, and restrict sensitive mutations during impersonation.
8. Escape email HTML, add recipient validation, quotas, duplicate-send protection, and reliable minimal delivery tracking.

No production exploitation or breach is asserted. These are source-derived launch gates requiring isolated verification and remediation in the API's repository.

Native refresh must be single-flight: concurrent expired requests await one refresh and retry at most once. Define a bounded, device/session-bound recovery protocol for rotation responses lost before SecureStore persistence; exact recovery replays may return the same successor credential briefly, while mismatched/out-of-window replay revokes the session. Do not treat every immediate retry as theft or allow indefinite reuse. Test concurrent 401s, lost responses, and process death between server rotation and credential persistence. Document the security tradeoff and recovery window before implementing it.

### Integrity Gate

- Explicit ID-based weight batches, daily unique index, versioned corrections, and transaction/idempotency guarantees.
- Atomic trial/entitlement consumption with litter activation; payment processing independent of birth recording.
- Explicit reservation entity and transactional reserve/cancel/handover commands.
- Document date-only, timestamp, and timezone semantics consistently across writes/reporting/jobs.
- Foreign-reference consistency in Mongo through validated commands, indexes where possible, and repair reports.
- Readiness returns failure when the database/required dependency is unavailable; liveness is a separate check.

If current Mongo hosting is standalone, transaction-dependent launch features require moving to a replica set or an equally explicit durable consistency design. `insertMany` alone is not atomic business processing. Do not claim batch rollback without testing real transaction behavior.

## Billing And Entitlements

The source displays 249 SEK/litter and 790 SEK/year. Treat these as historical configured/displayed prices, not approved native prices. Source integration comments also describe placeholder product setup.

Litterly sells digital app functionality. The current Stripe web flow cannot simply be embedded into the native app and assumed compliant. The default recommendation is native store billing for in-app purchase offers, unified with existing Stripe entitlements server-side. Region-specific alternative-billing/link programs require explicit eligibility, enrollment, legal/commercial review, and current policy checks.

Implementation rules:

- Model subscription and litter-pass coverage independently of litter birth/status fields.
- Identify the signed-in breeder account before purchase and bind verified transactions to it; restore must not transfer another account's entitlement silently.
- Validate provider, product, environment, transaction identity, settlement state, and effective period on the server.
- Record provider events durably and process idempotently/out-of-order safely; reconcile periodically.
- Handle pending, renewal, grace, cancellation, expiry, refund, revocation, chargeback, and restore.
- Deduplicate coverage across Stripe/Apple/Google and explain where to manage the active subscription.
- A purchase-return deep link refreshes state; it never grants access itself.
- Webhooks may grant coverage, not mark a litter born without a valid breeder lifecycle command.
- Keep financial records subject to a documented retention basis; do not promise all financial data disappears immediately on account deletion.

A per-litter purchase needs an agreed store product/restoration model and durable account-level allocation ledger. Do not casually choose consumable versus nonconsumable without testing recovery and cross-device behavior. If that complexity delays launch, an annual-only native offer with preserved legacy litter passes is a decision for Therese.

Alternatively, a deliberately non-monetized first release may omit new native purchase offers and SDKs. Document free-launch eligibility server-side, hide purchase/restore entry points that have no product, and do not steer users to prohibited external purchasing. Existing paid-access correctness and provider-management obligations still apply if existing customers continue. This is an explicit commercial branch, not permission to ship a broken paywall.

## Notifications And Jobs

Add device installation records, authenticated token registration/unregistration, permission/preferences, environment separation, and a durable scheduled job/outbox path.

- v1 sends at most a user-enabled daily care digest, not an alert for every generated milestone.
- Jobs compute due work in the breeder's chosen timezone and avoid duplicate notifications after retry/date changes.
- Tokens are private, account-bound, pruned on provider errors, and dissociated on logout.
- No buyer name, contact information, private notes, or detailed health concerns on lock screens by default.
- Notification payload contains opaque route identifiers; opening still requires current authorization.
- Push denial, provider outage, and OS delivery delay do not affect the in-app task record.

Use native/local notifications only when their scheduling semantics are explicitly appropriate. They are not a substitute for an authoritative multi-device task scheduler.

## Native Links And Permissions

- Configure verified iOS universal links and Android App Links for reset/recovery and supported record routes, with safe website fallback.
- Parse allowlisted routes/parameters; never accept a role, entitlement, or arbitrary redirect from a link.
- Reset tokens are single-use, short-lived, redacted from telemetry, and not cached as normal navigation state.
- Native app uses HTTPS API authentication; CORS is not a security boundary for mobile clients.
- v1 needs notifications only when enabled. Next-release photos request camera/library access just in time, using OS pickers where possible. No contacts, location, microphone, or broad storage access is necessary for v1.

## Migration And Coexistence

Recommended default: one authoritative account/data service serving web and mobile. Confirm whether existing customers and paid access must continue before production integration.

### Before Any Data Change

Create an authorized backup and a read-only consistency report, with counts and exceptions for:

- Missing/mismatched animal owners and unresolved litter references.
- Orphan weights/diary entries and dangling buyer references.
- Duplicate daily measurements and ambiguous historical dates.
- Born/completed litters with missing dates; planned litters retaining birth dates.
- Animal/litter species or birth-date disagreement.
- Missing or ambiguous trial/payment tiers and active subscriptions without reliable expiry.
- Historical buyer-to-animal collisions and retired signup records subject to retention decisions.
- Former ownership that cannot be reconstructed from current status.

Do not infer payment rights, parent IDs, biological relationships, or historical ownership from fuzzy names/current state. Produce a manual-review queue for ambiguity.

### Safe Rollout Sequence

1. Back up, dry-run migrations on a restored nonproduction copy, and verify restore.
2. Add optional fields/new collections and a versioned API without removing old web contracts.
3. Normalize valid dates/owners and resolve duplicate weights before enabling unique indexes. Quarantine/report unresolved cases rather than deleting silently.
4. Map legacy Buyer contacts to explicit reservations only when the relationship is unambiguous; preserve original provenance and audit the mapping.
5. Keep legacy parent-name snapshots; structured parent links are opt-in/verified, not guessed.
6. Update old web writers to invoke the same lifecycle/reservation authority before mobile can rely on new invariants. Do not let an old dropdown bypass transactional commands.
7. Introduce feature flags and beta accounts; compare web/mobile reads, summaries, and entitlement decisions.
8. Release gradually, monitor conflicts/duplicates/migration exceptions, and keep a tested rollback for code plus forward-compatible data.

If a clean new backend is selected instead, first write a separate identity/password, billing, schema, verification, cutover, rollback, and customer-communication plan. Do not run two writable databases with undefined ownership or assume bcrypt hashes and subscriptions migrate automatically.

## Operations And Privacy

- Separate development/staging/production accounts, data, purchase environments, push tokens, and secrets.
- CI runs formatting, lint/types, unit/component/API contract tests, native smoke journeys, and secret/dependency scanning.
- Track request IDs, mutation outcomes, API latency, job failures, billing reconciliation, and crash-free sessions without care/buyer content.
- Define backup retention, restore testing, deletion processing, incident response, and provider data-processing agreements.
- App privacy labels and Play Data safety disclosures must match actual SDK collection, including analytics/crash and purchase providers.
- EAS updates need runtime-version compatibility, staged rollout, and rollback; native permission/SDK changes require a new binary. OTA must not bypass store review obligations.

## Policy References

Official sources consulted on 2026-11-14; recheck immediately before implementation/submission because rules vary by storefront and change over time:

- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/): payments in section 3.1, privacy/account deletion in section 5.1, completeness/reviewer access in section 2.1.
- [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738): digital functionality and alternative program requirements.
- [Google Play account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111): in-app path and external request resource for account-creating apps.

These links inform launch requirements, not legal advice or a guarantee of store approval. Have current animal-care, Swedish/EU privacy, retention, and delivery obligations reviewed separately.
