import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError, createApiClient, errorKey, type LitterInput } from '../src/lib/api-client';

const input: LitterInput = {
  species: 'cat', name: 'Vårkullen', born_on: '2026-01-03', count: 3,
  mother_name: null, father_name: null, notes: null,
};

test('litter list sends the signed-in access token to the API', async () => {
  let request: { url: string; init?: RequestInit } | undefined;
  const api = createApiClient({
    baseUrl: 'https://api.example.test',
    getAccessToken: async () => 'access-token',
    fetcher: async (url, init) => {
      request = { url: String(url), init };
      return Response.json({ litters: [] });
    },
  });

  assert.deepEqual(await api('/litters'), { litters: [] });
  assert.equal(request?.url, 'https://api.example.test/litters');
  assert.equal(request?.init?.method, 'GET');
  assert.equal(new Headers(request?.init?.headers).get('authorization'), 'Bearer access-token');
});

test('litter creation sends validated fields as JSON with the session token', async () => {
  let request: { url: string; init?: RequestInit } | undefined;
  const api = createApiClient({
    baseUrl: 'https://api.example.test',
    getAccessToken: async () => 'access-token',
    fetcher: async (url, init) => {
      request = { url: String(url), init };
      return Response.json({ litter: { ...input, id: 'litter-id' } }, { status: 201 });
    },
  });

  const result = await api<{ litter: { id: string } }>('/litters', input);
  assert.equal(result.litter.id, 'litter-id');
  assert.equal(request?.init?.method, 'POST');
  assert.equal(new Headers(request?.init?.headers).get('content-type'), 'application/json');
  assert.deepEqual(JSON.parse(String(request?.init?.body)), input);
});

test('missing access tokens reject the request without contacting the API', async () => {
  let called = false;
  const api = createApiClient({
    baseUrl: 'https://api.example.test',
    getAccessToken: async () => null,
    fetcher: async () => { called = true; return Response.json({}); },
  });

  await assert.rejects(api('/litters'), (error: unknown) => error instanceof ApiError && error.code === 'UNAUTHORIZED');
  assert.equal(called, false);
});

test('unreachable API errors map to a connection message, not a generic error', async () => {
  const api = createApiClient({
    baseUrl: 'http://localhost:3001',
    getAccessToken: async () => 'access-token',
    fetcher: async () => { throw new TypeError('connection refused'); },
  });

  await assert.rejects(api('/litters'), (error: unknown) => errorKey(error) === 'errors.network');
});

test('API response failures map to actionable localized messages', async () => {
  for (const [status, expected] of [
    [401, 'errors.UNAUTHORIZED'],
    [400, 'errors.VALIDATION_ERROR'],
    [404, 'errors.NOT_FOUND'],
    [429, 'errors.RATE_LIMITED'],
    [503, 'errors.INTERNAL_ERROR'],
  ] as const) {
    const api = createApiClient({
      baseUrl: 'https://api.example.test',
      getAccessToken: async () => 'access-token',
      fetcher: async () => Response.json({ error: { code: 'UNRECOGNIZED_SERVER_CODE' } }, { status }),
    });
    await assert.rejects(api('/litters'), (error: unknown) => errorKey(error) === expected);
  }
});

test('known server error codes take precedence over the HTTP status', async () => {
  const api = createApiClient({
    baseUrl: 'https://api.example.test',
    getAccessToken: async () => 'access-token',
    fetcher: async () => Response.json({ error: { code: 'RATE_LIMITED' } }, { status: 400 }),
  });

  await assert.rejects(api('/litters'), (error: unknown) => errorKey(error) === 'errors.RATE_LIMITED');
});
