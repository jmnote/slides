import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, repoRoot, loadCatalog, deckPath, renderIndex } from './catalog.mjs';
import { replaceBuild } from './build-output.mjs';
import { runCli } from './cli.mjs';

await runCli(async () => {
  const catalog = loadCatalog();
  await replaceBuild(resolve(repoRoot, 'dist'), async out => {
    // Profile site at the root, slide decks under catalog.site.base (e.g. /slides/).
    for (const entry of ['index.html', 'assets', 'CNAME']) {
      await cp(resolve(repoRoot, entry), resolve(out, entry), { recursive: true });
    }
    const slidesOut = resolve(out, catalog.site.base.replace(/^\/|\/$/g, ''));
    await mkdir(slidesOut, { recursive: true });
    for (const talk of catalog.talks) {
      if (talk.slides) {
        console.log(`Building ${talk.id}`);
        const result = spawnSync(process.execPath, [
          resolve(root, 'tooling/node_modules/@slidev/cli/bin/slidev.mjs'),
          'build', resolve(root, talk.slides),
          '--base', catalog.site.base + deckPath(talk),
          '--out', resolve(slidesOut, deckPath(talk)), '--without-notes', '--router-mode', 'hash',
        ], { cwd: resolve(root, 'tooling'), stdio: 'inherit' });
        if (result.error) throw result.error;
        if (result.status !== 0) throw new Error(`Slidev build failed: ${talk.id}`);
      }
      const target = resolve(slidesOut, talk.pdf);
      await mkdir(dirname(target), { recursive: true });
      await cp(resolve(root, talk.pdf), target);
    }
    await writeFile(resolve(slidesOut, 'index.html'), renderIndex(catalog));
    await writeFile(resolve(out, '.nojekyll'), '');
  });
  console.log(`Built ${catalog.talks.length} talks into dist/ with profile site (slides base: ${catalog.site.base})`);
});
