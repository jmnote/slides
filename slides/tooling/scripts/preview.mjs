import { preview } from 'vite';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './catalog.mjs';
import { runCli } from './cli.mjs';

await runCli(async () => {
  if (!existsSync(resolve(repoRoot, 'dist/index.html'))) throw new Error('No built site found. Run make build before make preview.');
  const server = await preview({
    configFile: false,
    root: repoRoot,
    base: '/',
    build: { outDir: resolve(repoRoot, 'dist') },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  });
  server.printUrls();
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.httpServer.close(() => process.exit(0)));
});
