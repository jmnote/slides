import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { root, loadCatalog } from './catalog.mjs';
import { parseDevArgs } from './dev-args.mjs';

const talks = loadCatalog().talks.filter(talk => talk.slides);
const { id, args } = parseDevArgs(process.argv.slice(2), talks[0]?.id);
const talk = talks.find(talk => talk.id === id);
if (!talk) {
  console.error(`Unknown Slidev talk: ${id ?? '(none)'}. Choose: ${talks.map(talk => talk.id).join(', ') || '(no Slidev talks)'}`);
  process.exit(1);
}
console.log(`Opening ${talk.id}`);
const child = spawn(process.execPath, [resolve(root, 'tooling/node_modules/@slidev/cli/bin/slidev.mjs'), resolve(root, talk.slides), ...args], { cwd: resolve(root, 'tooling'), stdio: 'inherit' });
child.on('error', error => { console.error(error); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
