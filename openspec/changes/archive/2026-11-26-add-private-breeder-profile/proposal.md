# Proposal

## Why

Breeders currently have no in-app place to manage their kennel identity or reach account actions other than signing out from the litter list. A private profile gives them a place to maintain an optional kennel name, while keeping the existing email-based sign-in and litter workflows intact. A personal display name is not needed by the product and should not be collected or stored.

## What Changes

- Add an optional, private breeder profile with an editable kennel name; show the authenticated email as read-only account information and do not collect a personal display name.
- Add a profile screen that is reachable from a profile/avatar control in the signed-in app header, and move sign-out to that screen.
- Use the existing Litterly logo in the main signed-in header while preserving back navigation and screen titles on nested routes.
- Keep profile details unavailable to other users and buyer-facing flows.

## Capabilities

### New Capabilities
- `breeder-profile`: Private profile details, profile access and editing, and sign-out from the profile screen.

### Modified Capabilities

## Impact

- Mobile app: authenticated navigation header, profile screen, profile form, sign-out placement, and Swedish translations.
- API and Supabase Postgres: authenticated profile read/update behavior and owner-only data access, using the verified user identity and existing RLS guarantees.
- Tests and documentation: profile API, data ownership, navigation, and account behavior.

## Assumptions and Open Questions

- Confirmed: kennel name is optional; email is shown but not edited in the profile; no personal display name is collected or stored; profile setup does not block app use; sign-out is available from the profile screen.
- Assumption: profile details are stored separately from Supabase Auth identity as private application data, rather than in user-editable Auth metadata.
- The exact empty-state wording and whether the avatar uses initials or a generic profile icon are left to implementation, with no additional profile fields in scope.
