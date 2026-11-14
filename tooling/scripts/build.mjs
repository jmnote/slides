import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, loadCatalog, deckPath, renderIndex, renderLegacyKoreanIndex, SHOWCASE } from './catalog.mjs';
import { replaceBuild } from './build-output.mjs';
import { runCli } from './cli.mjs';

function slidevBuild(entry, base, out) {
  const result = spawnSync(process.execPath, [
    resolve(root, 'tooling/node_modules/@slidev/cli/bin/slidev.mjs'),
    'build', entry, '--base', base, '--out', out, '--without-notes', '--router-mode', 'hash',
  ], { cwd: resolve(root, 'tooling'), stdio: 'inherit' });
  if (result.error) throw result.error;
  return result.status === 0;
}

await runCli(async () => {
  const catalog = loadCatalog();
  const showcase = process.argv.includes('--with-showcase');
  // 쇼케이스 포함 결과물은 배포용 dist/와 섞이지 않게 dist-preview/에 만든다
  const outDir = resolve(root, showcase ? 'dist-preview' : 'dist');
  await replaceBuild(outDir, async out => {
    for (const talk of catalog.talks) {
      if (talk.slides) {
        console.log(`Building ${talk.id}`);
        if (!slidevBuild(resolve(root, talk.slides), catalog.site.base + deckPath(talk), resolve(out, deckPath(talk))))
          throw new Error(`Slidev build failed: ${talk.id}`);
      }
      const target = resolve(out, talk.pdf);
      await mkdir(dirname(target), { recursive: true });
      await cp(resolve(root, talk.pdf), target);
    }
    if (showcase) {
      console.log(`Building ${SHOWCASE}`);
      if (!slidevBuild(resolve(root, SHOWCASE, 'slides.md'), `${catalog.site.base}${SHOWCASE}/`, resolve(out, SHOWCASE)))
        throw new Error(`Slidev build failed: ${SHOWCASE}`);
    }
    await cp(resolve(root, 'tooling/site/assets'), resolve(out, 'assets'), { recursive: true });
    await writeFile(resolve(out, 'index.html'), renderIndex(catalog, 'en', { showcase }));
    await mkdir(resolve(out, 'ko'), { recursive: true });
    await writeFile(resolve(out, 'ko/index.html'), renderLegacyKoreanIndex(catalog));
    await writeFile(resolve(out, '.nojekyll'), '');
  });
  console.log(`Built ${catalog.talks.length} talks into ${showcase ? 'dist-preview' : 'dist'}/ (base: ${catalog.site.base})`);
});
