import Fastify, { LogController, type FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Config } from './config.js';

const litterInput = z.strictObject({
  species: z.enum(['cat', 'dog']),
  name: z.string().trim().min(1).max(100),
  born_on: z.iso.date().refine((date) =>
    !date.startsWith('0000') && date <= new Date().toISOString().slice(0, 10),
  ),
  count: z.number().int().min(1).max(30),
  mother_name: z.string().trim().max(100).nullable().optional(),
  father_name: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const petInput = z.strictObject({
  name: z.string().trim().min(1).max(100),
  sex: z.enum(['male', 'female']),
  notes: z.string().trim().max(2000).nullable().optional(),
});
const petBatchInput = z.strictObject({ pets: z.array(petInput).min(1).max(30) });
const petUpdateInput = petInput.partial().refine((input) => Object.keys(input).length > 0);
const breederProfileInput = z.strictObject({
  kennel_name: z.string().trim().max(100).nullable().optional(),
}).refine((input) => Object.keys(input).length > 0);

export type Litter = z.infer<typeof litterInput> & {
  id: string;
  owner_id: string;
  created_at: string;
  mother_name: string | null;
  father_name: string | null;
  notes: string | null;
};
export type Pet = z.infer<typeof petInput> & {
  id: string;
  litter_id: string;
  created_at: string;
  updated_at: string;
  notes: string | null;
};

const columns = 'id,owner_id,species,name,born_on,count,mother_name,father_name,notes,created_at';
const petColumns = 'id,litter_id,name,sex,notes,created_at,updated_at';
const uuid = z.uuid();
const errorBody = (code: string) => ({ error: { code } });

declare module 'fastify' {
  interface FastifyRequest {
    supabase: SupabaseClient | null;
    userId: string | null;
  }
}

export type AppOptions = {
  config: Config;
  createRequestClient?: (token: string) => SupabaseClient;
  logger?: FastifyServerOptions['logger'];
  rateLimitMax?: number;
};

export async function createApp(options: AppOptions) {
  const app = Fastify({
    logger: options.logger ?? false,
    logController: new LogController({ disableRequestLogging: true }),
    bodyLimit: 16 * 1024,
  });
  const requestClient = options.createRequestClient ?? ((token: string) =>
    createClient(options.config.SUPABASE_URL, options.config.SUPABASE_PUBLISHABLE_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  );

  await app.register(cors, {
    origin: options.config.CORS_ORIGINS,
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  });
  await app.register(rateLimit, {
    max: options.rateLimitMax ?? 100,
    timeWindow: '1 minute',
  });

  app.setErrorHandler((error, request, reply) => {
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 429) return reply.code(429).send(errorBody('RATE_LIMITED'));
    if (status && status >= 400 && status < 500) {
      return reply.code(400).send(errorBody('VALIDATION_ERROR'));
    }
    // Do not log raw SDK errors, request headers, bodies, or URLs with secrets.
    request.log.error({ requestId: request.id, code: 'INTERNAL_ERROR' }, 'Request failed');
    return reply.code(500).send(errorBody('INTERNAL_ERROR'));
  });
  app.setNotFoundHandler((_request, reply) => reply.code(404).send(errorBody('NOT_FOUND')));

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(async (protectedApp) => {
    protectedApp.decorateRequest('supabase', null);
    protectedApp.decorateRequest('userId', null);
    protectedApp.addHook('onRequest', async (request, reply) => {
      const match = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization ?? '');
      if (!match) return reply.code(401).send(errorBody('UNAUTHORIZED'));

      const client = requestClient(match[1]);
      let result;
      try {
        result = await client.auth.getUser(match[1]);
      } catch {
        return reply.code(503).send(errorBody('INTERNAL_ERROR'));
      }
      if (result.error) {
        const invalid = [400, 401, 403, 404].includes(result.error.status ?? 0);
        return reply.code(invalid ? 401 : 503).send(errorBody(invalid ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      }
      if (!result.data.user || !uuid.safeParse(result.data.user.id).success) {
        return reply.code(401).send(errorBody('UNAUTHORIZED'));
      }
      request.supabase = client;
      request.userId = result.data.user.id;
    });

    protectedApp.get('/profile', async (request, reply) => {
      const { data, error, status } = await request.supabase!.from('breeder_profiles')
        .select('kennel_name').eq('user_id', request.userId!).maybeSingle();
      if (error) return reply.code(status === 401 ? 401 : 500)
        .send(errorBody(status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      return { profile: data ?? { kennel_name: null } };
    });

    protectedApp.patch('/profile', async (request, reply) => {
      const input = breederProfileInput.safeParse(request.body);
      if (!input.success) return reply.code(400).send(errorBody('VALIDATION_ERROR'));
      const profile = Object.fromEntries(Object.entries(input.data).map(([key, value]) => [key, value || null]));
      const { data, error, status } = await request.supabase!.from('breeder_profiles')
        .upsert(profile, { onConflict: 'user_id' }).select('kennel_name').single();
      if (error || !data) return reply.code(status === 401 ? 401 : 500)
        .send(errorBody(status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      return { profile: data };
    });

    protectedApp.get('/litters', async (request, reply) => {
      const { data, error, status } = await request.supabase!.from('litters')
        .select(columns).eq('owner_id', request.userId!)
        .order('born_on', { ascending: false }).limit(100);
      if (error) return reply.code(status === 401 ? 401 : 500)
        .send(errorBody(status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      return { litters: data ?? [] };
    });

    protectedApp.post('/litters', async (request, reply) => {
      const input = litterInput.safeParse(request.body);
      if (!input.success) return reply.code(400).send(errorBody('VALIDATION_ERROR'));
      const { data, error, status } = await request.supabase!.from('litters').insert({
        ...input.data,
        mother_name: input.data.mother_name ?? null,
        father_name: input.data.father_name ?? null,
        notes: input.data.notes ?? null,
        owner_id: request.userId!,
      }).select(columns).single();
      if (error || !data) return reply.code(status === 401 ? 401 : 500)
        .send(errorBody(status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      return reply.code(201).send({ litter: data });
    });

    protectedApp.get<{ Params: { id: string } }>('/litters/:id', async (request, reply) => {
      if (!uuid.safeParse(request.params.id).success) {
        return reply.code(400).send(errorBody('VALIDATION_ERROR'));
      }
      const { data, error, status } = await request.supabase!.from('litters')
        .select(columns).eq('owner_id', request.userId!).eq('id', request.params.id).maybeSingle();
      if (error) return reply.code(status === 401 ? 401 : 500)
        .send(errorBody(status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      if (!data) return reply.code(404).send(errorBody('NOT_FOUND'));
      return { litter: data };
    });

    protectedApp.get<{ Params: { litterId: string } }>('/litters/:litterId/pets', async (request, reply) => {
      if (!uuid.safeParse(request.params.litterId).success) return reply.code(400).send(errorBody('VALIDATION_ERROR'));
      const { data, error, status } = await request.supabase!.from('litters').select('id')
        .eq('owner_id', request.userId!).eq('id', request.params.litterId).maybeSingle();
      if (error) return reply.code(status === 401 ? 401 : 500).send(errorBody(status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      if (!data) return reply.code(404).send(errorBody('NOT_FOUND'));
      const result = await request.supabase!.from('pets').select(petColumns)
        .eq('litter_id', request.params.litterId).order('created_at').order('id');
      if (result.error) return reply.code(result.status === 401 ? 401 : 500)
        .send(errorBody(result.status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      return { pets: result.data ?? [] };
    });

    protectedApp.post<{ Params: { litterId: string } }>('/litters/:litterId/pets', async (request, reply) => {
      if (!uuid.safeParse(request.params.litterId).success) return reply.code(400).send(errorBody('VALIDATION_ERROR'));
      const input = petBatchInput.safeParse(request.body);
      if (!input.success) return reply.code(400).send(errorBody('VALIDATION_ERROR'));
      const parent = await request.supabase!.from('litters').select('id')
        .eq('owner_id', request.userId!).eq('id', request.params.litterId).maybeSingle();
      if (parent.error) return reply.code(parent.status === 401 ? 401 : 500)
        .send(errorBody(parent.status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      if (!parent.data) return reply.code(404).send(errorBody('NOT_FOUND'));
      const result = await request.supabase!.from('pets').insert(input.data.pets.map((pet) => ({
        ...pet, notes: pet.notes ?? null, litter_id: request.params.litterId,
      }))).select(petColumns);
      if (result.error) return reply.code(result.status === 401 ? 401 : 500)
        .send(errorBody(result.status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      return reply.code(201).send({ pets: result.data ?? [] });
    });

    protectedApp.get<{ Params: { litterId: string; petId: string } }>('/litters/:litterId/pets/:petId', async (request, reply) => {
      if (!uuid.safeParse(request.params.litterId).success || !uuid.safeParse(request.params.petId).success) {
        return reply.code(400).send(errorBody('VALIDATION_ERROR'));
      }
      const { data, error, status } = await request.supabase!.from('litters').select('id')
        .eq('owner_id', request.userId!).eq('id', request.params.litterId).maybeSingle();
      if (error) return reply.code(status === 401 ? 401 : 500).send(errorBody(status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      if (!data) return reply.code(404).send(errorBody('NOT_FOUND'));
      const result = await request.supabase!.from('pets').select(petColumns)
        .eq('litter_id', request.params.litterId).eq('id', request.params.petId).maybeSingle();
      if (result.error) return reply.code(result.status === 401 ? 401 : 500)
        .send(errorBody(result.status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      if (!result.data) return reply.code(404).send(errorBody('NOT_FOUND'));
      return { pet: result.data };
    });

    protectedApp.patch<{ Params: { litterId: string; petId: string } }>('/litters/:litterId/pets/:petId', async (request, reply) => {
      if (!uuid.safeParse(request.params.litterId).success || !uuid.safeParse(request.params.petId).success) {
        return reply.code(400).send(errorBody('VALIDATION_ERROR'));
      }
      const input = petUpdateInput.safeParse(request.body);
      if (!input.success) return reply.code(400).send(errorBody('VALIDATION_ERROR'));
      const parent = await request.supabase!.from('litters').select('id')
        .eq('owner_id', request.userId!).eq('id', request.params.litterId).maybeSingle();
      if (parent.error) return reply.code(parent.status === 401 ? 401 : 500)
        .send(errorBody(parent.status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      if (!parent.data) return reply.code(404).send(errorBody('NOT_FOUND'));
      const result = await request.supabase!.from('pets').update(input.data)
        .eq('litter_id', request.params.litterId).eq('id', request.params.petId).select(petColumns).maybeSingle();
      if (result.error) return reply.code(result.status === 401 ? 401 : 500)
        .send(errorBody(result.status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'));
      if (!result.data) return reply.code(404).send(errorBody('NOT_FOUND'));
      return { pet: result.data };
    });
  });

  await app.ready();
  return app;
}
