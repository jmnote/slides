import { preview } from 'vite';
import { resolve } from 'node:path';
import { root, loadCatalog } from './catalog.mjs';
const server = await preview({
  configFile: false,
  root,
  base: loadCatalog().site.base,
  build: { outDir: resolve(root, 'dist') },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
});
server.printUrls();
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.httpServer.close(() => process.exit(0)));
