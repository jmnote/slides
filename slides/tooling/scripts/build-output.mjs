import { mkdtemp, mkdir, rename, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';

// Keep the last complete site until the replacement has finished building.
export async function replaceBuild(out, build) {
  const temporary = await mkdtemp(join(dirname(out), '.dist-build-'));
  const next = join(temporary, 'next');
  const previous = join(temporary, 'previous');
  let backedUp = false;
  let preserveBackup = false;
  try {
    await mkdir(next);
    await build(next);
    try {
      await rename(out, previous);
      backedUp = true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    try {
      await rename(next, out);
    } catch (error) {
      if (backedUp) {
        try {
          await rename(previous, out);
        } catch (restoreError) {
          preserveBackup = true;
          throw new Error(`Could not restore dist; previous build remains at ${previous}`, { cause: restoreError });
        }
      }
      throw error;
    }
  } finally {
    if (!preserveBackup) await rm(temporary, { recursive: true, force: true });
  }
}
