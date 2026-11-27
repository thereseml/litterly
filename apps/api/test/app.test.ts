import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createApp, type Litter, type Pet } from '../src/app.js';
import { loadConfig } from '../src/config.js';

const owner = '11111111-1111-4111-8111-111111111111';
const otherOwner = '22222222-2222-4222-8222-222222222222';
const id = '33333333-3333-4333-8333-333333333333';
const headers = { authorization: 'Bearer test-token' };
const input = { species: 'cat', name: 'Spring litter', born_on: '2024-02-29', count: 4 };
const row: Litter = {
  ...input, species: 'cat', id, owner_id: owner, created_at: '2024-03-01T00:00:00Z',
  mother_name: null, father_name: null, notes: null,
};
const petId = '44444444-4444-4444-8444-444444444444';
const petRow: Pet = { id: petId, litter_id: id, name: 'Kattunge 1', sex: 'female', notes: null, created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' };
const config = loadConfig({
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_key',
  CORS_ORIGINS: 'https://app.example.com',
});

type FakeOptions = {
  rows?: Litter[];
  petRows?: Pet[];
  weightRows?: { id: string; pet_id: string; weight_grams: number; measured_on: string; created_at: string }[];
  profileRows?: { user_id: string; kennel_name: string | null }[];
  authStatus?: number;
  authThrows?: boolean;
  userId?: string | null;
  dbError?: boolean;
  dbStatus?: number;
  dbThrows?: boolean;
  rateLimitMax?: number;
};

async function fixture(t: TestContext, options: FakeOptions = {}) {
  const calls: { method: string; args: unknown[] }[] = [];
  const tokens: string[] = [];
  const inserted: Record<string, unknown>[] = [];
  const petInserted: Record<string, unknown>[][] = [];
  const weightInserted: Record<string, unknown>[][] = [];
  const profileUpserts: Record<string, unknown>[] = [];
  let profileExists = options.profileRows ? options.profileRows.length > 0 : true;
  let profileData = options.profileRows?.[0] ?? { user_id: owner, kennel_name: 'North Star' };
  let clientCount = 0;
  const app = await createApp({
    config,
    rateLimitMax: options.rateLimitMax,
    createRequestClient(token) {
      tokens.push(token);
      clientCount++;
      return {
        auth: {
          async getUser(jwt: string) {
            assert.equal(jwt, token);
            if (options.authThrows) throw new Error('secret auth details');
            return {
              data: { user: options.userId === null ? null : { id: options.userId ?? owner } },
              error: options.authStatus ? { status: options.authStatus, message: 'secret auth details' } : null,
            };
          },
        },
        from(table: string) {
          assert.ok(table === 'litters' || table === 'pets' || table === 'pet_weight_measurements' || table === 'breeder_profiles');
          const filters: [string, unknown][] = [];
          const included: [string, unknown[]][] = [];
          const orderings: [string, boolean][] = [];
          let single = false;
          let values: Record<string, unknown> | Record<string, unknown>[] | undefined;
          let action: 'insert' | 'update' | 'upsert' | undefined;
          const query = {
            select(...args: unknown[]) { calls.push({ method: 'select', args }); return query; },
            eq(key: string, value: unknown) { filters.push([key, value]); calls.push({ method: 'eq', args: [key, value] }); return query; },
            in(key: string, values: unknown[]) { included.push([key, values]); calls.push({ method: 'in', args: [key, values] }); return query; },
            order(...args: unknown[]) {
              calls.push({ method: 'order', args });
              orderings.push([args[0] as string, (args[1] as { ascending?: boolean } | undefined)?.ascending ?? true]);
              return query;
            },
            limit(...args: unknown[]) { calls.push({ method: 'limit', args }); return query; },
            insert(value: Record<string, unknown> | Record<string, unknown>[]) {
              values = value; action = 'insert';
              const list = Array.isArray(value) ? value : [value];
              if (table === 'litters') inserted.push(...list);
              else if (table === 'pets') petInserted.push(list);
              else if (table === 'pet_weight_measurements') weightInserted.push(list);
              return query;
            },
            update(value: Record<string, unknown>) { values = value; action = 'update'; return query; },
            upsert(value: Record<string, unknown>) { values = value; action = 'upsert'; profileUpserts.push(value); return query; },
            single() { single = true; return query; },
            maybeSingle() { single = true; return query; },
            then(resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) {
              if (options.dbThrows) return Promise.reject(new Error('secret database details')).then(resolve, reject);
              const source: Record<string, unknown>[] = table === 'litters' ? (options.rows ?? [row])
                : table === 'pets' ? (options.petRows ?? [petRow])
                : table === 'pet_weight_measurements' ? (options.weightRows ?? [])
                : (profileExists ? [profileData] : []);
              const rows = source.filter((item) => filters.every(([key, value]) => item[key as keyof typeof item] === value))
                .filter((item) => included.every(([key, values]) => values.includes(item[key as keyof typeof item])))
                .sort((a, b) => {
                  for (const [key, ascending] of orderings) {
                    const left = a[key]; const right = b[key];
                    if (left === right) continue;
                    const result = left === undefined ? -1 : right === undefined ? 1
                      : typeof left === 'number' && typeof right === 'number' ? left - right
                      : String(left).localeCompare(String(right));
                    return ascending ? result : -result;
                  }
                  return 0;
                });
              if (table === 'breeder_profiles' && action === 'upsert') {
                profileData = { ...(profileExists ? profileData : { user_id: owner, kennel_name: null }), ...(values as Record<string, unknown>) };
                profileExists = true;
              }
              const resultRows = action === 'insert'
                ? table === 'litters' && !Array.isArray(values) ? [{ ...row, ...values }]
                  : (Array.isArray(values) ? values : []).map((value, index) => table === 'pet_weight_measurements'
                    ? { ...value, id: `weight-${index}`, created_at: '2024-03-02T00:00:00Z' }
                    : { ...petRow, ...value, id: `created-${index}` })
                : action === 'update' ? rows.map((item) => ({ ...item, ...(values as Record<string, unknown>) }))
                : action === 'upsert' ? [profileData]
                : rows;
              const projectedRows = table === 'breeder_profiles'
                ? resultRows.map((item) => {
                  const profile = item as Record<string, unknown>;
                  return { kennel_name: profile.kennel_name };
                }) : resultRows;
              return Promise.resolve({
                data: options.dbError ? null : single ? projectedRows[0] ?? null : projectedRows,
                error: options.dbError ? { message: 'secret database details', code: 'XX000' } : null,
                status: options.dbStatus ?? (options.dbError ? 500 : 200),
              }).then(resolve, reject);
            },
          };
          return query;
        },
      } as unknown as SupabaseClient;
    },
  });
  t.after(() => app.close());
  return { app, calls, tokens, inserted, petInserted, weightInserted, profileUpserts, clientCount: () => clientCount };
}

test('health is public and does not construct an authenticated client', async (t) => {
  const { app, clientCount } = await fixture(t);
  const response = await app.inject('/health');
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: 'ok' });
  assert.equal(clientCount(), 0);
});

test('all litter endpoints require a bearer token', async (t) => {
  const { app, clientCount } = await fixture(t);
  for (const [method, url] of [['GET', '/litters'], ['POST', '/litters'], ['GET', `/litters/${id}`]] as const) {
    for (const authorization of ['', 'Basic test-token', 'Bearer ', 'Bearer two tokens']) {
      const response = await app.inject({ method, url, headers: { authorization } });
      assert.equal(response.statusCode, 401);
      assert.deepEqual(response.json(), { error: { code: 'UNAUTHORIZED' } });
    }
  }
  assert.equal(clientCount(), 0);
});

test('all pet endpoints require a bearer token', async (t) => {
  const { app } = await fixture(t);
  const routes = [
    ['GET', `/litters/${id}/pets`], ['POST', `/litters/${id}/pets`],
    ['GET', `/litters/${id}/pets/${petId}`], ['PATCH', `/litters/${id}/pets/${petId}`],
    ['POST', `/litters/${id}/weight-measurements`],
    ['GET', `/litters/${id}/pets/${petId}/weight-measurements`],
  ] as const;
  for (const [method, url] of routes) {
    const response = await app.inject({ method, url, payload: method === 'POST' || method === 'PATCH' ? { pets: [{ name: 'A', sex: 'female' }] } : undefined });
    assert.equal(response.statusCode, 401);
  }
});

test('invalid credentials differ from auth outages and never expose details', async (t) => {
  for (const [authStatus, expected] of [[400, 401], [401, 401], [403, 401], [500, 503], [429, 503], [0, 503]]) {
    const { app } = await fixture(t, { authStatus, authThrows: authStatus === 0 });
    const response = await app.inject({ url: '/litters', headers });
    assert.equal(response.statusCode, expected);
    assert.deepEqual(response.json(), { error: { code: expected === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR' } });
  }
});

test('missing or malformed verified user identity is rejected', async (t) => {
  for (const userId of [null, '', 'not-a-uuid']) {
    const { app } = await fixture(t, { userId });
    const response = await app.inject({ url: '/litters', headers });
    assert.equal(response.statusCode, 401);
  }
});

test('profile reads require auth, filter by verified owner, and return an empty kennel name when absent', async (t) => {
  const { app, calls } = await fixture(t);
  const response = await app.inject({ url: '/profile', headers });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { profile: { kennel_name: 'North Star' } });
  assert.ok(calls.some((call) => call.method === 'eq' && call.args[0] === 'user_id' && call.args[1] === owner));

  const { app: emptyApp } = await fixture(t, { profileRows: [] });
  assert.deepEqual((await emptyApp.inject({ url: '/profile', headers })).json(), {
    profile: { kennel_name: null },
  });
  const { app: otherOwnerApp } = await fixture(t, { profileRows: [{ user_id: otherOwner, kennel_name: 'Other' }] });
  assert.deepEqual((await otherOwnerApp.inject({ url: '/profile', headers })).json(), {
    profile: { kennel_name: null },
  });
  assert.equal((await app.inject({ url: '/profile' })).statusCode, 401);
});

test('profile updates trim kennel name, normalize blanks, and reject personal names and unsupported fields', async (t) => {
  const { app, profileUpserts } = await fixture(t);
  const response = await app.inject({ method: 'PATCH', url: '/profile', headers, payload: { kennel_name: '  North Star  ' } });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { profile: { kennel_name: 'North Star' } });
  assert.deepEqual(profileUpserts, [{ kennel_name: 'North Star' }]);
  assert.deepEqual((await app.inject({ url: '/profile', headers })).json(), { profile: { kennel_name: 'North Star' } });

  for (const payload of [{}, { user_id: otherOwner, kennel_name: 'Other' }, { email: 'other@example.com' }, { display_name: 'Anna' }, { kennel_name: 'x'.repeat(101) }]) {
    const invalid = await app.inject({ method: 'PATCH', url: '/profile', headers, payload });
    assert.equal(invalid.statusCode, 400);
    assert.deepEqual(invalid.json(), { error: { code: 'VALIDATION_ERROR' } });
  }
  assert.equal((await app.inject({ method: 'PATCH', url: '/profile', payload: { kennel_name: 'North Star' } })).statusCode, 401);
  assert.equal(profileUpserts.length, 1);
});

test('creation assigns verified ownership, trims names, and defaults optional fields to null', async (t) => {
  const { app, tokens, inserted } = await fixture(t);
  const response = await app.inject({ method: 'POST', url: '/litters', headers, payload: { ...input, name: '  Spring litter  ' } });
  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.json(), { litter: row });
  assert.deepEqual(inserted, [{ ...input, owner_id: owner, mother_name: null, father_name: null, notes: null }]);
  assert.deepEqual(tokens, ['test-token']);
});

test('creation accepts dog species, nullable parents, and optional notes', async (t) => {
  const { app, inserted } = await fixture(t);
  const payload = { ...input, species: 'dog', count: 30, mother_name: '  Luna  ', father_name: null, notes: 'Healthy' };
  const response = await app.inject({ method: 'POST', url: '/litters', headers, payload });
  assert.equal(response.statusCode, 201);
  assert.equal(inserted[0].mother_name, 'Luna');
  assert.equal(response.json().litter.species, 'dog');
});

test('strict validation rejects ownership, unknown keys, bad types, bounds, and calendar dates', async (t) => {
  const { app, inserted } = await fixture(t);
  const invalid = [
    { owner_id: otherOwner }, { unexpected: true }, { id }, { species: 'bird' },
    { name: '   ' }, { name: 'x'.repeat(101) }, { name: null },
    { count: 0 }, { count: 31 }, { count: 1.5 }, { count: '4' },
    { born_on: '2023-02-29' }, { born_on: '1900-02-29' }, { born_on: '2024-04-31' },
    { born_on: '2024-2-09' }, { born_on: '2024-00-10' }, { born_on: '0000-01-01' },
    { born_on: '9999-12-31' }, { born_on: '2024-02-29T00:00:00Z' },
    { mother_name: 'x'.repeat(101) }, { father_name: 5 }, { notes: 'x'.repeat(2001) },
  ];
  for (const patch of invalid) {
    const response = await app.inject({ method: 'POST', url: '/litters', headers, payload: { ...input, ...patch } });
    assert.equal(response.statusCode, 400, JSON.stringify(patch));
    assert.deepEqual(response.json(), { error: { code: 'VALIDATION_ERROR' } });
  }
  for (const payload of [null, [], {}, { ...input, name: undefined }]) {
    const response = await app.inject({ method: 'POST', url: '/litters', payload: JSON.stringify(payload), headers: { ...headers, 'content-type': 'application/json' } });
    assert.equal(response.statusCode, 400);
  }
  assert.equal(inserted.length, 0);
});

test('valid century leap day and UTC today are accepted', async (t) => {
  const { app } = await fixture(t);
  for (const born_on of ['2000-02-29', new Date().toISOString().slice(0, 10)]) {
    const response = await app.inject({ method: 'POST', url: '/litters', headers, payload: { ...input, born_on } });
    assert.equal(response.statusCode, 201);
  }
});

test('list is owner-filtered, ordered newest first, and limited to 100', async (t) => {
  const { app, calls } = await fixture(t, { rows: [row, { ...row, owner_id: otherOwner }] });
  const response = await app.inject({ url: '/litters', headers });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { litters: [row] });
  assert.ok(calls.some((call) => call.method === 'eq' && call.args[0] === 'owner_id' && call.args[1] === owner));
  assert.ok(calls.some((call) => call.method === 'order' && call.args[0] === 'born_on' && (call.args[1] as { ascending: boolean }).ascending === false));
  assert.ok(calls.some((call) => call.method === 'limit' && call.args[0] === 100));
});

test('empty list is successful', async (t) => {
  const { app } = await fixture(t, { rows: [] });
  assert.deepEqual((await app.inject({ url: '/litters', headers })).json(), { litters: [] });
});

test('detail returns owned row, hides other owners, and validates UUID', async (t) => {
  const { app } = await fixture(t);
  assert.deepEqual((await app.inject({ url: `/litters/${id}`, headers })).json(), { litter: row });
  const invalid = await app.inject({ url: '/litters/not-a-uuid', headers });
  assert.equal(invalid.statusCode, 400);
  assert.deepEqual(invalid.json(), { error: { code: 'VALIDATION_ERROR' } });
  for (const rows of [[], [{ ...row, owner_id: otherOwner }]]) {
    const { app: isolated } = await fixture(t, { rows });
    const response = await isolated.inject({ url: `/litters/${id}`, headers });
    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), { error: { code: 'NOT_FOUND' } });
  }
});

test('pet batch creation validates every required sex and inserts a trimmed batch in one statement', async (t) => {
  const { app, petInserted } = await fixture(t);
  const response = await app.inject({ method: 'POST', url: `/litters/${id}/pets`, headers, payload: { pets: [
    { name: '  Kitten 1  ', sex: 'female' }, { name: 'Kitten 2', sex: 'male', notes: '  Marked  ' },
  ] } });
  assert.equal(response.statusCode, 201);
  assert.equal(petInserted.length, 1);
  assert.deepEqual(petInserted[0], [
    { name: 'Kitten 1', sex: 'female', notes: null, litter_id: id },
    { name: 'Kitten 2', sex: 'male', notes: 'Marked', litter_id: id },
  ]);
  assert.equal(response.json().pets.length, 2);
});

test('pet batch rejects invalid, empty, oversized and client-owned fields before insertion', async (t) => {
  const { app, petInserted } = await fixture(t);
  const badBatches = [
    [], [{ name: 'Unnamed' }], [{ name: 'Unknown sex', sex: 'unknown' }],
    [{ name: ' ', sex: 'male' }], [{ name: 'Named', sex: 'female', litter_id: otherOwner }],
    Array.from({ length: 31 }, (_, index) => ({ name: `Pet ${index}`, sex: 'male' })),
  ];
  for (const pets of badBatches) {
    const response = await app.inject({ method: 'POST', url: `/litters/${id}/pets`, headers, payload: { pets } });
    assert.equal(response.statusCode, 400);
  }
  assert.equal(petInserted.length, 0);
});

test('weight batch creates only supplied entries and preserves same-day duplicates atomically', async (t) => {
  const { app, weightInserted, calls } = await fixture(t);
  const response = await app.inject({
    method: 'POST', url: `/litters/${id}/weight-measurements`, headers,
    payload: { measured_on: '2024-03-02', measurements: [
      { pet_id: petId, weight_grams: 125 }, { pet_id: petId, weight_grams: 127 },
    ] },
  });
  assert.equal(response.statusCode, 201);
  assert.deepEqual(weightInserted, [[
    { pet_id: petId, weight_grams: 125, measured_on: '2024-03-02' },
    { pet_id: petId, weight_grams: 127, measured_on: '2024-03-02' },
  ]]);
  assert.equal(response.json().measurements.length, 2);
  assert.ok(calls.some((call) => call.method === 'in' && call.args[0] === 'id' && (call.args[1] as string[]).includes(petId)));
});

test('weight batch rejects invalid dates, weights, IDs, and unsupported fields before insertion', async (t) => {
  const { app, weightInserted } = await fixture(t);
  const valid = { measured_on: '2024-03-02', measurements: [{ pet_id: petId, weight_grams: 125 }] };
  const invalid = [
    { ...valid, measured_on: '2024-02-30' }, { ...valid, measured_on: '0000-01-01' },
    { ...valid, measured_on: '9999-12-31' }, { ...valid, measurements: [] },
    { ...valid, measurements: [{ pet_id: petId, weight_grams: 0 }] },
    { ...valid, measurements: [{ pet_id: petId, weight_grams: -1 }] },
    { ...valid, measurements: [{ pet_id: petId, weight_grams: 1.5 }] },
    { ...valid, measurements: [{ pet_id: petId, weight_grams: 2147483648 }] },
    { ...valid, measurements: [{ pet_id: 'not-a-uuid', weight_grams: 100 }] },
    { ...valid, measurements: [{ pet_id: petId, weight_grams: 100, litter_id: id }] },
  ];
  for (const payload of invalid) {
    const response = await app.inject({ method: 'POST', url: `/litters/${id}/weight-measurements`, headers, payload });
    assert.equal(response.statusCode, 400, JSON.stringify(payload));
    assert.deepEqual(response.json(), { error: { code: 'VALIDATION_ERROR' } });
  }
  assert.equal(weightInserted.length, 0);
});

test('weight batch hides unowned litters and offspring outside the requested litter', async (t) => {
  for (const rows of [[], [{ ...row, owner_id: otherOwner }]]) {
    const { app, weightInserted } = await fixture(t, { rows });
    const response = await app.inject({
      method: 'POST', url: `/litters/${id}/weight-measurements`, headers,
      payload: { measured_on: '2024-03-02', measurements: [{ pet_id: petId, weight_grams: 120 }] },
    });
    assert.equal(response.statusCode, 404);
    assert.equal(weightInserted.length, 0);
  }
  const { app, weightInserted } = await fixture(t, { petRows: [] });
  const response = await app.inject({
    method: 'POST', url: `/litters/${id}/weight-measurements`, headers,
    payload: { measured_on: '2024-03-02', measurements: [{ pet_id: petId, weight_grams: 120 }] },
  });
  assert.equal(response.statusCode, 404);
  assert.equal(weightInserted.length, 0);
});

test('weight history is pet-scoped and ordered by measurement date and creation time', async (t) => {
  const measurements = [
    { id: 'w1', pet_id: petId, weight_grams: 120, measured_on: '2024-03-01', created_at: '2024-03-01T10:00:00Z' },
    { id: 'w2', pet_id: petId, weight_grams: 125, measured_on: '2024-03-02', created_at: '2024-03-02T10:00:00Z' },
  ];
  const { app, calls } = await fixture(t, { weightRows: measurements });
  const response = await app.inject({ url: `/litters/${id}/pets/${petId}/weight-measurements`, headers });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { measurements });
  assert.ok(calls.some((call) => call.method === 'eq' && call.args[0] === 'pet_id' && call.args[1] === petId));
  assert.deepEqual(calls.filter((call) => call.method === 'order').slice(-3).map((call) => call.args[0]), ['measured_on', 'created_at', 'id']);
  const { app: missingPet } = await fixture(t, { petRows: [] });
  assert.equal((await missingPet.inject({ url: `/litters/${id}/pets/${petId}/weight-measurements`, headers })).statusCode, 404);
  const { app: otherLitter } = await fixture(t, { rows: [] });
  assert.equal((await otherLitter.inject({ url: `/litters/${id}/pets/${petId}/weight-measurements`, headers })).statusCode, 404);
  assert.equal((await app.inject({ url: `/litters/${id}/pets/not-a-uuid/weight-measurements`, headers })).statusCode, 400);
});

test('pet list and detail are litter-scoped, and patch updates only editable fields', async (t) => {
  const { app, calls } = await fixture(t);
  const list = await app.inject({ url: `/litters/${id}/pets`, headers });
  assert.deepEqual(list.json(), { pets: [petRow] });
  const detail = await app.inject({ url: `/litters/${id}/pets/${petId}`, headers });
  assert.deepEqual(detail.json(), { pet: petRow });
  const updated = await app.inject({ method: 'PATCH', url: `/litters/${id}/pets/${petId}`, headers, payload: { name: 'New name' } });
  assert.equal(updated.statusCode, 200);
  assert.equal(updated.json().pet.name, 'New name');
  assert.ok(calls.some((call) => call.method === 'eq' && call.args[0] === 'litter_id' && call.args[1] === id));
  assert.deepEqual(calls.filter((call) => call.method === 'order').map((call) => [call.args[0], (call.args[1] as { ascending: boolean }).ascending]), [
    ['created_at', true], ['added_order', true],
  ]);
  for (const payload of [{}, { owner_id: otherOwner }, { litter_id: otherOwner }, { sex: null }]) {
    assert.equal((await app.inject({ method: 'PATCH', url: `/litters/${id}/pets/${petId}`, headers, payload })).statusCode, 400);
  }
});

test('pet list keeps the oldest additions first and preserves order within a batch', async (t) => {
  const { app } = await fixture(t, { petRows: [
    { ...petRow, id: 'latest', name: 'Latest batch', created_at: '2024-03-02T00:00:00Z', added_order: 12 } as Pet,
    { ...petRow, id: 'oldest', name: 'First added', created_at: '2024-03-01T00:00:00Z', added_order: 10 } as Pet,
    { ...petRow, id: 'middle', name: 'Second in batch', created_at: '2024-03-02T00:00:00Z', added_order: 11 } as Pet,
  ] });
  const response = await app.inject({ url: `/litters/${id}/pets`, headers });
  assert.deepEqual(response.json().pets.map((pet: Pet) => pet.name), ['First added', 'Second in batch', 'Latest batch']);
});

test('pets in missing or unowned litters and pets outside the requested litter are hidden', async (t) => {
  for (const rows of [[], [{ ...row, owner_id: otherOwner }]]) {
    const { app, petInserted } = await fixture(t, { rows });
    assert.equal((await app.inject({ url: `/litters/${id}/pets`, headers })).statusCode, 404);
    const create = await app.inject({ method: 'POST', url: `/litters/${id}/pets`, headers, payload: { pets: [{ name: 'Hidden', sex: 'male' }] } });
    assert.equal(create.statusCode, 404);
    assert.equal(petInserted.length, 0);
  }
  const { app } = await fixture(t, { petRows: [{ ...petRow, litter_id: otherOwner }] });
  assert.equal((await app.inject({ url: `/litters/${id}/pets/${petId}`, headers })).statusCode, 404);
});

test('database failures and thrown errors use sanitized error envelopes on every route', async (t) => {
  for (const options of [{ dbError: true }, { dbThrows: true }, { dbError: true, dbStatus: 401 }]) {
    const { app } = await fixture(t, options);
    for (const [method, url] of [['GET', '/litters'], ['POST', '/litters'], ['GET', `/litters/${id}`], ['GET', '/profile'], ['PATCH', '/profile']] as const) {
      const response = await app.inject({ method, url, headers, ...(method === 'POST' ? { payload: input } : method === 'PATCH' ? { payload: { kennel_name: 'North Star' } } : {}) });
      assert.equal(response.statusCode, options.dbStatus === 401 ? 401 : 500);
      assert.deepEqual(response.json(), { error: { code: options.dbStatus === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR' } });
    }
  }
});

test('malformed JSON and unknown routes use the error contract', async (t) => {
  const { app } = await fixture(t);
  const response = await app.inject({ method: 'POST', url: '/litters', headers: { ...headers, 'content-type': 'application/json' }, payload: '{' });
  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), { error: { code: 'VALIDATION_ERROR' } });
  const missing = await app.inject('/missing');
  assert.equal(missing.statusCode, 404);
  assert.deepEqual(missing.json(), { error: { code: 'NOT_FOUND' } });
});

test('rate limiting uses the error contract', async (t) => {
  const { app } = await fixture(t, { rateLimitMax: 1 });
  assert.equal((await app.inject('/health')).statusCode, 200);
  const response = await app.inject('/health');
  assert.equal(response.statusCode, 429);
  assert.deepEqual(response.json(), { error: { code: 'RATE_LIMITED' } });
});

test('CORS only permits configured origins', async (t) => {
  const { app } = await fixture(t);
  for (const origin of ['https://app.example.com', 'https://evil.example.com']) {
    const response = await app.inject({ url: '/health', headers: { origin } });
    assert.equal(response.headers['access-control-allow-origin'], origin === 'https://app.example.com' ? origin : undefined);
  }
});

test('CORS preflight permits the pet update method for configured origins', async (t) => {
  const { app } = await fixture(t);
  const response = await app.inject({
    method: 'OPTIONS', url: `/litters/${id}/pets/${petId}`,
    headers: { origin: 'https://app.example.com', 'access-control-request-method': 'PATCH' },
  });
  assert.equal(response.statusCode, 204);
  assert.match(response.headers['access-control-allow-methods'] ?? '', /PATCH/);
});

test('configuration defaults, origins, and publishable-only credentials', () => {
  assert.equal(config.HOST, '0.0.0.0');
  assert.equal(config.PORT, 3001);
  assert.deepEqual(config.CORS_ORIGINS, ['https://app.example.com']);
  const env = { SUPABASE_URL: config.SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY: config.SUPABASE_PUBLISHABLE_KEY };
  assert.deepEqual(loadConfig(env).CORS_ORIGINS, []);
  for (const patch of [{ PORT: '0' }, { CORS_ORIGINS: '*' }, { CORS_ORIGINS: 'https://app.example.com/path' }, { SUPABASE_PUBLISHABLE_KEY: 'sb_secret_never_allowed' }]) {
    assert.throws(() => loadConfig({ ...env, ...patch }), /Invalid configuration:/);
  }
});
