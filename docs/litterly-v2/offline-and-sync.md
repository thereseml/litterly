# Offline Work and Synchronization

Scope: offline availability for structured work, sync state, concurrent edits, uploads, and birth/payment behavior. This is a cross-cutting requirement area for animal and litter workflows.

## Requirements

- **BR-OFF-01:** Essential structured work must remain available without an internet connection, including birth records, weights, timeline entries, notes, and checklist changes.
- **BR-OFF-02:** Members must be able to distinguish changes that are waiting to sync, successfully synced, or need review. When connectivity returns, pending work must be submitted and its outcome made clear.
- **BR-OFF-03:** Independent changes to different fields should be retained together. When concurrent changes affect the same field, neither value may be silently discarded; an authorized member must be able to review and resolve the conflict.
- **BR-OFF-04:** Photo and document uploads require an internet connection in the MVP. The product must clearly distinguish a selected local file from a successfully uploaded file.
- **BR-OFF-05:** An offline birth record must not be lost because payment cannot be checked while offline. If payment is required, the record remains pending and is not treated as fully available to the kennel until the payment requirement is resolved after synchronization.

## Implementation Dependencies

- Identify the exact operations included in “essential structured work” and their local validation behavior before implementation.
- Each locally accepted change needs a visible lifecycle consistent with pending, synced, and review-needed states.
- An offline birth can be locally retained while its entitlement is unresolved; do not represent it as fully available until the server-side payment condition is satisfied.
- Upload state must not imply that a local file is backed up or shared. Sharing follows [health, media, and documents](health-media-and-documents.md).

## Decisions to Resolve

The requirements do not yet define device loss/reinstall behavior, offline access after membership or entitlement changes, conflict resolution UX for deletion versus edit, or whether users can continue working on stale data after access is revoked. See [open questions and proposed requirements](open-questions-and-proposed-requirements.md).
