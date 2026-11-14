# MVP Boundaries and Release

## Users and Product Model

- **Kennel owner:** Accountable for the kennel, members, billing, and lifecycle decisions.
- **Kennel editor:** Performs day-to-day animal, litter, buyer, and document work within the kennel.
- **Kennel reader:** Can view kennel information but cannot change or share it.
- **Buyer:** Submits applications and can access only information explicitly made available to them.
- **Internal support administrator:** Handles limited account and subscription support without access to kennel operational records.
- **Kennel:** Shared workspace and owner of records, member access, and product entitlements.
- **Animal:** Kennel-owned/managed animal or limited external parent profile.
- **Litter:** Parent-linked record for offspring from planned mating through final outcomes.

For the MVP, each user account belongs to one active kennel. Kennel records and entitlements belong to the kennel, not to an individual member.

## MVP Exclusions

- Migration of historical data from Litterly V1 or a compatibility layer for its MongoDB data.
- A web client, separate mobile administration application, or public marketplace/search.
- General-purpose or direct buyer messaging.
- Litter financial accounting.
- Automatic integrations with SKK Avelsdata, SVERAK FindUs, or similar registries unless the relevant provider has explicitly approved access.
- Offline upload of photos or documents.
- Electronic signatures or Litterly-authored veterinary, legal, or jurisdiction-specific advice.

## Business Constraints

- V2 is a new product and database; V1 records are not included in the initial launch.
- The product handles sensitive personal, health, and document data. Access, consent, export, retention, and deletion policies require appropriate security and legal review before production.
- Retention following final kennel deletion requires legal review before production implementation.
- Supported document formats and file-size limits must be confirmed through representative template testing.
- Payment-provider and app-store policy compatibility must be confirmed before launch; commercial prices and currencies remain configurable.

## Controlled Pilot Outcome

The MVP is ready for a controlled pilot when a kennel can onboard and manage member roles; maintain animal and litter histories from planned mating through delivery; record critical work offline and safely resolve synchronization conflicts; collect and manage private buyer applications; share selected updates and documents with the intended buyers; and enforce kennel-level product access after confirmed payment. These journeys must be validated on both iOS and Android with access-control, privacy, and data-reliability checks before broader release.

## Implementation Note

The requirements describe business outcomes, not architecture. Keep data models, API contracts, security design, and delivery plans in separate technical documents. Track unresolved scope in [open questions and proposed requirements](open-questions-and-proposed-requirements.md) rather than deciding it implicitly during implementation.
