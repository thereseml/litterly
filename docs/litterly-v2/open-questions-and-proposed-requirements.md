# Open Questions and Proposed Requirements

This document separates decisions already called out by the business requirements from additional candidate requirements found during review. Nothing in the “Proposed Requirements” section is approved scope until stakeholders accept it. Resolve blocking decisions before an implementation agent has to guess.

## Existing Open Decisions

- **Access and governance:** Document retention and final deletion policy; define what happens to active memberships and invitations when a member is removed or loses account access; define export contents, format, readiness, and delivery.
- **Animal and litter operations:** Define lifecycle/status transitions, supported units, date/time and timezone rules, due-date estimate behavior, missing-weigh-in cadence, and configurable weight-change thresholds.
- **Offline and sync:** Define device loss/reinstall behavior, offline access after entitlement or membership changes, stale-data behavior after access revocation, and same-field conflict resolution including delete-versus-edit.
- **Buyer applications:** Define application-link expiration and revocation; anonymous versus account-based applicant identity; form changes after submission; retention for matched and withdrawn applications; spam/abuse controls.
- **Health, media, and documents:** Define structured health fields, file retention/deletion, already-shared file revocation behavior, template size/field limits, and PDF rendering expectations.
- **Billing:** Define subscription term, renewal/cancellation, refunds, failed-payment grace period, tax/receipt requirements, and payment-failure recovery. Confirm store-policy-compatible checkout before release.
- **Notifications:** Choose channels (in-app, push, email), frequency/digest behavior, delivery failure behavior, and configuration for weight flags and checklist reminders.
- **Localization:** Define date, time, number, and measurement formatting, and whether user-entered content needs translation (the current requirement only promises interface language selection).
- **Production policy:** Complete security/legal review of consent, retention, export, deletion, and data handling; confirm supported document formats and file-size limits through representative testing.

## Proposed Requirements to Consider

These are gaps that commonly cause inconsistent implementations or privacy regressions. Confirm, reject, or defer each explicitly; they are not assigned `BR-*` IDs because they are not yet approved.

| Priority | Candidate requirement | Why it matters / decision needed |
| --- | --- | --- |
| Blocking | **Define a permission matrix for every record and action by role.** Include create/edit/delete, export, sharing, matching, template activation, billing, and member administration. | The role summary does not enumerate editor and reader permissions for every workflow. Implementation otherwise risks inconsistent access checks. |
| Blocking | **Define member removal and account recovery behavior.** State who can remove a member, whether ownership is transferable before owner removal, and how the one-active-kennel limit is released. | `BR-ACC-03` depends on membership ending, but the process and effects on that member’s local/offline data are not specified. |
| Blocking | **Define audit history for sensitive and consequential actions.** Consider recording actor, time, action, and affected record for role changes, ownership transfer, sharing/revocation, match changes, exports, and deletion. | Supports accountability and investigation where sensitive data is shared or changed. Confirm retention and member visibility. |
| Blocking | **Define revocation semantics for access changes.** State how promptly access ends across active sessions, cached/offline devices, buyer links, and previously downloaded/shared files. | Server-side authorization alone cannot retract already downloaded files; product and policy expectations must be explicit. |
| High | **Define required, optional, and editable fields for animal, litter, birth, match, and delivery workflows.** Include allowed corrections and whether historical values are retained. | Existing requirements name some fields but do not define validation or correction rules. |
| High | **Define safe recovery for destructive or irreversible actions.** Specify confirmation, undo/restore, and downstream effects for deleting records/files, withdrawing applications, unmatching, and finalizing animal outcomes. | Prevents accidental permanent loss and inconsistent histories. Align with retention rules. |
| High | **Define data export completeness and format.** Include operational records, relationships, files, consent, and timestamps as applicable, plus how the owner receives and secures the export. | “Data export” is not sufficiently testable without its contents and delivery expectations. |
| High | **Define notification semantics for each event.** Specify recipients, triggers, duplicate suppression, quiet hours, and whether failed delivery changes in-product state. | Current requirements list notification categories but not event behavior; buyer withdrawal already requires notification suppression. |
| High | **Define account security expectations.** Decide session expiry, re-authentication for sensitive actions, recovery safeguards, and whether multi-factor authentication is required or deferred. | The product handles sensitive health, buyer, and document data; sign-in methods alone do not define account protection. |
| Medium | **Define accessibility and supported-device expectations.** Set a baseline for accessibility, minimum OS versions, screen sizes, and offline storage capacity. | “Mobile-first” and iOS/Android validation do not establish a testable device/accessibility baseline. |
| Medium | **Define data correction and provenance for generated documents.** Decide whether generated PDFs are immutable snapshots, can be regenerated, and how corrections or template changes are represented. | `BR-DOC-05` captures template/data provenance, but subsequent edits and corrections are unspecified. |
| Medium | **Define operational support and failure states.** Specify user-facing recovery for sync failure, payment pending/failure, upload failure, and document generation failure. | These are central workflows; clear recovery avoids silent data loss and support ambiguity. |

## Suggested Acceptance-Criteria Format

When decisions are resolved, add testable acceptance criteria beneath the applicable requirement. At minimum, criteria should cover:

- Allowed and denied behavior for each role, including attempts through non-UI entry points.
- Success, validation failure, cancellation, and retry paths.
- Offline, reconnect, duplicate submission, and conflict cases where relevant.
- Privacy boundaries between kennels and between buyers.
- Data retained, deleted, or made inaccessible after lifecycle transitions.
- iOS and Android behavior for the end-to-end pilot journeys.
