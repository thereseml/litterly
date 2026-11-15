# Delivery Plan And Quality Gates

## How To Use This Plan

This is an ordered implementation backlog, not a claim that development is complete. No app, infrastructure, production migration, or paid service has been created by this documentation task.

Build vertical breeder journeys, not isolated screen mockups. Prototype with fictional data while backend gates are resolved. Do not connect production customers to an unhardened API simply because screens are ready.

Priorities: P0 = safety/integrity prerequisite; P1 = first-public-release scope; P2 = next-release opportunity. Estimates are intentionally omitted until team size, backend ownership, billing model, and migration scope are confirmed.

## Milestone 0: Decisions And Source Baseline

| Item | Priority | Deliverable / done when | Depends on |
| --- | --- | --- | --- |
| D-01 | P0 | Confirm account continuity, backend owner/repository, launch species/market; record decisions from Q-01 to Q-04 | Therese answers |
| D-02 | P0 | Security findings reproduced/triaged in isolated API environment; remediation tickets and owners assigned | Source review |
| D-03 | P0 | Read-only data consistency report, backup inventory, tested restore; no production edits by default | Authorized data access |
| D-04 | P1 | Approved v1 journeys, inherited-theme prototype, and scope tradeoffs | Product/design docs |
| D-05 | P0 | Monetized versus free-launch branch, billing policy/products if applicable, legacy access and care-expiry policy | Q-07/Q-08, current store review |
| D-06 | P0 | Current species/region care and handover guidance reviewed, with source/version/owner | Qualified reviewer |

Gate: no unowned critical risk, no implicit data-loss migration, and explicit decisions before paid/production functionality. Work with mocks can proceed while business answers are pending.

## Milestone 1: Native Foundation And Secure API

| Item | Priority | Deliverable / done when | Requirements |
| --- | --- | --- | --- |
| F-01 | P1 | Expo TypeScript scaffold, dev/preview/prod config, reproducible lockfile and CI | Architecture |
| F-02 | P1 | Native primitives, exact theme tokens, accessible contrast variants, Swedish resources, system appearance | Design |
| F-03 | P1 | Five-tab shell, stacks, safe areas, keyboard handling, link routing and error boundary on both platforms | PR-02 |
| F-04 | P0 | Strict request schemas, fixed reset risk, revocable sessions, recent-auth controls | PR-01, DR-01 |
| F-05 | P1 | Typed versioned API client and fixtures; normalized IDs/dates/errors; old-web compatibility tests | Domain/API |
| F-06 | P1 | Protected account-scoped draft proof: interruption, session expiry, logout and switch tests | PR-05/10 |
| F-07 | P0 | Ownership regression suite and fail-closed child reads; sensitive admin restrictions | DR-01 |
| F-08 | P1 | Registration/login/recovery/onboarding/profile vertical slice with real staging API | PR-01 |
| F-09 | P1 | Minimum OS/device matrix, current store build/target and native-module compatibility, API/binary support window and draft-safe required-upgrade flow | Architecture |

Gate: real-device iOS/Android sign-in, password recovery link, session rotation/revocation including interrupted-rotation recovery, and no cross-account cache/draft leakage. Expo Go-only demonstration is insufficient.

## Milestone 2: Litter To Daily Care

| Item | Priority | Deliverable / done when | Requirements |
| --- | --- | --- | --- |
| C-01 | P0 | Transaction-capable DB path, unique daily-weight migration, shared care guard, mutation/revision/race contracts tested | DR-04 |
| C-02 | P1 | Create/list/detail planned and born litters, linked/external parents, lifecycle commands | PR-03, DR-02 |
| C-03 | P1 | Record birth, bulk offspring 1-20, explicit unknown-sex decision, resumable flow | PR-03/04, Q-06 |
| C-04 | P1 | Own/acquired/former animals, collar identity, notes and health tests | PR-04, DR-03 |
| C-05 | P1 | ID-based batch weighing with protected drafts, partial valid entry, review and reconciliation | PR-05 |
| C-06 | P1 | Single weights, revisioned corrections, accessible animal/litter charts and measurement list | PR-06 |
| C-07 | P1 | Diary CRUD with pending/error behavior; stable source references and audit | PR-06 |
| C-08 | P1 | Today coverage and care priorities; query invalidation after each relevant mutation | PR-02 |

Gate: complete a planned-to-born six-animal care journey on both platforms. Pass concurrent save, simultaneous death/removal/date-correction-versus-save, duplicate tap, timeout-after-commit, renamed/deceased animal, and app-killed draft tests. No silent partial batch save.

## Milestone 3: Buyers And Care Follow-Through

| Item | Priority | Deliverable / done when | Requirements |
| --- | --- | --- | --- |
| B-01 | P1 | Searchable contact/waitlist, editing/clearing, private notes, call/email actions | PR-07 |
| B-02 | P0 | Reservation model/index and reserve/cancel/handover transaction commands; old-web writers aligned | DR-05 |
| B-03 | P1 | Animal-specific reservation and handover checklist/review UI | PR-07 |
| B-04 | P1 | Safe individual email, valid recipient, quotas, duplicate-send protection, send result | PR-07 |
| B-05 | P1 | Persisted tasks separating complete/dismiss/snooze, date-change behavior, legacy dismissal mapping | PR-08, DR-06 |
| B-06 | P1 | Optional daily push digest, device lifecycle, quiet hours, authorized tap route | PR-08 |
| B-07 | P1 | Reviewed litter completion/reopen and historical access | PR-03/09 |

Gate: prospect to reserved animal to handover works without separate contradictory status edits. Push-denied mode remains fully usable. No message sends without explicit breeder action.

## Milestone 4: Billing, Trust, And Existing Data

| Item | Priority | Deliverable / done when | Requirements |
| --- | --- | --- | --- |
| T-01 | P0 | Entitlement ledger, atomic trial allocation, provider-event idempotency/reconciliation | PR-09 |
| T-02 | P1 if monetized | Approved native offer, restore, localized terms/price, pending/refund/expiry/provider management; omit new offers/SDKs for approved free launch | PR-09 |
| T-03 | P0 | Safe legacy migration dry run and count/reference/coverage verification; coordinated web release | Architecture migration |
| T-04 | P1 | Account JSON export and weights CSV, expiring authenticated downloads | PR-10 |
| T-05 | P0 | Reauthenticated resumable deletion, provider/subscription handling, external request page | PR-10 |
| T-06 | P1 | Support/privacy/terms, store disclosures, minimal telemetry and monitoring | PR-10 |
| T-07 | P0 | Backup restore, incident runbook, staged deploy/rollback, readiness and job alerts | Operations |

Gate for monetized launch: canceled/pending/duplicate/out-of-order/restore purchase scenarios pass in provider sandboxes. Gate for a free launch: server eligibility is explicit, no broken paywall or unsupported external purchase steering, and new-purchase checks are marked not applicable with the approved decision. In either branch, existing paid customer access is verified against source-of-truth billing data where applicable, not inferred from UI labels.

## Milestone 5: Breeder Beta And Store Launch

1. Internal builds on real iPhone and Android, fictional cat and dog demo data.
2. Moderated tests with 3-5 breeders: record birth, weigh six animals, correct a mistake, reserve, hand over, recover access.
3. Wider TestFlight/Play closed testing, with consented support and a clear feedback channel.
4. Fix observed care-flow friction and data-loss/conflict issues before cosmetic expansion.
5. Submit store-ready builds with working reviewer account/demo data, backend availability, purchase review instructions, and accurate screenshots.
6. Stage rollout, monitor mutation errors/duplicates, billing exceptions, crashes, task delivery, and support load.

No feature expansion during beta unless it resolves a demonstrated blocker. Never make animal-care safety dependent on a store-release deadline.

## Next-Release Backlog

| ID | Feature | Why it is valuable | Prerequisite |
| --- | --- | --- | --- |
| N-01 | Private animal photos | Identity and emotional continuity | Protected uploads, image limits, deletion, consent/EXIF policy |
| N-02 | Selected attachments | Keep inspection/vaccination evidence with animal | Private object storage, type/size validation, malware handling, expiring access |
| N-03 | Handover PDF | Portable, breeder-reviewed care summary | Explicit field selection, internal-note exclusion, safe export, non-certification wording |
| N-04 | Structured care and custom tasks | Distinguish scheduled, performed, and documented care | Reviewed templates, schema, correction/audit semantics |
| N-05 | Queued offline weights | Reliable use in poor-connectivity breeding spaces | Durable queue, replay retention, conflicts, tombstones, reconciliation |

Buyer update sharing and team/family access remain later, uncommitted opportunities rather than next-release scope. Their permission/publication requirements need separate discovery before scheduling.

## Verification Matrix

| Layer | Required coverage |
| --- | --- |
| Domain unit | Gestation/estimate, eligibility, lifecycle transitions, weight deltas/averages, task identity, reservation transitions |
| API integration | Real transaction-capable test database, daily unique index and death/removal-versus-save races, idempotency replay, atomic rollback, ownership, deletion, billing-event ordering where applicable |
| Contract | DTO/date/null/error contracts, old-web/new-mobile write compatibility, app-version compatibility |
| Native components | Large text, label/error association, decimal input, loading/pending/failure/conflict states, safe footer/keyboard |
| Native journeys | Register/recovery, create/birth, acquired animal, bulk/single weigh, correction, diary, reserve/handover, export/delete |
| Connectivity | Offline before save, timeout after commit, retry, session expiry during save, app background/kill, account switch |
| Billing | For monetized launch, both platform sandboxes plus applicable legacy Stripe reconciliation, restore and account-binding edge cases; free-launch eligibility and existing paid coverage otherwise |
| Notifications | Permission denied, expired token, logout/switch, duplicate job, timezone change, deleted target, quiet hours |
| Accessibility | VoiceOver/TalkBack, large text, contrast, non-color cues, reduced motion, chart list fallback |
| Security/privacy | Object-shaped auth input, rate limiting, IDOR, token revocation/replay, concurrent/interrupted refresh recovery, logs/exports, malicious email HTML, support restrictions |

Use Jest/React Native Testing Library for client logic/components, API integration tooling in the server repository, and Maestro or a selected equivalent for installed native journeys. Browser Playwright tests remain useful for existing web/admin; they do not prove native keyboard, purchases, permissions, or safe-area behavior.

### Required Edge Cases

- Same name for two offspring; no name-keyed charts or name-based mutation mapping.
- Comma input, one decimal, zero/negative/infinite/invalid input, empty/skipped rows.
- Birth today, leap day, Swedish daylight-saving boundary, midnight, and phone traveling across timezones.
- Unknown sex, external parent, acquired animal without litter, deceased animal, retained animal after litter removal.
- Existing daily measurement, changed cohort, version conflict, and response lost after server commit.
- Existing contacts without pet assignment, multiple historical allocations, and conflicting legacy buyer references.
- User has paid web coverage, switched stores/devices/accounts, canceled renewal, or received a refund.
- Parent missing but orphan child records remain; every read fails closed.
- Completed litter with unresolved animals, reopened paid litter, corrected birth with old completed tasks.
- Long Swedish text/names, large text size, narrow Android phone, iPhone home indicator, landscape keyboard.

## Public Launch Checklist

- [ ] No unresolved critical/high authentication, ownership, data-loss, or payment-integrity defect.
- [ ] All PR-01 to PR-10 acceptance criteria pass or have an explicitly approved scope change documented.
- [ ] Current care/age/handover text reviewed for launch species and region; no unsupported legal or clinical claim.
- [ ] iOS and Android native builds tested on physical devices, not only simulator/browser.
- [ ] Core flows pass screen-reader, large-text, contrast, and keyboard/safe-area checks.
- [ ] Existing customer migration/coexistence and paid-access preservation accepted, if applicable.
- [ ] Exports/deletion/provider-retention behavior match published privacy information.
- [ ] Push/analytics permissions are contextual and disclosures match actual SDK behavior.
- [ ] Store purchase/restore/management and subscription terms are complete for offered products, or the free-launch branch is explicitly approved and purchase-only checks marked not applicable.
- [ ] App identifiers, signing ownership, support URL, privacy URL, and deletion URL belong to the product owner.
- [ ] Reviewer can access a realistic fictional cat/dog demo account and all submitted purchase flows.
- [ ] Store screenshots reflect the shipped native build, not the old website or an unimplemented mockup.
- [ ] Supported OS/device matrix, current store SDK/target rules, applicable Android page-size/native-library compatibility, and draft-safe minimum-client policy are verified against the submitted binaries.
- [ ] Backups restore successfully; production monitoring, incident contact, staged rollout, and rollback are ready.

## First Implementation Slice

After critical decisions, build: secure sign-in -> one born litter -> six identified animals -> ID-based daily batch -> confirmed chart/Today refresh -> recover draft after interruption.

This slice validates the highest-value interaction, the theme, the real device keyboard, and the riskiest write semantics before spending time on richer sharing or secondary statistics.
