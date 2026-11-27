# Tasks

## 1. Weight Measurement Data and API

- [x] 1.1 Add a SQL migration for dated whole-gram measurements, with validation constraints, indexes, authenticated grants, and owner-scoped RLS; review the SQL against existing pet policies, apply only to the verified dedicated project, and verify owner-only access.
- [x] 1.2 Add authenticated API batch-create and per-offspring history reads, validating positive whole-number grams and real dates, checking litter/offspring ownership, and preserving same-day duplicates; verify with API tests for partial-entry batches, invalid input atomicity, ordering, and inaccessible resources.
- [x] 1.3 Extend API test fakes and API documentation for the new measurement operations; verify the documented request/response shapes match passing route tests and `npm run build -w @litterly/api` succeeds.
- [x] 1.4 Add a migration for a generated pet insertion ordinal and sort litter offspring oldest-first by creation time then ordinal; verify existing rows receive ordinals and a test covers chronological batches and submitted order within a batch.

## 2. Mobile Weight Entry and History

- [x] 2.1 Add the litter-detail bottom-sheet weight dialog with a shared editable date, one optional grams field per offspring, swipe-down dismissal on the handle, and submission of only populated rows; verify form tests cover blank rows, positive whole grams, date handling, submit errors, and dismissing without saving.
- [x] 2.2 Add dated weight history and an empty state to each offspring detail page, displaying multiple same-day measurements in chronological order; verify mobile tests cover populated and empty histories.
- [x] 2.3 Add Swedish translations and API client types for weight entry/history; verify `npm run typecheck` and `npm run lint` pass.
- [x] 2.4 Manually verify bottom-sheet presentation, handle swipe dismissal, keyboard, scrolling, date selection, partial submission, and detail-page history on web and at least one iOS or Android device/simulator.

## 3. Documentation and Integration

- [x] 3.1 Update the README API table, measurement and offspring-ordering semantics, and hosted SQL migration instructions; verify the documented endpoint behavior matches the API tests and both migrations are clearly identified for manual application to the dedicated project only.
- [x] 3.2 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build -w @litterly/api`, `npx expo-doctor`, and `npx expo export --platform all`; verify all commands pass before release review.
