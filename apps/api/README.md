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
- `GET /litters/:litterId/pets`: bearer auth, `200 {"pets": Pet[]}`, ordered by creation time.
- `POST /litters/:litterId/pets`: bearer auth, strict `{ "pets": [...] }` with 1..30 pets; each pet requires a trimmed `name` (1..100) and `sex` (`male` or `female`), and accepts nullable `notes` (max 2000). The list is inserted in one database statement and returns `201 {"pets": Pet[]}`.
- `GET /litters/:litterId/pets/:petId`: bearer auth and UUIDs, `200 {"pet": Pet}`, or indistinguishable `404` for missing/unowned rows.
- `PATCH /litters/:litterId/pets/:petId`: bearer auth; strict, non-empty partial pet fields; returns `200 {"pet": Pet}`. Litter assignment cannot be changed.

`Litter` contains `id`, `owner_id`, `species`, `name`, `born_on`, `count`, `mother_name`, `father_name`, `notes`, `created_at`. Dates and timestamps are strings; nullable fields are always present on newly created rows. Database-generated `id` and `created_at` must have defaults.

`Pet` contains `id`, `litter_id`, `name`, required `sex`, nullable `notes`, `created_at`, and `updated_at`. The litter's count remains the reported litter size and is not enforced as a hard limit on registered pets.

All errors use `{"error":{"code":"..."}}`: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `404 NOT_FOUND`, `429 RATE_LIMITED`, `500 INTERNAL_ERROR`. Auth service outages use `503 INTERNAL_ERROR`, not 401. Supabase query failures are sanitized; upstream 401 remains 401. Rate limit: 100 requests/IP/minute per process, including health. Proxy headers are not trusted by default; distributed deployment needs a shared limiter and explicitly trusted proxy configuration.

## Database Integration

The hosted Supabase project must have `public.litters` and owner-only RLS. Apply `apps/api/sql/001_create_pets.sql` only to the Litterly project after confirming the litter table matches its assumptions. It creates `public.pets`, required-sex checks, parent-derived RLS, and restricted UPDATE column grants to prevent changing the litter relationship. The multi-row insert is a single Postgres statement, so it is atomic. Never apply this migration to the unrelated Supabase project attached to general-purpose tooling. The API adds owner filters as defense in depth and uses no privileged client.

`createApp({config, createRequestClient?, logger?, rateLimitMax?})` is separate from listening. Tests inject fake Supabase clients and use `Fastify.inject`, with no env file, network calls, or database. They validate the API contract and query construction, not actual database RLS enforcement; RLS is configured in the hosted project.
