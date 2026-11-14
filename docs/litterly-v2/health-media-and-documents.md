# Health, Media, and Documents

Scope: structured animal health information, private photos/documents, buyer sharing, kennel-supplied templates, and generated PDFs.

## Requirements

- **BR-DOC-01:** Kennels must be able to keep structured health records for all their own animals, including retired and historical animals.
- **BR-DOC-02:** Photos and documents are private to the kennel by default. Sharing must be a deliberate action, and buyer access must be limited to the intended recipient and authorized kennel members.
- **BR-DOC-03:** Kennels must be able to use their own supported contract templates: DOCX templates with placeholders and fillable PDF templates.
- **BR-DOC-04:** Before a template is used, its fields must be identifiable and the kennel owner must be able to review or adjust field mappings. A template with unresolved required fields cannot be activated.
- **BR-DOC-05:** A member must be able to generate a private PDF for a relevant kennel, buyer, litter, animal, and delivery using an active kennel template. The generated document must preserve which template version and data were used. Electronic signature is outside the MVP.
- **BR-DOC-06:** Litterly does not supply its own legal or veterinary contract language, care advice, or country-specific compliance checklists in the MVP. Kennels are responsible for their own content.

## Implementation Dependencies

- File privacy and sharing must be consistent with [access and governance](access-and-governance.md) and [buyer applications and sharing](buyer-applications-and-sharing.md).
- Uploading media/documents requires a connection in the MVP; see [offline and synchronization](offline-and-sync.md).
- Generated documents must be private by default and preserve template/data provenance as required by `BR-DOC-05`.
- Supported formats and file-size limits remain open pending representative template testing.

## Decisions to Resolve

The requirements do not define versioning/revocation behavior for already-shared files, supported health-record fields, file deletion/retention, template limits, or PDF rendering fidelity guarantees. See [open questions and proposed requirements](open-questions-and-proposed-requirements.md).
