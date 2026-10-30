import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { root, loadCatalog } from './catalog.mjs';

const talks = loadCatalog().talks.filter(talk => talk.slides);
const args = process.argv.slice(2).filter(arg => arg !== '--');
const id = args[0] && !args[0].startsWith('-') ? args.shift() : talks[0]?.id;
const talk = talks.find(talk => talk.id === id);
if (!talk) throw new Error(`Choose a Slidev talk: ${talks.map(talk => talk.id).join(', ')}`);
console.log(`Opening ${talk.id}`);
const child = spawn(process.execPath, [resolve(root, 'tooling/node_modules/@slidev/cli/bin/slidev.mjs'), resolve(root, talk.slides), ...args], { cwd: resolve(root, 'tooling'), stdio: 'inherit' });
child.on('error', error => { console.error(error); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
