# Litterly V2 Business Requirements

## 1. Purpose

Litterly V2 will give cat and dog breeders a shared, mobile-first workspace for managing a kennel and the journey from planned mating through birth, care, buyer coordination, and delivery. It will replace the account-centred and online-dependent parts of Litterly V1 with shared kennel ownership, reliable operational records, and controlled buyer access.

This document describes the business outcomes and capabilities required for the V2 minimum viable product (MVP). It is the product-level source of truth; implementation architecture and delivery tasks belong in separate technical documentation.

## 2. Business Objectives

- Help a breeding team maintain one reliable, shared history for its animals, litters, and buyers.
- Make essential litter work practical on a mobile device, including when internet access is unavailable.
- Protect sensitive kennel, health, buyer, and document information through clear access boundaries.
- Give breeders a controlled way to collect buyer applications and share relevant updates and documents.
- Establish a kennel-level commercial model that can support free, per-litter, and subscription access.
- Launch a new product without requiring migration of historical Litterly V1 data.

## 3. Users and Business Concepts

- **Kennel owner:** Accountable for the kennel, its members, billing, and lifecycle decisions.
- **Kennel editor:** Performs day-to-day animal, litter, buyer, and document work within the kennel.
- **Kennel reader:** Can view kennel information but cannot change or share it.
- **Buyer:** Submits one or more applications and can access only information explicitly made available to them.
- **Internal support administrator:** Handles limited account and subscription support without access to kennel operational records.
- **Kennel:** The shared business workspace and owner of its records, member access, and product entitlements.
- **Animal:** An animal owned or managed by a kennel, or a limited external parent profile used in breeding records.
- **Litter:** A record connecting parent profiles and tracking the offspring from planned mating through final outcomes.

For the MVP, each user account belongs to one active kennel. Kennel records and entitlements belong to the kennel, not to an individual member.

## 4. Business Requirements

### 4.1 Kennel Access and Governance

- **BR-ACC-01:** A user must be able to create or regain access to an account using supported email-based or Apple/Google sign-in methods.
- **BR-ACC-02:** A new kennel must be usable after providing a kennel name; contact or business details are requested only when needed for a relevant activity.
- **BR-ACC-03:** A user may have only one active kennel membership in the MVP. A user already belonging to a kennel cannot accept an invitation to another kennel unless their existing membership has first ended.
- **BR-ACC-04:** Kennel access must distinguish owner, editor, and reader responsibilities. Owners manage members, billing, and deletion; editors manage permitted operational work; readers have view-only access.
- **BR-ACC-05:** Owners must be able to invite editors and readers using personal invitations. An invitation must expire or become unusable after acceptance and must not grant access to anyone other than its intended recipient.
- **BR-ACC-06:** Ownership transfer must require confirmation by both the current owner and the selected existing editor. The kennel, its records, and its entitlements remain intact through the transfer.
- **BR-ACC-07:** Owners must be able to request a kennel data export and permanent deletion. Deletion requires renewed identity confirmation and includes a 30-day cancellation period. The approved retention and final deletion policy must be documented before production use.
- **BR-ACC-08:** Internal support access must be limited to the account and subscription information needed for support and must not expose kennel operational data.

### 4.2 Animal and Breeding Records

- **BR-ANI-01:** A kennel must be able to maintain profiles and long-term histories for its own animals, including breeding animals, offspring, and animals no longer active in the kennel.
- **BR-ANI-02:** Animal profiles must support relevant identity and breeding information, including species, sex, breed, registration details, health tests, documents, and breeding status where applicable.
- **BR-ANI-03:** Breed selection must support a searchable list for cats and dogs and an “Other” option with a recorded free-text breed.
- **BR-ANI-04:** A kennel must be able to keep limited profiles for external breeding partners without treating those animals as kennel-owned animals.
- **BR-ANI-05:** A litter must link to parent profiles rather than relying only on unstructured parent names. A litter may combine kennel-owned and external parent profiles.
- **BR-ANI-06:** Availability and final outcome must be tracked separately. For example, reserving an offspring for a buyer must not mark it as delivered; delivery, death, and other final outcomes must preserve the animal’s historical records and litter relationships.

### 4.3 Litter Management

- **BR-LIT-01:** A kennel must be able to record a planned litter with its species, parent profiles, and mating date, and see an estimated due date.
- **BR-LIT-02:** Breeders must be able to record each birth and create an individual record for every newborn, including birth order, time, sex, colour or identifying characteristics, and birth weight where known.
- **BR-LIT-03:** Newborns must be trackable using birth order or a temporary identifier before an official name is known. Adding a name later must not break the animal’s history, weights, media, or buyer relationship.
- **BR-LIT-04:** Breeders must be able to record individual weights and enter a weighing round for multiple offspring efficiently. Duplicate weight entries for the same animal and date must be prevented or resolved by updating the existing entry.
- **BR-LIT-05:** The product must help breeders notice missing weigh-ins and configured weight changes without presenting veterinary diagnoses or substituting for professional judgement.
- **BR-LIT-06:** Kennels must have a private litter timeline and be able to explicitly publish selected updates to eligible buyers. Private entries must remain visible only to authorized kennel members.
- **BR-LIT-07:** Kennels must be able to create and manage their own checklists at kennel or litter level. The product must not present Litterly-authored veterinary, legal, or jurisdiction-specific guidance as authoritative advice.
- **BR-LIT-08:** The operational overview must help members identify active litters, relevant upcoming actions, checklist progress, and weight status, including trends or comparisons within a litter.
- **BR-LIT-09:** Once all offspring have a final outcome, the product may recommend archiving the litter. Archiving remains a deliberate member action and must not happen automatically.
- **BR-LIT-10:** Before an animal is marked delivered, the breeder must be able to review incomplete kennel-created delivery checklist items and explicitly confirm how to proceed.

### 4.4 Offline Work and Data Reliability

- **BR-OFF-01:** Essential structured work must remain available without an internet connection, including birth records, weights, timeline entries, notes, and checklist changes.
- **BR-OFF-02:** Members must be able to distinguish changes that are waiting to sync, successfully synced, or need review. When connectivity returns, pending work must be submitted and its outcome made clear.
- **BR-OFF-03:** Independent changes to different fields should be retained together. When concurrent changes affect the same field, neither value may be silently discarded; an authorized member must be able to review and resolve the conflict.
- **BR-OFF-04:** Photo and document uploads require an internet connection in the MVP. The product must clearly distinguish a selected local file from a successfully uploaded file.
- **BR-OFF-05:** An offline birth record must not be lost because payment cannot be checked while offline. If payment is required, the record remains pending and is not treated as fully available to the kennel until the payment requirement is resolved after synchronization.

### 4.5 Buyer Applications and Access

- **BR-BUY-01:** A kennel must be able to share an unlisted application link or QR code and invite a buyer directly, without creating a public kennel or animal marketplace.
- **BR-BUY-02:** Each kennel must be able to tailor its application form using short or long text, yes/no, single-choice, and multiple-choice questions, with required-answer settings and helpful descriptions.
- **BR-BUY-03:** Applicants must accept the applicable Litterly privacy policy and the kennel’s privacy notice before submitting. The accepted versions and time of consent must be retained with the application.
- **BR-BUY-04:** A buyer may maintain multiple active applications for different litters or animals. Buyers must be able to update their answers or withdraw their own applications; withdrawn applications are no longer eligible for matching and must not trigger further application-related notifications.
- **BR-BUY-05:** Owners and editors must be able to match a buyer to an offspring without exposing other buyers’ personal information or assigning the same animal to multiple active matches.
- **BR-BUY-06:** Buyers may see only their own applications, updates explicitly published to an eligible litter, and information about their matched animal. There is no buyer-to-kennel direct messaging in the MVP.
- **BR-BUY-07:** After delivery, a buyer’s access to litter updates ends. The buyer may continue to access only documents explicitly shared for their own animal.
- **BR-BUY-08:** Unmatched applications must be deleted 12 months after their last activity, in accordance with the documented retention policy.

### 4.6 Health Information, Media, and Documents

- **BR-DOC-01:** Kennels must be able to keep structured health records for all their own animals, including retired and historical animals.
- **BR-DOC-02:** Photos and documents are private to the kennel by default. Sharing must be a deliberate action, and buyer access must be limited to the intended recipient and authorized kennel members.
- **BR-DOC-03:** Kennels must be able to use their own supported contract templates: DOCX templates with placeholders and fillable PDF templates.
- **BR-DOC-04:** Before a template is used, its fields must be identifiable and the kennel owner must be able to review or adjust field mappings. A template with unresolved required fields cannot be activated.
- **BR-DOC-05:** A member must be able to generate a private PDF for a relevant kennel, buyer, litter, animal, and delivery using an active kennel template. The generated document must preserve which template version and data were used. Electronic signature is outside the MVP.
- **BR-DOC-06:** Litterly does not supply its own legal or veterinary contract language, care advice, or country-specific compliance checklists in the MVP. Kennels are responsible for their own content.

### 4.7 Billing and Product Access

- **BR-BIL-01:** Each kennel receives one free litter entitlement. The entitlement is consumed when the first planned litter is recorded as born.
- **BR-BIL-02:** Further birth registrations require either an entitlement purchased for that litter or an active kennel subscription. The owner must be offered the available purchase options when payment is required.
- **BR-BIL-03:** Kennel access entitlements must be granted only after payment is confirmed. A completed checkout alone is not sufficient confirmation.
- **BR-BIL-04:** Paid litter entitlements and subscription access belong to the kennel and remain with it after an ownership transfer. The new owner is responsible for updating the payment method before a renewal when required.
- **BR-BIL-05:** Prices and currencies are commercial configuration, not values that should be fixed in product behaviour. The intended in-app checkout model must be verified against current Apple App Store and Google Play rules before release.

### 4.8 Notifications and Languages

- **BR-NOT-01:** Members may receive relevant notifications about checklist items, weight flags, buyer applications, published buyer updates, matches, and shared or generated documents.
- **BR-NOT-02:** Notification preferences must be manageable by member and, where relevant, by litter. Essential security and invitation notifications cannot be disabled. Notifications supplement the product and are not the sole place where important information is available.
- **BR-NOT-03:** The mobile product must support Swedish, Norwegian Bokmål, Danish, Finnish, and English. Each user can choose the interface language independently of kennel data, the user’s country, and a litter’s jurisdiction.

## 5. MVP Scope Exclusions

- Migration of historical data from Litterly V1 or a compatibility layer for its MongoDB data.
- A web client, separate mobile administration application, or public marketplace/search.
- General-purpose or direct buyer messaging.
- Litter financial accounting.
- Automatic integrations with SKK Avelsdata, SVERAK FindUs, or similar registries unless the relevant provider has explicitly approved access.
- Offline upload of photos or documents.
- Electronic signatures or Litterly-authored veterinary, legal, or jurisdiction-specific advice.

## 6. Business Constraints and Open Decisions

- V2 is a new product and database; V1 records are not included in the initial launch.
- The product handles sensitive personal, health, and document data. Access, consent, export, retention, and deletion policies require appropriate security and legal review before production.
- Retention following final kennel deletion requires legal review before production implementation.
- Supported document formats and file-size limits must be confirmed through representative template testing.
- Payment-provider and app-store policy compatibility must be confirmed before launch; commercial prices and currencies remain configurable.

## 7. Release-Level Outcomes

The MVP is ready for a controlled pilot when a kennel can onboard and manage member roles; maintain animal and litter histories from planned mating through delivery; record critical work offline and safely resolve synchronization conflicts; collect and manage private buyer applications; share selected updates and documents with the intended buyers; and enforce kennel-level product access after confirmed payment. These journeys must be validated on both iOS and Android with access-control, privacy, and data-reliability checks before broader release.
