# Access and Governance

Scope: account access, kennel membership and roles, invitations, ownership, support access, export, and deletion. These rules apply to all kennel-owned data and are foundational to the other requirement areas.

## Business Concepts

- **Kennel owner:** Accountable for the kennel, its members, billing, and lifecycle decisions.
- **Kennel editor:** Performs day-to-day animal, litter, buyer, and document work within the kennel.
- **Kennel reader:** Can view kennel information but cannot change or share it.
- **Internal support administrator:** Handles limited account and subscription support without access to kennel operational records.
- **Kennel:** Shared business workspace and owner of its records, member access, and product entitlements.

For the MVP, each user account belongs to one active kennel. Kennel records and entitlements belong to the kennel, not to an individual member.

## Requirements

- **BR-ACC-01:** A user must be able to create or regain access to an account using supported email-based or Apple/Google sign-in methods.
- **BR-ACC-02:** A new kennel must be usable after providing a kennel name; contact or business details are requested only when needed for a relevant activity.
- **BR-ACC-03:** A user may have only one active kennel membership in the MVP. A user already belonging to a kennel cannot accept an invitation to another kennel unless their existing membership has first ended.
- **BR-ACC-04:** Kennel access must distinguish owner, editor, and reader responsibilities. Owners manage members, billing, and deletion; editors manage permitted operational work; readers have view-only access.
- **BR-ACC-05:** Owners must be able to invite editors and readers using personal invitations. An invitation must expire or become unusable after acceptance and must not grant access to anyone other than its intended recipient.
- **BR-ACC-06:** Ownership transfer must require confirmation by both the current owner and the selected existing editor. The kennel, its records, and its entitlements remain intact through the transfer.
- **BR-ACC-07:** Owners must be able to request a kennel data export and permanent deletion. Deletion requires renewed identity confirmation and includes a 30-day cancellation period. The approved retention and final deletion policy must be documented before production use.
- **BR-ACC-08:** Internal support access must be limited to the account and subscription information needed for support and must not expose kennel operational data.

## Implementation Dependencies

- Apply the role model and kennel boundary to all records, files, buyer access, exports, and background jobs, not only the primary screens.
- Invitation acceptance, membership ending, and ownership transfer interact with the one-active-kennel rule; define their ordering and failure behavior before implementing them.
- Export and deletion depend on the retention and final-deletion decisions in [open questions and proposed requirements](open-questions-and-proposed-requirements.md).

## Unresolved Policy

See [open questions and proposed requirements](open-questions-and-proposed-requirements.md) for membership removal and recovery, audit history, export contents/format, and deletion/retention details.
