import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, loadCatalog, deckPath, renderIndex } from './catalog.mjs';
import { replaceBuild } from './build-output.mjs';
import { runCli } from './cli.mjs';

await runCli(async () => {
  const catalog = loadCatalog();
  await replaceBuild(resolve(root, 'dist'), async out => {
    for (const talk of catalog.talks) {
      if (talk.slides) {
        console.log(`Building ${talk.id}`);
        const result = spawnSync(process.execPath, [
          resolve(root, 'tooling/node_modules/@slidev/cli/bin/slidev.mjs'),
          'build', resolve(root, talk.slides),
          '--base', catalog.site.base + deckPath(talk),
          '--out', resolve(out, deckPath(talk)), '--without-notes', '--router-mode', 'hash',
        ], { cwd: resolve(root, 'tooling'), stdio: 'inherit' });
        if (result.error) throw result.error;
        if (result.status !== 0) throw new Error(`Slidev build failed: ${talk.id}`);
      }
      const target = resolve(out, talk.pdf);
      await mkdir(dirname(target), { recursive: true });
      await cp(resolve(root, talk.pdf), target);
    }
    await cp(resolve(root, 'tooling/site/style.css'), resolve(out, 'site.css'));
    await writeFile(resolve(out, 'index.html'), renderIndex(catalog));
    await writeFile(resolve(out, '.nojekyll'), '');
  });
  console.log(`Built ${catalog.talks.length} talks into dist/ (base: ${catalog.site.base})`);
});
