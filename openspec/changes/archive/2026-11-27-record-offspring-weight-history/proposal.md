# Proposal

## Why

Breeders need to record offspring growth over time, but individual pet records currently contain no weight measurements. A shared litter workflow should make it practical to record weights for any subset of offspring while preserving each animal's dated history.

## What Changes

- Add dated weight measurements, entered in grams, to individual offspring.
- Provide a litter-level bottom-sheet dialog that lists all offspring and adds measurements for only those with a supplied weight, using one shared date per submission. The sheet slides up and can be dismissed by swiping down on its handle.
- Show an offspring's complete weight history on its detail page, including multiple measurements on the same date.
- List offspring oldest-added first, preserving their submitted order when they were registered in the same batch.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pet-registration`: Add weight measurement recording, history viewing, and stable oldest-added-first ordering to offspring behavior.

## Impact

- Mobile litter detail and offspring detail flows, including a new bulk weight-entry modal.
- Fastify API endpoints and validation for creating and reading weight measurements.
- Supabase Postgres schema, grants, and owner-scoped RLS for weight records, plus a persisted offspring insertion ordinal.
- Swedish mobile translations, API/mobile tests, and README/API documentation.

## Scope Notes

- Confirmed: the modal shares one date across its entries; blank offspring rows are not changed; one offspring may have multiple measurements on the same date; values are entered in grams.
- Confirmed: offspring are ordered oldest-added first, and entries from the same registration batch retain their submitted order.
- Assumption: weight history is presented as a chronological list; charting is not required.
- Unresolved: correction or deletion of an incorrectly recorded measurement is not specified and should not be inferred as part of this change.
- Out of scope: changing litter counts, weight units other than grams, and buyer access to weight data.
