import { z } from 'zod';

const webOrigin = z.string().refine((value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.origin === value;
  } catch {
    return false;
  }
});

const environment = z.object({
  SUPABASE_URL: z.url({ protocol: /^https?$/ }),
  SUPABASE_PUBLISHABLE_KEY: z.string().startsWith('sb_publishable_').min(16),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  CORS_ORIGINS: z.string().default('').transform((value) =>
    value.split(',').map((origin) => origin.trim()).filter(Boolean),
  ).pipe(z.array(webOrigin)),
});

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const result = environment.safeParse(env);
  if (!result.success) {
    // Report field names only: never include environment values or API keys.
    throw new Error(`Invalid configuration: ${result.error.issues.map((issue) => issue.path.join('.')).join(', ')}`);
  }
  return result.data;
}

export type Config = ReturnType<typeof loadConfig>;
