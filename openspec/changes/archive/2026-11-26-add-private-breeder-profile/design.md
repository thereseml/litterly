# Design

## Context

The mobile app uses Supabase Auth for email-code sessions and sends protected domain requests to a Fastify API. The API verifies each access token, derives the user ID from the verified identity, and queries Supabase with that user's token. Public database schema and RLS are managed in the hosted Supabase project; repository SQL documents schema changes. See `proposal.md` and `specs/breeder-profile/spec.md` for motivation and required behavior.

## Goals / Non-Goals

**Goals:**
- Persist optional private breeder details across sessions with the same owner-scoped security model as existing data.
- Keep the email account identity in Supabase Auth and display it read-only in the profile.
- Make profile access persistent across signed-in navigation without removing nested-route back behavior.

**Non-Goals:**
- Public breeder pages, buyer access, account email changes, profile photos, or additional contact/business fields.
- Requiring profile completion at signup or before litter management.

## Decisions

### Store profile details separately from Auth metadata

Add a profile row keyed to the Supabase Auth user ID, with a nullable kennel-name field. The row is created on the first profile save; a missing row is returned to the app as an empty profile. The email is read from the authenticated session and is not duplicated in the profile table. Do not collect or store a personal display name. A migration removes the existing `display_name` column and its values from the hosted table.

This keeps editable app data separate from authentication identity and avoids relying on user-editable Auth metadata for profile persistence. Auth metadata was considered because it avoids a profile table, but it mixes account identity and application data and is not the right boundary for private database-backed profile behavior.

### Use the existing authenticated API and RLS

Add a profile read operation and a profile update operation to the Fastify API. The API derives the profile owner from its verified bearer token, uses strict request validation for `kennel_name` only, and never accepts a user ID from the client. Supabase queries continue to use the request user's token. The profile table has RLS policies for owner-only SELECT and INSERT/UPDATE; UPDATE policies include both `USING` and `WITH CHECK`. No service-role access is introduced.

Using the API is consistent with existing protected litter and pet operations. Direct client access to a new table was considered, but would create a second data-access pattern for private breeder records.

### Add profile access to the signed-in stack header

Provide a profile action in the header across signed-in routes. The litter-list route uses the existing Litterly logo as its left-aligned brand mark; nested routes retain their back affordance and route title while keeping profile access in the header. The profile screen shows the Auth email read-only, edits the optional kennel name, and owns the sign-out action. The avatar appearance can use an accessible generic profile icon; initials are not required.

This preserves existing stack navigation while making account access available throughout the signed-in app. The existing logo asset at `apps/mobile/assets/litterly-logo.png` is used rather than adding a new image asset.

## Risks / Trade-offs

- [Hosted schema and RLS are not applied from local migrations today] -> Keep a reviewed bootstrap SQL script, add a forward SQL migration that removes `display_name` from the already-deployed table, and apply both only to the dedicated Litterly Supabase project; verify policies with authenticated-user tests or a controlled project check.
- [Profile row may not exist for newly signed-in users] -> Treat absence as an empty profile and create/upsert the row on first save; do not make profile completion part of authentication.
- [RLS may silently hide updates if SELECT or ownership checks are incomplete] -> Add explicit owner-only SELECT and INSERT/UPDATE policies, constrain grants, and test both owner and non-owner access.

## Migration Plan

1. Add the profile table, constraints, grants, and owner-only RLS in a repository bootstrap SQL script. Add a separate forward migration that drops the existing personal display-name column and values; apply it only to the dedicated hosted project.
2. Deploy the API profile operations, then release the mobile UI that uses them.
3. Users without a profile row see an empty optional kennel-name field until their first save. Existing personal display names are intentionally deleted by the migration.
4. Rollback can remove the mobile profile entry points and API routes. Do not recreate or retain personal display-name data.
