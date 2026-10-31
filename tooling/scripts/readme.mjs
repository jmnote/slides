import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root, loadCatalog, renderReadmeTable } from './catalog.mjs';
import { runCli } from './cli.mjs';

await runCli(async () => {
  const path = resolve(root, 'README.md');
  const before = await readFile(path, 'utf8');
  const start = '<!-- talks:start -->', end = '<!-- talks:end -->';
  const pattern = /<!-- talks:start -->[\s\S]*?<!-- talks:end -->/;
  if (!pattern.test(before)) throw new Error('README talk-list markers are missing');
  const after = before.replace(pattern, () => `${start}\n${renderReadmeTable(loadCatalog())}\n${end}`);
  if (process.argv.includes('--check')) {
    if (before !== after) throw new Error('README is out of date. Run make docs.');
    console.log('README talk list is up to date.');
  } else {
    await writeFile(path, after);
  }
});
