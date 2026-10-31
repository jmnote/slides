import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { replaceBuild } from './build-output.mjs';

test('failed builds preserve the last site and successful builds replace stale files', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'slides-build-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const out = join(directory, 'dist');
  await mkdir(out);
  await writeFile(join(out, 'index.html'), 'old');
  await writeFile(join(out, 'stale.txt'), 'old');
  await assert.rejects(replaceBuild(out, async staging => {
    await writeFile(join(staging, 'index.html'), 'incomplete');
    throw new Error('build failed');
  }), /build failed/);
  assert.equal(await readFile(join(out, 'index.html'), 'utf8'), 'old');
  assert.deepEqual(await readdir(directory), ['dist']);
  await replaceBuild(out, staging => writeFile(join(staging, 'index.html'), 'new'));
  assert.equal(await readFile(join(out, 'index.html'), 'utf8'), 'new');
  assert.deepEqual(await readdir(out), ['index.html']);
  assert.deepEqual(await readdir(directory), ['dist']);
});
