import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const localUpstreamAssets = path.resolve(repoRoot, '../jmnote.github.io/assets');
const targetAssetsDir = path.resolve(repoRoot, 'tooling/site/assets');

fs.mkdirSync(targetAssetsDir, { recursive: true });

const files = ['style.css', 'theme.js', 'sun.svg', 'moon.svg'];

async function sync() {
  if (fs.existsSync(localUpstreamAssets)) {
    console.log(`Syncing assets from local upstream: ${localUpstreamAssets}`);
    for (const file of files) {
      const src = path.join(localUpstreamAssets, file);
      const dest = path.join(targetAssetsDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✓ Copied ${file}`);
      } else {
        console.warn(`! Missing local asset: ${src}`);
      }
    }
  } else {
    console.log('Local upstream not found; fetching from GitHub raw (main)...');
    const baseUrl = 'https://raw.githubusercontent.com/jmnote/jmnote.github.io/main/assets';
    for (const file of files) {
      const dest = path.join(targetAssetsDir, file);
      const res = await fetch(`${baseUrl}/${file}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${file}: ${res.statusText}`);
      }
      const text = await res.text();
      fs.writeFileSync(dest, text);
      console.log(`✓ Downloaded ${file}`);
    }
  }
  console.log('Upstream assets synchronized successfully.');
}

sync().catch(err => {
  console.error('Error syncing upstream assets:', err);
  process.exit(1);
});
