# Design

## Context

See proposal.md for motivation and specs/pet-registration/spec.md for observable behavior. The mobile app currently loads litter and offspring data through the Fastify API. Pet rows contain no measurement history, and all data operations use the authenticated user's Supabase token with owner checks and RLS.

## Goals / Non-Goals

**Goals:** Keep weight measurements independently readable per offspring while supporting one litter-level entry session for a subset of offspring, and make offspring ordering reflect their actual addition order.

**Non-Goals:** Add measurement editing/deletion, graphs, other units, or buyer access.

## Decisions

- Store each measurement as a separate row in a new `pet_weight_measurements` table, linked to its offspring and carrying `weight_grams`, `measured_on`, and a creation timestamp. Do not put a mutable weight or serialized history on `pets`; separate rows preserve multiple same-day measurements and make chronological history queries natural. No uniqueness constraint should prevent repeated same-day measurements.
- Add a batch API operation scoped to a litter, accepting one shared date and entries containing an offspring ID and positive whole-number grams. Ignore blank rows in the mobile form before submission. Use one insert statement for submitted entries so the batch is atomic, consistent with existing pet batch registration. Add an owner-scoped read for an offspring's measurements, ordered by measurement date and then creation timestamp/ID for deterministic same-day display.
- Keep ownership enforced at both API and database layers. The API verifies the requested litter and offspring belong together under the authenticated user; table grants and RLS allow reads/inserts only through offspring in that user's litters. Do not introduce service-role access.
- Add the weight-entry modal to litter details and display the full dated list on the offspring detail page. Keep the modal's date shared across rows; default it to today's date as a convenience, while allowing the breeder to change it.
- Present weight entry as a bottom-anchored sheet with a visible drag handle. Use a handle-only downward gesture to dismiss, avoiding conflicts with the scrollable list and numeric text fields; keep an explicit close/cancel action for accessibility and discoverability.
- Enter and display whole grams. This avoids unit ambiguity and decimal input; supporting conversions is not necessary for this change.
- Add a generated identity ordinal to `pets` in a separate migration and order API results by `created_at` ascending, then the ordinal ascending. The timestamp preserves chronology across registration requests; the ordinal preserves input order among rows created by one batch, whose `now()` timestamps are equal. An ID tie-breaker is not suitable because UUIDs are unrelated to insertion order.

## Risks / Trade-offs

- [A batch may be rejected as a whole because one submitted entry is invalid] -> Validate every supplied entry in the client and API before inserting; preserve the all-or-nothing batch behavior.
- [RLS joins from measurements through offspring to litters can be misconfigured] -> Add focused API ownership tests and review the SQL policies against existing owner-scoped pet policies before applying the migration.
- [Same-day measurements have no breeder-supplied time] -> Retain creation timestamps and use them as a deterministic secondary display order; the spec promises date and weight, not a separate time field.
- [Adding the identity ordinal rewrites the existing pets table] -> Apply the ordering migration deliberately to the dedicated project and account for its table lock and rewrite during deployment.

## Migration Plan

Add a new SQL migration for the measurement table, constraints, grants, index, and owner-scoped RLS. It has been applied to the verified dedicated Litterly Supabase project; for any other deployment, review the target and apply it manually following the repository's hosted-database process. Deploy the API and mobile app after the schema is available. Rollback by reverting application/API changes and, if needed, dropping the new table in a separately reviewed database operation; do not alter or delete existing pet records.

Add a separate SQL migration for the pet insertion ordinal and its litter ordering index. It has been applied after the existing pet table migration to the verified dedicated project, with all existing pet rows populated. For any other deployment, apply it before deploying the API version that sorts by the new column. Roll back the API ordering first; dropping the ordinal is optional and requires separate review.

## Open Questions

- Correction or deletion of an incorrectly recorded measurement is unspecified; keep it outside this change rather than treating repeated submission as an edit.
