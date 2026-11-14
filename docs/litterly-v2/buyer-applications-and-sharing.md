# Buyer Applications and Sharing

Scope: private application intake, form configuration, consent, multiple applications, buyer matching, buyer-visible information, and application retention.

## Business Concept

- **Buyer:** Submits one or more applications and can access only information explicitly made available to them.

## Requirements

- **BR-BUY-01:** A kennel must be able to share an unlisted application link or QR code and invite a buyer directly, without creating a public kennel or animal marketplace.
- **BR-BUY-02:** Each kennel must be able to tailor its application form using short or long text, yes/no, single-choice, and multiple-choice questions, with required-answer settings and helpful descriptions.
- **BR-BUY-03:** Applicants must accept the applicable Litterly privacy policy and the kennel’s privacy notice before submitting. The accepted versions and time of consent must be retained with the application.
- **BR-BUY-04:** A buyer may maintain multiple active applications for different litters or animals. Buyers must be able to update their answers or withdraw their own applications; withdrawn applications are no longer eligible for matching and must not trigger further application-related notifications.
- **BR-BUY-05:** Owners and editors must be able to match a buyer to an offspring without exposing other buyers’ personal information or assigning the same animal to multiple active matches.
- **BR-BUY-06:** Buyers may see only their own applications, updates explicitly published to an eligible litter, and information about their matched animal. There is no buyer-to-kennel direct messaging in the MVP.
- **BR-BUY-07:** After delivery, a buyer’s access to litter updates ends. The buyer may continue to access only documents explicitly shared for their own animal.
- **BR-BUY-08:** Unmatched applications must be deleted 12 months after their last activity, in accordance with the documented retention policy.

## Implementation Dependencies

- Application, match, litter publication, and document visibility must be enforced as access rules, not just hidden in the UI.
- Matching and animal availability/final outcomes must remain distinct; see [animal and litter operations](animal-and-litter-operations.md).
- Buyer-visible documents follow [health, media, and documents](health-media-and-documents.md).
- Consent records must retain the relevant policy and notice versions, not only a boolean state.

## Decisions to Resolve

The requirements do not define link expiration/revocation, spam or abuse controls, applicant identity/account requirements, whether a form can change after an application is submitted, or how long matched/withdrawn applications are retained. See [open questions and proposed requirements](open-questions-and-proposed-requirements.md).
