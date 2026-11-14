# Billing, Notifications, and Languages

Scope: kennel entitlements, birth-related payment gates, notifications/preferences, and interface language support.

## Billing Requirements

- **BR-BIL-01:** Each kennel receives one free litter entitlement. The entitlement is consumed when the first planned litter is recorded as born.
- **BR-BIL-02:** Further birth registrations require either an entitlement purchased for that litter or an active kennel subscription. The owner must be offered the available purchase options when payment is required.
- **BR-BIL-03:** Kennel access entitlements must be granted only after payment is confirmed. A completed checkout alone is not sufficient confirmation.
- **BR-BIL-04:** Paid litter entitlements and subscription access belong to the kennel and remain with it after an ownership transfer. The new owner is responsible for updating the payment method before a renewal when required.
- **BR-BIL-05:** Prices and currencies are commercial configuration, not values that should be fixed in product behaviour. The intended in-app checkout model must be verified against current Apple App Store and Google Play rules before release.

## Notifications and Language Requirements

- **BR-NOT-01:** Members may receive relevant notifications about checklist items, weight flags, buyer applications, published buyer updates, matches, and shared or generated documents.
- **BR-NOT-02:** Notification preferences must be manageable by member and, where relevant, by litter. Essential security and invitation notifications cannot be disabled. Notifications supplement the product and are not the sole place where important information is available.
- **BR-NOT-03:** The mobile product must support Swedish, Norwegian Bokmål, Danish, Finnish, and English. Each user can choose the interface language independently of kennel data, the user’s country, and a litter’s jurisdiction.

## Implementation Dependencies

- Payment confirmation and entitlement checks must be server-authoritative; offline birth handling is specified in [offline and synchronization](offline-and-sync.md).
- Entitlements are kennel-owned and must survive ownership transfer; see [access and governance](access-and-governance.md).
- Buyer notification suppression after withdrawal is required by `BR-BUY-04`.
- Notifications are supplementary; important workflow state must also be visible in the product.

## Decisions to Resolve

The requirements do not define subscription periods, renewal/cancellation, refunds, failed-payment grace periods, tax/receipt needs, notification delivery channels, or how weight flags and checklist reminders are configured. See [open questions and proposed requirements](open-questions-and-proposed-requirements.md). Store-policy compatibility and commercial configuration must be confirmed before release.
