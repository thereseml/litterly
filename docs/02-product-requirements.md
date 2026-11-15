# Litterly Product Requirements

## Product Promise

**A calm, dependable breeding notebook in your pocket: know what needs attention, record care quickly, and keep each animal's story together from planning to handover.**

Litterly should feel like the existing product made purposefully mobile, not enterprise livestock software and not a pet social network.

Status: proposed product baseline. Decisions requiring confirmation are in [Questions for Therese](07-questions-for-therese.md). Requirement IDs here are the reference for the delivery plan.

## Audience And Defaults

| Topic | Working recommendation |
| --- | --- |
| Primary user | Independent cat or dog breeder managing one or several litters |
| First market | Sweden, Swedish UI, grams, SEK where applicable |
| Localization | All new copy translatable; ship Swedish first, English after copy QA |
| Platforms | iPhone and Android phones; responsive larger-screen layouts without a separate tablet product |
| Accounts | One breeder account owns its records; no shared passwords or team permissions in v1 |
| Connectivity | Online-first, with protected local form drafts; no promise of automatic offline saving to the server |
| Existing customers | Preserve account identity, records, and legitimately acquired access if migration/coexistence is chosen |
| Business | No advertising or sale of breeder/buyer data |

Support both cats and dogs in the initial domain. If a cat-only launch is chosen later, hide dog entry points deliberately without corrupting or deleting existing dog records.

## Release Boundaries

### First Public Release: Essential Breeder Companion

- Account creation/recovery, onboarding, secure sessions, profile, support, export, and deletion.
- Today care overview, litter lifecycle, birth recording, bulk offspring entry.
- Animal details, retained/foster/acquired animals, parent links, health tests, dated diary notes.
- Fast litter and individual weighing, correction/history, trustworthy growth charts.
- Buyer contacts and waitlist, animal-specific reservations, handover checklist, individual email.
- In-app lifecycle tasks with explicit completion versus dismissal; optional daily push digest.
- Existing brand in light/dark/system appearance, accessible native controls, Swedish copy.
- Server-authoritative trial/paid access, compliant purchasing and restore if monetization is enabled.
- Local drafts, visible unsaved state, reliable retries, privacy-safe analytics and operational monitoring.

### Next Release: Richer Records And Sharing

- Animal photos and private attachments, including vaccination/inspection evidence.
- Simple breeder-reviewed handover PDF with selected weights, care notes, and contact details.
- Structured vaccination/deworming/vet records and custom tasks after content review.
- Reusable buyer email templates, minimal sent-message history, export improvements.
- True queued offline weight submission once replay/conflict requirements are implemented.

### Later Opportunities

- Revocable, explicitly selected buyer updates or a buyer portal.
- Team/family roles and multiple breeding businesses.
- Pedigree/genetic integrations with verified data sources.
- Foster-family agreements, deposits and expense records, registry integrations.
- Home-screen widget/shortcuts, scale integrations, searchable longitudinal breeding insights.

### Explicit Non-Goals For v1

No marketplace, public listings, social feed, in-app chat, animal-sale payment processing, legally binding e-signatures, complete accounting, AI medical advice, genetic suitability score, or automatic diagnosis. No native admin impersonation; retain support operations on the web.

## Core Requirements And Acceptance

### PR-01: Access And Onboarding

User can register, sign in, recover access, and return securely without signing in every day. Onboarding asks only breeder display name, preferred species, and timezone; species is a preference, not a restriction. Existing users skip repeated setup.

Acceptance:

- Registration and login link to each other; recovery produces an explicit success state.
- Terms acceptance is versioned server-side; optional marketing consent is separate and off by default.
- No notification/photo permission prompt on first launch without context.
- Empty Today offers create planned litter, record an existing litter, or add an acquired animal.
- Session expiration preserves a care draft without exposing it to another signed-in account.
- Password reset/change revokes previous sessions; sensitive changes require recent authentication.

### PR-02: Today

Prioritize due care, active litters, and incomplete weighing. Secondary actions are create litter and add contact. Insights and future plans do not dominate the screen.

Acceptance:

- Each born litter shows age, eligible animal count, and today's confirmed weight coverage.
- One born litter opens weighing directly; multiple litters offer a concise chooser.
- Show the date/time of the latest server refresh; stale information never looks current.
- Successful care/lifecycle changes refresh affected dashboard, task, and chart data.
- Loading, no-data, offline/stale, and failed-request states are distinguishable.

### PR-03: Litter Planning And Birth

Create planned or already-born cat/dog litters. Select owned parents or record external parent names. Show estimated birth as an estimate. Record a planned litter's birth through a dedicated flow.

Acceptance:

- Planned, born, and completed remain the persisted lifecycle vocabulary.
- Expected date initially follows existing 65-day cat/63-day dog rules, visibly approximate and subject to review.
- Born status requires birth date; future dates and species inconsistencies produce specific validation errors.
- Record birth date and optional note, then add 1-20 offspring or continue later.
- Birth can be saved without knowing final offspring count; zero registered offspring is not zero births.
- Parent links enforce ownership/species compatibility; free-text external parent fallback remains available.
- An incomplete or failed purchase never discards the birth draft or creates a false birth.
- Completion preserves records and permits authorized historical corrections; it is not deletion.

### PR-04: Animal Identity And Own Animals

Retain name, species, sex, coat color, birth date, notes, available/reserved/sold/deceased/kept/foster, and acquired animals without a litter. Add optional collar label/color for quick identification. Photo is deliberately deferred.

Acceptance:

- Duplicate names are allowed; lists, charts, and submissions identify animals by immutable ID.
- Collar color always has a readable name/label. Current sex values are male/female; proposed unknown sex requires a deliberate schema and legacy-client update before enabling it, never a guessed value.
- Kept/foster animals appear in My animals; former animals remain searchable without inventing historical ownership.
- Acquired animal creation does not require a fictitious litter; health tests are optional structured name/date/result entries.
- Deceased animals stay in history, are excluded from new bulk weighing, and are treated sensitively in copy.
- Parent links can reveal associated litters; missing/deleted/external parents render gracefully.

### PR-05: Daily Weighing, The Signature Flow

Open a litter's weighing session, enter grams with a decimal keyboard, move through stable animal rows, review differences, and save the batch.

Acceptance:

- Show animal identity, last confirmed weight/date, elapsed days, input, gram delta, and percent delta.
- Swedish comma and decimal point parse consistently; empty means skipped, invalid means error, zero is not a valid measurement.
- Blank values are not converted into zero or silently copied from yesterday.
- One daily weight per animal; existing daily records are corrected explicitly, not overwritten by replay.
- Server request uses animal IDs, a stable mutation ID, and explicit day key; duplicate taps/retries cannot duplicate records.
- Save only filled valid rows; show an explicit summary such as 5 measured, 1 skipped.
- Do not close or reset the form on failure. Persist an account-scoped local draft across interruption, subject to the security policy.
- A drop of at least 5% from the prior measurement initially shows a non-diagnostic review cue; no data is not a healthy result.
- On timeout, reconcile mutation status before claiming failure or allowing a second independent submission.
- Historical corrections are possible with a reason and revision history; no silent last-write-wins conflict.

### PR-06: Growth And Animal Diary

Each animal has an understandable weight chart, accessible measurement list, and dated diary. Litter insights compare animals without requiring wide desktop tables.

Acceptance:

- Single measurement, missing days, skipped/deceased animals, duplicate names, and corrected records render honestly.
- Chart series use IDs; no interpolated data implies an actual measurement.
- Display units, date range, actual comparison interval, and definition of any average.
- Each chart has a text summary and selectable/listed values for screen-reader access.
- Diary create/edit/delete awaits confirmation and retains entered text on errors.
- Growth cues prompt checking/reweighing and appropriate professional advice, not diagnosis or treatment.

### PR-07: Buyers, Reservations, And Handover

Keep a searchable contact/waitlist directory, private internal notes, contact actions, litter interest, and individual email. A contact can have multiple reservations over time.

Acceptance:

- A breeder can actually select an eligible animal, optionally filtered by litter. Acquired animals without a litter can be offered for sale explicitly and reserved without a fictitious litter.
- Reserving an animal updates reservation and animal state atomically; another active reservation is rejected.
- Canceling releases the animal unless a newer authoritative lifecycle state prevents it.
- Handover review shows recipient, animal, actual date, and checklist status before confirmation.
- Handover atomically marks the reservation delivered and the animal sold; litter completion remains a separate reviewed action.
- Checklist distinguishes not recorded, pending, completed, and not applicable. A checked box is a breeder record, not legal certification.
- No jurisdictional minimum-age or health claim ships without current review; any required delivery block is defined by reviewed policy.
- Buyer edits can explicitly clear optional fields; failures preserve all form content.
- Email needs a valid recipient, visible send result, safe rendering, quota, and duplicate-send protection. Never auto-email because a status changed.
- Buyer internal notes never appear in buyer communications or later sharing exports by default.

### PR-08: Care Tasks And Notifications

Generate species/date-appropriate guidance and due tasks. Keep tasks available even when push is denied. Ask for push permission only when the breeder enables a useful daily reminder.

Acceptance:

- Guidance, completed care, dismiss, and snooze are distinct concepts; completion records an actor/time.
- Legacy dismissed reminders migrate as dismissed, never completed.
- Changing birth date recalculates future tasks without duplicating completed records or silently losing history.
- Push respects timezone/quiet hours, deduplicates per account/device policy, and contains no buyer PII by default.
- Notification tap opens the intended authorized litter/task; deleted records have a safe fallback.
- Logout removes account/device association; disabled notification permission does not break in-app care.
- No urgent-medical-alert guarantee or dependence on guaranteed background execution.

### PR-09: Plans And Access

Preserve existing legitimately purchased access if existing accounts continue. Candidate product model is free planning plus one free born litter, then a litter pass or annual plan. This is a proposal, not an approved pricing decision.

Acceptance:

- API returns eligibility and reason consistently at every entry point; UI does not invent its own trial rules.
- Purchase grants entitlement only after server verification; returning to a screen is not proof of payment.
- Trial consumption and paid-litter activation are atomic and cannot happen twice concurrently.
- A paid litter is not charged twice because it is corrected/reopened.
- Purchasing has canceled, pending, successful, failed, expired, refunded, and restored handling.
- Prices/terms come from the relevant storefront/provider, not hardcoded legacy strings.
- No accidental duplicate subscription across Apple, Google, and Stripe; show existing coverage and provider management link.
- Existing historical data stays readable/exportable after expiry under the proposed default policy; new paid-litter activation may be blocked. Any care-edit grace policy requires approval.

### PR-10: Data Control And Trust

Profile provides support contact, privacy/terms, notification/appearance preferences, account export, subscription management, and deletion.

Acceptance:

- Export account data in documented JSON and weights in CSV through authenticated, expiring downloads.
- Warn about buyer data before system sharing and never generate publicly accessible export links.
- Delete requires recent authentication and clearly explains subscription cancellation and any legally retained records.
- Deletion is resumable and covers domain data, drafts/cache, sessions, devices, and applicable providers.
- Maintain a functional external account-deletion request page for users without the app.
- Analytics/crash reports contain no buyer messages, contact details, passwords, tokens, or free-text diary content.

## Success Measures

Targets below are proposed usability/quality targets, not claims about current performance.

| Measure | Initial target / definition |
| --- | --- |
| Six-animal daily weighing | Median under 60 seconds in a moderated test, excluding physically weighing animals |
| Reach weighing | No more than two decisions from Today for a returning breeder |
| Activation | Measure account to first litter plus first confirmed weight; establish baseline before setting conversion targets |
| Care continuity | Measure weekly active breeders with born litters who log weights; exclude accounts without a care need |
| Mutation reliability | No confirmed duplicate or misassigned weight in concurrency/retry acceptance tests |
| Crash-free sessions | Proposed >=99.5% during beta, with no unresolved data-loss crash |
| Accessibility | Core flows complete with VoiceOver and TalkBack at large text sizes |
| Trust | No entered care data lost in tested interruption, validation, network, and session-expiry scenarios |

Instrument only minimal event metadata: flow, success/error category, duration, platform, and app version. Obtain the appropriate consent/lawful basis and never substitute usage tracking for actual breeder interviews.
