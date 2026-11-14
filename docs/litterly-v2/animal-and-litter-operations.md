# Animal and Litter Operations

Scope: kennel-owned and external animal profiles, breeding relationships, the litter lifecycle, newborn records, weights, checklists, and the operational overview.

## Business Concepts

- **Animal:** An animal owned or managed by a kennel, or a limited external parent profile used in breeding records.
- **Litter:** A record connecting parent profiles and tracking offspring from planned mating through final outcomes.

## Animal and Breeding Requirements

- **BR-ANI-01:** A kennel must be able to maintain profiles and long-term histories for its own animals, including breeding animals, offspring, and animals no longer active in the kennel.
- **BR-ANI-02:** Animal profiles must support relevant identity and breeding information, including species, sex, breed, registration details, health tests, documents, and breeding status where applicable.
- **BR-ANI-03:** Breed selection must support a searchable list for cats and dogs and an “Other” option with a recorded free-text breed.
- **BR-ANI-04:** A kennel must be able to keep limited profiles for external breeding partners without treating those animals as kennel-owned animals.
- **BR-ANI-05:** A litter must link to parent profiles rather than relying only on unstructured parent names. A litter may combine kennel-owned and external parent profiles.
- **BR-ANI-06:** Availability and final outcome must be tracked separately. For example, reserving an offspring for a buyer must not mark it as delivered; delivery, death, and other final outcomes must preserve the animal’s historical records and litter relationships.

## Litter Requirements

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

## Implementation Dependencies

- Birth records and weight/checklist/timeline changes must follow [offline and synchronization](offline-and-sync.md) behavior.
- Matching an offspring to a buyer and publishing litter entries must follow [buyer applications and sharing](buyer-applications-and-sharing.md) visibility rules.
- Animal health data and files must follow [health, media, and documents](health-media-and-documents.md) access rules.
- Entitlement checks on birth must follow [billing, notifications, and languages](billing-notifications-and-languages.md), including the explicit offline exception.

## Decisions to Resolve

The original requirements do not specify all lifecycle states, units, date/time rules, or the algorithm and defaults for due-date estimates, missing weigh-ins, and weight-change alerts. See [open questions and proposed requirements](open-questions-and-proposed-requirements.md); these details should be confirmed without turning product cues into veterinary advice.
