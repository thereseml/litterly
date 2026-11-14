# Billing, Files, and Background Work

**Status: Proposed boundaries; vendors and detailed flows remain undecided.**

## Billing and Entitlement Boundary

The kennel entitlement ledger in Postgres is the product's canonical access state. App Store/Google Play transactions and billing-provider events are evidence used to update that ledger; the client never asserts that payment succeeded.

### Purchase Flow

1. The mobile app fetches available products and prices from the selected store/billing SDK.
2. The kennel owner starts a purchase through the platform-compliant purchase flow.
3. The billing provider validates the transaction and sends a server-to-server event, or the backend verifies the transaction with the store.
4. A server-side handler validates provider signatures, maps the transaction to the correct authenticated purchaser and kennel, and applies an idempotent ledger update.
5. The client reads the resulting entitlement state from the backend. A successful checkout screen without a confirmed backend entitlement remains pending.

### Product Mapping Decisions

The business model includes one free litter, subsequent per-litter purchases, and subscriptions. Before schema/product configuration, decide:

- Which product forms are sold on each platform and whether any regional alternate-billing program is used.
- How a store account transaction maps to a kennel when a member buys on behalf of the kennel.
- What “one litter entitlement” means in store product types, restoration, refund, and reuse behavior.
- Subscription cancellation, renewal failure, grace periods, refunds, chargebacks, tax/receipts, and entitlement expiration.
- How ownership transfer affects billing account control and any store-managed subscription association.

Evaluate RevenueCat to reduce platform-specific subscription integration work, but prove the per-litter/consumable model, account-to-kennel mapping, ownership transfer, refunds, and server notification handling before selecting it. RevenueCat is not the entitlement source of truth; the app backend must reconcile its events with the kennel ledger.

Apple and Google policies change and have region-specific programs. The current policy links are in the [architecture overview](README.md#references); obtain current platform/legal review before release.

## Files and Document Generation

- Store file objects in private buckets; store ownership, content type, size, checksum, and related entity metadata in Postgres.
- Use opaque object keys, strict upload validation, and short-lived authorized downloads. Do not make buckets public or treat unguessable URLs as authorization.
- Represent buyer sharing as explicit revocable grants scoped to a buyer and animal/document. Check the current grant before issuing a download URL.
- Use an authenticated upload intent or equivalent server-validated path so a client cannot write files into another kennel's namespace.
- Keep offline file selection separate from uploaded/available state; offline uploads remain out of MVP.
- Generate PDFs in a server-side worker/function after authorization. Record the source template version and a data snapshot/reference used; store the output privately.
- Never execute macros or arbitrary embedded code in user-supplied DOCX/PDF files. Apply file-size, type, malware-scanning, and processing-time limits based on the eventual service capabilities.
- Define what happens to generated documents if source data, a template, or a share grant is later changed or deleted. Revoking future access does not erase a copy already downloaded by a buyer.

Test representative DOCX placeholders and fillable PDFs before choosing the rendering service. Fidelity, fonts, form fields, localization, and malformed-file handling can be provider-specific.

## Notifications and Asynchronous Work

- Persist important workflow state in Postgres first; notifications are derived side effects, never the only record of an event.
- Use an outbox/queued-job pattern for notifications, document generation, and other retryable work so database commits do not depend on a push/email provider being available.
- Make jobs idempotent. A retried event must not send duplicate material notifications or generate conflicting document records.
- Check current recipient preferences and access eligibility at delivery time. Withdrawn buyers must not receive application-related notifications; a buyer who has lost access must not receive stale links to protected data.
- Keep security and invitation notification preferences consistent with `BR-NOT-02`; define channels, delivery retries, quiet hours, and retention before selecting vendors.
- Push notifications should contain minimal sensitive information; direct the user to an authenticated view to retrieve details.

## Operational Protections

- Retain provider event IDs and processing results for deduplication and support investigation, subject to agreed retention.
- Alert on repeated payment-verification, sync-upload, document-generation, and notification failures.
- Provide a user-visible pending/failure state and retry path for async operations.
- Keep provider credentials and signing secrets server-side and rotate them through managed secrets configuration.

Requirement traceability: `BR-BIL-*`, `BR-DOC-*`, `BR-NOT-*`, `BR-OFF-04`, `BR-BUY-07`.
