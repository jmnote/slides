import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, loadCatalog, LANGUAGES, SHOWCASE, slidesPath, deckPath, pdfPath, showcasePath, renderIndex } from './catalog.mjs';
import { renderHome, renderRoot, renderSitemap, renderRobots } from './pages.mjs';
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
    const { site } = catalog;
    const deck = async (entry, path, label) => {
      console.log(`Building ${label}`);
      if (!slidevBuild(resolve(root, entry), site.base + path, resolve(out, path))) throw new Error(`Slidev build failed: ${label}`);
    };
    const page = async (path, html) => {
      await mkdir(dirname(resolve(out, path)), { recursive: true });
      await writeFile(resolve(out, path), html);
    };
    for (const talk of catalog.talks) {
      if (talk.slides) await deck(talk.slides, deckPath(talk, 'ko'), talk.id);
      if (talk.slidesEn) await deck(talk.slidesEn, deckPath(talk, 'en'), `${talk.id} (English)`);
      await mkdir(dirname(resolve(out, pdfPath(talk))), { recursive: true });
      await cp(resolve(root, talk.pdf), resolve(out, pdfPath(talk)));
    }
    if (showcase) await deck(`${SHOWCASE}/slides.md`, showcasePath, SHOWCASE);
    await cp(resolve(root, 'tooling/site/assets'), resolve(out, 'assets'), { recursive: true });
    await page('index.html', renderRoot(site));
    for (const language of LANGUAGES) {
      await page(`${language}/index.html`, renderHome(site, language));
      await page(`${slidesPath(language)}index.html`, renderIndex(catalog, language, { showcase }));
    }
    await page('sitemap.xml', renderSitemap(catalog));
    await page('robots.txt', renderRobots(site));
    await page('.nojekyll', '');
  });
  console.log(`Built ${catalog.talks.length} talks into ${showcase ? 'dist-preview' : 'dist'}/ (base: ${catalog.site.base})`);
});
