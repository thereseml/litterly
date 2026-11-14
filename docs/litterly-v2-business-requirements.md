# Litterly V2 Business Requirements

This is the entry point and product-level source of truth for the Litterly V2 MVP business requirements. Requirements are split into focused documents to make implementation and review easier. Preserve the requirement IDs when implementing or discussing scope.

## Product Outcomes

Litterly V2 gives cat and dog breeders a shared, mobile-first workspace for managing a kennel and the journey from planned mating through birth, care, buyer coordination, and delivery. It replaces the account-centred and online-dependent parts of Litterly V1 with shared kennel ownership, reliable operational records, and controlled buyer access.

The MVP must:

- Help a breeding team maintain one reliable, shared history for its animals, litters, and buyers.
- Make essential litter work practical on a mobile device, including when internet access is unavailable.
- Protect sensitive kennel, health, buyer, and document information through clear access boundaries.
- Give breeders a controlled way to collect buyer applications and share relevant updates and documents.
- Establish a kennel-level commercial model that can support free, per-litter, and subscription access.
- Launch as a new product without requiring migration of historical Litterly V1 data.

## Requirement Documents

| Document | Scope | Primary requirement IDs |
| --- | --- | --- |
| [Access and governance](litterly-v2/access-and-governance.md) | Accounts, kennel membership and roles, invitations, ownership, support access, export and deletion | `BR-ACC-*` |
| [Animal and litter operations](litterly-v2/animal-and-litter-operations.md) | Animal histories, breeding profiles, litter lifecycle, birth, weights, checklists, operational overview | `BR-ANI-*`, `BR-LIT-*` |
| [Offline and synchronization](litterly-v2/offline-and-sync.md) | Offline work, sync status, conflict handling, uploads, offline birth and payment | `BR-OFF-*` |
| [Buyer applications and sharing](litterly-v2/buyer-applications-and-sharing.md) | Application links and forms, consent, matching, buyer visibility, application retention | `BR-BUY-*` |
| [Health, media, and documents](litterly-v2/health-media-and-documents.md) | Health records, private files, buyer sharing, kennel templates and generated PDFs | `BR-DOC-*` |
| [Billing, notifications, and languages](litterly-v2/billing-notifications-and-languages.md) | Entitlements, purchase requirements, notifications, preferences, supported languages | `BR-BIL-*`, `BR-NOT-*` |
| [MVP boundaries and release](litterly-v2/mvp-boundaries-and-release.md) | Roles and concepts, exclusions, cross-cutting constraints, pilot outcome | N/A |
| [Open questions and proposed requirements](litterly-v2/open-questions-and-proposed-requirements.md) | Decisions and requirement gaps to resolve before implementation or production | Proposed; not approved requirements |

## Suggested Reading Order

1. Read this overview and [MVP boundaries and release](litterly-v2/mvp-boundaries-and-release.md).
2. Resolve decisions marked as blocking in [open questions and proposed requirements](litterly-v2/open-questions-and-proposed-requirements.md).
3. Implement access and governance before building domain workflows; access rules apply to every kennel-owned record.
4. Implement animal and litter operations, then offline/sync and buyer sharing, which depend on those records and lifecycle states.
5. Implement documents and billing/notifications alongside their dependent workflows, then validate the release outcomes on both mobile platforms.

This order is guidance, not a technical architecture mandate. Each requirement document states its relevant dependencies and implementation notes.

## Requirement Handling

- The `BR-*` statements in the linked documents are the agreed business requirements carried over from the original consolidated document.
- The open-questions document distinguishes existing unresolved decisions from proposed requirements. Proposed requirements are not approved scope until product stakeholders decide them.
- Architecture, data models, API contracts, and delivery tasks belong in separate technical documentation. Do not infer a specific implementation from these business requirements.
- Where a requirement leaves behavior undefined, record the decision rather than silently choosing behavior during implementation.
