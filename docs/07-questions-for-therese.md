# Questions For Therese

These questions were collected instead of interrupting the review. You can answer here in any order. Recommendations are working defaults, not decisions already made for you. Do not put passwords, API keys, or customer data in this file.

## Decisions Before Production Work

### Q-01: Is This A Replacement Or A Companion?

Should the current Catbreeder/Litterly website continue alongside the native apps, or eventually be replaced?

**Recommendation:** Keep web and mobile on one authoritative backend initially; retain the standalone web admin. Reassess the breeder website after mobile proves useful.

**Affects:** API compatibility, deployment ownership, migration, support, and ongoing cost.

**Your answer:**

### Q-02: What Existing Users And Data Must Carry Over?

Are there real breeders using the source app today? Must their accounts, historical weights, buyers, trial usage, and paid access work unchanged in the new app? Approximately how many accounts/litters need continuity? Aggregate estimates only, no personal data.

**Recommendation:** Preserve identifiers and legitimate access; do not ask existing users to recreate their animals. Treat uncertain history as a review queue, not something to guess.

**Affects:** Whether this is a fresh beta or a customer migration and which billing/data checks are mandatory.

**Your answer:**

### Q-03: Can We Extend The Existing Backend?

Do you own/control the current Express/MongoDB hosting and authorize backend improvements in the Catbreeder repository? Is there a reason you prefer a new backend such as Supabase instead?

**Recommendation:** Reuse and harden the existing API first. A backend replacement should be a deliberate project, not an accidental consequence of going mobile.

**Affects:** Cost, timeline, identity migration, transactions, billing, and who can fix the source security issues. No production change has been made during this review.

**Your answer:**

### Q-04: Which Breeders, Languages, And Countries Come First?

Should v1 support both cats and dogs, Swedish only, and Sweden only? Are professional/registered breeders the main audience, or also occasional/home breeders?

**Recommendation:** Cats and dogs in the domain, Swedish first, Sweden as the initial reviewed market. Keep translation infrastructure ready for English.

**Affects:** Copy, onboarding, legal/care guidance, pricing, app-store territories, and beta recruitment.

**Your answer:**

### Q-05: Which Three Jobs Matter Most To You?

Rank daily weighing, litter planning/birth, retained/acquired animals, buyer follow-up, care reminders, and handover. Is anything essential in your real workflow missing from the blueprint?

**Recommendation:** Optimize weighing first, then litter/birth and buyer/reservation continuity. Keep advanced reports subordinate to care.

**Affects:** Scope cuts and which journeys we test with breeders first.

**Your answer:**

### Q-06: How Should Uncertain Newborn Details Work?

May offspring be registered before sex is known, with an explicit unknown value? Do you regularly record individual birth times/dates, stillbirths, or identification by collar color? Is one daily weight enough or do you need several measurements per day?

**Recommendation:** Add explicit unknown sex through a deliberate schema/client update, optional collar label/color, and one authoritative daily weight with corrections. Keep detailed labor/stillbirth records and multiple daily observations out of v1 unless they are essential.

**Affects:** Schema compatibility, birth usability, chart model, uniqueness rules, and sensitive recordkeeping.

**Your answer:**

### Q-07: What Should Litterly Charge For?

Keep one free born litter plus paid litter passes and annual membership, or simplify native offers to annual membership? Are the source's 249 SEK/litter and 790 SEK/year intentional current prices? Should existing customers be grandfathered?

**Recommendation:** Preserve valid legacy purchases. Start with a simple annual native offer if per-litter store restoration/allocation adds disproportionate complexity. Validate willingness to pay before fixing prices.

**Affects:** Store products, checkout/restore, provider costs, tax/terms, and entitlement policy.

**Your answer:**

### Q-08: What Happens When Access Expires During An Active Litter?

Should previously recorded data remain readable/exportable? Can an already covered litter continue receiving care entries? Is a temporary birth/care logging allowance needed before purchase?

**Recommendation:** Never hide history or block export; keep an already paid litter covered without a second charge. Any grace period for new uncovered care needs an explicit commercial rule and clear end conditions.

**Affects:** Animal-care continuity, customer trust, trial allocation, and billing edge cases.

**Your answer:**

### Q-09: Who Can Review Care And Handover Guidance?

Do you have a veterinarian, breeder association, or other qualified reviewer for species milestones, delivery-age guidance, vaccinations, and handover checklists? Which association rules matter to your users?

**Recommendation:** Publish only reviewed, versioned guidance for the launch region. Do not treat old hardcoded schedules as current legal or veterinary assurance.

**Affects:** Launch readiness, reminder content, handover blocking rules, and product wording.

**Your answer:**

### Q-10: Who Owns The Store Accounts And Release Operations?

Do you already have Apple Developer, Google Play Console, Expo/EAS, domain/support email, and production monitoring accounts under the intended business? Who will answer breeder support and handle privacy/deletion requests?

**Recommendation:** Business-owned accounts and signing credentials with documented recovery, not accounts owned by an individual contractor. Review paid service costs before provisioning.

**Affects:** Signing, app identifiers, purchases, legal disclosures, review, incident response, and release timing.

**Your answer:**

## Product Preferences And Tradeoffs

### Q-11: How Important Is Full Offline Use?

Do breeders commonly weigh animals where there is no usable connection? Is protected draft entry plus save when back online acceptable for v1?

**Recommendation:** Online-first with protected drafts initially. Prioritize a real offline queue sooner only if poor connectivity is a frequent core-use problem.

**Affects:** Synchronization scope, conflict UX, device storage, testing, and launch date.

**Your answer:**

### Q-12: Which Brand Assets Should Be Authoritative?

Do you have the original vector logo/font rights and preferred app-icon artwork? Is the existing cat-focused mark right for a cat-and-dog product? Are there any colors/layout details you specifically do not want changed?

**Recommendation:** Preserve the mark, cream/brown palette, Inter, and quiet cards. Adapt contrast and icon framing for native accessibility rather than rebrand.

**Affects:** Asset production, dark mode, store screenshots, and final design approval.

**Your answer:**

### Q-13: What Is Essential At Handover?

Do you need a simple checklist, a downloadable summary, formal contracts, deposit tracking, inspection documents, or registry IDs in the first release? Should a buyer be allowed to reserve several animals?

**Recommendation:** Linked reservations and a reviewed checklist first; one reservation per animal, multiple per contact. Add a selective PDF and private attachments next, not legal signing/payment processing.

**Affects:** Reservation model, legal review, private document storage, and scope.

**Your answer:**

### Q-14: Should Buyers Receive Updates?

Is individual email enough initially, or is sharing selected photos/growth updates a high priority? Would buyers need accounts, or would revocable access links suffice later?

**Recommendation:** Keep breeder-only v1 with explicit individual email. Later add tightly scoped, revocable sharing without exposing internal notes or contact lists.

**Affects:** Consent, permissions, public surfaces, moderation/support, and privacy threat model.

**Your answer:**

### Q-15: Is Care Shared With Anyone?

Do partners, family, staff, or foster homes need access to the same records at launch? Do you manage more than one cattery/kennel?

**Recommendation:** One account/owner for v1 unless collaboration is essential. Add explicit invitations/roles later, never encourage password sharing.

**Affects:** Tenant model, actor attribution, notifications, team billing, and permissions.

**Your answer:**

### Q-16: What Is The Delivery Constraint?

Do you have a preferred launch window, budget/team size, and breeders willing to test on iPhone and Android? Is either platform more important for the first closed beta?

**Recommendation:** Release a real daily-care vertical slice to a small beta before committing to a public date. Test both native platforms early even if one beta group is larger.

**Affects:** Staffing, milestone sizing, scope tradeoffs, and credible estimates.

**Your answer:**

## Safe Defaults While Waiting

Prototype work can use the inherited theme, fictional cat/dog data, five-tab navigation, Swedish-first resources, one owner, grams, and the proposed online-first care flow. Keep payment offers, production migrations, sensitive data connections, legal/care claims, and paid-service provisioning uncommitted until the relevant answers are recorded.
