# Hosted Supabase

This repository uses the hosted Litterly project only. It does not use a local
Supabase stack. The linked project ref is `blnxhqyweeutxqmggoph`; the litter
migration has already been applied there.

Keep the CLI linked to Litterly before managing migrations. Check the target and
review changes before pushing:

```sh
npx supabase projects list
npx supabase migration list --linked
npx supabase db push --linked --dry-run
npx supabase db push --linked
```

The mobile app and API use the project's URL and publishable key from ignored
`.env` files. Do not use a service-role or secret key in either runtime.
Authenticated litter access is enforced by row-level security; the API forwards
the user's access token to Postgres.

The migration creates `public.litters`, constraints, an owner/date index, and
owner-only SELECT and INSERT policies. Authenticated UPDATE/DELETE and all anon
table privileges are intentionally absent.

For email-code login, both the **Magic Link** and **Confirm signup** templates in
the hosted Auth dashboard must include `{{ .Token }}`. Use
`templates/magic_link.html` and `templates/confirmation.html` as their source.
Set the hosted OTP length to eight digits and configure SMTP for reliable email
delivery.
