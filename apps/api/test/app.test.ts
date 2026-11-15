import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createApp, type Litter } from '../src/app.js';
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
const config = loadConfig({
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_key',
  CORS_ORIGINS: 'https://app.example.com',
});

type FakeOptions = {
  rows?: Litter[];
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
          assert.equal(table, 'litters');
          const filters: [string, unknown][] = [];
          let single = false;
          let values: Record<string, unknown> | undefined;
          const query = {
            select(...args: unknown[]) { calls.push({ method: 'select', args }); return query; },
            eq(key: string, value: unknown) { filters.push([key, value]); calls.push({ method: 'eq', args: [key, value] }); return query; },
            order(...args: unknown[]) { calls.push({ method: 'order', args }); return query; },
            limit(...args: unknown[]) { calls.push({ method: 'limit', args }); return query; },
            insert(value: Record<string, unknown>) { values = value; inserted.push(value); return query; },
            single() { single = true; return query; },
            maybeSingle() { single = true; return query; },
            then(resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) {
              if (options.dbThrows) return Promise.reject(new Error('secret database details')).then(resolve, reject);
              const rows = (options.rows ?? [row]).filter((item) =>
                filters.every(([key, value]) => item[key as keyof Litter] === value),
              );
              return Promise.resolve({
                data: options.dbError ? null : values ? { ...row, ...values } : single ? rows[0] ?? null : rows,
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
  return { app, calls, tokens, inserted, clientCount: () => clientCount };
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

test('database failures and thrown errors use sanitized error envelopes on every route', async (t) => {
  for (const options of [{ dbError: true }, { dbThrows: true }, { dbError: true, dbStatus: 401 }]) {
    const { app } = await fixture(t, options);
    for (const [method, url] of [['GET', '/litters'], ['POST', '/litters'], ['GET', `/litters/${id}`]] as const) {
      const response = await app.inject({ method, url, headers, ...(method === 'POST' ? { payload: input } : {}) });
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
