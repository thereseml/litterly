import { createApp } from './app.js';
import { loadConfig } from './config.js';

try {
  const config = loadConfig();
  const app = await createApp({
    config,
    logger: { redact: ['req.headers.authorization', 'req.headers.apikey'] },
  });
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void app.close().catch(() => { process.exitCode = 1; });
    });
  }
  await app.listen({ host: config.HOST, port: config.PORT });
} catch {
  console.error('API startup failed. Check configuration and port availability.');
  process.exitCode = 1;
}
