# Domain and Data Model

**Status: Proposed logical model.** This describes ownership boundaries and invariants, not a final SQL schema. Names and physical normalization should be agreed during the proof of concept and schema design.

## Ownership Model

- A user identity is separate from a kennel. A user has at most one active kennel membership in the MVP.
- A kennel is the tenant root and owns its operational records, member relationships, configuration, and product entitlements.
- Buyer identities and applications are separate from kennel member accounts. A buyer can have applications at different kennels without gaining access to those kennel workspaces.
- A profile for an external breeding partner's animal is a kennel-scoped reference record, not a shared/global animal record and not an animal owned by that kennel.
- Files are stored as objects; Postgres metadata and explicit sharing relationships determine the authorized audience.

## Logical Entities

| Entity | Key relationships and constraints |
| --- | --- |
| User | Authenticated identity; can hold one active kennel membership in MVP. |
| Kennel | Tenant root; owns memberships, animals, litters, forms, timeline, files, templates, and entitlement ledger. |
| Membership | Links user to kennel with owner/editor/reader role and active/ended lifecycle. Enforce at most one active membership per user. |
| Invitation | Targets a recipient and a kennel role; single-use, expiring, and bound to the intended recipient. Store only a protected token representation. |
| Animal profile | Kennel-scoped; distinguish kennel-owned/managed animal from external parent profile. Preserve history when inactive or deceased. |
| Litter | Belongs to one kennel; links to parent profiles and tracks lifecycle from planned mating through final offspring outcomes. |
| Litter offspring | Links a litter to an animal profile; keeps birth order and litter-specific relationship stable when a temporary identifier is later replaced by an official name. |
| Weight entry | Belongs to an offspring/animal; has measurement value, unit, measured-at time, and author. Define uniqueness/update behavior for the same animal and weighing date. |
| Checklist and item | Kennel- or litter-scoped; kennel-authored content only. Delivery review records the explicit decision to proceed with incomplete items. |
| Timeline entry/publication | Private kennel entry by default; a separate publication relationship identifies which eligible buyer audience may see it. |
| Buyer application | Links buyer, kennel, and optionally litter/animal; stores versioned form answers and consent evidence. |
| Match | Links one application/buyer to one offspring; only one active match per offspring. Keep availability distinct from delivery/final outcome. |
| Health record | Belongs to a kennel-owned animal; use domain-specific structured fields rather than placing all health data in free text. |
| File metadata/share grant | Links stored object to kennel and relevant entities; explicit audience and revocation state. Object key is not itself authorization. |
| Document template/version | Kennel-owned, with reviewed field mappings and activation state. Generated document records the template version and data snapshot/reference used. |
| Entitlement ledger | Kennel-owned grants and consumption events, with provider transaction references and idempotency keys. Current access is derived from verified events and product rules. |
| Audit event | Actor, action, target, time, and relevant outcome for sensitive changes, subject to agreed retention and access policy. |

## Important Invariants

- Parent links reference animal profiles; parent names are display data, not the relationship itself.
- A reservation/match does not set the offspring to delivered. Availability and final outcome are separate dimensions.
- An animal name change does not change its identity or sever weights, media, timeline, application, or litter relationships.
- A buyer match is unique per offspring while active, and withdrawn applications cannot be matched.
- An unmatched application is deleted 12 months after its last activity as required by `BR-BUY-08`; define the separate lifecycle for matched and withdrawn applications before production.
- Entitlement belongs to the kennel, not the purchasing member. A store transaction is evidence of payment; it is not by itself the current product access record.
- A locally staged birth and a server-accepted birth are distinct states. Only the server can confirm entitlement and authoritative availability.
- Every relation and file access path must be tested across two kennels and across two buyers within the same kennel.

## Lifecycle States to Specify Before Schema Freeze

Requirements imply transitions but do not fully specify state vocabularies. Agree state machines and allowed corrections for:

- Litter: planned, born/active, completed/archived, and cancellation/loss cases.
- Offspring: temporary identity, named, available, reserved/matched, delivered, deceased, or another final outcome.
- Application: draft/submitted, active, withdrawn, matched, and retained/deleted.
- Membership and invitation: invited, accepted, expired/revoked; active, suspended/ended; ownership transfer pending/completed/cancelled.
- Local change: pending, syncing, synced, rejected/review-needed, and resolved.
- Entitlement: pending verification, active, consumed/expired, refunded/revoked, or payment issue.

These are candidate labels, not approved product language. Keep domain status separate from synchronization status and from authorization.

## Requirement Traceability

Primary requirements: [access and governance](../litterly-v2/access-and-governance.md), [animal and litter operations](../litterly-v2/animal-and-litter-operations.md), [buyer applications and sharing](../litterly-v2/buyer-applications-and-sharing.md), and [health, media, and documents](../litterly-v2/health-media-and-documents.md). Open lifecycle and retention decisions remain in the [business open-questions register](../litterly-v2/open-questions-and-proposed-requirements.md).
