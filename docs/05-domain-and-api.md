# Domain Rules And API Blueprint

## Status And Terminology

This document proposes the target mobile contract. It is **not a description of endpoints already implemented**. Existing Catbreeder schema names remain useful, but new invariants require server work and legacy-web coordination.

Use Animal in product/feature language and keep the existing `Pet` persistence name initially to avoid needless migration. Contact represents the existing `Buyer`; reservation is a new separate record. This naming distinction must not create duplicate copies of the same person.

## Entity Blueprint

| Entity | Retain | Proposed additions/changes |
| --- | --- | --- |
| User | UUID, names/email, kennel name, role/active state | Timezone, locale, versioned terms acceptance, verified-email state, session-revocation policy |
| Litter | Owner, species, name, planned/born/completed, pairing/expected/birth dates, parent text | Optional parent animal IDs plus name snapshots, revision, careRevision concurrency guard, lifecycle history, archived/deleted metadata |
| Pet/Animal | Owner independent of litter, origin, name/species/sex/color/date/status, health tests, formerlyOwn | Optional collar label/color, revision, verified parent context through litter; photos deferred |
| Buyer/Contact | Owner, name, email/phone, notes/message, legacy source/status | Explicit interests and separate reservations; legacy fields become a compatibility projection, not second authority |
| Reservation | New | Owner/contact/animal IDs, optional server-derived litter ID, state, reserved/delivered/canceled dates, checklist, revision |
| Weight | Animal, positive grams, recorded date | Canonical day key, entered/revised timestamps, actor, revision, mutation reference; daily unique key |
| Diary entry | Animal, date, free text | Actor/revision; future structured care type must not reinterpret free text |
| Care task | Generated guidance currently has dismissal only | Stable task identity, template version, due date, lifecycle anchor, completion/snooze/dismiss state and history |
| Entitlement | Existing user/litter tiers are coarse | Provider-backed coverage ledger, product, effective period, litter allocation, status and event provenance |
| Device installation | New | Owner, installation ID, push token, platform/environment, permission and last seen |
| Mutation record | New | Owner, idempotency key, request hash, state, response/reference, retention |
| Audit entry | New | Actor/account/action/target, timestamp, outcome and minimal structured diff; restricted access |

### Sex/Unknown Values

Current `Pet.gender` permits only `male` and `female`. Do not pretend unknown is already supported. Recommended improvement is an explicit `unknown` value so birth recording never forces a guess; it requires runtime/schema, translation, validation, and legacy-client updates before enabling it. Until that work is accepted, register offspring later rather than invent biological data. See Q-06.

## Ownership And Authorization: DR-01

- The initial tenant is the existing user account, not a new organization. No speculative team tables are necessary for v1.
- Every domain read/write resolves the owner from the authenticated account. Never trust caller-supplied ownership.
- Parent, litter, animal, buyer, reservation, and task references must exist and belong to the same permitted account.
- Missing parent means not found/denied, not permission to query orphaned children.
- List endpoints need bounded pagination and filters; search must not leak another account's record counts.
- Admin access is an explicit audited support capability, not implicit permission inside every breeder command. Impersonated access cannot change credentials, delete accounts, or manage billing.
- Future team support needs explicit memberships/roles and migration; sharing a password is not collaboration.

## Litter Lifecycle: DR-02

| Command | Preconditions | Result |
| --- | --- | --- |
| Create planned | Valid owner/species/name; optional pairing/parents | Planned litter; estimate if paired; no trial consumption |
| Create born / record birth | Valid actual birth date, eligibility, authorized parent/litter data | Born litter and lifecycle event; eligible tier allocated atomically |
| Correct birth date | Expected revision and reason; check offspring/weight/task consequences | Reviewed consistent correction, recalculate future tasks, preserve original history |
| Complete litter | Born with valid date; review unresolved animal/reservation states | Completed, retained history; no automatic deletion |
| Reopen completed | Explicit confirmation/reason, expected revision | Born; retain existing paid/trial coverage, no second charge |
| Revert recorded birth | Exceptional audited correction, not generic dropdown | Block if dependent offspring/measurements/reservations exist until a specific reconciliation is performed |

Do not automatically complete a litter when the last sale is recorded: retained/foster animals and unresolved records require breeder review. Completion should prompt about available/reserved animals and require an explicit reason/decision for unresolved states.

Expected birth remains a species-configured estimate. Keep actual birth separate. A birth-date correction cannot silently leave offspring dates inconsistent; define an atomic correction or review report before applying it. Individual offspring with deliberately different dates require a documented exception rather than accidental drift.

Destructive litter deletion must preserve independent retained/acquired animal history and report linked-contact/reservation impact. Prefer archive over deletion in normal breeder UI. Use a transactional deletion job or resumable state machine for large cascades.

## Animal Lifecycle: DR-03

- Retain available/reserved/sold/deceased/kept/foster enums initially.
- External animals start kept/foster, have their own owner, and need no litter.
- Born-litter animals inherit species and normally birth date. Enforce consistency on updates as well as creation.
- Reserving/selling is performed through reservation/handover commands. Direct edits cannot bypass active allocation constraints.
- A legitimate sale of a kept/foster/acquired animal begins with an explicit offer-for-sale action moving it to available while preserving prior own-animal membership in history. It is not a correction of mistaken data. The reservation/handover path works without a litter and sets formerlyOwn on sale where appropriate.
- Kept/foster membership determines current My animals; preserve trustworthy prior membership through history, not guesses from sold status.
- Recording death cancels/flags active reservation through an explicit sensitive flow and excludes the animal from future weighing/tasks. Preserve existing measurements and notes.
- Correcting a mistaken deceased/sold status requires a reason and reconciliation, not loss of historical events.
- A pet can remain without a litter after an authorized litter removal; its care history stays attached to the same UUID.
- Do not auto-link parents based on names. Linked parents must match species, differ from each other, and not be offspring/self references. Deceased historical parents may remain linked; new pairing selection should make lifecycle context explicit.

## Weight And Date Contract: DR-04

### Canonical Values

- Weight is a finite positive decimal in **grams**, normalized server-side. Proposed precision: one decimal place, rejecting rather than silently rounding excess precision until the final policy is agreed.
- Store/transport measurement day as validated `YYYY-MM-DD`, not a UTC midnight pretending to be a date-only field.
- Use UTC ISO 8601 instants for created/updated/audit timestamps.
- Account timezone is an IANA value, initially `Europe/Stockholm`; it determines today/due tasks, not a traveling phone's accidental timezone.
- Changing account timezone does not rewrite historical day keys. Historical timestamps require a documented migration mapping, not blanket UTC truncation.
- Birth/pairing/health-test dates are also calendar dates. Do not parse them with device-dependent locale strings.
- Future actual births/weights are rejected relative to account today. Weight before known birth is rejected except through explicit authorized legacy correction.

### Daily Measurement Invariant

Recommended v1 policy: one authoritative measurement per animal/day, matching current product intent. Multiple daily observations are a possible future product change, not an accidental duplicate loophole.

- Enforce a unique `(petId, dayKey)` index after resolving historical duplicates.
- Edits require the current revision; date changes also respect target-day uniqueness.
- Preserve a revision/audit trail for corrections/deletion. Retained audit content must follow privacy/retention policy.
- New entries for deceased animals are rejected; historical correction is allowed through an explicit history flow.
- Batch insert validates all provided rows before writing and commits all or none. Explicitly skipped rows are absent from the batch.
- Data-load failure is not permission to submit against an unknown cohort.

### Concurrent Cohort And Lifecycle Changes

Mongo snapshot reads alone do not serialize a weight insert against an animal being marked deceased or removed. Add a server-managed litter `careRevision` guard, returned when opening weighing. All weight writes/corrections, animal membership/status changes, birth-date corrections, and litter lifecycle/deletion commands conditionally advance that same guard inside their transaction. Batch submission includes the expected guard value; stale commands fail with a reviewable conflict.

For movement between litters, contend on both litter guards in a consistent order. For litterless animals, contend on the animal revision in the same transaction as the weight/status change. Individual weight routes and legacy-web writes must use the same guards; a separate unchecked CRUD route defeats the guarantee. A normal rename need not advance the care guard because mapping uses immutable IDs, but current identity is refreshed on conflict/review.

Verify simultaneous death/removal-versus-save and date-correction-versus-save races against a real transaction-capable database. In each case commands serialize or one conflicts; a transaction that only reads state and inserts weights is insufficient.

### Growth Calculations

```text
changeGrams = currentGrams - previousGrams
changePercent = 100 * changeGrams / previousGrams
dailyGain = changeGrams / elapsedCalendarDays
```

Use the most recent earlier dated measurement, not a later record or same-day revision. If no prior measurement exists, delta is unavailable, not zero. Show the actual elapsed interval; a seven-day change is not daily gain.

Initial review cue: decrease >=5% compared with prior measurement. This is inherited UI behavior, not a validated clinical threshold or proof that smaller drops are safe. Move cue computation to a shared server policy with versioned provenance; retain raw values for explanation. Clinical wording/thresholds require review.

For litter daily-average charts, proposed definition is mean of actual measurements recorded on that day, showing measured count/cohort count. Do not mix latest measurements from different dates and label them today's average. Weekly average means average of that animal's recorded daily values in the stated period, not average across unmeasured days. Keep aggregation definitions identical across web/mobile or label differences explicitly.

## Buyer, Reservation, And Handover: DR-05

Contact stage is not animal ownership. Preserve contact details and interests independently of allocations.

| Reservation state | Meaning | Allowed next state |
| --- | --- | --- |
| Reserved | One specific animal allocated to one contact | Delivered or canceled |
| Delivered | Confirmed actual handover; animal sold | Only audited correction/return workflow |
| Canceled | Allocation released with reason/date | Create a new reservation rather than erasing history |

- At most one active reservation per animal, enforced by a database constraint/transaction, not only a filtered dropdown.
- Reserve requires an available animal; kept/foster animals can enter through the explicit offer-for-sale action. Sold/deceased animals require an audited correction or return workflow first.
- Reservation litter association is optional and derived from the selected animal. Selling an acquired/litterless animal never requires manufacturing a litter; retained animals remain sellable after authorized litter removal.
- One contact may reserve multiple animals; each reservation remains individually identifiable.
- Reserve/cancel/handover update animal and reservation in one atomic command.
- Contact deletion with reservations offers anonymization or blocks pending reconciliation; no dangling references.
- Handover stores actual date, recipient/contact snapshot as justified, and checklist record. A planned departure date is not proof of actual delivery.
- v1 checklist is breeder recordkeeping: veterinary inspection, vaccination/identification documentation, agreed documents, and care information as applicable. Exact mandatory items and blocking rules require jurisdiction/species review.
- Do not copy source guidance's cat 12-week/dog 8-week strings into a claim of current legal compliance. Confirm current law, association rules, and any permitted exceptions first.
- No deposit amount, sale payment processing, or automatic invoice is implied by a reservation.

## Tasks: DR-06

Generated task identity must be stable across retries: account + litter + lifecycle anchor + template/version + occurrence. Avoid using only human-readable title or currently calculated week.

- Pending, completed, dismissed, and snoozed are distinct states.
- Completion records who/when and optional note; dismiss does not assert care was performed.
- Birth-date correction recalculates pending due dates while preserving completed history/provenance.
- Guidance may suggest tasks but must not generate fictitious completed clinical records.
- Push delivery state is independent of task state; notification delivery does not complete a task.
- Old reminder-dismissal records map to dismissed, with legacy provenance where possible.

## Proposed API Surface

Use `/api/v1` for the mobile contract. Names below are proposed, not existing Catbreeder routes. Existing `/api` web routes remain until consumers are migrated. Both must call the same domain authority.

| Capability | Proposed contract |
| --- | --- |
| Sessions | `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password` |
| Profile | `GET/PATCH /me`, account preferences and verified identity-change flow |
| Today | `GET /today?day=YYYY-MM-DD` with coverage, tasks, freshness, and permissions |
| Litters | `GET/POST /litters`, `GET/PATCH /litters/:id` for non-lifecycle fields |
| Lifecycle | `POST /litters/:id/record-birth`, `/complete`, `/reopen`, `/correct-birth` |
| Animals | `GET/POST /animals`, `GET/PATCH /animals/:id`, `POST /litters/:id/animals/batch` |
| Weights | `GET /animals/:id/weights`, `POST /litters/:id/weight-batches`, revision-protected correction endpoint |
| Reporting | `GET /litters/:id/growth`, animal weekly summaries with explicit range/definition |
| Diary | `GET/POST /animals/:id/diary`, revision-protected update/delete |
| Contacts | `GET/POST /contacts`, `GET/PATCH /contacts/:id`, explicit clearing semantics |
| Reservations | `POST /reservations`, `POST /reservations/:id/cancel`, `/handover` |
| Email | `POST /contacts/:id/messages` with idempotency and recipient validation |
| Tasks | `GET /tasks`, `POST /tasks/:id/complete`, `/dismiss`, `/restore`, `/snooze` |
| Devices | Authenticated installation register/update/delete with environment binding |
| Entitlements | `GET /me/entitlements`, verified purchase/restore and provider webhooks |
| Mutation reconciliation | `GET /mutations/:clientMutationId` scoped to current account |
| Data control | Account export job/status/download and reauthenticated account-deletion request/status |

Use `id` consistently in DTOs even if persistence uses `_id`. Explicitly specify nullable versus omitted fields: omitted PATCH field means unchanged, `null` means clear if allowed. Lists return bounded cursor pagination and stable ordering. Error responses expose stable codes and field details, not raw database errors.

### ID-Based Weight Batch Example

```http
POST /api/v1/litters/litter-uuid/weight-batches
Authorization: Bearer <access-token>
Idempotency-Key: 791aa041-b609-468f-b2df-2f9a56f6b012
Content-Type: application/json
```

```json
{
  "clientMutationId": "791aa041-b609-468f-b2df-2f9a56f6b012",
  "dayKey": "2026-11-14",
  "careRevision": 12,
  "entries": [
    { "petId": "animal-uuid-1", "grams": 258.5 },
    { "petId": "animal-uuid-2", "grams": 235 }
  ]
}
```

IDs here are illustrative placeholders except the example mutation UUID. Do not copy them as fixture records in a migration.

The server verifies ownership, cohort membership/care revision, date, positive precision-valid grams, unique animals, and daily conflicts, then atomically advances the shared care guard and commits the batch and mutation result. If cohort membership/lifecycle changed, return conflict even if the number of animals is unchanged. Rename need not invalidate ID mapping, but the breeder should see current identity on review.

### Retry And Conflict Contract

- Scope idempotency key to account and operation; store a canonical request hash.
- Same key + same payload returns the original authoritative result without writing again.
- Same key + different payload returns `409 IDEMPOTENCY_KEY_REUSED`.
- Competing animal/day writes return `409 WEIGHT_ALREADY_RECORDED`, with authorized conflict details and revision.
- Stale edit/care guard returns `409 REVISION_CONFLICT`; client reviews and creates a new command only after reconciliation.
- Commit mutation outcome in the same transaction as the domain change. Do not record success before writing the weights.
- Document retention, response replay, and in-progress status before implementation. Proposed minimum replay retention is 30 days for v1 retries; permanent domain uniqueness still applies after expiry.
- A later offline queue cannot replay beyond supported retention without checking authoritative daily records first.

```json
{
  "error": {
    "code": "WEIGHT_ALREADY_RECORDED",
    "message": "A measurement already exists for this animal and date.",
    "fields": { "entries.0": "Review the existing measurement." },
    "requestId": "request-uuid"
  }
}
```

Other stable categories should include `VALIDATION_ERROR`, `AUTH_REQUIRED`, `FORBIDDEN`, `NOT_FOUND`, `ENTITLEMENT_REQUIRED`, `RATE_LIMITED`, and `SERVICE_UNAVAILABLE`. Retry only safe operations with bounded backoff; validation/permission/conflict errors are not transient network errors.

## Domain Acceptance Scenarios

1. Two devices reserve the same animal: exactly one succeeds, with no contradictory animal/contact state.
2. Two devices save the same animal/day: one authoritative measurement; other receives a conflict or identical replay result.
3. A response is lost after commit: retrying the same mutation returns the same result without duplicate weights.
4. A batch has one invalid/cross-account animal: no entry is written and no unrelated data is disclosed.
5. Animal name changes between opening/saving: IDs prevent misassignment; no name-keyed chart collision.
6. A litter activation write fails: no consumed trial and no dangling entitlement allocation.
7. A duplicated/out-of-order purchase webhook arrives: coverage remains correct; no false litter birth.
8. A breeder corrects birth date after tasks and weights exist: required consequences are reviewed atomically or the correction is rejected clearly.
9. An owned pet's parent record is missing: child reads fail closed; another breeder cannot retrieve orphan entries.
10. A legacy reminder was dismissed: mobile shows dismissed guidance, never falsely completed care.
11. Account deletion is interrupted: job resumes; access is revoked and retained financial records are documented.
12. A subscription expires: historical read/export works under approved policy; no duplicate charge on already covered litter.
13. An acquired kept animal is offered for sale, reserved, and delivered without a litter; prior own-animal history remains intact.
14. A weight batch races with death/removal/birth-date correction: shared conditional writes serialize them or return an explicit conflict; no stale-cohort save slips through snapshot isolation.
