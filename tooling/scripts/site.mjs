// make site: 배포 사이트와 같은 경로(/slides/...)로 모든 Slidev 덱을 개발 모드로 띄운다.
// 덱마다 표준 Slidev 개발 서버를 내부 포트로 실행하고, 게이트웨이 하나가 목록·PDF·덱을 한 포트로 묶는다.
import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { root, loadCatalog, deckPath, renderIndex, renderLegacyKoreanIndex, SHOWCASE } from './catalog.mjs';
import { runCli } from './cli.mjs';
import { requestPath, refererPath } from './site-request.mjs';

const PORT = Number(process.env.PORT || 4174);
const DECK_PORT_BASE = Number(process.env.DECK_PORT_BASE || 3101);
const portFree = port => new Promise(done => {
  const probe = net.createServer().once('error', () => done(false)).once('listening', () => probe.close(() => done(true)));
  probe.listen(port, '127.0.0.1');
});
const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.pdf': 'application/pdf' };

await runCli(async () => {
  const catalog = loadCatalog();
  const { base } = catalog.site;
  const decks = [
    ...catalog.talks.filter(talk => talk.slides).map(talk => ({ id: deckPath(talk).replace(/\/$/, ''), entry: talk.slides })),
    { id: SHOWCASE, entry: `${SHOWCASE}/slides.md` },
  ].map((deck, i) => ({ ...deck, port: DECK_PORT_BASE + i }));
  const files = new Map([
    ...catalog.talks.map(talk => [`${base}${talk.pdf}`, resolve(root, talk.pdf)]),
    ...['style.css', 'language.js', 'theme.js', 'sun.svg', 'moon.svg'].map(name => [`${base}assets/${name}`, resolve(root, 'tooling/site/assets', name)]),
  ]);

  for (const deck of [...decks, { id: 'gateway', port: PORT }])
    if (!await portFree(deck.port)) throw new Error(`Port ${deck.port} (${deck.id}) is already in use. Set PORT or DECK_PORT_BASE to free ports.`);

  const children = decks.map(deck => spawn(process.execPath, [
    resolve(root, 'tooling/node_modules/@slidev/cli/bin/slidev.mjs'),
    resolve(root, deck.entry), '--port', String(deck.port), '--base', `${base}${deck.id}/`,
  ], { cwd: resolve(root, 'tooling'), stdio: ['ignore', 'ignore', 'inherit'] }));
  children.forEach((child, i) => {
    child.on('error', error => console.error(`[${decks[i].id}] failed to start: ${error.message}`));
    child.on('exit', (code, signal) => { if (!stopping) console.error(`[${decks[i].id}] dev server exited (${signal ?? `code ${code}`}); restart make site`); });
  });
  let stopping = false;
  const stop = () => { stopping = true; for (const child of children) child.kill('SIGTERM'); };
  process.on('exit', stop);
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { stop(); process.exit(0); });

  const deckFor = url => decks.find(deck => url === `${base}${deck.id}` || url.startsWith(`${base}${deck.id}/`));

  const server = http.createServer((req, res) => {
    const path = requestPath(req.url);
    if (path === null) return res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' }).end('Bad request');
    if (path === '/') return res.writeHead(302, { location: base }).end();
    if (path === base || path === `${base}ko/`) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(path === base ? renderIndex(catalog, 'en', { showcase: true }) : renderLegacyKoreanIndex(catalog));
    }
    const file = files.get(path);
    if (file && existsSync(file)) {
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'content-length': statSync(file).size });
      return createReadStream(file).pipe(res);
    }
    // Slidev 개발 모드가 base 없이 루트로 보내는 요청(/@server-reactive/... 등)은 요청한 덱으로 전달
    const deck = deckFor(path) || deckFor(refererPath(req.headers.referer));
    if (!deck) return res.writeHead(404).end('Not found');
    if (path === `${base}${deck.id}`) return res.writeHead(302, { location: `${base}${deck.id}/` }).end();
    const upstream = http.request({ host: '127.0.0.1', port: deck.port, path: req.url, method: req.method, headers: req.headers }, up => {
      res.writeHead(up.statusCode, up.headers);
      up.pipe(res);
    });
    upstream.on('error', () => {
      req.resume();
      return res.headersSent ? res.end() : res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' }).end(`${deck.id} 개발 서버를 시작하는 중입니다. 잠시 후 새로고침하세요.`);
    });
    req.pipe(upstream);
  });

  // HMR 웹소켓도 해당 덱 개발 서버로 그대로 전달
  server.on('upgrade', (req, socket, head) => {
    const deck = deckFor(requestPath(req.url) ?? '');
    if (!deck) return socket.destroy();
    const upstream = net.connect(deck.port, '127.0.0.1', () => {
      upstream.write(`${req.method} ${req.url} HTTP/${req.httpVersion}\r\n${Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n')}\r\n\r\n`);
      if (head?.length) upstream.write(head);
      socket.pipe(upstream).pipe(socket);
    });
    upstream.on('error', () => socket.destroy());
    socket.on('error', () => upstream.destroy());
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Slides site (dev): http://localhost:${PORT}${base}`);
    for (const deck of decks) console.log(`  ${deck.id.padEnd(20)} http://localhost:${PORT}${base}${deck.id}/`);
  });
});
