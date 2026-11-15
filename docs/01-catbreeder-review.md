# Catbreeder Source Review

## Review Basis

- Repository: [thereseml/catbreeder](https://github.com/thereseml/catbreeder), private, branch `main`.
- Inspected commit: `35f11a94d85f0099cc905de943cf888b2f033e05`.
- Review date: 2026-11-14.
- Litterly destination at review start: only `README.md` and an empty `.gitignore`; no app or backend implementation.
- Method: static inspection of frontend, backend, admin, tests, deployment configuration, planning documents, theme, logo, and demo-poster image. No running-app/browser review, test execution, production access, or live integration validation was performed.
- Existing functionality below means wired in the inspected source, not independently verified in production. Proposed functionality is identified separately.
- Source paths refer to Catbreeder, not files already copied into this repository. Use the pinned commit when following references; source plans can be stale.

The source project already calls itself **Litterly**, despite the GitHub repository name. This is a mobile evolution of the product, not a new unrelated brand.

## What Already Exists

| Area | Implemented in source | Important boundary |
| --- | --- | --- |
| Accounts | Registration, login, password recovery/change, profile, account deletion | No guided onboarding, verified-email journey, or native session lifecycle |
| Dashboard | Active/planned counts, quick actions, litter growth summary, lifecycle reminders, calendar markers | Not a general appointment/task calendar; some mutations leave summaries stale |
| Litters | Cats/dogs, planned/born/completed, parent names, pairing and birth dates, expected date, timelines | Parents are text, not linked animals; birth is an edit rather than a dedicated journey |
| Offspring | Bulk creation of 1-20 animals, individual records, sex, color, notes, six statuses | No photo, collar identifier, microchip, or pedigree in current forms/models |
| Own animals | Kept/foster animals, current/former views, acquired animals without litter, health tests | Foster is a status, not foster-household management; parent-history links are planned |
| Growth | Single/bulk weights, daily/weekly views, individual and litter comparisons | Bulk mapping is positional; concurrent daily uniqueness is not database-enforced |
| Diary | Dated animal notes, edit/delete | Free text, not structured treatment records or an audit trail |
| Buyers | Waitlist/buyer directory, interested/reserved/delivered stages, contact details, litter association, email | Animal allocation is present in form/types but live callers do not supply the selectable animals |
| Reminders | Species/lifecycle schedules, due reminders, persisted dismiss/restore | No push, custom tasks, snooze, or proof that care was performed |
| Billing | Free-litter gate, one-litter and annual Stripe Checkout, webhook handlers | Web payment implementation, not native-store billing or complete entitlement accounting |
| Support | Standalone admin plus older embedded admin, user management, metrics, impersonation | Support tooling, not shared breeder accounts; live rollout is unverified |

The buyer waitlist remains active. The retired early-access signup waitlist was a different feature and should not be revived accidentally.

## Preserve, Improve, Defer

| Preserve | Improve for mobile | Defer intentionally |
| --- | --- | --- |
| Cream surfaces, earthy brown identity, muted semantic colors, Inter | Contrast-safe controls and native type scaling | A visual rebrand |
| Cat and dog domain support | Species-correct language and reviewed guidance | New species |
| Planned to born to completed lifecycle | Guided birth flow and reversible, audited corrections | Detailed labor monitoring and medical decisions |
| Litter-wide weighing and growth history | Stable animal IDs, collar labels, fast keyboard flow, reliable retries | Bluetooth scales and automated diagnosis |
| Independent retained/acquired animals | Linked parents with external-name fallback | Pedigree/genetic compatibility engine |
| Buyer contacts and email | Working animal assignment and coordinated reservation/handover | Marketplace, chat, and buyer login |
| Lifecycle reminders | Today priorities, completion records, optional push | General calendar replacement |
| Existing accounts and identifiers | Safe migration and common entitlements | Unnecessary backend/database rewrite |

## Most Valuable Product Improvements

### 1. A Care Desk, Not A Smaller Dashboard

The current dashboard stacks quick-action cards, statistics, and a calendar. On a phone, the breeder's immediate question is usually: which litter needs weighing, what has changed, and what is due?

Put those answers first. Show a litter's measured/eligible count for today, one primary weighing action, and a short due-task list. Keep reporting available, but below action-critical content.

### 2. A Reliable Weighing Session

The current weighing form is already unusually useful: batch entry, previous measurements, gram/percentage changes, decimal-comma input, and next-field navigation. Preserve that investment.

Fix the underlying contract before adding offline replay. A list of values mapped to animals sorted by name is unsafe when animals are renamed or their membership changes. Submit explicit animal IDs, enforce one daily measurement, and retain the draft when saving fails.

Add collar color plus a text label or short identifier. Color alone is not a reliable identifier, and duplicate names must never merge chart series.

### 3. One Connected Buyer Journey

Currently a buyer can be reserved while the animal remains available; delivered and sold are also independent. Replace this double bookkeeping with explicit reservation and handover commands that update related records together.

Keep contacts reusable: a person may be interested in multiple litters over time. A contact record should not itself be the complete sale record.

### 4. Birth As A Real Event

Provide a short flow: confirm birth date, record optional note, register offspring now or later, then start care. Preserve pairing history and estimated date as historical information.

Do not place an unexpected checkout halfway through recording a birth. Explain entitlement eligibility in advance and preserve entered care data if a purchase is needed. Any emergency logging allowance is a commercial decision, not something to invent silently.

### 5. Useful Guidance Without False Assurance

The source contains preset development and departure guidance. It does not enforce legal delivery eligibility, establish veterinary validity, or record that a vaccination actually happened.

Separate guidance, scheduled tasks, and completed care. Make region/species assumptions visible and have current husbandry/legal content reviewed before launch.

## Source Risks To Resolve Before Launch

These are source-review findings, not verified exploits or a complete penetration test. They justify implementation and regression-test work, not unsupported claims about production incidents.

| Priority | Finding | Required response |
| --- | --- | --- |
| Critical investigation | Reset token enters a Mongo query after only a truthiness check; object-shaped input is not explicitly rejected | Validate scalar token format and request schema, hash tokens, reproduce safely in isolation, add regression tests |
| High | Password reset/change does not revoke existing normal JWTs; normal tokens last 24 hours | Revocable sessions, refresh rotation, and reset/change revocation |
| High | Weight duplicates use check-then-insert with a nonunique index; bulk insert lacks a transaction | Unique daily key, idempotency, atomic batch writes on supported database topology |
| High | Free-trial consumption happens before litter persistence; checkout handlers can alter litter status | Atomic entitlement consumption and lifecycle command; payment must not manufacture a birth |
| High | Deletion differs between self/admin paths, can orphan references, and does not reconcile subscriptions | One deletion policy, resumable cleanup, provider coordination, reauthentication |
| High | Child record reads may proceed when the parent pet is missing | Fail closed unless an owned existing parent is found |
| High | Payment completion lacks comprehensive settlement/state reconciliation and event deduplication | Durable event ledger, verified settlement, account binding, idempotent processing |
| Medium | Buyer, animal, and diary forms have inconsistent pending/error behavior | Preserve input until success, reject duplicate taps, visible retry/error states |
| Medium | Admin operations lack a durable security audit; last-admin safeguards are incomplete | Audited actions, last-active-admin protection, sensitive-action restrictions |
| Medium | User data is interpolated into email HTML; buyer email lacks a dedicated quota/history | Escape content, enforce quotas, add minimal delivery audit and breeder reply-to |
| Medium | Date-only fields mix local and UTC handling | Document one date contract and test midnight, daylight saving, travel, and Swedish decimals |

Several historical documents describe fixes that are not present in current source. In particular, do not rely on `docs/SECURITY.md` as proof of token revocation or current security posture. Existing tests are useful evidence of intended behavior, but were not run during this review.

## Source Reference Map

All references below are within [the pinned source tree](https://github.com/thereseml/catbreeder/tree/35f11a94d85f0099cc905de943cf888b2f033e05).

| Subject | Source paths |
| --- | --- |
| Theme, spacing, type | `frontend/src/theme.ts`, `frontend/src/styles/global.css` |
| Brand assets | `frontend/src/assets/litterlyLogo.png`, `frontend/public/videos/litterly-demo-poster.jpg` |
| Mobile shell | `frontend/src/components/Layout/{Layout,MobileHeader,BottomNav}.tsx` |
| Dashboard | `frontend/src/pages/Dashboard/DashboardPage.tsx` |
| Litter journeys | `frontend/src/pages/Litters/{LittersPage,LitterDetailPage}.tsx`, `frontend/src/components/forms/LitterForm.tsx` |
| Animal records | `frontend/src/pages/{Pets/PetDetailPage,MyPets/MyPetsPage}.tsx`, `frontend/src/components/forms/{PetForm,BulkPetForm}.tsx` |
| Weighing and charts | `frontend/src/components/forms/{BulkWeightForm.tsx,bulkWeightUtils.ts}`, `frontend/src/pages/Statistics/StatisticsPage.tsx` |
| Buyer allocation gap | `frontend/src/components/forms/BuyerForm.tsx`, `frontend/src/pages/Buyers/BuyersPage.tsx`, dashboard and litter-detail callers |
| Reminders | `frontend/src/contexts/NotificationsProvider.tsx`, `backend/controllers/todoController.ts`, `backend/data/{cat,dog}Schedule.json` |
| Billing UI/prices | `frontend/src/components/PaymentRequiredDialog.tsx`, `frontend/src/pages/Settings/ProfilePage.tsx`, `frontend/src/locales/sv/translation.json` |
| Models | `backend/models/{User,Litter,Pet,Buyer,WeightEntry,EventLog,ReminderDismissal}.ts` |
| Business logic | `backend/controllers/{litter,pet,weight,buyer}Controller.ts`, `backend/utils/{gestation,subscription}.ts` |
| Authentication | `backend/controllers/authController.ts`, `backend/middleware/auth.ts`, `backend/models/User.ts` |
| Deletion and admin | `backend/controllers/{user,litter,pet,event,weight}Controller.ts`, `admin/src/` |
| Integrations | `backend/controllers/stripeController.ts`, `backend/services/{stripe,email}.ts` |
| Existing migration | `backend/migrations/backfillPetOwner.ts` |
| Test evidence | `backend/controllers/*.integration.test.ts`, `frontend/src/pages/journeys.test.tsx`, `frontend/playwright.config.ts` |
| Operational evidence | `.github/workflows/{ci,deploy-dev,deploy-prod}.yml`, `backend/{server,db}.ts` |
| Historical/planned material | `FRONTEND_BACKEND_LOGIC_{AUDIT,IMPLEMENTATION_PLAN}.md`, `docs/{min-djur-plan,standalone-admin-plan,SECURITY}.md`, `openspec/changes/` |

## Reuse Conclusion

Reuse domain knowledge, identifiers, reviewed schedules, brand tokens, translations, reporting formulas after validation, and server integrations after hardening. Rebuild the interface in native components.

Do not copy Material UI components, CSS layouts, Recharts/browser interactions, `localStorage` authentication, browser redirects, or frontend-only enforcement into React Native. Native delivery requires a new client and a safer multi-client API, not a wholesale copy of the website.
