# Tasks

## 1. Profile Data and API

- [x] 1.1 Update the repository SQL setup script to store only the nullable kennel name, retain minimal grants and owner-only RLS, and grant no service-role access.
- [x] 1.2 Add authenticated API profile read and update operations for the optional kennel name only; reject personal display-name input and add tests for authentication, strict input validation, owner scoping, persistence behavior, and sanitized errors, then verify with `npm test --workspace @litterly/api`.
- [x] 1.3 Update the API and root READMEs to document the kennel-name-only profile contract and correct hosted-project schema setup.
- [x] 1.4 Add a forward SQL migration that drops `display_name` and its existing values from `public.breeder_profiles`; verify the migration is safe when no such column exists.
- [x] 1.5 Apply the migration to the dedicated Litterly Supabase project, verify kennel-name reads and updates for the owner and denial for a second account, and confirm the unrelated Supabase project is untouched.

## 2. Mobile Profile and Navigation

- [x] 2.1 Add a translated profile screen that reads and saves only the optional kennel name, displays the authenticated email read-only, and shows loading, empty, save-error, and success states; verify field behavior with mobile tests and `npm run typecheck --workspace @litterly/mobile`.
- [x] 2.2 Add an accessible profile action to the signed-in header, use the existing Litterly logo on the litter list, preserve nested route titles/back navigation, and move sign-out from the litter list to the profile screen; verify route transitions and sign-out with mobile navigation tests.
- [x] 2.3 Update the root README's first-flow and navigation guidance for profile access and sign-out; verify it describes only implemented behavior.

## 3. Integration Verification

- [x] 3.1 Run `npm run typecheck`, `npm run lint`, and `npm test`; resolve any regressions across API and mobile work.
- [x] 3.2 Manually verify the signed-in header and profile flow on web and at least one native platform, including access from a nested screen, empty and saved profile states, and return to sign-in after logout.
