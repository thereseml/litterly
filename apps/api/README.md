# Litterly API

Node.js 22+ Fastify API workspace: `@litterly/api`. Configuration is documented in `.env.example`; dev/start load `apps/api/.env` with Node's native env-file support. No service-role or secret key is accepted. An empty `CORS_ORIGINS` allows no cross-origin browser access; native clients do not need CORS.

From the root, after the workspace dependencies are installed:

```sh
npm run dev --workspace @litterly/api
npm run typecheck --workspace @litterly/api
npm test --workspace @litterly/api
npm run build --workspace @litterly/api
npm start --workspace @litterly/api
```

## HTTP Contract

- `GET /health`: public, `200 {"status":"ok"}`.
- `GET /litters`: bearer auth, `200 {"litters": Litter[]}`, filtered by verified owner, ordered by `born_on` descending, at most 100 rows. No pagination in this milestone.
- `POST /litters`: bearer auth, `201 {"litter": Litter}`. Strict JSON object: `species` (`cat` or `dog`), trimmed `name` (1..100), `born_on` (valid `YYYY-MM-DD`, not after UTC today), integer `count` (1..30). Optional nullable `mother_name`/`father_name` (trimmed, max 100) and `notes` (trimmed, max 2000) default to null. Unknown fields, including `owner_id`, are rejected.
- `GET /litters/:id`: bearer auth and UUID, `200 {"litter": Litter}`, or indistinguishable `404` for missing/unowned rows.

`Litter` contains `id`, `owner_id`, `species`, `name`, `born_on`, `count`, `mother_name`, `father_name`, `notes`, `created_at`. Dates and timestamps are strings; nullable fields are always present on newly created rows. Database-generated `id` and `created_at` must have defaults.

All errors use `{"error":{"code":"..."}}`: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `404 NOT_FOUND`, `429 RATE_LIMITED`, `500 INTERNAL_ERROR`. Auth service outages use `503 INTERNAL_ERROR`, not 401. Supabase query failures are sanitized; upstream 401 remains 401. Rate limit: 100 requests/IP/minute per process, including health. Proxy headers are not trusted by default; distributed deployment needs a shared limiter and explicitly trusted proxy configuration.

## Database Integration

The hosted Supabase project must have the `public.litters` table with the columns listed above, owner UUID referencing the authenticated user's ID, and RLS enabled. Grant `authenticated` SELECT/INSERT explicitly (new Supabase tables are not automatically exposed to the Data API). SELECT policy must restrict `owner_id = (select auth.uid())`; INSERT policy must use the same predicate in `WITH CHECK`. The API adds owner filters as defense in depth, but does not replace RLS. No privileged client is used: each request gets its own client with the caller's bearer token, verified through `auth.getUser(token)`.

`createApp({config, createRequestClient?, logger?, rateLimitMax?})` is separate from listening. Tests inject fake Supabase clients and use `Fastify.inject`, with no env file, network calls, or database. They validate the API contract and query construction, not actual database RLS enforcement; RLS is configured in the hosted project.
