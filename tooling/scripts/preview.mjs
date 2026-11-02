import { preview } from 'vite';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { root, loadCatalog } from './catalog.mjs';
import { runCli } from './cli.mjs';

await runCli(async () => {
  const dir = process.argv.includes('--with-showcase') ? 'dist-preview' : 'dist';
  if (!existsSync(resolve(root, dir, 'index.html'))) throw new Error(`No built site found in ${dir}/. Run make ${dir === 'dist' ? 'build' : 'preview'} first.`);
  const server = await preview({
    configFile: false,
    root,
    base: loadCatalog().site.base,
    build: { outDir: resolve(root, dir) },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  });
  server.printUrls();
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.httpServer.close(() => process.exit(0)));
});
